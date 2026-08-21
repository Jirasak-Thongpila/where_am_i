import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/db";
import { checkins, users } from "@/db/schema";
import { count, desc, eq, ilike, or } from "drizzle-orm";

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

    const updateFields: Record<string, any> = {
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
