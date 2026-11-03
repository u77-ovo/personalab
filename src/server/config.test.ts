import { describe, expect, it } from "vitest";
import { inspectRuntimeConfig, parseServerConfig } from "./config";

describe("server configuration", () => {
  it("keeps the local demo usable without cloud credentials", () => {
    const config = parseServerConfig({ APP_MODE: "demo" });
    expect(config.mode).toBe("demo");
    expect(inspectRuntimeConfig({ APP_MODE: "demo" }).ready).toBe(true);
  });

  it("fails closed when real mode has no Supabase credentials", () => {
    expect(() => parseServerConfig({ APP_MODE: "real" })).toThrow(/配置不完整/);
    expect(inspectRuntimeConfig({ APP_MODE: "real" }).ready).toBe(false);
  });

  it("accepts a configured real mode and the legacy anon key", () => {
    const current = parseServerConfig({
      APP_MODE: "real",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });
    const legacy = parseServerConfig({
      APP_MODE: "real",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-anon-key",
    });
    expect(current.supabase.publishableKey).toBe("sb_publishable_example");
    expect(legacy.supabase.publishableKey).toBe("legacy-anon-key");
  });

  it("never exposes the service-role key through runtime status", () => {
    const status = inspectRuntimeConfig({
      APP_MODE: "demo",
      SUPABASE_SERVICE_ROLE_KEY: "do-not-leak",
    });
    expect(JSON.stringify(status)).not.toContain("do-not-leak");
  });

  it("does not claim cloud data is ready before RLS and Storage are verified", () => {
    const base = {
      APP_MODE: "real",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    };
    expect(inspectRuntimeConfig(base).dataReady).toBe(false);
    expect(inspectRuntimeConfig({
      ...base,
      SUPABASE_RLS_VERIFIED: "true",
      SUPABASE_STORAGE_VERIFIED: "true",
    }).dataReady).toBe(true);
  });

  it("never exposes the new Supabase secret key through runtime status", () => {
    const status = inspectRuntimeConfig({ APP_MODE: "demo", SUPABASE_SECRET_KEY: "sb_secret_do-not-leak" });
    expect(JSON.stringify(status)).not.toContain("sb_secret_do-not-leak");
  });
});
