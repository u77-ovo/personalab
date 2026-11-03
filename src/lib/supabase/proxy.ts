import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { inspectRuntimeConfig } from "@/server/config";

export async function refreshSession(request: NextRequest) {
  const runtime = inspectRuntimeConfig();
  if (runtime.mode === "demo") return NextResponse.next({ request });

  if (!runtime.ready) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("reason", "configuration");
    return NextResponse.redirect(loginUrl);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )!;
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
