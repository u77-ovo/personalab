import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerConfig } from "@/server/config";

export async function createServerSupabaseClient() {
  const config = getServerConfig();
  const { url, publishableKey } = config.supabase;
  if (!url || !publishableKey) throw new Error("Supabase 尚未配置");

  const cookieStore = await cookies();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always write cookies; proxy.ts performs refresh writes.
        }
      },
    },
  });
}
