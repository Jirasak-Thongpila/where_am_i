import { db } from "@/db";
import { users } from "@/db/schema";
import { Name } from "drizzle-orm";
import { NextResponse } from "next/server";
import argon2 from "argon2";


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

        const hashPassword = await argon2.hash(password);

        const newUser = await db.insert(users).values({
            email,
            name,
            password: hashPassword,
        }).returning();

        return NextResponse.json({
            message: "User created successfully",
            user: newUser,
        }, {
            status: 201
        })

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "Failed to register",
        }, {
            status: 500
        })
    }
}
