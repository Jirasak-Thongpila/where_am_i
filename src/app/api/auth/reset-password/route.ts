import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import argon2 from "argon2";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        {
          message: "Email, OTP, and new password are required",
        },
        {
          status: 400,
        },
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        {
          message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // 1. Verify OTP
    const [tokenRecord] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.email, normalizedEmail),
          eq(verificationTokens.otp, cleanOtp),
          gt(verificationTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json(
        {
          message: "รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว",
        },
        {
          status: 400,
        },
      );
    }

    // 2. Hash new password with Argon2
    const hashedPassword = await argon2.hash(newPassword);

    // 3. Update password in DB
    const [updatedUser] = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.email, normalizedEmail))
      .returning({ id: users.id, email: users.email });

    if (!updatedUser) {
      return NextResponse.json(
        {
          message: "ไม่พบบัญชีผู้ใช้",
        },
        {
          status: 404,
        },
      );
    }

    // 4. Delete used OTP tokens
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.email, normalizedEmail));

    return NextResponse.json(
      {
        message: "รีเซ็ตรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        message: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน",
      },
      {
        status: 500,
      },
    );
  }
}
