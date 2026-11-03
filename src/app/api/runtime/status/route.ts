import { NextResponse } from "next/server";
import { connection } from "next/server";
import { inspectRuntimeConfig } from "@/server/config";

export async function GET() {
  await connection();
  const status = inspectRuntimeConfig();
  return NextResponse.json(status, { status: status.ready ? 200 : 503 });
}
