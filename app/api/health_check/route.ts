import { NextResponse } from "next/server"

export async function GET(req: Request) {
    return new Response("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
}