import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { uploadToGCS } from "@/lib/gcs";

export async function GET(request: NextRequest) {
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

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        bio: users.bio,
        profileImage: users.profileImage,
        coverImage: users.coverImage,
        socialLinks: users.socialLinks,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: "User found",
        user: user,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json(
      {
        message: "Failed to get user",
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
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const [existingUser] = await db
      .select({ id: users.id, profileImage: users.profileImage })
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    const contentType = (request.headers.get("content-type") || "").toLowerCase();
    let name: string | undefined;
    let bio: string | undefined;
    let profileImageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const nameRaw = formData.get("name")?.toString();
      const bioRaw = formData.get("bio")?.toString();
      if (nameRaw && nameRaw.trim().length > 0) name = nameRaw.trim();
      if (bioRaw !== undefined) bio = bioRaw.trim();

      const imageFile = (formData.get("image") ||
        formData.get("file") ||
        formData.get("profileImage") ||
        formData.get("photo")) as File | null;

      if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = imageFile.name ? imageFile.name.split(".").pop() || "jpg" : "jpg";
        const filename = `profiles/${payload.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        profileImageUrl = await uploadToGCS(buffer, filename, imageFile.type || "image/jpeg");
      }
    } else {
      const body = await request.json();
      if (body.name) name = body.name.trim();
      if (body.bio !== undefined) bio = body.bio;
      if (body.profileImage) profileImageUrl = body.profileImage;
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImageUrl) updateData.profileImage = profileImageUrl;

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, payload.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        bio: users.bio,
        profileImage: users.profileImage,
        coverImage: users.coverImage,
        socialLinks: users.socialLinks,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        message: "Failed to update profile",
      },
      {
        status: 500,
      },
    );
  }
}
