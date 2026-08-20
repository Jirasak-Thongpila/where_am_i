"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  category: "auth" | "checking" | "system";
  title: string;
  description: string;
  authRequired: boolean;
  contentType?: string;
  requestBody?: string;
  responseBody: string;
}

const endpoints: Endpoint[] = [
  // Authentication APIs
  {
    method: "POST",
    path: "/api/auth/register",
    category: "auth",
    title: "Register New Account",
    description: "สมัครสมาชิกใหม่ (รองรับทุกอีเมล) และส่งรหัส OTP 6 หลักเข้าอีเมลผ่าน Resend",
    authRequired: false,
    contentType: "application/json",
    requestBody: JSON.stringify(
      {
        fname: "Somchai",
        lname: "Jaidee",
        email: "somchai@example.com",
        password: "password1234",
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        message:
          "User registered successfully. Please verify your email with the OTP sent to your inbox.",
        user: {
          id: 1,
          name: "Somchai Jaidee",
          email: "somchai@example.com",
          isVerified: false,
        },
        requiresVerification: true,
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/auth/verify-otp",
    category: "auth",
    title: "Verify Email with OTP",
    description: "ยืนยันรหัส OTP 6 หลัก เพื่อเปิดใช้งานบัญชี (isVerified: true) และรับ JWT Token",
    authRequired: false,
    contentType: "application/json",
    requestBody: JSON.stringify(
      {
        email: "somchai@example.com",
        otp: "723871",
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        message: "Email verified successfully",
        user: {
          id: 1,
          name: "Somchai Jaidee",
          email: "somchai@example.com",
          isVerified: true,
        },
        token: "eyJhbGciOiJIUzI1NiJ9...",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/auth/resend-otp",
    category: "auth",
    title: "Resend Verification OTP",
    description: "ขอส่งรหัส OTP 6 หลักชุดใหม่ไปยังอีเมล (กรณีรหัสเดิมหมดอายุหรือสูญหาย)",
    authRequired: false,
    contentType: "application/json",
    requestBody: JSON.stringify(
      {
        email: "somchai@example.com",
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        message: "New OTP has been sent to your email",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/auth/login",
    category: "auth",
    title: "User Login",
    description: "เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน ได้รับ JWT Token และ HTTP-Only Cookie",
    authRequired: false,
    contentType: "application/json",
    requestBody: JSON.stringify(
      {
        email: "somchai@example.com",
        password: "password1234",
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        message: "Logged in successfully",
        user: {
          id: 1,
          email: "somchai@example.com",
          name: "Somchai Jaidee",
          isVerified: true,
        },
        token: "eyJhbGciOiJIUzI1NiJ9...",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/auth/forgot-password",
    category: "auth",
    title: "Forgot Password (Request OTP)",
    description: "ขอรหัส OTP 6 หลัก สำหรับการรีเซ็ตรหัสผ่านทางอีเมล",
    authRequired: false,
    contentType: "application/json",
    requestBody: JSON.stringify(
      {
        email: "somchai@example.com",
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        message: "ส่งรหัส OTP สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/auth/reset-password",
    category: "auth",
    title: "Reset Password with OTP",
    description: "รีเซ็ตรหัสผ่านใหม่โดยใช้รหัส OTP ที่ได้รับทางอีเมล",
    authRequired: false,
    contentType: "application/json",
    requestBody: JSON.stringify(
      {
        email: "somchai@example.com",
        otp: "839201",
        newPassword: "newpassword5678",
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        message: "รีเซ็ตรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที",
      },
      null,
      2,
    ),
  },
  {
    method: "GET",
    path: "/api/auth/me",
    category: "auth",
    title: "Get Current Profile",
    description: "ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบันที่ทำการ Login อยู่",
    authRequired: true,
    responseBody: JSON.stringify(
      {
        message: "User found",
        user: {
          id: 1,
          email: "somchai@example.com",
          name: "Somchai Jaidee",
          bio: "นักเดินทางและช่างภาพ",
          profileImage: "https://storage.googleapis.com/where_am_i/profiles/1_1787058244392_8f9g12.jpg",
          coverImage: null,
          isVerified: true,
          createdAt: "2026-08-18T10:00:00.000Z",
          updatedAt: "2026-08-18T12:30:00.000Z",
        },
      },
      null,
      2,
    ),
  },
  {
    method: "PUT",
    path: "/api/auth/me",
    category: "auth",
    title: "Update Profile & Avatar",
    description: "อัปเดตข้อมูลโปรไฟล์และอัปโหลดรูป Avatar ขึ้น GCS (พร้อมระบบลบรูปเดิมอัตโนมัติ)",
    authRequired: true,
    contentType: "multipart/form-data or application/json",
    requestBody: `name: "Somchai Jaidee (Updated)"
bio: "สวัสดีครับ ผมชอบเที่ยวถ่ายรูป"
image: [File (.jpg, .png, .webp)]`,
    responseBody: JSON.stringify(
      {
        message: "Profile updated successfully",
        user: {
          id: 1,
          email: "somchai@example.com",
          name: "Somchai Jaidee (Updated)",
          bio: "สวัสดีครับ ผมชอบเที่ยวถ่ายรูป",
          profileImage: "https://storage.googleapis.com/where_am_i/profiles/1_1787069123456_a1b2c3.jpg",
          isVerified: true,
        },
      },
      null,
      2,
    ),
  },
  {
    method: "PUT",
    path: "/api/auth/change-password",
    category: "auth",
    title: "Change Password",
    description: "เปลี่ยนรหัสผ่านใหม่ของผู้ใช้ (ต้องระบุ oldPassword และ newPassword)",
    authRequired: true,
    contentType: "application/json",
    requestBody: JSON.stringify(
      {
        oldPassword: "password1234",
        newPassword: "newpassword5678",
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        message: "Password changed successfully",
        user: {
          id: 1,
          email: "somchai@example.com",
          name: "Somchai Jaidee",
        },
      },
      null,
      2,
    ),
  },
  {
    method: "DELETE",
    path: "/api/auth/me",
    category: "auth",
    title: "Delete Account",
    description: "ลบบัญชีผู้ใช้ถาวร พร้อมลบข้อมูลเช็คอินและรูปภาพทั้งหมดใน GCS ของผู้ใช้นี้",
    authRequired: true,
    responseBody: JSON.stringify(
      {
        message: "Account and all associated data deleted successfully",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/auth/logout",
    category: "auth",
    title: "User Logout",
    description: "ออกจากระบบและเคลียร์ auth-token cookie",
    authRequired: false,
    responseBody: JSON.stringify(
      {
        message: "Logged out successfully",
      },
      null,
      2,
    ),
  },

  // Check-in Location APIs
  {
    method: "POST",
    path: "/api/checking",
    category: "checking",
    title: "Create Check-in with Image",
    description: "บันทึกพิกัดสถานที่พร้อมอัปโหลดรูปภาพขึ้น Google Cloud Storage (GCS)",
    authRequired: true,
    contentType: "multipart/form-data",
    requestBody: `lat: 13.7469
lng: 100.5349
locationName: "Siam Paragon"
address: "ถ.พระรามที่ ๑ แขวงปทุมวัน กรุงเทพมหานคร"
accuracy: 15.5
description: "มาเดินเล่นวันหยุด"
image: [File (.jpg, .png, .webp)]`,
    responseBody: JSON.stringify(
      {
        message: "Check-in created successfully",
        checkin: {
          id: 4,
          userId: 1,
          lat: 13.7469,
          lng: 100.5349,
          locationName: "Siam Paragon",
          address: "ถ.พระรามที่ ๑ แขวงปทุมวัน กรุงเทพมหานคร",
          accuracy: 15.5,
          description: "มาเดินเล่นวันหยุด",
          imageUrl:
            "https://storage.googleapis.com/where_am_i/checkins/1_1787058244392_79gjqv.jpg",
          createdAt: "2026-08-18T13:04:05.304Z",
        },
      },
      null,
      2,
    ),
  },
  {
    method: "GET",
    path: "/api/checking",
    category: "checking",
    title: "Get Check-ins Feed",
    description: "ดึงรายการ Check-in ทั้งหมด (รองรับ ?my=true เพื่อดึงเฉพาะของฉัน และ ?limit=N)",
    authRequired: false,
    responseBody: JSON.stringify(
      {
        message: "Check-ins retrieved successfully",
        checkins: [
          {
            id: 4,
            lat: 13.7469,
            lng: 100.5349,
            locationName: "Siam Paragon",
            address: "กรุงเทพมหานคร",
            accuracy: 15.5,
            description: "มาเดินเล่นวันหยุด",
            imageUrl:
              "https://storage.googleapis.com/where_am_i/checkins/1_1787058244392_79gjqv.jpg",
            createdAt: "2026-08-18T13:04:05.304Z",
            user: {
              id: 1,
              name: "Somchai Jaidee",
              profileImage: null,
            },
          },
        ],
      },
      null,
      2,
    ),
  },
  {
    method: "PUT",
    path: "/api/checking",
    category: "checking",
    title: "Update Check-in",
    description: "แก้ไขข้อมูล Check-in (เฉพาะเจ้าของโพสต์เท่านั้น)",
    authRequired: true,
    contentType: "application/json or multipart/form-data",
    requestBody: JSON.stringify(
      {
        id: 4,
        locationName: "Siam Paragon ชั้น G",
        description: "แก้ไขข้อความใหม่",
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        message: "Check-in updated successfully",
        checkin: {
          id: 4,
          locationName: "Siam Paragon ชั้น G",
          description: "แก้ไขข้อความใหม่",
          imageUrl: "https://storage.googleapis.com/where_am_i/checkins/...",
        },
      },
      null,
      2,
    ),
  },
  {
    method: "DELETE",
    path: "/api/checking?id={id}",
    category: "checking",
    title: "Delete Check-in",
    description: "ลบรายการ Check-in ตาม ID (เฉพาะเจ้าของโพสต์เท่านั้น)",
    authRequired: true,
    responseBody: JSON.stringify(
      {
        message: "Check-in deleted successfully",
      },
      null,
      2,
    ),
  },

  // System
  {
    method: "GET",
    path: "/api/health",
    category: "system",
    title: "Server Health Check",
    description: "ตรวจสอบสถานะการทำงานของ API Server",
    authRequired: false,
    responseBody: JSON.stringify(
      {
        status: "ok",
      },
      null,
      2,
    ),
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const baseUrl = "https://where-am-i-silk.vercel.app";

  const handleCopyBaseUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesCategory =
      selectedCategory === "all" || ep.category === selectedCategory;
    const matchesSearch =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header Hero */}
        <header className={styles.header}>
          <div className={styles.statusBadge}>
            <span className={styles.pulseDot}></span>
            <span>All API Systems Operational • Production Vercel</span>
          </div>

          <h1 className={styles.title}>Where Am I — Backend API</h1>
          <p className={styles.subtitle}>
            High-Performance RESTful API สำหรับแอปพลิเคชันมือถือ (Flutter) & เว็บ
            พร้อมระบบยืนยันตัวตนด้วย OTP และ Cloud Storage สำหรับรูปภาพ
          </p>

          <div className={styles.baseUrlBox}>
            <span className={styles.baseUrlText}>{baseUrl}</span>
            <button className={styles.copyButton} onClick={handleCopyBaseUrl}>
              {copied ? "✓ Copied!" : "📋 Copy URL"}
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⚡</span>
            <div>
              <div className={styles.statVal}>12 Endpoints</div>
              <div className={styles.statLabel}>Auth & Check-in CRUD</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🐘</span>
            <div>
              <div className={styles.statVal}>Neon PostgreSQL</div>
              <div className={styles.statLabel}>Serverless & Drizzle ORM</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>☁️</span>
            <div>
              <div className={styles.statVal}>Google Cloud Storage</div>
              <div className={styles.statLabel}>High-Speed Image Storage</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>✉️</span>
            <div>
              <div className={styles.statVal}>Resend Email OTP</div>
              <div className={styles.statLabel}>Instant 6-Digit Codes</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterContainer}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tabButton} ${selectedCategory === "all" ? styles.activeTab : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All APIs ({endpoints.length})
            </button>
            <button
              className={`${styles.tabButton} ${selectedCategory === "auth" ? styles.activeTab : ""}`}
              onClick={() => setSelectedCategory("auth")}
            >
              🔐 Authentication (7)
            </button>
            <button
              className={`${styles.tabButton} ${selectedCategory === "checking" ? styles.activeTab : ""}`}
              onClick={() => setSelectedCategory("checking")}
            >
              📍 Location Check-in (4)
            </button>
            <button
              className={`${styles.tabButton} ${selectedCategory === "system" ? styles.activeTab : ""}`}
              onClick={() => setSelectedCategory("system")}
            >
              ⚙️ System (1)
            </button>
          </div>

          <input
            type="text"
            placeholder="🔍 Search endpoints (e.g. login, checkin)..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* API Cards List */}
        <div className={styles.apiList}>
          {filteredEndpoints.map((ep, idx) => {
            const cardId = `${ep.method}-${ep.path}-${idx}`;
            const isExpanded = expandedId === cardId;

            return (
              <div key={cardId} className={styles.apiCard}>
                <div
                  className={styles.apiHeader}
                  onClick={() => toggleExpand(cardId)}
                >
                  <div className={styles.apiHeaderLeft}>
                    <span
                      className={`${styles.methodBadge} ${
                        styles[`method${ep.method}`]
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className={styles.pathText}>{ep.path}</span>
                    {ep.authRequired ? (
                      <span
                        className={`${styles.authBadge} ${styles.authBadgeLocked}`}
                      >
                        🔒 Bearer Auth
                      </span>
                    ) : (
                      <span className={styles.authBadge}>🔓 Public</span>
                    )}
                    <span className={styles.descText}>— {ep.title}</span>
                  </div>
                  <span
                    className={`${styles.expandIcon} ${
                      isExpanded ? styles.expanded : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>

                {isExpanded && (
                  <div className={styles.apiBody}>
                    <div>
                      <div className={styles.sectionTitle}>
                        <span>Description</span>
                      </div>
                      <p
                        style={{
                          color: "#cbd5e1",
                          fontSize: "0.9rem",
                          lineHeight: "1.6",
                          marginBottom: "1rem",
                        }}
                      >
                        {ep.description}
                      </p>

                      {ep.contentType && (
                        <div style={{ marginBottom: "1rem" }}>
                          <span
                            style={{
                              fontSize: "0.78rem",
                              color: "#94a3b8",
                              marginRight: "0.5rem",
                            }}
                          >
                            Content-Type:
                          </span>
                          <code
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              padding: "0.2rem 0.4rem",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                              color: "#38bdf8",
                            }}
                          >
                            {ep.contentType}
                          </code>
                        </div>
                      )}

                      {ep.requestBody && (
                        <>
                          <div className={styles.sectionTitle}>
                            <span>Request Payload</span>
                          </div>
                          <pre className={styles.codeBlock}>
                            {ep.requestBody}
                          </pre>
                        </>
                      )}
                    </div>

                    <div>
                      <div className={styles.sectionTitle}>
                        <span>Example Response</span>
                      </div>
                      <pre className={styles.codeBlock}>{ep.responseBody}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div>© {new Date().getFullYear()} Where Am I API. Built with Next.js 16 & Drizzle ORM.</div>
          <div className={styles.footerLinks}>
            <a
              href="https://github.com/Jirasak-Thongpila/where_am_i"
              target="_blank"
              rel="noreferrer"
              className={styles.footerLink}
            >
              GitHub Repository
            </a>
            <a
              href="https://where-am-i-silk.vercel.app/api/health"
              target="_blank"
              rel="noreferrer"
              className={styles.footerLink}
            >
              Health Check
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
