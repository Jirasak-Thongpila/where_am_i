import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/db";
import { checkins, users } from "@/db/schema";
import { count, desc, eq, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Get aggregations
    const [totalUsersRes] = await db.select({ value: count(users.id) }).from(users);
    const [verifiedUsersRes] = await db
      .select({ value: count(users.id) })
      .from(users)
      .where(eq(users.isVerified, true));
    const [adminUsersRes] = await db
      .select({ value: count(users.id) })
      .from(users)
      .where(eq(users.role, "admin"));
    const [totalCheckinsRes] = await db.select({ value: count(checkins.id) }).from(checkins);
    const [todayCheckinsRes] = await db
      .select({ value: count(checkins.id) })
      .from(checkins)
      .where(gte(checkins.createdAt, twentyFourHoursAgo));

    // 2. Get recent check-ins
    const recentCheckins = await db
      .select({
        id: checkins.id,
        lat: checkins.lat,
        lng: checkins.lng,
        locationName: checkins.locationName,
        address: checkins.address,
        description: checkins.description,
        imageUrl: checkins.imageUrl,
        createdAt: checkins.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileImage: users.profileImage,
        },
      })
      .from(checkins)
      .innerJoin(users, eq(users.id, checkins.userId))
      .orderBy(desc(checkins.createdAt))
      .limit(6);

    // 3. Get recent registered users
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        profileImage: users.profileImage,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5);

    return NextResponse.json(
      {
        message: "Admin statistics retrieved successfully",
        stats: {
          totalUsers: totalUsersRes?.value || 0,
          verifiedUsers: verifiedUsersRes?.value || 0,
          adminUsers: adminUsersRes?.value || 0,
          totalCheckins: totalCheckinsRes?.value || 0,
          todayCheckins: todayCheckinsRes?.value || 0,
        },
        recentCheckins,
        recentUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch admin stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
