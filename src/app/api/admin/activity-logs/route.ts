import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { db } from "@/db";
import { activityLogs, users } from "@/db/schema";
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
    const actionFilter = searchParams.get("action")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (search) {
      const searchPattern = `%${search}%`;
      whereClause = or(
        ilike(activityLogs.action, searchPattern),
        ilike(activityLogs.details, searchPattern),
        ilike(activityLogs.ipAddress, searchPattern),
        ilike(users.name, searchPattern),
        ilike(users.email, searchPattern)
      );
    }

    if (actionFilter && actionFilter !== "ALL") {
      const actionCondition = eq(activityLogs.action, actionFilter);
      whereClause = whereClause ? or(whereClause, actionCondition) : actionCondition;
    }

    // 1. Get count
    const [countRes] = await db
      .select({ value: count(activityLogs.id) })
      .from(activityLogs)
      .leftJoin(users, eq(users.id, activityLogs.userId))
      .where(whereClause);

    const totalCount = countRes?.value || 0;

    // 2. Fetch records
    const logs = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        entityType: activityLogs.entityType,
        entityId: activityLogs.entityId,
        details: activityLogs.details,
        ipAddress: activityLogs.ipAddress,
        userAgent: activityLogs.userAgent,
        createdAt: activityLogs.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileImage: users.profileImage,
          role: users.role,
        },
      })
      .from(activityLogs)
      .leftJoin(users, eq(users.id, activityLogs.userId))
      .where(whereClause)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      {
        message: "Activity logs retrieved successfully",
        logs,
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
    console.error("Admin activity logs error:", error);
    return NextResponse.json(
      {
        message: "Failed to retrieve activity logs",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
