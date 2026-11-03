import { z } from "zod";

const optionalSecret = z.string().trim().optional().transform((value) => value || undefined);

const envSchema = z.object({
  APP_MODE: z.enum(["demo", "real"]).default("demo"),
  NEXT_PUBLIC_SUPABASE_URL: optionalSecret,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalSecret,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret,
  SUPABASE_SECRET_KEY: optionalSecret,
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
  OPENAI_API_KEY: optionalSecret,
  OPENAI_MODEL: optionalSecret,
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
});

export type ServerConfig = {
  mode: "demo" | "real";
  baseUrl: string;
  supabase: {
    url?: string;
    publishableKey?: string;
    secretKey?: string;
  };
  openai: {
    apiKey?: string;
    model?: string;
  };
};

export type RuntimeStatus = {
  mode: "demo" | "real";
  ready: boolean;
  authConfigured: boolean;
  databaseConfigured: boolean;
  storageConfigured: boolean;
  rlsVerified: boolean;
  dataReady: boolean;
  openaiConfigured: boolean;
  deploymentConfigured: boolean;
  problems: string[];
  warnings: string[];
};

export function parseServerConfig(env: Record<string, string | undefined>): ServerConfig {
  const parsed = envSchema.parse(env);
  const publishableKey = parsed.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const problems: string[] = [];

  if (parsed.APP_MODE === "real") {
    if (!parsed.NEXT_PUBLIC_SUPABASE_URL) problems.push("缺少 NEXT_PUBLIC_SUPABASE_URL");
    if (!publishableKey) problems.push("缺少 Supabase publishable key");
  }

  if (problems.length > 0) {
    throw new Error(`Real 模式配置不完整：${problems.join("；")}`);
  }

  return {
    mode: parsed.APP_MODE,
    baseUrl: parsed.APP_BASE_URL,
    supabase: {
      url: parsed.NEXT_PUBLIC_SUPABASE_URL,
      publishableKey,
      secretKey: parsed.SUPABASE_SECRET_KEY ?? parsed.SUPABASE_SERVICE_ROLE_KEY,
    },
    openai: {
      apiKey: parsed.OPENAI_API_KEY,
      model: parsed.OPENAI_MODEL,
    },
  };
}

export function getServerConfig(): ServerConfig {
  return parseServerConfig(process.env);
}

export function inspectRuntimeConfig(env: Record<string, string | undefined> = process.env): RuntimeStatus {
  const mode = env.APP_MODE === "real" ? "real" : "demo";
  const urlConfigured = Boolean(env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const keyConfigured = Boolean(
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
  const supabaseConfigured = urlConfigured && keyConfigured;
  const problems: string[] = [];
  const warnings: string[] = [];
  const rlsVerified = supabaseConfigured && env.SUPABASE_RLS_VERIFIED === "true";
  const storageVerified = supabaseConfigured && env.SUPABASE_STORAGE_VERIFIED === "true";

  if (mode === "real" && !urlConfigured) problems.push("缺少 Supabase 项目 URL");
  if (mode === "real" && !keyConfigured) problems.push("缺少 Supabase publishable key");
  if (mode === "real" && !rlsVerified) warnings.push("数据库 RLS 尚未标记为已验证");
  if (mode === "real" && !storageVerified) warnings.push("私有 Storage 尚未标记为已验证");

  return {
    mode,
    ready: mode === "demo" || problems.length === 0,
    authConfigured: supabaseConfigured,
    databaseConfigured: supabaseConfigured,
    storageConfigured: storageVerified,
    rlsVerified,
    dataReady: rlsVerified && storageVerified,
    openaiConfigured: Boolean(env.OPENAI_API_KEY?.trim()),
    deploymentConfigured: Boolean(env.VERCEL_URL?.trim() || env.APP_BASE_URL?.startsWith("https://")),
    problems,
    warnings,
  };
}
