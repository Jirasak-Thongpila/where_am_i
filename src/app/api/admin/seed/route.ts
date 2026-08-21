import { db } from "@/db";
import { users } from "@/db/schema";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    let email = "admin@whereami.local";
    let password = "AdminPassword123!";
    let name = "System Administrator";

    try {
      const body = await request.json();
      if (body?.email) email = body.email.toLowerCase().trim();
      if (body?.password) password = body.password;
      if (body?.name) name = body.name.trim();
    } catch {
      // Body is optional, default credentials used
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      const hashedPassword = await argon2.hash(password);
      await db
        .update(users)
        .set({
          name: name || existing.name,
          password: hashedPassword,
          role: "admin",
          isVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));

      return NextResponse.json(
        {
          message: "Admin account updated and ready",
          admin: {
            id: existing.id,
            name: name || existing.name,
            email: existing.email,
            role: "admin",
            isVerified: true,
          },
          credentials: {
            email,
            password,
          },
        },
        { status: 200 }
      );
    }

    const hashedPassword = await argon2.hash(password);
    const [newAdmin] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Admin account created successfully",
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          isVerified: newAdmin.isVerified,
        },
        credentials: {
          email,
          password,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin seed error:", error);
    return NextResponse.json(
      {
        message: "Failed to seed admin account",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
