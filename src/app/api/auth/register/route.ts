import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import argon2 from "argon2";
import { signJWT } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, fname, lname, password } = body;

    // Support both `name` or `fname` + `lname`
    const displayName = (name || `${fname || ""} ${lname || ""}`).trim();

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string" ||
      !displayName
    ) {
      return NextResponse.json(
        {
          message: "Email, name (or fname and lname), and password are required",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const sskruEmailRegex: RegExp = /^[^\s@]+@sskru\.ac\.th$/;
    if (!sskruEmailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          message: "Only @sskru.ac.th email addresses are allowed",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must be at least 6 characters long",
        },
        {
          status: 400,
        },
      );
    }

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          message: "Email already exists",
        },
        {
          status: 409,
        },
      );
    }

    const hashPassword = await argon2.hash(password);

    const [user] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: displayName,
        password: hashPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
        profileImage: users.profileImage,
        coverImage: users.coverImage,
        socialLinks: users.socialLinks,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    const jwtToken = await signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: user,
        token: jwtToken,
      },
      {
        status: 201,
      },
    );

    response.cookies.set({
      name: "auth-token",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        message: "Failed to register",
      },
      {
        status: 500,
      },
    );
  }
}
