/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Users,
  Search,
  ExternalLink,
  RefreshCw,
  Trash2,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronRight,
  Shield,
  Compass,
  BarChart3,
  Check,
  Clock,
  ArrowUpRight,
  ScrollText,
  Globe,
  Filter,
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";

// Types
interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
}

interface StatsData {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  totalCheckins: number;
  todayCheckins: number;
}

interface CheckinItem {
  id: number;
  lat: number;
  lng: number;
  locationName: string | null;
  address: string | null;
  accuracy: number | null;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage: string | null;
  };
}

interface RecentUserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profileImage: string | null;
  createdAt: string;
}

interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profileImage: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  checkinsCount: number;
}

interface ActivityLogItem {
  id: number;
  action: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage: string | null;
    role: string;
  } | null;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr: string, currentTimestamp: number) {
  try {
    const time = new Date(dateStr).getTime();
    const diffSec = Math.floor((currentTimestamp - time) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return "";
  }
}

export default function AdminPage() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<
    "overview" | "checkins" | "users" | "logs"
  >("overview");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<CheckinItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUserItem[]>([]);
  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [usersList, setUsersList] = useState<UserListItem[]>([]);
  const [activityLogsList, setActivityLogsList] = useState<ActivityLogItem[]>(
    []
  );
  const [loadingData, setLoadingData] = useState(false);
  const [nowTime, setNowTime] = useState<number>(() => Date.now());

  // Search & Filters
  const [checkinSearch, setCheckinSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  // Modals
  const [previewImage, setPreviewImage] = useState<CheckinItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CheckinItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Toast Helper
  const showToast = (
    text: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Auth Check Effect
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.role === "admin") {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch {
        if (isMounted) setCurrentUser(null);
      } finally {
        if (isMounted) setAuthChecking(false);
      }
    }
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Dashboard Data Function
  const loadDashboardData = React.useCallback(async () => {
    setLoadingData(true);
    setNowTime(Date.now());
    try {
      // 1. Stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
        setRecentCheckins(data.recentCheckins || []);
        setRecentUsers(data.recentUsers || []);
      }

      // 2. Check-in logs
      const checkinsRes = await fetch("/api/admin/checkins?limit=100");
      if (checkinsRes.ok) {
        const data = await checkinsRes.json();
        setCheckins(data.checkins || []);
      }

      // 3. Users list
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsersList(data.users || []);
      }

      // 4. Activity Logs
      const logsRes = await fetch("/api/admin/activity-logs?limit=100");
      if (logsRes.ok) {
        const data = await logsRes.json();
        setActivityLogsList(data.logs || []);
      }
    } catch (err: unknown) {
      console.error("Fetch admin data error:", err);
      showToast("Failed to load some dashboard data", "error");
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Load data when currentUser is authenticated
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;
    async function fetchInitial() {
      if (!isMounted) return;
      await loadDashboardData();
    }
    fetchInitial();
    return () => {
      isMounted = false;
    };
  }, [currentUser, loadDashboardData]);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      if (data.user.role !== "admin") {
        throw new Error("Access denied: This account is not an administrator");
      }

      setCurrentUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setCurrentUser(null);
    showToast("Logged out from admin console", "info");
  };

  // Handle Delete Checkin
  const handleDeleteCheckin = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/checkins?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCheckins((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setRecentCheckins((prev) =>
          prev.filter((c) => c.id !== deleteTarget.id)
        );
        if (stats) {
          setStats({
            ...stats,
            totalCheckins: Math.max(0, stats.totalCheckins - 1),
          });
        }
        showToast("Check-in log deleted successfully", "success");
        setDeleteTarget(null);
        // Refresh logs
        loadDashboardData();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete log";
      showToast(message, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Toggle User Role
  const handleToggleRole = async (user: UserListItem) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setActionLoadingId(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: newRole,
        }),
      });

      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        showToast(
          `Updated ${user.name}'s role to ${newRole.toUpperCase()}`,
          "success"
        );
        // Refresh logs
        loadDashboardData();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Update failed");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update role";
      showToast(message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Toggle User Verification
  const handleToggleVerification = async (user: UserListItem) => {
    const newVerified = !user.isVerified;
    setActionLoadingId(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          isVerified: newVerified,
        }),
      });

      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isVerified: newVerified } : u
          )
        );
        showToast(
          `Set verification status for ${user.name} to ${
            newVerified ? "VERIFIED" : "UNVERIFIED"
          }`,
          "success"
        );
        // Refresh logs
        loadDashboardData();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Update failed");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      showToast(message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Checkins
  const filteredCheckins = useMemo(() => {
    if (!checkinSearch.trim()) return checkins;
    const q = checkinSearch.toLowerCase().trim();
    return checkins.filter(
      (c) =>
        c.locationName?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.user?.name?.toLowerCase().includes(q) ||
        c.user?.email?.toLowerCase().includes(q) ||
        `${c.lat},${c.lng}`.includes(q)
    );
  }, [checkins, checkinSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return usersList;
    const q = userSearch.toLowerCase().trim();
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [usersList, userSearch]);

  // Filtered Activity Logs
  const filteredActivityLogs = useMemo(() => {
    return activityLogsList.filter((item) => {
      const matchesAction =
        actionFilter === "ALL" || item.action === actionFilter;
      if (!matchesAction) return false;

      if (!logSearch.trim()) return true;
      const q = logSearch.toLowerCase().trim();
      return (
        item.action.toLowerCase().includes(q) ||
        item.details?.toLowerCase().includes(q) ||
        item.ipAddress?.toLowerCase().includes(q) ||
        item.user?.name?.toLowerCase().includes(q) ||
        item.user?.email?.toLowerCase().includes(q)
      );
    });
  }, [activityLogsList, actionFilter, logSearch]);

  // Helper for Action Badge Colors
  const renderActionBadge = (action: string) => {
    switch (action) {
      case "USER_LOGIN":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] uppercase font-bold tracking-wider">
            Login
          </Badge>
        );
      case "USER_REGISTER":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider">
            Register
          </Badge>
        );
      case "CHECKIN_CREATE":
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[10px] uppercase font-bold tracking-wider">
            Check-in
          </Badge>
        );
      case "CHECKIN_UPDATE":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] uppercase font-bold tracking-wider">
            Edit
          </Badge>
        );
      case "CHECKIN_DELETE":
      case "ADMIN_DELETE_CHECKIN":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] uppercase font-bold tracking-wider">
            Delete
          </Badge>
        );
      case "ADMIN_UPDATE_USER":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] uppercase font-bold tracking-wider">
            Admin Change
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="text-[10px] uppercase font-bold tracking-wider"
          >
            {action}
          </Badge>
        );
    }
  };

  // 1. Loading State
  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Authenticating Admin Console...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated / Login Gate
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-8 right-8 z-10">
          <ThemeToggle />
        </div>

        {/* Toast */}
        {toastMessage && (
          <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg border shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
              toastMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : toastMessage.type === "error"
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {toastMessage.text}
          </div>
        )}

        <Card className="w-full max-w-md border-border/80 shadow-2xl backdrop-blur-md bg-card/90 relative z-10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              WhereAmI Admin
            </CardTitle>
            <CardDescription className="text-sm">
              Sign in with an administrative account to view check-in logs and
              manage system assets.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {loginError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin Email
                </label>
                <Input
                  type="email"
                  placeholder="admin@whereami.local"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full h-10 font-semibold cursor-pointer"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign In to Console
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                ← Back to API Playground
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard (Shadcn dashboard-01)
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl text-sm font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-card border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : toastMessage.type === "error"
              ? "bg-card border-destructive/30 text-destructive"
              : "bg-card border-primary/30 text-primary"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-destructive" />
          )}
          {toastMessage.text}
        </div>
      )}

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight">
                WhereAmI
              </span>
              <Badge
                variant="outline"
                className="bg-primary/10 border-primary/30 text-primary text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5"
              >
                Admin
              </Badge>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("checkins")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "checkins"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Check-in Logs
              {checkins.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-muted text-muted-foreground rounded-full text-[10px]">
                  {checkins.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "users"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Users
              {usersList.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-muted text-muted-foreground rounded-full text-[10px]">
                  {usersList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "logs"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              Activity Logs
              {activityLogsList.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-primary/20 text-primary font-bold rounded-full text-[10px]">
                  {activityLogsList.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadDashboardData}
              disabled={loadingData}
              title="Refresh Data"
              className="h-8 w-8 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`}
              />
            </Button>

            <ThemeToggle />

            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

            {/* Admin User Info */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-medium leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {currentUser.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log out"
                className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden w-full overflow-x-auto pb-1 gap-1 border-b border-border">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="text-xs"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "checkins" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("checkins")}
            className="text-xs"
          >
            Check-ins ({checkins.length})
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("users")}
            className="text-xs"
          >
            Users ({usersList.length})
          </Button>
          <Button
            variant={activeTab === "logs" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("logs")}
            className="text-xs"
          >
            Logs ({activityLogsList.length})
          </Button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time system overview, check-in activity metrics, and
                  registered users.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  API Documentation
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </Link>
              </div>
            </div>

            {/* 4 Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats ? stats.totalUsers : "..."}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <span className="font-medium text-foreground">
                      {stats ? stats.verifiedUsers : 0}
                    </span>{" "}
                    verified accounts
                  </p>
                </CardContent>
              </Card>

              {/* Verified Rate */}
              <Card className="border-border/70 shadow-xs hover:border-emerald-500/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Verification Rate
                  </CardTitle>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats && stats.totalUsers > 0
                      ? `${Math.round(
                          (stats.verifiedUsers / stats.totalUsers) * 100
                        )}%`
                      : "100%"}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Email OTP confirmed rate
                  </p>
                </CardContent>
              </Card>

              {/* Total Check-in Records */}
              <Card className="border-border/70 shadow-xs hover:border-blue-500/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Check-ins
                  </CardTitle>
                  <MapPin className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats ? stats.totalCheckins : "..."}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      +{stats ? stats.todayCheckins : 0}
                    </span>{" "}
                    recorded in 24h
                  </p>
                </CardContent>
              </Card>

              {/* Admin Accounts */}
              <Card className="border-border/70 shadow-xs hover:border-purple-500/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Administrators
                  </CardTitle>
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats ? stats.adminUsers : "..."}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Active system admins
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Split Content: Recent Check-ins & Recent Users */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
              {/* Recent Checkins (4 cols) */}
              <Card className="lg:col-span-4 border-border/70 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-bold">
                      Recent Check-in Activity
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Live locations and timestamped records
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("checkins")}
                    className="text-xs text-primary cursor-pointer"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {recentCheckins.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No check-ins recorded yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {recentCheckins.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.imageUrl ? (
                              <div
                                onClick={() => setPreviewImage(item)}
                                className="w-11 h-11 rounded-lg overflow-hidden border border-border bg-muted shrink-0 cursor-pointer relative group"
                              >
                                <img
                                  src={item.imageUrl}
                                  alt="Checkin"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 text-muted-foreground">
                                <MapPin className="w-5 h-5 text-primary/70" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {item.locationName || "Unnamed Location"}
                                </p>
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate">
                                By {item.user.name} •{" "}
                                {item.address ||
                                  `${item.lat.toFixed(4)}, ${item.lng.toFixed(
                                    4
                                  )}`}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {formatRelativeTime(item.createdAt, nowTime)}
                            </span>
                            <div className="mt-0.5">
                              <a
                                href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center text-[10px] text-primary hover:underline"
                              >
                                Maps{" "}
                                <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Registered Users (3 cols) */}
              <Card className="lg:col-span-3 border-border/70 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-bold">
                      New Members
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Latest user registrations
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("users")}
                    className="text-xs text-primary cursor-pointer"
                  >
                    Manage <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {recentUsers.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No users registered yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {recentUsers.map((u) => (
                        <div
                          key={u.id}
                          className="p-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {u.email}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex flex-col items-end gap-1">
                            <Badge
                              variant={
                                u.role === "admin" ? "default" : "secondary"
                              }
                              className="text-[10px] px-1.5 py-0 uppercase"
                            >
                              {u.role}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatRelativeTime(u.createdAt, nowTime)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: CHECK-IN LOGS */}
        {activeTab === "checkins" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Action & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Check-in Logs
                </h2>
                <p className="text-xs text-muted-foreground">
                  Showing {filteredCheckins.length} of {checkins.length} total
                  check-in records
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search location, user, coords..."
                  value={checkinSearch}
                  onChange={(e) => setCheckinSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
                {checkinSearch && (
                  <button
                    onClick={() => setCheckinSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Check-ins Data Table */}
            <Card className="border-border/70 shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-44">Timestamp</TableHead>
                    <TableHead className="w-48">User</TableHead>
                    <TableHead>Location & Address</TableHead>
                    <TableHead className="w-40">Coordinates</TableHead>
                    <TableHead className="w-24 text-center">Photo</TableHead>
                    <TableHead className="w-20 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCheckins.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-sm text-muted-foreground"
                      >
                        No check-in logs match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCheckins.map((item) => (
                      <TableRow key={item.id}>
                        {/* Timestamp */}
                        <TableCell className="align-middle">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              {formatDate(item.createdAt)}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(item.createdAt, nowTime)}
                            </span>
                          </div>
                        </TableCell>

                        {/* User */}
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                              {item.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-foreground truncate">
                                {item.user.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {item.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Location Name & Address */}
                        <TableCell className="align-middle">
                          <div className="flex flex-col max-w-sm">
                            <div className="text-xs font-bold text-foreground flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>
                                {item.locationName || "Unnamed Location"}
                              </span>
                            </div>
                            {item.address && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                {item.address}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-[11px] text-muted-foreground italic mt-0.5 line-clamp-1">
                                &ldquo;{item.description}&rdquo;
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Coordinates & Google Maps Link */}
                        <TableCell className="align-middle">
                          <div className="flex flex-col gap-1">
                            <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                              {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                            </code>
                            <a
                              href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
                            >
                              Open in Maps
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </TableCell>

                        {/* Image Thumbnail */}
                        <TableCell className="align-middle text-center">
                          {item.imageUrl ? (
                            <button
                              onClick={() => setPreviewImage(item)}
                              className="relative group w-10 h-10 rounded-md overflow-hidden border border-border inline-flex items-center justify-center cursor-pointer"
                              title="Click to zoom photo"
                            >
                              <img
                                src={item.imageUrl}
                                alt="Checkin"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              No photo
                            </span>
                          )}
                        </TableCell>

                        {/* Action: Delete */}
                        <TableCell className="align-middle text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(item)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete check-in log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 3: USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Action & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  User Management
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage registered accounts, grant administrator roles, and
                  inspect verification status.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
                {userSearch && (
                  <button
                    onClick={() => setUserSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Users Data Table */}
            <Card className="border-border/70 shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>User Profile</TableHead>
                    <TableHead className="w-32">Role</TableHead>
                    <TableHead className="w-36">Status</TableHead>
                    <TableHead className="w-28 text-center">
                      Check-ins
                    </TableHead>
                    <TableHead className="w-40">Registered</TableHead>
                    <TableHead className="w-44 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-sm text-muted-foreground"
                      >
                        No users found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        {/* ID */}
                        <TableCell className="align-middle font-mono text-xs text-muted-foreground">
                          #{u.id}
                        </TableCell>

                        {/* Profile Info */}
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-foreground truncate">
                                {u.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role Badge */}
                        <TableCell className="align-middle">
                          {u.role === "admin" ? (
                            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] uppercase font-bold tracking-wider">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase font-medium"
                            >
                              User
                            </Badge>
                          )}
                        </TableCell>

                        {/* Verification Status */}
                        <TableCell className="align-middle">
                          {u.isVerified ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]"
                            >
                              Unverified
                            </Badge>
                          )}
                        </TableCell>

                        {/* Check-ins Count */}
                        <TableCell className="align-middle text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-muted">
                            {u.checkinsCount}
                          </span>
                        </TableCell>

                        {/* Registered Date */}
                        <TableCell className="align-middle text-xs text-muted-foreground">
                          {formatDate(u.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="align-middle text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Role Button */}
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleToggleRole(u)}
                              disabled={
                                actionLoadingId === u.id ||
                                (u.id === currentUser.id && u.role === "admin")
                              }
                              title={
                                u.role === "admin"
                                  ? "Demote to standard user"
                                  : "Promote to administrator"
                              }
                              className="text-[11px] h-7 cursor-pointer"
                            >
                              {actionLoadingId === u.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : u.role === "admin" ? (
                                "Demote"
                              ) : (
                                "Make Admin"
                              )}
                            </Button>

                            {/* Toggle Verification */}
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleToggleVerification(u)}
                              disabled={actionLoadingId === u.id}
                              title={
                                u.isVerified
                                  ? "Mark as unverified"
                                  : "Manually verify account"
                              }
                              className="text-[11px] h-7 cursor-pointer"
                            >
                              {u.isVerified ? "Unverify" : "Verify"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 4: ACTIVITY LOGS (AUDIT TRAIL) */}
        {activeTab === "logs" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Action & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-primary" />
                  System Activity & Audit Logs
                </h2>
                <p className="text-xs text-muted-foreground">
                  Complete audit trail of user logins, registrations, check-in
                  events, and admin operations.
                </p>
              </div>

              {/* Action Filter & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="h-9 px-2.5 rounded-md border border-input bg-card text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="ALL">All Actions</option>
                    <option value="USER_LOGIN">Logins</option>
                    <option value="USER_REGISTER">Registrations</option>
                    <option value="CHECKIN_CREATE">Check-in Created</option>
                    <option value="CHECKIN_UPDATE">Check-in Updated</option>
                    <option value="CHECKIN_DELETE">Check-in Deleted</option>
                    <option value="ADMIN_UPDATE_USER">Admin Role Changes</option>
                    <option value="ADMIN_DELETE_CHECKIN">Admin Deletions</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs, details, IPs..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                  {logSearch && (
                    <button
                      onClick={() => setLogSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Logs Table */}
            <Card className="border-border/70 shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Timestamp</TableHead>
                    <TableHead className="w-36">Action</TableHead>
                    <TableHead className="w-48">Actor / User</TableHead>
                    <TableHead>Activity Details</TableHead>
                    <TableHead className="w-32 text-right">Client IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivityLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-sm text-muted-foreground"
                      >
                        No activity logs found matching the filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivityLogs.map((log) => (
                      <TableRow key={log.id}>
                        {/* Timestamp */}
                        <TableCell className="align-middle">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">
                              {formatDate(log.createdAt)}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(log.createdAt, nowTime)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Action Badge */}
                        <TableCell className="align-middle">
                          {renderActionBadge(log.action)}
                        </TableCell>

                        {/* User Profile */}
                        <TableCell className="align-middle">
                          {log.user ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                                {log.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-foreground truncate">
                                  {log.user.name}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {log.user.email}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-mono">
                                ?
                              </div>
                              <span className="text-xs">Anonymous</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Details */}
                        <TableCell className="align-middle">
                          <p className="text-xs text-foreground font-medium">
                            {log.details || "—"}
                          </p>
                        </TableCell>

                        {/* Client Info */}
                        <TableCell className="align-middle text-right">
                          {log.ipAddress ? (
                            <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-muted/60 px-2 py-0.5 rounded border border-border/50 text-muted-foreground">
                              <Globe className="w-3 h-3" />
                              {log.ipAddress}
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </main>

      {/* MODAL 1: Full-Screen Image Preview */}
      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        {previewImage && (
          <DialogContent
            className="max-w-3xl p-0 overflow-hidden"
            onClose={() => setPreviewImage(null)}
          >
            <div className="relative aspect-video w-full bg-black/95 flex items-center justify-center">
              {previewImage.imageUrl ? (
                <img
                  src={previewImage.imageUrl}
                  alt={previewImage.locationName || "Check-in Photo"}
                  className="max-h-full max-w-full object-contain"
                />
              ) : null}
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {previewImage.locationName || "Unnamed Location"}
                  </h3>
                  {previewImage.address && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {previewImage.address}
                    </p>
                  )}
                </div>

                <a
                  href={`https://www.google.com/maps?q=${previewImage.lat},${previewImage.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors shrink-0"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Google Maps
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>

              {previewImage.description && (
                <div className="p-3 rounded-lg bg-muted/50 text-xs text-foreground italic border border-border/50">
                  &ldquo;{previewImage.description}&rdquo;
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
                <span>
                  Check-in by{" "}
                  <strong className="text-foreground font-semibold">
                    {previewImage.user.name}
                  </strong>{" "}
                  ({previewImage.user.email})
                </span>
                <span>{formatDate(previewImage.createdAt)}</span>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* MODAL 2: Delete Confirmation */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        {deleteTarget && (
          <DialogContent
            className="max-w-md"
            onClose={() => setDeleteTarget(null)}
          >
            <DialogHeader>
              <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
                <Trash2 className="w-5 h-5" />
              </div>
              <DialogTitle>Delete Check-in Record?</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this check-in at{" "}
                <strong className="text-foreground">
                  {deleteTarget.locationName || "this location"}
                </strong>
                ? If an image was uploaded, it will also be purged from Google
                Cloud Storage.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCheckin}
                disabled={deleteLoading}
                className="cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
