import { NextResponse } from "next/server";

// These env vars are server-only (no NEXT_PUBLIC_ prefix)
const CLIENT_ID = process.env.PALABRA_CLIENT_ID!;
const CLIENT_SECRET = process.env.PALABRA_CLIENT_SECRET!;

export async function GET() {
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
