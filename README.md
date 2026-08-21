# 📍 Where Am I - Backend API

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![Google Cloud Storage](https://img.shields.io/badge/Google_Cloud-Storage-4285F4?logo=googlecloud)](https://cloud.google.com/storage)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-Gmail_SMTP-EA4335?logo=gmail)](https://nodemailer.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ระบบ **Backend API** ประสิทธิภาพสูงสำหรับแอปพลิเคชันบันทึกพิกัดและเช็คอินสถานที่ (**Where Am I**) พัฒนาด้วย **Next.js 16 (App Router)**, **TypeScript**, และ **Neon Serverless PostgreSQL (Drizzle ORM)** พร้อมระบบยืนยันตัวตนความปลอดภัยสูงด้วย **Email OTP 6 หลัก**, จัดเก็บรูปภาพบน **Google Cloud Storage (GCS)** พร้อมระบบลบไฟล์ขยะอัตโนมัติ (Auto-Cleanup) และออกแบบโครงสร้างให้เชื่อมต่อกับ **Flutter (iOS & Android)** รวมถึง Web Client ได้อย่างสมบูรณ์แบบ

---

## ✨ ไฮไลท์ฟีเจอร์ (Key Features)

- 🔐 **ระบบ Authentication & Security**:
  - สมัครสมาชิกพร้อมระบบส่งรหัส **Email OTP 6 หลัก** (อายุ 15 นาที) ป้องกันสแปมและอีเมลปลอม
  - เข้ารหัสผ่านด้วย **Argon2** (มาตรฐานความปลอดภัยสูงสุด)
  - ระบบ Sign & Verify ผ่าน **JWT (`jose`)** รองรับทั้ง `Authorization: Bearer <TOKEN>` และ HTTP-Only Cookies
  - ระบบ **Forgot Password & Reset Password** กู้คืนรหัสผ่านด้วยรหัส OTP ทางอีเมล
  - ระบบเปลี่ยนรหัสผ่าน (Change Password) และลบบัญชีผู้ใช้ถาวร (Delete Account)
- ☁️ **Google Cloud Storage (GCS) & Storage Management**:
  - รองรับการอัปโหลดไฟล์ภาพผ่าน `multipart/form-data` ทั้งรูปโปรไฟล์และรูปสถานที่เช็คอิน
  - **GCS Auto-Cleanup**: ลบรูปภาพเดิมออกจาก Cloud Storage อัตโนมัติเมื่อผู้ใช้อัปโหลดรูปใหม่ หรือลบโพสต์เช็คอิน
  - **Account Deletion Cascade**: ลบรูปภาพทั้งหมดของผู้ใช้ (Avatar, Cover, Check-in photos) ออกจาก GCS ทันทีเมื่อลบบัญชี
- 📍 **ระบบ Check-in & Geolocation**:
  - จัดเก็บพิกัดแม่นยำด้วย `lat` (Latitude), `lng` (Longitude) และ `accuracy` (ความแม่นยำ GPS เป็นเมตร)
  - บันทึกชื่อสถานที่, ที่อยู่, คำบรรยายความทรงจำ และรูปถ่าย
  - ดึงฟีดเช็คอินทั้งหมด หรือระบุ `?my=true` เพื่อดึงเฉพาะรายการของตนเอง
  - ระบบสิทธิ์ (Ownership Protection) ผู้ใช้สามารถแก้ไขหรือลบได้เฉพาะโพสต์ของตนเองเท่านั้น
- 📱 **Flutter & Mobile Ready**:
  - ออกแบบ JSON Response และ Error Handling ชัดเจน เข้ากันได้ 100% กับ `http`, `dio`, `geolocator`, `image_picker` และ `flutter_map`

---

## 🚀 Tech Stack

| ด้าน | เทคโนโลยี / เครื่องมือ | รายละเอียด |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Next.js เวอร์ชันล่าสุด รองรับ Route Handlers และ Edge/Serverless |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe ตลอดทั้งโปรเจกต์ |
| **Database** | [Neon PostgreSQL](https://neon.tech/) | Serverless Postgres ประสิทธิภาพสูง ขยายตัวอัตโนมัติ |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit | Type-safe SQL ORM ที่เร็วและเบาที่สุด |
| **Auth & Crypto** | `jose` (JWT), `argon2` | ระบบ Token และ Hashing มาตรฐานความปลอดภัยระดับองค์กร |
| **Email Service** | [Nodemailer](https://nodemailer.com/) (Gmail SMTP) / [Resend](https://resend.com/) | ส่งรหัส OTP 6 หลัก สำหรับยืนยันตัวตนและรีเซ็ตรหัสผ่าน |
| **Cloud Storage** | [Google Cloud Storage (GCS)](https://cloud.google.com/storage) | จัดเก็บรูปโปรไฟล์และรูปภาพสถานที่เช็คอิน |
| **Deployment** | [Vercel](https://vercel.com/) | CI/CD พร้อมรัน Production Serverless |

---

## ⚙️ การตั้งค่า Environment Variables (`.env`)

สร้างหรือแก้ไขไฟล์ `.env` ใน Root Directory ของโปรเจกต์:

```env
# 1. Neon PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@ep-xxxx.ap-southeast-1.aws.neon.tech/where_am_i?sslmode=require"

# 2. JWT Authentication Secret Key (สำหรับ Sign & Verify Token)
JWT_SECRET=your_super_secret_jwt_key_here

# 3. Google Cloud Storage (GCS) Configuration
GCS_BUCKET_NAME="where_am_i"
GCS_PROJECT_ID="your-gcp-project-id"
GCS_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# 4. Email Service (Gmail SMTP via Nodemailer)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
EMAIL_FROM="Where Am I <your-email@gmail.com>"

# 5. (ทางเลือก) Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

> 💡 **คำแนะนำสำหรับการสร้าง Gmail App Password:**
> 1. ไปที่ [Google Account Security](https://myaccount.google.com/security)
> 2. เปิดใช้งาน **2-Step Verification**
> 3. ค้นหา **App Passwords (รหัสผ่านสำหรับแอป)** แล้วสร้างรหัสผ่าน 16 หลักเพื่อนำมาใส่ใน `GMAIL_APP_PASSWORD`

---

## 💻 การติดตั้งและเริ่มรันเซิร์ฟเวอร์

```bash
# 1. ติดตั้ง Dependencies ทั้งหมด
npm install

# 2. ทำการ Push โครงสร้าง Database Schema ไปยัง Neon PostgreSQL
npm run db:push

# 3. รันเซิร์ฟเวอร์ Development (Port 3000)
npm run dev

# 4. ตรวจสอบการ Build สำหรับ Production
npm run build
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
where_am_i/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts        # POST /api/auth/register (สมัครสมาชิก & ส่ง OTP)
│   │   │   │   ├── verify-otp/route.ts      # POST /api/auth/verify-otp (ยืนยัน OTP & รับ Token)
│   │   │   │   ├── resend-otp/route.ts      # POST /api/auth/resend-otp (ขอ OTP ยืนยันอีเมลใหม่)
│   │   │   │   ├── login/route.ts           # POST /api/auth/login (เข้าสู่ระบบ)
│   │   │   │   ├── forgot-password/route.ts # POST /api/auth/forgot-password (ขอ OTP รีเซ็ตรหัสผ่าน)
│   │   │   │   ├── reset-password/route.ts  # POST /api/auth/reset-password (รีเซ็ตรหัสผ่านด้วย OTP)
│   │   │   │   ├── me/route.ts              # GET, PUT, DELETE /api/auth/me (จัดการโปรไฟล์ & บัญชี)
│   │   │   │   ├── change-password/route.ts # PUT /api/auth/change-password (เปลี่ยนรหัสผ่าน)
│   │   │   │   └── logout/route.ts          # POST /api/auth/logout (ออกจากระบบ)
│   │   │   ├── checking/
│   │   │   │   └── route.ts                 # GET, POST, PUT, DELETE /api/checking (จัดการ Check-in)
│   │   │   ├── images/
│   │   │   │   └── [...path]/
│   │   │   │       └── route.ts             # GET /api/images/[...path] (Image Proxy ให้บริการรูปภาพจาก GCS)
│   │   │   ├── health/
│   │   │   │   └── route.ts                 # GET /api/health (Health Check)
│   │   │   └── test-db/
│   │   │       └── route.ts                 # GET /api/test-db (ทดสอบการเชื่อมต่อ Database)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.module.css
│   │   └── page.tsx                         # Dashboard แสดง Interactive API Documentation
│   ├── db/
│   │   ├── index.ts                         # Neon DB connection pool instance
│   │   └── schema.ts                        # Drizzle ORM tables (users, verificationTokens, checkins)
│   └── lib/
│       ├── auth.ts                          # Helper ถอดรหัส & ตรวจสอบ Auth User จาก Request
│       ├── gcs.ts                           # Helper อัปโหลด/ลบไฟล์บน Google Cloud Storage
│       ├── jwt.ts                           # Sign & Verify JWT Token
│       └── mail.ts                          # ส่งอีเมล OTP ผ่าน Nodemailer (Gmail SMTP)
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## 📖 สรุปรายการ API Endpoints (API Reference)

- **Production Base URL**: `https://where-am-i-silk.vercel.app`
- **Development Base URL**: `http://localhost:3000` (หรือ `http://10.0.2.2:3000` สำหรับ Android Emulator)

| หมวดหมู่ | Method | Endpoint | Auth | คำอธิบาย |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/auth/register` | ❌ | สมัครสมาชิกใหม่และส่งรหัส OTP ทางอีเมล |
| **Auth** | `POST` | `/api/auth/verify-otp` | ❌ | ยืนยันรหัส OTP เพื่อเปิดใช้งานบัญชีและรับ JWT Token |
| **Auth** | `POST` | `/api/auth/resend-otp` | ❌ | ขอส่งรหัส OTP สำหรับยืนยันอีเมลชุดใหม่ |
| **Auth** | `POST` | `/api/auth/login` | ❌ | เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน |
| **Auth** | `POST` | `/api/auth/forgot-password` | ❌ | ขอรหัส OTP 6 หลักเพื่อรีเซ็ตรหัสผ่านทางอีเมล |
| **Auth** | `POST` | `/api/auth/reset-password` | ❌ | รีเซ็ตรหัสผ่านใหม่ด้วยรหัส OTP |
| **Auth** | `GET` | `/api/auth/me` | ✅ | ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน |
| **Auth** | `PUT` | `/api/auth/me` | ✅ | อัปเดตโปรไฟล์/อัปโหลดรูป Avatar ขึ้น GCS (พร้อมลบรูปเดิม) |
| **Auth** | `DELETE` | `/api/auth/me` | ✅ | ลบบัญชีและลบรูปภาพทั้งหมดของผู้ใช้ออกจาก GCS |
| **Auth** | `PUT` | `/api/auth/change-password` | ✅ | เปลี่ยนรหัสผ่านของผู้ใช้ (ระบุรหัสเดิมและรหัสใหม่) |
| **Auth** | `POST` | `/api/auth/logout` | ❌ | ออกจากระบบและเคลียร์ Auth Cookie |
| **Check-in** | `POST` | `/api/checking` | ✅ | สร้างโพสต์เช็คอินพิกัด พร้อมอัปโหลดรูปภาพขึ้น GCS |
| **Check-in** | `GET` | `/api/checking` | ❌/✅ | ดึงรายการเช็คอินทั้งหมด (หรือ `?my=true` สำหรับของตนเอง) |
| **Check-in** | `PUT` | `/api/checking` | ✅ | แก้ไขข้อมูลเช็คอิน/เปลี่ยนรูปภาพใหม่ (พร้อมลบรูปเดิมใน GCS) |
| **Check-in** | `DELETE` | `/api/checking?id={id}` | ✅ | ลบโพสต์เช็คอินและลบรูปภาพออกจาก GCS |
| **Media** | `GET` | `/api/images/{path}` | ❌ | พร็อกซีสตรีมรูปภาพจาก Google Cloud Storage พร้อม Cache Control |
| **System** | `GET` | `/api/health` | ❌ | ตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์ (Health Check) |
| **System** | `GET` | `/api/test-db` | ❌ | ทดสอบการเชื่อมต่อ Database Neon PostgreSQL |

---

## 📚 รายละเอียด API Documentation

### 🔐 1. Authentication APIs (`/api/auth/*`)

#### 1.1 สมัครสมาชิก (Register)
* **Endpoint**: `POST /api/auth/register`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "fname": "Somchai",
    "lname": "Jaidee",
    "email": "somchai@example.com",
    "password": "password1234"
  }
  ```
  *(สามารถส่งเป็น `"name": "Somchai Jaidee"` แทน `fname` + `lname` ได้)*
* **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully. Please verify your email with the OTP sent to your inbox.",
    "user": {
      "id": 1,
      "name": "Somchai Jaidee",
      "email": "somchai@example.com",
      "isVerified": false
    },
    "requiresVerification": true
  }
  ```

---

#### 1.2 ยืนยันรหัส OTP (Verify OTP)
* **Endpoint**: `POST /api/auth/verify-otp`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "email": "somchai@example.com",
    "otp": "723871"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Email verified successfully",
    "user": {
      "id": 1,
      "name": "Somchai Jaidee",
      "email": "somchai@example.com",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
  ```

---

#### 1.3 ขอรหัส OTP ใหม่ (Resend OTP)
* **Endpoint**: `POST /api/auth/resend-otp`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "email": "somchai@example.com"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "New OTP has been sent to your email"
  }
  ```

---

#### 1.4 เข้าสู่ระบบ (Login)
* **Endpoint**: `POST /api/auth/login`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "email": "somchai@example.com",
    "password": "password1234"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Logged in successfully",
    "user": {
      "id": 1,
      "email": "somchai@example.com",
      "name": "Somchai Jaidee",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
  ```

---

#### 1.5 ลืมรหัสผ่าน - ขอรหัส OTP (Forgot Password)
* **Endpoint**: `POST /api/auth/forgot-password`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "email": "somchai@example.com"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "ส่งรหัส OTP สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว"
  }
  ```

---

#### 1.6 รีเซ็ตรหัสผ่านด้วย OTP (Reset Password)
* **Endpoint**: `POST /api/auth/reset-password`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "email": "somchai@example.com",
    "otp": "839201",
    "newPassword": "newpassword5678"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "รีเซ็ตรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที"
  }
  ```

---

#### 1.7 ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน (Get Profile)
* **Endpoint**: `GET /api/auth/me`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "message": "User found",
    "user": {
      "id": 1,
      "email": "somchai@example.com",
      "name": "Somchai Jaidee",
      "bio": "นักเดินทางและช่างภาพ",
      "profileImage": "https://storage.googleapis.com/where_am_i/profiles/1_1787058244392_8f9g12.jpg",
      "coverImage": null,
      "socialLinks": null,
      "isVerified": true,
      "createdAt": "2026-08-18T10:00:00.000Z",
      "updatedAt": "2026-08-18T12:30:00.000Z"
    }
  }
  ```

---

#### 1.8 แก้ไขข้อมูลโปรไฟล์และอัปโหลดรูป Avatar (Update Profile)
* **Endpoint**: `PUT /api/auth/me`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Content-Type**: `multipart/form-data` หรือ `application/json`
* **Form Fields / JSON Properties**:
  - `name` *(string, optional)*: ชื่อ-นามสกุลใหม่
  - `bio` *(string, optional)*: คำแนะนำตัว
  - `image` หรือ `file` หรือ `profileImage` *(File, optional)*: ไฟล์รูปภาพโปรไฟล์ใหม่ (.jpg, .png, .webp) — *ระบบจะอัปโหลดขึ้น GCS และลบรูปโปรไฟล์เดิมทิ้งอัตโนมัติ*
* **Response (200 OK)**:
  ```json
  {
    "message": "Profile updated successfully",
    "user": {
      "id": 1,
      "email": "somchai@example.com",
      "name": "Somchai Jaidee (Updated)",
      "bio": "สวัสดีครับ ผมชอบเที่ยวถ่ายรูป",
      "profileImage": "https://storage.googleapis.com/where_am_i/profiles/1_1787069123456_a1b2c3.jpg",
      "coverImage": null,
      "socialLinks": null,
      "isVerified": true,
      "createdAt": "2026-08-18T10:00:00.000Z",
      "updatedAt": "2026-08-18T14:10:00.000Z"
    }
  }
  ```

---

#### 1.9 เปลี่ยนรหัสผ่าน (Change Password)
* **Endpoint**: `PUT /api/auth/change-password`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Content-Type**: `application/json`
* **Request Body**:
  ```json
  {
    "oldPassword": "password1234",
    "newPassword": "newpassword5678"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Password changed successfully",
    "user": {
      "id": 1,
      "email": "somchai@example.com",
      "name": "Somchai Jaidee"
    }
  }
  ```

---

#### 1.10 ลบบัญชีผู้ใช้ถาวร (Delete Account)
* **Endpoint**: `DELETE /api/auth/me`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **คำอธิบาย**: ลบบัญชีผู้ใช้, ข้อมูลการเช็คอินทั้งหมดในฐานข้อมูล และ**ลบรูปภาพทั้งหมดใน Google Cloud Storage** ของผู้ใช้นั้นอย่างสมบูรณ์
* **Response (200 OK)**:
  ```json
  {
    "message": "Account and all associated data deleted successfully"
  }
  ```

---

#### 1.11 ออกจากระบบ (Logout)
* **Endpoint**: `POST /api/auth/logout`
* **Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

### 📍 2. Check-in Location APIs (`/api/checking`)

#### 2.1 บันทึกการ Check-in พร้อมรูปภาพ (Create Check-in)
* **Endpoint**: `POST /api/checking`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Content-Type**: `multipart/form-data` (หรือ `application/json`)
* **Form Fields**:
  - `lat` *(number, required)*: ละติจูด เช่น `13.7469`
  - `lng` *(number, required)*: ลองจิจูด เช่น `100.5349`
  - `locationName` *(string, optional)*: ชื่อสถานที่ เช่น `"สยามพารากอน"`
  - `address` *(string, optional)*: ที่อยู่ เช่น `"ถ.พระรามที่ ๑ แขวงปทุมวัน กรุงเทพฯ"`
  - `accuracy` *(number, optional)*: ความแม่นยำของ GPS (เมตร) เช่น `15.5`
  - `description` *(string, optional)*: รายละเอียดบันทึกความทรงจำ
  - `image` หรือ `file` *(File, optional)*: ไฟล์รูปภาพ (.jpg, .png, .webp)
* **Response (201 Created)**:
  ```json
  {
    "message": "Check-in created successfully",
    "checkin": {
      "id": 4,
      "userId": 1,
      "lat": 13.7469,
      "lng": 100.5349,
      "locationName": "สยามพารากอน",
      "address": "ถ.พระรามที่ ๑ แขวงปทุมวัน กรุงเทพฯ",
      "accuracy": 15.5,
      "description": "มาเดินเล่นวันหยุด",
      "imageUrl": "https://storage.googleapis.com/where_am_i/checkins/1_1787058244392_79gjqv.jpg",
      "createdAt": "2026-08-18T13:04:05.304Z",
      "updatedAt": "2026-08-18T13:04:05.304Z"
    }
  }
  ```

---

#### 2.2 ดึงรายการ Check-in (Get Check-ins Feed)
* **Endpoint**: `GET /api/checking`
* **Query Parameters**:
  - `my=true` *(optional)*: ดึงเฉพาะ Check-in ของตนเอง (ต้องแนบ Header `Authorization: Bearer <TOKEN>`)
  - `limit=50` *(optional)*: กำหนดจำนวนรายการสูงสุด (Default: 200)
* **Response (200 OK)**:
  ```json
  {
    "message": "Check-ins retrieved successfully",
    "checkins": [
      {
        "id": 4,
        "lat": 13.7469,
        "lng": 100.5349,
        "locationName": "สยามพารากอน",
        "address": "กรุงเทพมหานคร",
        "accuracy": 15.5,
        "description": "มาเดินเล่นวันหยุด",
        "imageUrl": "https://storage.googleapis.com/where_am_i/checkins/1_1787058244392_79gjqv.jpg",
        "createdAt": "2026-08-18T13:04:05.304Z",
        "user": {
          "id": 1,
          "name": "Somchai Jaidee",
          "profileImage": "https://storage.googleapis.com/where_am_i/profiles/1_1787058244392_8f9g12.jpg"
        }
      }
    ]
  }
  ```

---

#### 2.3 แก้ไข Check-in (Update Check-in)
* **Endpoint**: `PUT /api/checking`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Content-Type**: `multipart/form-data` หรือ `application/json`
* **Form Fields / Body**:
  - `id` *(number, required)*: รหัส Check-in ที่ต้องการแก้ไข
  - `locationName` *(string, optional)*: ชื่อสถานที่ใหม่
  - `address` *(string, optional)*: ที่อยู่ใหม่
  - `description` *(string, optional)*: ข้อความบันทึกใหม่
  - `image` *(File, optional)*: อัปโหลดรูปภาพใหม่แทนที่รูปเดิม *(ระบบจะลบรูปเก่าออกจาก GCS อัตโนมัติ)*
* **Response (200 OK)**:
  ```json
  {
    "message": "Check-in updated successfully",
    "checkin": {
      "id": 4,
      "userId": 1,
      "lat": 13.7469,
      "lng": 100.5349,
      "locationName": "สยามพารากอน ชั้น G",
      "address": "ถ.พระรามที่ ๑ แขวงปทุมวัน กรุงเทพฯ",
      "accuracy": 15.5,
      "description": "แก้ไขข้อความเช็คอินใหม่",
      "imageUrl": "https://storage.googleapis.com/where_am_i/checkins/1_1787089123456_xy98z1.jpg",
      "createdAt": "2026-08-18T13:04:05.304Z",
      "updatedAt": "2026-08-18T15:20:10.120Z"
    }
  }
  ```

---

#### 2.4 ลบ Check-in (Delete Check-in)
* **Endpoint**: `DELETE /api/checking?id=4`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **คำอธิบาย**: ลบ Check-in และระบบจะทำการลบไฟล์รูปภาพออกจาก Google Cloud Storage โดยอัตโนมัติ (เฉพาะเจ้าของโพสต์เท่านั้น)
* **Response (200 OK)**:
  ```json
  {
    "message": "Check-in deleted successfully"
  }
  ```

---

### ⚙️ 3. System & Health Check APIs

#### 3.1 ตรวจสอบสถานะเซิร์ฟเวอร์ (Health Check)
* **Endpoint**: `GET /api/health`
* **Response (200 OK)**:
  ```json
  {
    "status": "ok"
  }
  ```

#### 3.2 ทดสอบการเชื่อมต่อฐานข้อมูล (Test DB Connection)
* **Endpoint**: `GET /api/test-db`
* **Response (200 OK)**:
  ```json
  {
    "message": "database connection success",
    "users": []
  }
  ```

---

### 🖼️ 4. Media & Image Proxy APIs (`/api/images/*`)

#### 4.1 ดึงและแสดงผลรูปภาพจาก Google Cloud Storage (Get / Proxy Image)
* **Endpoint**: `GET /api/images/{path}`
* **คำอธิบาย**: ดึงไฟล์รูปภาพจาก Google Cloud Storage (GCS) ผ่านเซิร์ฟเวอร์ Backend เพื่อแสดงผลบนแอปพลิเคชันหรือเว็บ พร้อมแนบ Header Caching เพื่อประสิทธิภาพสูงสุด
* **ตัวอย่างการเรียกใช้งาน**:
  - รูปโปรไฟล์: `GET /api/images/profiles/1_1787058244392_8f9g12.jpg`
  - รูปเช็คอิน: `GET /api/images/checkins/1_1787058244392_79gjqv.jpg`
* **URL Parameters**:
  - `path` *(string, required)*: Path ของไฟล์ใน GCS Bucket (เช่น `profiles/...` หรือ `checkins/...`)
* **Headers**: ไม่จำเป็นต้องส่ง Token (Public Access)
* **Response Headers**:
  - `Content-Type`: `image/jpeg` / `image/png` / `image/webp` (ตามประเภทไฟล์รูปภาพ)
  - `Cache-Control`: `public, max-age=31536000, immutable`
* **Response (200 OK)**:
  Binary Data Stream ของไฟล์รูปภาพ
* **Response (400 Bad Request)**:
  ```json
  {
    "message": "File path is required"
  }
  ```
* **Response (404 Not Found)**:
  ```json
  {
    "message": "Image not found"
  }
  ```

---

## 📱 วิธีเชื่อมต่อและใช้งานกับ Flutter

### 1. แพ็กเกจที่แนะนำสำหรับ Flutter (`pubspec.yaml`)

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0           # สำหรับเรียกใช้งาน REST API (JSON & Multipart)
  geolocator: ^11.0.0    # ดึงพิกัด GPS ละติจูด, ลองจิจูด และ Accuracy
  image_picker: ^1.0.7   # ถ่ายรูปด้วยกล้อง หรือเลือกรูปจากแกลเลอรี
  flutter_map: ^6.1.0    # แผนที่ OpenStreetMap ฟรี 100% (ไม่ต้องใช้ API Key)
  latlong2: ^0.9.0       # จัดการข้อมูลพิกัด ละติจูด/ลองจิจูด
```

---

### 2. Service ตัวอย่างสำหรับระบบ Authentication (`auth_service.dart`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  // Production URL หรือสำหรับ Android Emulator ใช้: "http://10.0.2.2:3000"
  static const String baseUrl = "https://where-am-i-silk.vercel.app";

  // 1. สมัครสมาชิก
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
      }),
    );
    return jsonDecode(response.body);
  }

  // 2. ยืนยันรหัส OTP
  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/verify-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'otp': otp,
      }),
    );
    return jsonDecode(response.body);
  }

  // 3. เข้าสู่ระบบ
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );
    return jsonDecode(response.body);
  }

  // 4. ขอ OTP รีเซ็ตรหัสผ่าน (Forgot Password)
  Future<Map<String, dynamic>> forgotPassword(String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/forgot-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
    return jsonDecode(response.body);
  }

  // 5. รีเซ็ตรหัสผ่านใหม่ด้วย OTP (Reset Password)
  Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/reset-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'otp': otp,
        'newPassword': newPassword,
      }),
    );
    return jsonDecode(response.body);
  }
}
```

---

### 3. Service ตัวอย่างสำหรับ Check-in พร้อมรูปถ่าย (`checkin_service.dart`)

```dart
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

class CheckinService {
  static const String baseUrl = "https://where-am-i-silk.vercel.app";

  // ฟังก์ชัน Check-in พร้อมพิกัด GPS ปัจจุบันและรูปภาพ
  Future<bool> createCheckin({
    required String token,
    required String locationName,
    required String description,
    File? imageFile,
  }) async {
    // 1. ดึงพิกัด GPS ปัจจุบันจากอุปกรณ์
    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    // 2. สร้าง Multipart Request
    var uri = Uri.parse('$baseUrl/api/checking');
    var request = http.MultipartRequest('POST', uri);

    // 3. แนบ Auth Bearer Token
    request.headers['Authorization'] = 'Bearer $token';

    // 4. แนบข้อมูลพิกัดและรายละเอียด
    request.fields['lat'] = position.latitude.toString();
    request.fields['lng'] = position.longitude.toString();
    request.fields['accuracy'] = position.accuracy.toString();
    request.fields['locationName'] = locationName;
    request.fields['description'] = description;

    // 5. แนบไฟล์รูปภาพ
    if (imageFile != null && await imageFile.exists()) {
      request.files.add(
        await http.MultipartFile.fromPath('image', imageFile.path),
      );
    }

    // 6. ส่งข้อมูลไปยัง Backend
    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201) {
      print("✅ เช็คอินสำเร็จ: ${response.body}");
      return true;
    } else {
      print("❌ ผิดพลาด (${response.statusCode}): ${response.body}");
      return false;
    }
  }

  // ดึงรายการ Check-ins Feed ทั้งหมด หรือของตนเอง (?my=true)
  Future<List<dynamic>> getCheckins({String? token, bool onlyMine = false}) async {
    String url = '$baseUrl/api/checking';
    if (onlyMine) url += '?my=true';

    Map<String, String> headers = {};
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    final response = await http.get(Uri.parse(url), headers: headers);
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['checkins'] ?? [];
    }
    return [];
  }
}
```

---

### 4. ตัวอย่างการแสดงผลแผนที่และหมุดด้วย `flutter_map` (OpenStreetMap)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class CheckinMapScreen extends StatelessWidget {
  final List<dynamic> checkinList;

  const CheckinMapScreen({super.key, required this.checkinList});

  @override
  Widget build(BuildContext context) {
    // กำหนดพิกัดเริ่มต้นจากจุดเช็คอินแรก หรือ กรุงเทพฯ
    final LatLng initialCenter = checkinList.isNotEmpty
        ? LatLng(checkinList[0]['lat'], checkinList[0]['lng'])
        : const LatLng(13.7563, 100.5018);

    return Scaffold(
      appBar: AppBar(title: const Text("📍 แผนที่การเช็คอิน")),
      body: FlutterMap(
        options: MapOptions(
          initialCenter: initialCenter,
          initialZoom: 13.0,
        ),
        children: [
          // OpenStreetMap Tile Layer (ฟรี 100% ไม่ต้องใช้ API Key)
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.example.where_am_i',
          ),
          // ปักหมุด Check-in แต่ละตำแหน่ง
          MarkerLayer(
            markers: checkinList.map((item) {
              return Marker(
                point: LatLng(item['lat'], item['lng']),
                width: 45,
                height: 45,
                child: GestureDetector(
                  onTap: () {
                    showModalBottomSheet(
                      context: context,
                      builder: (ctx) => Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['locationName'] ?? "ไม่ระบุชื่อสถานที่",
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            Text(item['description'] ?? ""),
                            if (item['imageUrl'] != null) ...[
                              const SizedBox(height: 10),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(item['imageUrl'], height: 150, fit: BoxFit.cover),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                  child: const Icon(
                    Icons.location_on,
                    color: Colors.redAccent,
                    size: 40,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
```

---

## 📄 สัญญาอนุญาต (License)

โปรเจกต์นี้เผยแพร่ภายใต้สัญญาอนุญาต [MIT License](LICENSE) สามารถนำไปพัฒนาต่อยอด ใช้งาน และปรับแต่งได้อย่างอิสระ
