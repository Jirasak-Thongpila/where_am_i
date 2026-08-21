import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/db";
import { activityLogs, checkins, users, verificationTokens } from "@/db/schema";
import { count, desc, eq, ilike, or } from "drizzle-orm";
import { logActivity } from "@/lib/activity";
import { deleteFromGCS } from "@/lib/gcs";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    let whereClause = undefined;
    if (search) {
      const pattern = `%${search}%`;
      whereClause = or(ilike(users.name, pattern), ilike(users.email, pattern));
    }

    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        profileImage: users.profileImage,
        bio: users.bio,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt));

    // Get checkin counts per user
    const checkinCounts = await db
      .select({
        userId: checkins.userId,
        count: count(checkins.id),
      })
      .from(checkins)
      .groupBy(checkins.userId);

    const countMap = new Map<number, number>();
    for (const item of checkinCounts) {
      countMap.set(item.userId, item.count);
    }

    const usersWithCounts = userList.map((u) => ({
      ...u,
      checkinsCount: countMap.get(u.id) || 0,
    }));

    return NextResponse.json(
      {
        message: "Users retrieved successfully",
        users: usersWithCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json(
      {
        message: "Failed to retrieve users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role, isVerified } = body;

    if (!userId || typeof userId !== "number") {
      return NextResponse.json(
        { message: "Valid userId is required" },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (role !== undefined) {
      if (role !== "user" && role !== "admin") {
        return NextResponse.json(
          { message: "Role must be either 'user' or 'admin'" },
          { status: 400 }
        );
      }
      updateFields.role = role;
    }

    if (isVerified !== undefined) {
      updateFields.isVerified = Boolean(isVerified);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        updatedAt: users.updatedAt,
      });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Log activity
    await logActivity({
      userId: admin.id,
      action: "ADMIN_UPDATE_USER",
      entityType: "admin",
      entityId: updatedUser.id,
      details: `Admin ${admin.name} updated user #${updatedUser.id} (${updatedUser.name}): ${
        role !== undefined ? `role=${role} ` : ""
      }${isVerified !== undefined ? `verified=${isVerified}` : ""}`,
      request,
    });

    return NextResponse.json(
      {
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      {
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const userId = idParam ? parseInt(idParam, 10) : NaN;

    if (Number.isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { message: "Valid User ID is required" },
        { status: 400 }
      );
    }

    if (userId === admin.id) {
      return NextResponse.json(
        { message: "Forbidden: You cannot delete your own admin account" },
        { status: 400 }
      );
    }

    // 1. Fetch user to verify existence
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 2. Fetch all user's checkins and delete their images from GCS
    const userCheckins = await db
      .select({ id: checkins.id, imageUrl: checkins.imageUrl })
      .from(checkins)
      .where(eq(checkins.userId, userId));

    for (const c of userCheckins) {
      if (c.imageUrl) {
        try {
          await deleteFromGCS(c.imageUrl);
        } catch {
          // ignore
        }
      }
    }

    // 3. Delete profile/cover images from GCS if exists
    if (targetUser.profileImage) {
      try {
        await deleteFromGCS(targetUser.profileImage);
      } catch {
        // ignore
      }
    }
    if (targetUser.coverImage) {
      try {
        await deleteFromGCS(targetUser.coverImage);
      } catch {
        // ignore
      }
    }

    // 4. Delete user's checkins
    await db.delete(checkins).where(eq(checkins.userId, userId));

    // 5. Delete user's verification tokens
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.email, targetUser.email));

    // 6. Delete user's activity logs
    await db.delete(activityLogs).where(eq(activityLogs.userId, userId));

    // 7. Delete user from users table
    await db.delete(users).where(eq(users.id, userId));

    // 8. Log admin activity
    await logActivity({
      userId: admin.id,
      action: "ADMIN_DELETE_USER",
      entityType: "admin",
      entityId: userId,
      details: `Admin ${admin.name} deleted user #${userId} (${targetUser.name} - ${targetUser.email}) and purged all check-ins`,
      request,
    });

    return NextResponse.json(
      { message: "User and all associated records deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      {
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
