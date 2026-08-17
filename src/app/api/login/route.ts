import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import { signJWT } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password.trim()
    ) {
      return NextResponse.json(
        {
          message: "email and password are required",
        },
        {
          status: 400,
        }
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
        }
      );
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const verifyPassword = await argon2.verify(user.password, password);
    if (!verifyPassword) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const jwtToken = await signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        message: "user logged in successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token: jwtToken,
      },
      {
        status: 200,
      }
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
    console.error(error);
    return NextResponse.json(
      {
        message: "Failed to login",
      },
      {
        status: 500,
      }
    );
  }
}
