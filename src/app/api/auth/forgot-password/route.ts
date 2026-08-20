import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sendPasswordResetOtpEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        {
          message: "Valid email is required",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user exists
    const [existingUser] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "ไม่พบบัญชีผู้ใช้นี้ในระบบ",
        },
        {
          status: 404,
        },
      );
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // 3. Clear existing tokens
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.email, normalizedEmail));

    // 4. Save new OTP
    await db.insert(verificationTokens).values({
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    // 5. Send OTP Email
    await sendPasswordResetOtpEmail(normalizedEmail, otp);

    return NextResponse.json(
      {
        message: "ส่งรหัส OTP สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        message: "เกิดข้อผิดพลาดในการส่งรหัส OTP",
      },
      {
        status: 500,
      },
    );
  }
}
