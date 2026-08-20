import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER || "tle0613828245@gmail.com";
const gmailPass = process.env.GMAIL_APP_PASSWORD || "rkmbrwefeqegpsmw";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const from = process.env.EMAIL_FROM || `"Where Am I" <${gmailUser}>`;

  return await transporter.sendMail({
    from: from,
    to: to,
    subject: `รหัสยืนยันอีเมลของคุณ: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #111827; text-align: center; margin-bottom: 12px; font-size: 24px;">ยืนยันอีเมลของคุณ</h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.5; text-align: center;">
          ขอบคุณที่สมัครใช้งานระบบ Where Am I<br/>กรุณาใช้รหัส OTP ด้านล่างนี้เพื่อยืนยันบัญชีของคุณ:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="display: inline-block; font-size: 36px; font-weight: 700; letter-spacing: 8px; padding: 14px 28px; background-color: #f3f4f6; border-radius: 10px; color: #10B981; border: 1px solid #e5e7eb;">
            ${otp}
          </span>
        </div>
        <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 24px;">
          รหัส OTP นี้มีอายุการใช้งาน <strong>15 นาที</strong><br/>
          หากคุณไม่ได้ทำการลงทะเบียน กรุณาเพิกเฉยต่ออีเมลฉบับนี้
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetOtpEmail(to: string, otp: string) {
  const from = process.env.EMAIL_FROM || `"Where Am I" <${gmailUser}>`;

  return await transporter.sendMail({
    from: from,
    to: to,
    subject: `รหัสสำหรับรีเซ็ตรหัสผ่าน: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #111827; text-align: center; margin-bottom: 12px; font-size: 24px;">รีเซ็ตรหัสผ่านของคุณ</h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.5; text-align: center;">
          คุณได้ร้องขอการรีเซ็ตรหัสผ่านสำหรับระบบ Where Am I<br/>กรุณาใช้รหัส OTP ด้านล่างนี้เพื่อตั้งรหัสผ่านใหม่:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="display: inline-block; font-size: 36px; font-weight: 700; letter-spacing: 8px; padding: 14px 28px; background-color: #fef2f2; border-radius: 10px; color: #ef4444; border: 1px solid #fee2e2;">
            ${otp}
          </span>
        </div>
        <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 24px;">
          รหัส OTP นี้มีอายุการใช้งาน <strong>15 นาที</strong><br/>
          หากคุณไม่ได้เป็นผู้ร้องขอ กรุณาเพิกเฉยต่ออีเมลฉบับนี้ รหัสผ่านเดิมของคุณจะยังคงปลอดภัย
        </p>
      </div>
    `,
  });
}
