import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import argon2 from "argon2";
import { signJWT } from "@/lib/jwt";


export async function POST(request: Request) {
    try {

        const body = await request.json();
        const { email, name, password } = body;


        if (!email || !name || !password) {
            return NextResponse.json({
                message: "email and username and password are required",

            }, {

                status: 400
            })
        }

        const normalizedEmail = email.toLowerCase().trim();

        const sskruEmailRegex = /^[^\s@]+@sskru\.ac\.th$/;

        if (!sskruEmailRegex.test(normalizedEmail)) {
            return NextResponse.json({

                message: "Only @sskru.ac.th email addresses are allowed",
            }, {
                status: 400
            })
        }

        const expiresInUser = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

        if (expiresInUser.length > 0) {
            return NextResponse.json({
                message: "email already exists",
            }, {
                status: 409
            })
        }

        const hashPassword = await argon2.hash(password);

        const newUser = await db.insert(users).values({
            email: normalizedEmail,
            name,
            password: hashPassword,
        }).returning();

        const jwtToken = await signJWT({
            id: newUser[0].id,
            email: newUser[0].email,
            name: newUser[0].name
        });

        const { password: _, ...userWithoutPassword } = newUser[0];

        const response = NextResponse.json({
            message: "User created successfully",
            user: userWithoutPassword,
            token: jwtToken,
        }, {
            status: 201
        })

        response.cookies.set({
            name: "auth-token",
            value: jwtToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        })

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "Failed to register",
        }, {
            status: 500
        })
    }
}
