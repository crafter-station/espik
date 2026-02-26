import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "@/lib/ratelimit";

// These env vars are server-only (no NEXT_PUBLIC_ prefix)
const CLIENT_ID = process.env.PALABRA_CLIENT_ID!;
const CLIENT_SECRET = process.env.PALABRA_CLIENT_SECRET!;

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Translation service not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });
}
