import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import argon2 from "argon2";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const hashPassword = await argon2.hash(password);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        {
          message: "user not found",
        },
        { status: 404 },
      );
    }

    const verifyPassword = await argon2.verify(user[0].password, password);
    if (!verifyPassword) {
      return NextResponse.json(
        {
          message: "invalid password",
        },
        { status: 401 },
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "username and password are required",
        },
        {
          status: 400,
        },
      );
    } else {
      return NextResponse.json(
        {
          message: "user logged in successfully",
          user: user[0],
        },
        {
          status: 200,
        },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Failed to login",
      },
      {
        status: 500,
      },
    );
  }
}
