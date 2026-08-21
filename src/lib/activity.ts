import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export interface LogActivityParams {
  userId?: number | null;
  action: string;
  entityType?: "user" | "checkin" | "auth" | "admin" | string;
  entityId?: number;
  details?: string;
  request?: Request;
  ipAddress?: string;
  userAgent?: string;
}

export function extractClientInfo(request?: Request): {
  ipAddress?: string;
  userAgent?: string;
} {
  if (!request) return {};

  let ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    undefined;

  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "localhost";
  }

  const userAgent = request.headers.get("user-agent") || undefined;
  return { ipAddress: ip, userAgent };
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const clientInfo = extractClientInfo(params.request);
    const ipAddress = params.ipAddress || clientInfo.ipAddress;
    const userAgent = params.userAgent || clientInfo.userAgent;

    await db.insert(activityLogs).values({
      userId: params.userId || null,
      action: params.action,
      entityType: params.entityType || null,
      entityId: params.entityId || null,
      details: params.details || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  } catch (error) {
    // Non-blocking logger failure
    console.error("Failed to log activity:", error);
  }
}
