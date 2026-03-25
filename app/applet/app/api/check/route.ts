// app/api/check/route.ts v0.1.0
import { NextResponse } from "next/server";
import { getServerConfig } from "@/app/lib/config-server";

export async function GET() {
  try {
    // Using Firebase Client SDK for server-side operations
    const config = await getServerConfig("system");
    return NextResponse.json({ status: "ok", config });
  } catch (error) {
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
