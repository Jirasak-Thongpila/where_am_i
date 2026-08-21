# Admin Dashboard (`dashboard-01`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive, authenticated Admin Dashboard (`/admin`) based on the Shadcn `dashboard-01` pattern to view stats, inspect live check-in logs with GCS images and coordinates, manage users, and seed an initial admin account.

**Architecture:** Next.js 16 App Router with React 19, Tailwind CSS v4, Drizzle ORM on PostgreSQL, JWT session cookies for authentication with role-based access control (`role === "admin"`), and a rich interactive dashboard UI with real-time stats and log viewing.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lucide React, Drizzle ORM, PostgreSQL, Argon2, Jose (JWT).

## Global Constraints
- All backend routes under `/api/admin/*` (except `/api/admin/seed` when initial setup) must strictly require admin authentication (`getAdminUser`).
- UI styling must leverage Tailwind CSS v4 variables with full Dark/Light theme responsiveness.
- Must include complete, runnable code with zero placeholders or TBDs.

---

### Task 1: Database Schema & Auth Role Updates

**Files:**
- Modify: `src/db/schema.ts`
- Modify: `src/lib/jwt.ts`
- Modify: `src/lib/auth.ts`

**Interfaces:**
- Consumes: Existing drizzle schema & JWT helpers.
- Produces:
  - `users.role` field with default `'user'`
  - `AuthUser` with `role: "user" | "admin"`
  - `getAdminUser(request: NextRequest): Promise<AuthUser | null>`

- [ ] **Step 1: Update `src/db/schema.ts` to include `role` field**

```ts
// in src/db/schema.ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  socialLinks: json("social_links"),
  isVerified: boolean("is_verified").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Update `src/lib/jwt.ts` and `src/lib/auth.ts`**

Update `AuthUser` interface and add `getAdminUser`:
```ts
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role?: "user" | "admin" | string;
}

export async function getAdminUser(request: NextRequest): Promise<AuthUser | null> {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}
```

- [ ] **Step 3: Update `src/app/api/auth/login/route.ts` & `src/app/api/auth/me/route.ts` to sign and return `role`**

Include `role: user.role` in the JWT payload when creating the token on login.

- [ ] **Step 4: Push database schema updates**

Run: `npx drizzle-kit push` (or generate migration)

- [ ] **Step 5: Commit changes**

```bash
git add src/db/schema.ts src/lib/auth.ts src/lib/jwt.ts src/app/api/auth/login/route.ts src/app/api/auth/me/route.ts
git commit -m "feat(auth): add role support and getAdminUser helper"
```

---

### Task 2: Admin API Endpoints & Admin Seeder

**Files:**
- Create: `src/app/api/admin/seed/route.ts`
- Create: `src/app/api/admin/stats/route.ts`
- Create: `src/app/api/admin/checkins/route.ts`
- Create: `src/app/api/admin/users/route.ts`

**Interfaces:**
- Consumes: `getAdminUser`, `db`, `users`, `checkins`, `argon2`
- Produces:
  - `POST /api/admin/seed`: Seeds default admin (`admin@whereami.local` / `AdminPassword123!`)
  - `GET /api/admin/stats`: Aggregate system KPIs & recent activity
  - `GET /api/admin/checkins`: Paginated and searchable checkin logs
  - `DELETE /api/admin/checkins?id=<id>`: Delete checkin and image from GCS
  - `GET /api/admin/users`: User directory
  - `PATCH /api/admin/users`: Update user role or verification status

- [ ] **Step 1: Implement `src/app/api/admin/seed/route.ts`**

Creates default admin with hashed password if not already present, or promotes if email exists:
```ts
import { db } from "@/db";
import { users } from "@/db/schema";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const adminEmail = "admin@whereami.local";
    const defaultPassword = "AdminPassword123!";
    const [existing] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existing) {
      if (existing.role !== "admin" || !existing.isVerified) {
        await db.update(users).set({ role: "admin", isVerified: true }).where(eq(users.id, existing.id));
      }
      return NextResponse.json({
        message: "Admin account is ready",
        admin: { email: adminEmail, role: "admin", isVerified: true },
      });
    }

    const hashedPassword = await argon2.hash(defaultPassword);
    const [newAdmin] = await db.insert(users).values({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    }).returning();

    return NextResponse.json({
      message: "Admin account created successfully",
      admin: { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role },
      defaultCredentials: { email: adminEmail, password: defaultPassword },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin seed error:", error);
    return NextResponse.json({ message: "Failed to seed admin user" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Implement `src/app/api/admin/stats/route.ts`**

Calculate total users, verified users, total checkins, 24-hr checkins, and latest activity stream.

- [ ] **Step 3: Implement `src/app/api/admin/checkins/route.ts` (GET & DELETE)**

Support search query, pagination, user info join, and GCS deletion on delete.

- [ ] **Step 4: Implement `src/app/api/admin/users/route.ts` (GET & PATCH)**

Fetch all users with their checkin count, and handle role promotion/demotion and verification toggle.

- [ ] **Step 5: Verify API endpoints with curl/tests and commit**

```bash
git add src/app/api/admin/
git commit -m "feat(api): implement admin stats, checkins, users and seed endpoints"
```

---

### Task 3: Shadcn Dashboard-01 UI Components

**Files:**
- Create/Verify: `src/components/ui/table.tsx`
- Create/Verify: `src/components/ui/dialog.tsx`
- Create/Verify: `src/components/ui/dropdown-menu.tsx`
- Create/Verify: `src/components/ui/select.tsx`

**Interfaces:**
- Consumes: Tailwind v4 classes, React 19 primitives
- Produces: Clean UI components matching Shadcn UI standard for dashboard tables, metric cards, dialogs, and filters.

- [ ] **Step 1: Implement Table components (`src/components/ui/table.tsx`)**
- [ ] **Step 2: Implement Dialog / Modal components (`src/components/ui/dialog.tsx`)**
- [ ] **Step 3: Implement Dropdown Menu & Select components**
- [ ] **Step 4: Commit UI components**

```bash
git add src/components/ui/
git commit -m "feat(ui): add table, dialog, and dropdown components for admin dashboard"
```

---

### Task 4: Admin Dashboard Page (`src/app/admin/page.tsx`)

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: `/api/admin/*` and `/api/auth/*` endpoints.
- Produces: Full interactive Admin Dashboard with:
  1. **Admin Login Gate**: Quick login form + 1-click Default Admin Seed button.
  2. **Top Navigation Header**: Brand logo, Navigation tabs, Global Search, ThemeToggle, Refresh button, Admin profile avatar, Logout button.
  3. **Overview Tab**: 4 Metric KPI Cards (Users, Verified %, Checkins, Today's activity), Recent Checkins & New Users stream.
  4. **Check-in Logs Tab**: Filterable search bar, responsive data table with timestamps, user info, coordinate badges (Google Maps link), thumbnail preview with Fullscreen Image Viewer Modal, and Delete action.
  5. **Users Management Tab**: Directory table, Role badge, Verification status toggle, Role switch (`admin` / `user`).

- [ ] **Step 1: Create `src/app/admin/layout.tsx` for Admin metadata and theme wrapper**
- [ ] **Step 2: Implement `src/app/admin/page.tsx` complete client component with state management and tabs**
- [ ] **Step 3: Test Login/Logout, Tab switching, Search filtering, Modal image viewer, and Role switching**
- [ ] **Step 4: Commit Admin Page**

```bash
git add src/app/admin/
git commit -m "feat(admin): create full-featured admin dashboard page with dashboard-01 layout"
```

---

### Task 5: End-to-End Verification & Testing

**Files:**
- Verify: Full integration across all admin functions

- [ ] **Step 1: Test Admin Seeding API (`POST /api/admin/seed`)**
- [ ] **Step 2: Test Admin Login with `admin@whereami.local` / `AdminPassword123!`**
- [ ] **Step 3: Test Check-in logs retrieval, search filtering, coordinate links, and image preview**
- [ ] **Step 4: Test User management (Role update & Verification toggle)**
- [ ] **Step 5: Test Non-admin access blocking (401/403 security verification)**
- [ ] **Step 6: Build verification: `npm run build`**
- [ ] **Step 7: Final commit & documentation**
