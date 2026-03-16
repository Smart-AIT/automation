import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const response = NextResponse.json({ message: "Logout successful" });

        response.cookies.delete({
            name: "sb-edlzolohwpxgshimjbzb-auth-token",
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Failed to logout", details: error }, { status: 500 });
    }

}