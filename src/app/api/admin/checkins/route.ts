import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/db";
import { checkins, users } from "@/db/schema";
import { deleteFromGCS } from "@/lib/gcs";
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (search) {
      const searchPattern = `%${search}%`;
      whereClause = or(
        ilike(checkins.locationName, searchPattern),
        ilike(checkins.address, searchPattern),
        ilike(checkins.description, searchPattern),
        ilike(users.name, searchPattern),
        ilike(users.email, searchPattern)
      );
    }

    // 1. Get filtered total count
    const [countRes] = await db
      .select({ value: count(checkins.id) })
      .from(checkins)
      .innerJoin(users, eq(users.id, checkins.userId))
      .where(whereClause);

    const totalCount = countRes?.value || 0;

    // 2. Fetch paginated records
    const checkinList = await db
      .select({
        id: checkins.id,
        lat: checkins.lat,
        lng: checkins.lng,
        locationName: checkins.locationName,
        address: checkins.address,
        accuracy: checkins.accuracy,
        description: checkins.description,
        imageUrl: checkins.imageUrl,
        createdAt: checkins.createdAt,
        updatedAt: checkins.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileImage: users.profileImage,
        },
      })
      .from(checkins)
      .innerJoin(users, eq(users.id, checkins.userId))
      .where(whereClause)
      .orderBy(desc(checkins.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      {
        message: "Check-in logs retrieved successfully",
        checkins: checkinList,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin get checkins error:", error);
    return NextResponse.json(
      {
        message: "Failed to retrieve check-in logs",
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
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (Number.isNaN(id) || id <= 0) {
      return NextResponse.json(
        { message: "Valid check-in ID is required" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(checkins)
      .where(eq(checkins.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { message: "Check-in log not found" },
        { status: 404 }
      );
    }

    // Delete image from GCS if exists
    if (existing.imageUrl) {
      try {
        await deleteFromGCS(existing.imageUrl);
      } catch (gcsError) {
        console.warn("Could not delete image from GCS:", gcsError);
      }
    }

    // Delete check-in record
    await db.delete(checkins).where(eq(checkins.id, id));

    return NextResponse.json(
      {
        message: "Check-in log and associated media deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin delete checkin error:", error);
    return NextResponse.json(
      {
        message: "Failed to delete check-in log",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
