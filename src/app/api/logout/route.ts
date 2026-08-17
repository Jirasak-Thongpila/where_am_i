import { NextResponse } from "next/server";

export async function POST() {
    try {
      const response = NextResponse.json(
        {
          message: "Logout successfully",
        },
        {
          status: 200
        }
      );

      response.cookies.set({
        name: "auth-token",
        value: "",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      })

      return response;

    } catch (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        {
          message: "Failed to logout",
        },
        {
          status: 500
        }
      );
    }
}
