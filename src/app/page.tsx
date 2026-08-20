"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  ShieldCheck,
  MapPin,
  Server,
  Key,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Database,
  Cloud,
  Mail,
  Play,
  Code2,
  Lock,
  Unlock,
  Terminal,
  Activity,
  Layers,
  Smartphone,
  Info,
  RefreshCw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";

interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  category: "auth" | "checking" | "system";
  title: string;
  description: string;
  authRequired: boolean;
  contentType?: string;
  requestBody?: string;
  responseBody: string;
  defaultParams?: Record<string, string>;
}

const endpoints: Endpoint[] = [
  // Authentication APIs
  {
    id: "auth-register",
    method: "POST",
    path: "/api/auth/register",
    category: "auth",
    title: "Register New Account",
    description: "สมัครสมาชิกใหม่ และส่งรหัส OTP 6 หลักเข้าอีเมลผ่านระบบ Resend",
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
      2
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
      2
    ),
  },
  {
    id: "auth-verify-otp",
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
      2
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
        token: "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaWF0IjoxNzg3MDU4MjQ0fQ...",
      },
      null,
      2
    ),
  },
  {
    id: "auth-resend-otp",
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
      2
    ),
    responseBody: JSON.stringify(
      {
        message: "New OTP has been sent to your email",
      },
      null,
      2
    ),
  },
  {
    id: "auth-login",
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
      2
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
        token: "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaWF0IjoxNzg3MDU4MjQ0fQ...",
      },
      null,
      2
    ),
  },
  {
    id: "auth-forgot-password",
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
      2
    ),
    responseBody: JSON.stringify(
      {
        message: "ส่งรหัส OTP สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว",
      },
      null,
      2
    ),
  },
  {
    id: "auth-reset-password",
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
      2
    ),
    responseBody: JSON.stringify(
      {
        message: "รีเซ็ตรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที",
      },
      null,
      2
    ),
  },
  {
    id: "auth-me-get",
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
      2
    ),
  },
  {
    id: "auth-me-put",
    method: "PUT",
    path: "/api/auth/me",
    category: "auth",
    title: "Update Profile & Avatar",
    description: "อัปเดตข้อมูลโปรไฟล์และอัปโหลดรูป Avatar ขึ้น GCS (พร้อมระบบลบรูปเดิมอัตโนมัติ)",
    authRequired: true,
    contentType: "multipart/form-data or application/json",
    requestBody: `name: "Somchai Jaidee (Updated)"\nbio: "สวัสดีครับ ผมชอบเที่ยวถ่ายรูป"\nimage: [File (.jpg, .png, .webp)]`,
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
      2
    ),
  },
  {
    id: "auth-change-password",
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
      2
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
      2
    ),
  },
  {
    id: "auth-me-delete",
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
      2
    ),
  },
  {
    id: "auth-logout",
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
      2
    ),
  },

  // Check-in Location APIs
  {
    id: "checking-create",
    method: "POST",
    path: "/api/checking",
    category: "checking",
    title: "Create Check-in with Image",
    description: "บันทึกพิกัดสถานที่พร้อมอัปโหลดรูปภาพขึ้น Google Cloud Storage (GCS)",
    authRequired: true,
    contentType: "multipart/form-data",
    requestBody: `lat: 13.7469\nlng: 100.5349\nlocationName: "Siam Paragon"\naddress: "ถ.พระรามที่ ๑ แขวงปทุมวัน กรุงเทพมหานคร"\naccuracy: 15.5\ndescription: "มาเดินเล่นวันหยุด"\nimage: [File (.jpg, .png, .webp)]`,
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
          imageUrl: "https://storage.googleapis.com/where_am_i/checkins/1_1787058244392_79gjqv.jpg",
          createdAt: "2026-08-18T13:04:05.304Z",
        },
      },
      null,
      2
    ),
  },
  {
    id: "checking-feed",
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
            imageUrl: "https://storage.googleapis.com/where_am_i/checkins/1_1787058244392_79gjqv.jpg",
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
      2
    ),
  },
  {
    id: "checking-update",
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
      2
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
      2
    ),
  },
  {
    id: "checking-delete",
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
      2
    ),
  },

  // System
  {
    id: "system-health",
    method: "GET",
    path: "/api/health",
    category: "system",
    title: "Server Health Check",
    description: "ตรวจสอบสถานะการทำงานของ API Server และการเชื่อมต่อฐานข้อมูล",
    authRequired: false,
    responseBody: JSON.stringify(
      {
        status: "ok",
        uptime: "99.98%",
        timestamp: "2026-08-20T15:20:00.000Z",
      },
      null,
      2
    ),
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>("system-health");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [baseUrlCopied, setBaseUrlCopied] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string>("");

  // Interactive Live Request Playground state
  const [testResults, setTestResults] = useState<
    Record<
      string,
      {
        loading: boolean;
        status?: number;
        time?: number;
        data?: unknown;
        error?: string;
      }
    >
  >({});

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://where-am-i-silk.vercel.app";

  const handleCopyBaseUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setBaseUrlCopied(true);
    setTimeout(() => setBaseUrlCopied(false), 2000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(id);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Run Live API Test
  const runLiveTest = async (ep: Endpoint) => {
    const epId = ep.id;
    setTestResults((prev) => ({
      ...prev,
      [epId]: { loading: true },
    }));

    const startTime = performance.now();
    try {
      const headers: Record<string, string> = {};
      if (ep.contentType && ep.contentType.includes("application/json")) {
        headers["Content-Type"] = "application/json";
      }
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      let res: Response;
      if (ep.method === "GET") {
        res = await fetch(ep.path, { headers });
      } else if (
        ep.method === "POST" ||
        ep.method === "PUT" ||
        ep.method === "DELETE"
      ) {
        res = await fetch(ep.path, {
          method: ep.method,
          headers,
          body:
            ep.requestBody && ep.contentType?.includes("json")
              ? ep.requestBody
              : undefined,
        });
      } else {
        res = await fetch(ep.path);
      }

      const duration = Math.round(performance.now() - startTime);
      let data;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }

      setTestResults((prev) => ({
        ...prev,
        [epId]: {
          loading: false,
          status: res.status,
          time: duration,
          data,
        },
      }));
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - startTime);
      setTestResults((prev) => ({
        ...prev,
        [epId]: {
          loading: false,
          time: duration,
          error: (err as Error).message || "Request failed",
        },
      }));
    }
  };

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesCategory =
        selectedCategory === "all" || ep.category === selectedCategory;
      const matchesMethod =
        selectedMethod === "all" || ep.method === selectedMethod;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        ep.path.toLowerCase().includes(q) ||
        ep.title.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q);
      return matchesCategory && matchesMethod && matchesSearch;
    });
  }, [selectedCategory, selectedMethod, searchQuery]);

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case "GET":
        return "get";
      case "POST":
        return "post";
      case "PUT":
        return "put";
      case "DELETE":
        return "delete";
      default:
        return "default";
    }
  };

  const generateCurl = (ep: Endpoint) => {
    let curl = `curl -X ${ep.method} "${baseUrl}${ep.path}"`;
    if (ep.authRequired) {
      curl += ` \\\n  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"`;
    }
    if (ep.contentType?.includes("json")) {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      if (ep.requestBody) {
        curl += ` \\\n  -d '${ep.requestBody.replace(/\n/g, " ")}'`;
      }
    }
    return curl;
  };

  const generateDart = (ep: Endpoint) => {
    return `import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> ${ep.id.replace(/-/g, "_")}() async {
  final url = Uri.parse('$baseUrl${ep.path}');
  final response = await http.${ep.method.toLowerCase()}(
    url,
    headers: {
      ${ep.contentType?.includes("json") ? "'Content-Type': 'application/json',\n      " : ""}${
      ep.authRequired ? "'Authorization': 'Bearer \$jwtToken',\n    " : ""}},${
      ep.requestBody && ep.contentType?.includes("json")
        ? `\n    body: jsonEncode(${ep.requestBody}),`
        : ""
    }
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    print('Success: \$data');
  }
}`;
  };

  const generateJs = (ep: Endpoint) => {
    return `const response = await fetch('${baseUrl}${ep.path}', {
  method: '${ep.method}',
  headers: {
    ${ep.contentType?.includes("json") ? "'Content-Type': 'application/json',\n    " : ""}${
      ep.authRequired ? "'Authorization': 'Bearer ' + token,\n  " : ""}},${
      ep.requestBody && ep.contentType?.includes("json")
        ? `\n  body: JSON.stringify(${ep.requestBody})`
        : ""
    }
});
const data = await response.json();
console.log(data);`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Top Glass Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base sm:text-lg">
                  Where Am I
                </span>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[10px] font-mono uppercase bg-muted/60"
                >
                  REST API v1.0
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Systems Operational</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  "https://github.com/Jirasak-Thongpila/where_am_i",
                  "_blank"
                )
              }
              className="hidden sm:flex items-center gap-1.5 cursor-pointer"
            >
              <Code2 className="h-4 w-4" />
              <span>GitHub</span>
            </Button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm transition-all">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next.js 16 • PostgreSQL • GCS • Resend OTP</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Where Am I — REST API & Interactive Console
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              ระบบศูนย์กลาง API สำหรับแอปพลิเคชันมือถือ (Flutter) & เว็บ
              รองรับระบบยืนยันตัวตนด้วยรหัส OTP 6 หลัก, JWT Session, Google Cloud
              Storage สำหรับรูปภาพ และระบบ Check-in บันทึกพิกัดตำแหน่ง
            </p>

            {/* Base URL Box */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl rounded-xl border border-border bg-muted/40 p-2 backdrop-blur">
                <div className="flex items-center gap-2 px-3 py-1 flex-1 overflow-hidden">
                  <Terminal className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs sm:text-sm font-mono text-foreground truncate">
                    {baseUrl}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleCopyBaseUrl}
                  className="gap-1.5 shrink-0 font-medium"
                >
                  {baseUrlCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Base URL</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* System Highlights / Stats Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Endpoints
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 APIs</div>
              <p className="text-xs text-muted-foreground mt-1">
                Auth, Profile, Check-in & System
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Serverless DB
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Database className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Neon Postgres</div>
              <p className="text-xs text-muted-foreground mt-1">
                Drizzle ORM & Connection Pooling
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Cloud Storage
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Cloud className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Google GCS</div>
              <p className="text-xs text-muted-foreground mt-1">
                Public Buckets & Auto Cleanup
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Email & OTP
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Mail className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Resend API</div>
              <p className="text-xs text-muted-foreground mt-1">
                High-Speed 6-Digit Email Codes
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Global Auth Token Helper for API Testing */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">
                  API Test Token (Bearer Authentication)
                </h4>
                <p className="text-xs text-muted-foreground">
                  ใส่ JWT Token ที่ได้จากการ Login หรือ OTP Verify
                  เพื่อใช้ทดสอบ Endpoint ที่ต้องใช้สิทธิ์ (🔒 Bearer Auth)
                </p>
              </div>
            </div>
            <div className="w-full sm:w-80">
              <Input
                placeholder="eyJhbGciOiJIUzI1NiJ9..."
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
        </section>

        {/* API Explorer & Documentation */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                API Reference & Explorer
              </h2>
              <p className="text-sm text-muted-foreground">
                เลือกและทดสอบ Endpoint ได้ทันทีบนหน้านี้ พร้อมตัวอย่าง Request &
                Response
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา Endpoint หรือ Path..."
                className="pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All APIs ({endpoints.length})
              </button>
              <button
                onClick={() => setSelectedCategory("auth")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === "auth"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Auth & Profile (7)</span>
              </button>
              <button
                onClick={() => setSelectedCategory("checking")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === "checking"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Check-in (4)</span>
              </button>
              <button
                onClick={() => setSelectedCategory("system")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === "system"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                <span>System (1)</span>
              </button>
            </div>

            {/* Method Filter */}
            <div className="flex items-center gap-1">
              {["all", "GET", "POST", "PUT", "DELETE"].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`px-2.5 py-1 text-xs rounded-md uppercase font-mono font-medium transition-all cursor-pointer ${
                    selectedMethod === m
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoints List */}
          <div className="space-y-3">
            {filteredEndpoints.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  ไม่พบ Endpoint ที่ตรงกับเงื่อนไขการค้นหา
                </p>
              </Card>
            ) : (
              filteredEndpoints.map((ep) => {
                const isExpanded = expandedId === ep.id;
                const testResult = testResults[ep.id];

                return (
                  <Card
                    key={ep.id}
                    className={`overflow-hidden transition-all duration-200 border-border ${
                      isExpanded
                        ? "ring-1 ring-primary/40 shadow-sm"
                        : "hover:border-border/80 hover:bg-card/70"
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(ep.id)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer user-select-none"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          variant={getMethodBadgeVariant(ep.method)}
                          className="min-w-16 justify-center uppercase"
                        >
                          {ep.method}
                        </Badge>

                        <span className="font-mono text-sm sm:text-base font-semibold text-foreground">
                          {ep.path}
                        </span>

                        {ep.authRequired ? (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 text-[11px] bg-primary/10 text-primary border-primary/20"
                          >
                            <Lock className="h-3 w-3" />
                            <span>Bearer Auth</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 text-[11px] text-muted-foreground"
                          >
                            <Unlock className="h-3 w-3" />
                            <span>Public</span>
                          </Badge>
                        )}

                        <span className="text-xs sm:text-sm text-muted-foreground hidden lg:inline">
                          — {ep.title}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-xs text-muted-foreground lg:hidden">
                          {ep.title}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expandable Details Body */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 p-4 sm:p-6 space-y-6 animate-in fade-in-50 duration-200">
                        {/* Description & Path Copy */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <p className="text-sm text-foreground">
                            {ep.description}
                          </p>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(`${baseUrl}${ep.path}`, ep.id);
                            }}
                            className="self-start sm:self-auto gap-1 text-xs"
                          >
                            {copiedPath === ep.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span>Copied URL</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Full URL</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Interactive Playground & Code Tabs */}
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid grid-cols-4 max-w-md">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="try">⚡ Try It Out</TabsTrigger>
                            <TabsTrigger value="curl">cURL</TabsTrigger>
                            <TabsTrigger value="flutter">Flutter</TabsTrigger>
                          </TabsList>

                          {/* Overview Tab */}
                          <TabsContent value="overview" className="space-y-4 pt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Request Body Info */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  <span>Request Payload</span>
                                  {ep.contentType && (
                                    <span className="text-[10px] lowercase font-mono bg-muted px-1.5 py-0.5 rounded">
                                      {ep.contentType}
                                    </span>
                                  )}
                                </div>
                                {ep.requestBody ? (
                                  <pre className="rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground overflow-x-auto max-h-60">
                                    {ep.requestBody}
                                  </pre>
                                ) : (
                                  <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                                    No request body required (Query parameters or URL only)
                                  </div>
                                )}
                              </div>

                              {/* Example Response */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  <span>Example Response (200 OK)</span>
                                  <span className="text-[10px] font-mono text-emerald-500">
                                    application/json
                                  </span>
                                </div>
                                <pre className="rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground overflow-x-auto max-h-60">
                                  {ep.responseBody}
                                </pre>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Try It Out Live Console */}
                          <TabsContent value="try" className="space-y-4 pt-3">
                            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                                <div className="flex items-center gap-2">
                                  <Badge variant={getMethodBadgeVariant(ep.method)}>
                                    {ep.method}
                                  </Badge>
                                  <span className="font-mono text-xs sm:text-sm font-semibold">
                                    {ep.path}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => runLiveTest(ep)}
                                  disabled={testResult?.loading}
                                  className="gap-2"
                                >
                                  {testResult?.loading ? (
                                    <>
                                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                      <span>Sending Request...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-3.5 w-3.5" />
                                      <span>Send Live Request</span>
                                    </>
                                  )}
                                </Button>
                              </div>

                              {/* Live Result View */}
                              {testResult && (
                                <div className="space-y-3 pt-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-muted-foreground">
                                        Response Status:
                                      </span>
                                      {testResult.status && (
                                        <Badge
                                          variant={
                                            testResult.status < 300
                                              ? "success"
                                              : "destructive"
                                          }
                                        >
                                          {testResult.status}
                                        </Badge>
                                      )}
                                      {testResult.time !== undefined && (
                                        <span className="text-muted-foreground font-mono">
                                          ({testResult.time}ms)
                                        </span>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      onClick={() =>
                                        handleCopy(
                                          JSON.stringify(testResult.data, null, 2),
                                          `res-${ep.id}`
                                        )
                                      }
                                      className="gap-1 text-[11px]"
                                    >
                                      {copiedPath === `res-${ep.id}` ? (
                                        <>
                                          <Check className="h-3 w-3 text-emerald-500" />
                                          <span>Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3 w-3" />
                                          <span>Copy JSON</span>
                                        </>
                                      )}
                                    </Button>
                                  </div>

                                  {testResult.error ? (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-mono">
                                      Error: {testResult.error}
                                    </div>
                                  ) : (
                                    <pre className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-foreground overflow-x-auto max-h-64">
                                      {JSON.stringify(testResult.data, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          {/* cURL Snippet */}
                          <TabsContent value="curl" className="pt-3">
                            <div className="relative">
                              <pre className="rounded-lg border border-border bg-card p-4 font-mono text-xs text-foreground overflow-x-auto">
                                {generateCurl(ep)}
                              </pre>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  handleCopy(generateCurl(ep), `curl-${ep.id}`)
                                }
                                className="absolute right-3 top-3 gap-1"
                              >
                                {copiedPath === `curl-${ep.id}` ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </TabsContent>

                          {/* Flutter Snippet */}
                          <TabsContent value="flutter" className="pt-3">
                            <div className="relative">
                              <pre className="rounded-lg border border-border bg-card p-4 font-mono text-xs text-foreground overflow-x-auto">
                                {generateDart(ep)}
                              </pre>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  handleCopy(generateDart(ep), `dart-${ep.id}`)
                                }
                                className="absolute right-3 top-3 gap-1"
                              >
                                {copiedPath === `dart-${ep.id}` ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Flutter Mobile App Quickstart Section */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">
                Flutter Mobile Client Integration
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                คู่มือการเชื่อมต่อ API สำหรับ Flutter Developers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  1
                </span>
                <span>
                  <strong>Authentication Flow:</strong> ผู้ใช้กรอกอีเมลเพื่อขอ OTP
                  จากนั้นส่งรหัส OTP 6 หลักเพื่อรับ <code>token</code> และเก็บลงใน{" "}
                  <code>flutter_secure_storage</code>
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  2
                </span>
                <span>
                  <strong>Check-in Upload:</strong> ใช้{" "}
                  <code>http.MultipartRequest</code> แนบไฟล์รูปภาพจากกล้อง พร้อมพิกัด{" "}
                  <code>lat</code>, <code>lng</code> และส่ง <code>Authorization</code> header
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  3
                </span>
                <span>
                  <strong>Image URLs:</strong> รูปภาพทั้งหมดจะถูก Host บน Google
                  Cloud Storage โดยตรง ให้ความเร็วสูงและพร้อมใช้งานบน Widget{" "}
                  <code>Image.network</code>
                </span>
              </div>
            </div>

            <div className="relative">
              <pre className="rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs text-foreground overflow-x-auto max-h-56">
{`// Flutter ApiClient example
class ApiClient {
  static const baseUrl = '${baseUrl}';
  
  static Future<Map<String, dynamic>> checkin({
    required double lat,
    required double lng,
    required String name,
    required String token,
    File? imageFile,
  }) async {
    var req = http.MultipartRequest('POST', Uri.parse('\$baseUrl/api/checking'));
    req.headers['Authorization'] = 'Bearer \$token';
    req.fields['lat'] = lat.toString();
    req.fields['lng'] = lng.toString();
    req.fields['locationName'] = name;
    if (imageFile != null) {
      req.files.add(await http.MultipartFile.fromPath('image', imageFile.path));
    }
    var res = await req.send();
    return jsonDecode(await res.stream.bytesToString());
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Where Am I API.</span>
            <span>•</span>
            <span>Built with Next.js 16, Tailwind CSS v4 & shadcn/ui.</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`${baseUrl}/api/health`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Health Status</span>
            </a>
            <a
              href="https://github.com/Jirasak-Thongpila/where_am_i"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
