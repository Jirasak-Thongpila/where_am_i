import { db } from "@/db";
import { checkins, users } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { deleteFromGCS, uploadToGCS } from "@/lib/gcs";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activity";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const contentType = (request.headers.get("content-type") || "").toLowerCase();
    let lat: number = 0;
    let lng: number = 0;
    let locationName: string | undefined;
    let address: string | undefined;
    let accuracy: number | undefined;
    let description: string | undefined;
    let imageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const latRaw = formData.get("lat");
      const lngRaw = formData.get("lng");
      lat = latRaw ? parseFloat(latRaw.toString()) : 0;
      lng = lngRaw ? parseFloat(lngRaw.toString()) : 0;

      locationName = formData.get("locationName")?.toString();
      address = formData.get("address")?.toString();
      const accRaw = formData.get("accuracy");
      accuracy = accRaw ? parseFloat(accRaw.toString()) : undefined;
      description = formData.get("description")?.toString();

      const imageFile = (formData.get("image") ||
        formData.get("file") ||
        formData.get("photo") ||
        formData.get("picture")) as File | null;

      if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = imageFile.name ? imageFile.name.split(".").pop() || "jpg" : "jpg";
        const filename = `checkins/${payload.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        imageUrl = await uploadToGCS(buffer, filename, imageFile.type || "image/jpeg");
      }
    } else {
      const body = await request.json();
      lat = typeof body.lat === "number" ? body.lat : parseFloat(body.lat || "0");
      lng = typeof body.lng === "number" ? body.lng : parseFloat(body.lng || "0");
      locationName = body.locationName;
      address = body.address;
      accuracy = body.accuracy ? parseFloat(body.accuracy.toString()) : undefined;
      description = body.description;
      imageUrl = body.imageUrl;
    }

    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      return NextResponse.json(
        {
          message: "Valid latitude and longitude are required",
        },
        {
          status: 400,
        },
      );
    }

    const [newCheckin] = await db
      .insert(checkins)
      .values({
        userId: payload.id,
        lat,
        lng,
        locationName,
        address,
        accuracy,
        description,
        imageUrl,
      })
      .returning();

    // Log activity
    await logActivity({
      userId: payload.id,
      action: "CHECKIN_CREATE",
      entityType: "checkin",
      entityId: newCheckin.id,
      details: `Created check-in at ${newCheckin.locationName || `${newCheckin.lat}, ${newCheckin.lng}`}`,
      request,
    });

    return NextResponse.json(
      {
        message: "Check-in created successfully",
        checkin: newCheckin,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Create check-in error:", error);
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
    const limit = parseInt(searchParams.get("limit") || "200", 10);

    let targetUserId: number | undefined;
    if (isOnlyMine) {
      const payload = await getAuthUser(request);
      if (!payload) {
        return NextResponse.json(
          {
            message: "Unauthorized",
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
    console.error("Get check-ins error:", error);
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
    const payload = await getAuthUser(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const contentType = (request.headers.get("content-type") || "").toLowerCase();

    let id: number | undefined;
    let description: string | undefined;
    let imageUrl: string | undefined;
    let locationName: string | undefined;
    let address: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const idRaw = formData.get("id");
      id = idRaw ? parseInt(idRaw.toString(), 10) : NaN;

      if (formData.has("description")) {
        description = formData.get("description")?.toString();
      }
      if (formData.has("locationName")) {
        locationName = formData.get("locationName")?.toString();
      }
      if (formData.has("address")) {
        address = formData.get("address")?.toString();
      }
      if (formData.has("imageUrl")) {
        imageUrl = formData.get("imageUrl")?.toString();
      }

      const imageFile = (formData.get("image") ||
        formData.get("file") ||
        formData.get("photo") ||
        formData.get("picture")) as File | null;

      if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = imageFile.name ? imageFile.name.split(".").pop() || "jpg" : "jpg";
        const filename = `checkins/${payload.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        imageUrl = await uploadToGCS(buffer, filename, imageFile.type || "image/jpeg");
      }
    } else {
      const body = await request.json();
      id = typeof body.id === "number" ? body.id : parseInt(body.id, 10);
      description = body.description;
      imageUrl = body.imageUrl;
      locationName = body.locationName;
      address = body.address;
    }

    if (!id || typeof id !== "number" || Number.isNaN(id)) {
      return NextResponse.json(
        { message: "Check-in ID is required and must be a number" },
        { status: 400 },
      );
    }

    const [existingCheckin] = await db
      .select()
      .from(checkins)
      .where(eq(checkins.id, id))
      .limit(1);

    if (!existingCheckin) {
      return NextResponse.json(
        { message: "Check-in not found" },
        { status: 404 },
      );
    }

    if (existingCheckin.userId !== payload.id) {
      return NextResponse.json(
        { message: "Forbidden: You cannot edit another user's check-in" },
        { status: 403 },
      );
    }

    // If new image uploaded, delete previous image from GCS
    if (imageUrl && existingCheckin.imageUrl && existingCheckin.imageUrl !== imageUrl) {
      await deleteFromGCS(existingCheckin.imageUrl);
    }

    const [updatedCheckin] = await db
      .update(checkins)
      .set({
        description: description !== undefined ? description : existingCheckin.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existingCheckin.imageUrl,
        locationName: locationName !== undefined ? locationName : existingCheckin.locationName,
        address: address !== undefined ? address : existingCheckin.address,
        updatedAt: new Date(),
      })
      .where(and(eq(checkins.id, id), eq(checkins.userId, payload.id)))
      .returning();

    // Log activity
    await logActivity({
      userId: payload.id,
      action: "CHECKIN_UPDATE",
      entityType: "checkin",
      entityId: updatedCheckin.id,
      details: `Updated check-in #${updatedCheckin.id} (${updatedCheckin.locationName || ""})`,
      request,
    });

    return NextResponse.json(
      {
        message: "Check-in updated successfully",
        checkin: updatedCheckin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update check-in error:", error);
    return NextResponse.json(
      { message: "Failed to update check-in" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (Number.isNaN(id) || id <= 0) {
      return NextResponse.json(
        { message: "Check-in ID is required and must be a valid number" },
        { status: 400 },
      );
    }

    const payload = await getAuthUser(request);
    if (!payload || !payload.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [existingCheckin] = await db
      .select()
      .from(checkins)
      .where(eq(checkins.id, id))
      .limit(1);

    if (!existingCheckin) {
      return NextResponse.json(
        { message: "Check-in not found" },
        { status: 404 },
      );
    }

    if (existingCheckin.userId !== payload.id) {
      return NextResponse.json(
        { message: "Forbidden: You cannot delete another user's check-in" },
        { status: 403 },
      );
    }

    // Delete image from GCS
    if (existingCheckin.imageUrl) {
      await deleteFromGCS(existingCheckin.imageUrl);
    }

    // Delete record from DB
    await db
      .delete(checkins)
      .where(and(eq(checkins.id, id), eq(checkins.userId, payload.id)));

    // Log activity
    await logActivity({
      userId: payload.id,
      action: "CHECKIN_DELETE",
      entityType: "checkin",
      entityId: id,
      details: `Deleted check-in #${id} (${existingCheckin.locationName || ""})`,
      request,
    });

    return NextResponse.json(
      {
        message: "Check-in deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete check-in error:", error);
    return NextResponse.json(
      { message: "Failed to delete check-in" },
      { status: 500 },
    );
  }
}
