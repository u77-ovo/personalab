import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { inspectRuntimeConfig } from "@/server/config";

export async function GET(request: NextRequest) {
  const runtime = inspectRuntimeConfig();
  if (runtime.mode !== "real" || !runtime.authConfigured) {
    return NextResponse.redirect(new URL("/login?reason=configuration", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?reason=missing_code", request.url));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?reason=callback_failed", request.url));
  return NextResponse.redirect(new URL("/workspace", request.url));
}
