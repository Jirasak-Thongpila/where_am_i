import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export async function GET(request: NextRequest) {
    try {
        let cookieToken = request.cookies.get("auth-token")?.value;

        if (!cookieToken) {
            const authHeader = request.headers.get("Authorization");
            if (authHeader && authHeader.startsWith("Bearer ")) {
                cookieToken = authHeader.split(" ")[1];
            }
        }

        if (!cookieToken) {
            return NextResponse.json({
                message: "Unauthorized",
            }, {
                status: 401
            })
        }

        const payload = await verifyJWT<{id:number, email:string, name:string}>(cookieToken);
        if (!payload || !payload.id) {
            return NextResponse.json({
                message: "Invalid token",
            }, {
                status: 401
            })
        }

        const user = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, payload.id))
            .limit(1);

        if (!user || user.length === 0) {
            return NextResponse.json({
                message: "User not found",
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            message: "User found",
            user: user[0],
        }, {
            status: 200
        })

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "Failed to get user",
        }, {
            status: 500
        })
    }
}
