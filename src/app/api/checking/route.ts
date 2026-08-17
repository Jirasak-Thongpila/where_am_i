import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { checkins, users } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, locationName, address, accuracy, description, imageUrl } =
      body;

    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return NextResponse.json(
        {
          message: "Missing or invalid coordinates",
        },
        {
          status: 400,
        },
      );
    }

    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        },
      );
    }

    const user = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    const [checkin] = await db
      .insert(checkins)
      .values({
        userId: user[0].id,
        lat: lat,
        lng: lng,
        locationName: locationName,
        address: address,
        accuracy: accuracy,
        description: description,
        imageUrl: imageUrl,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Check-in created successfully",
        checkin: checkin,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Failed to create check-in",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isOnlyMine = searchParams.get("my") === "true";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    let targetUserId: number | undefined;
    if (isOnlyMine) {
      const payload = await getAuthUser(request);
      if (!payload) {
        return NextResponse.json(
          {
            message: "Invalid token",
          },
          {
            status: 401,
          },
        );
      }
      targetUserId = payload.id;
    }

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
        user: {
          id: users.id,
          name: users.name,
          profileImage: users.profileImage,
        },
      })
      .from(checkins)
      .innerJoin(users, eq(users.id, checkins.userId))
      .where(targetUserId ? eq(checkins.userId, targetUserId) : undefined)
      .orderBy(desc(checkins.createdAt))
      .limit(limit);
    // ส่ง checkinList กลับไปได้เลย (ถ้าไม่มีข้อมูล จะได้ [] กลับไปแบบ 200 OK)
    return NextResponse.json(
      {
        message: "Check-ins retrieved successfully",
        checkins: checkinList,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Failed to retrieve check-ins",
      },
      {
        status: 500,
      },
    );
  }
}
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, description, imageUrl, locationName, address } = body;
    // 1. ตรวจสอบว่าส่ง ID ของ Check-in มาไหม
    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { message: "Check-in ID is required and must be a number" },
        { status: 400 }
      );
    }
    // 2. ตรวจสอบ Auth Token
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // 3. ตรวจสอบว่า Check-in นี้มีอยู่จริง และเป็นของ User คนนี้หรือไม่
    const [existingCheckin] = await db
      .select()
      .from(checkins)
      .where(eq(checkins.id, id))
      .limit(1);
    if (!existingCheckin) {
      return NextResponse.json(
        { message: "Check-in not found" },
        { status: 404 }
      );
    }
    if (existingCheckin.userId !== payload.id) {
      return NextResponse.json(
        { message: "Forbidden: You cannot edit another user's check-in" },
        { status: 403 }
      );
    }
    // 4. ทำการ Update เฉพาะฟิลด์ที่ส่งมา
    const [updatedCheckin] = await db
      .update(checkins)
      .set({
        description: description !== undefined ? description : existingCheckin.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existingCheckin.imageUrl,
        locationName: locationName !== undefined ? locationName : existingCheckin.locationName,
        address: address !== undefined ? address : existingCheckin.address,
        updatedAt: new Date(), // อัปเดต timestamp
      })
      .where(and(eq(checkins.id, id), eq(checkins.userId, payload.id)))
      .returning();
    return NextResponse.json(
      {
        message: "Check-in updated successfully",
        checkin: updatedCheckin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update check-in error:", error);
    return NextResponse.json(
      { message: "Failed to update check-in" },
      { status: 500 }
    );
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const id = idParam ? parseInt(idParam, 10) : NaN;

    // 1. ตรวจสอบว่าส่ง ID ของ Check-in มาไหม
    if (Number.isNaN(id) || id <= 0) {
      return NextResponse.json(
        { message: "Check-in ID is required and must be a valid number" },
        { status: 400 }
      );
    }
    // 2. ตรวจสอบ Auth Token
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // 3. ตรวจสอบว่า Check-in นี้มีอยู่จริง และเป็นของ User คนนี้หรือไม่
    const [existingCheckin] = await db
      .select()
      .from(checkins)
      .where(eq(checkins.id, id))
      .limit(1);
    if (!existingCheckin) {
      return NextResponse.json(
        { message: "Check-in not found" },
        { status: 404 }
      );
    }
    if (existingCheckin.userId !== payload.id) {
      return NextResponse.json(
        { message: "Forbidden: You cannot delete another user's check-in" },
        { status: 403 }
      );
    }
    // 4. ทำการ Delete
    await db
      .delete(checkins)
      .where(and(eq(checkins.id, id), eq(checkins.userId, payload.id)));
    return NextResponse.json(
      {
        message: "Check-in deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete check-in error:", error);
    return NextResponse.json(
      { message: "Failed to delete check-in" },
      { status: 500 }
    );
  }
}
