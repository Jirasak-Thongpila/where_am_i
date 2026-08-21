# Design Spec: Admin Dashboard (`dashboard-01`) & Log Viewer

**Author:** Antigravity  
**Date:** 2026-08-21  
**Project:** `where_am_i` (Next.js 16, React 19, Tailwind CSS v4, Drizzle ORM, PostgreSQL)

---

## 1. Overview & Goals

The goal is to build a dedicated Admin Dashboard under `/admin` using the Shadcn `dashboard-01` design pattern. The dashboard enables administrators to inspect system metrics, monitor live check-in logs with GCS images and coordinates, manage registered users, and adjust user roles. Additionally, an automated admin user seed mechanism will be provided to easily create an initial administrator account.

---

## 2. Architecture & Data Model

### 2.1 Database Schema (`src/db/schema.ts`)
- Add a `role` field to the `users` table:
  ```ts
  role: text("role").default("user").notNull(), // "user" | "admin"
  ```
- Keep existing tables: `users`, `verificationTokens`, `checkins`.
- Push/migrate schema updates using Drizzle Kit.

### 2.2 Authentication & Authorization (`src/lib/auth.ts`, `src/lib/jwt.ts`)
- **`AuthUser` interface**:
  ```ts
  export interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: "user" | "admin";
  }
  ```
- **`getAdminUser(request: NextRequest)`**:
  - Validates JWT from cookie (`auth-token`) or `Authorization: Bearer <token>`.
  - Checks if `user.role === "admin"`. If not, returns `403 Forbidden` / `null`.
- **Default Admin Account Seed**:
  - Seed credentials:
    - **Email**: `admin@whereami.local` (or `admin@example.com`)
    - **Password**: `AdminPassword123!`
    - **Name**: `System Administrator`
    - **Role**: `admin`
    - **isVerified**: `true`
  - Mechanism: A dedicated seed API (`POST /api/admin/seed`) or initialization helper that creates the admin account if it does not exist.

---

## 3. Backend API Specification (`/api/admin/*`)

### 3.1 `GET /api/admin/stats`
- **Auth**: Admin only
- **Response**:
  ```json
  {
    "stats": {
      "totalUsers": 120,
      "verifiedUsers": 110,
      "totalCheckins": 350,
      "todayCheckins": 15
    },
    "recentCheckins": [ ... ],
    "recentUsers": [ ... ]
  }
  ```

### 3.2 `GET /api/admin/checkins`
- **Auth**: Admin only
- **Query Params**: `page` (number), `limit` (number), `search` (string)
- **Response**: Paginated list of check-ins with user profiles, coordinates, location names, descriptions, and GCS image URLs.

### 3.3 `DELETE /api/admin/checkins?id=<id>`
- **Auth**: Admin only
- **Action**: Deletes check-in record from DB and deletes associated image from Google Cloud Storage.

### 3.4 `GET /api/admin/users`
- **Auth**: Admin only
- **Response**: List of users with user IDs, names, emails, roles, verification status, check-in counts, and creation dates.

### 3.5 `PATCH /api/admin/users`
- **Auth**: Admin only
- **Body**: `{ userId: number, role?: "user" | "admin", isVerified?: boolean }`
- **Action**: Updates the specified user's role or verification status.

### 3.6 `POST /api/admin/seed`
- **Auth**: Public or protected via `ADMIN_SECRET_KEY`
- **Action**: Seeds the default admin account with hashed password (`argon2`) if not already present in the database.

---

## 4. Frontend & UI Architecture (`src/app/admin/*`)

### 4.1 Page Layout (`src/app/admin/page.tsx` & layout)
Adopts the **Shadcn Dashboard-01** layout:
- **Top Header Bar**:
  - App Logo & "Admin Console" badge.
  - Active Section Navigation (Overview, Check-in Logs, Users).
  - Global Search bar.
  - Dark / Light Theme Toggle.
  - Refresh data button.
  - Admin Profile avatar & Logout action.
- **Admin Auth Gate / Login Modal**:
  - If unauthenticated or role !== admin, displays an Admin Login card with Email & Password fields, plus a quick "Seed Default Admin" button for easy first-time setup.

### 4.2 Dashboard Tabs

#### Tab 1: Overview
- **4 KPI Metric Cards**:
  1. 👥 Total Users (with % verified).
  2. ✅ Verified Users.
  3. 📍 Total Check-in Records.
  4. ⚡ Today's Activity (last 24 hours).
- **Recent Stream**:
  - Latest 5 check-ins with preview thumbnails and timestamps.
  - Newest registered users list.

#### Tab 2: Check-in Logs (Log Viewer)
- Search filter by location name, address, description, or username.
- Rich Data Table:
  - Timestamp (formatted relative + full date).
  - User avatar and name.
  - Location Name & Address.
  - Coordinates (Lat/Lng badge with direct Google Maps link button).
  - Photo thumbnail (clicking opens fullscreen Image Modal).
  - Actions: Delete check-in button with confirmation dialog.

#### Tab 3: Users Management
- User directory table with ID, Name, Email, Role badge (`ADMIN` / `USER`), Verification badge, Join Date.
- Action to promote/demote role and toggle verification status.

---

## 5. Error Handling & Edge Cases
- **Non-admin attempts to access `/api/admin/*`**: Returns `401 Unauthorized` or `403 Forbidden`.
- **Image Deletion Failure**: Ensure DB deletion succeeds and logs warning if GCS image was already missing.
- **Empty States**: Friendly empty illustration/text when no check-in logs or users match search filters.

---

## 6. Verification & Testing Plan
- **DB Migration**: Verify `role` column exists in `users` table.
- **Admin Seeding**: Call seed route and verify default admin user creation with hashed password.
- **Authentication**: Test login with admin credentials and verify JWT payload contains `role: "admin"`.
- **API Tests**: Verify all `/api/admin/*` endpoints return correct status codes for both admin and unauthorized users.
- **UI Verification**: Open `/admin` in browser, verify layout rendering, KPI stats, search filters, modal image viewer, and theme toggling.
