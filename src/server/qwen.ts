import { z } from "zod";
import { getServerConfig } from "./config";

type RateBucket = { count: number; resetAt: number };

declare global {
  var __personaLabStudentQwenBuckets: Map<string, RateBucket> | undefined;
}

const rateBuckets = globalThis.__personaLabStudentQwenBuckets ?? new Map<string, RateBucket>();
globalThis.__personaLabStudentQwenBuckets = rateBuckets;

export class QwenRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 500,
  ) {
    super(message);
  }
}

const qwenErrorSchema = z.object({
  error: z.object({
    code: z.union([z.string(), z.number()]).optional(),
    message: z.string().optional(),
  }).optional(),
  code: z.union([z.string(), z.number()]).optional(),
  message: z.string().optional(),
});

const completionSchema = z.object({
  id: z.string(),
  model: z.string().optional(),
  choices: z.array(z.object({
    message: z.object({ content: z.string() }),
  })).min(1),
});

export function parseQwenJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    try {
      return JSON.parse(withoutFence);
    } catch {
      throw new QwenRequestError("QWEN_OUTPUT_INVALID", "千问没有返回可用的结构化结果，请重试。", 502);
    }
  }
}

export function assertQwenRequest(request: Request) {
  const config = getServerConfig();
  if (!config.qwen.apiKey || !config.qwen.baseUrl || !config.qwen.liveEnabled) {
    throw new QwenRequestError("QWEN_NOT_CONFIGURED", "千问真实 AI 尚未启用，请先配置服务器环境变量。", 503);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 120_000) {
    throw new QwenRequestError("REQUEST_TOO_LARGE", "本次研究内容过长，请精简后重试。", 413);
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    throw new QwenRequestError("CROSS_SITE_REQUEST", "拒绝跨站 AI 请求。", 403);
  }

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || request.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const existing = rateBuckets.get(key);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + 60 * 60 * 1000 }
    : existing;
  if (bucket.count >= config.qwen.requestsPerHour) {
    throw new QwenRequestError("RATE_LIMITED", "本小时千问调用次数已达上限，请稍后再试。", 429);
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);

  return {
    ...config.qwen,
    remainingThisHour: Math.max(0, config.qwen.requestsPerHour - bucket.count),
    resetsAt: new Date(bucket.resetAt).toISOString(),
  };
}

type StructuredQwenOptions<Schema extends z.ZodType> = {
  apiKey: string;
  baseUrl: string;
  model: string;
  schema: Schema;
  schemaName: string;
  instructions: string;
  prompt: string;
};

export async function runStructuredQwen<Schema extends z.ZodType>(options: StructuredQwenOptions<Schema>) {
  const endpoint = `${options.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        { role: "system", content: options.instructions },
        { role: "user", content: options.prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: options.schemaName,
          strict: true,
          schema: z.toJSONSchema(options.schema),
        },
      },
      enable_thinking: false,
      stream: false,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsedError = qwenErrorSchema.safeParse(payload);
    const upstreamCode = parsedError.success
      ? String(parsedError.data.error?.code ?? parsedError.data.code ?? "unknown")
      : "unknown";
    if (response.status === 403 && upstreamCode === "AccessDenied.Unpurchased") {
      throw new QwenRequestError(
        "QWEN_SERVICE_NOT_ACTIVATED",
        "当前阿里云账号尚未开通百炼模型服务，请先在华北2（北京）模型广场完成开通。",
        503,
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new QwenRequestError("QWEN_AUTH_FAILED", "千问 API Key 无效、额度已停用或没有当前模型权限。", 503);
    }
    if (response.status === 429) {
      throw new QwenRequestError("QWEN_RATE_LIMITED", "千问调用频率已达上限，请稍后重试。", 429);
    }
    console.error("Qwen upstream error", response.status, upstreamCode);
    throw new QwenRequestError("QWEN_API_ERROR", "千问服务暂时不可用，请稍后重试。", 502);
  }

  const completion = completionSchema.safeParse(payload);
  if (!completion.success) {
    throw new QwenRequestError("QWEN_RESPONSE_INVALID", "千问响应格式异常，请稍后重试。", 502);
  }
  const parsedOutput = options.schema.safeParse(parseQwenJson(completion.data.choices[0].message.content));
  if (!parsedOutput.success) {
    throw new QwenRequestError("QWEN_OUTPUT_INVALID", "千问返回的报告字段不完整，请重试。", 502);
  }

  return {
    data: parsedOutput.data as z.infer<Schema>,
    model: completion.data.model ?? options.model,
    responseId: completion.data.id,
  };
}

export function qwenErrorResponse(error: unknown) {
  if (error instanceof QwenRequestError) {
    return Response.json({ error: error.code, message: error.message }, { status: error.status });
  }
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return Response.json({ error: "QWEN_TIMEOUT", message: "千问生成报告超时，请稍后重试。" }, { status: 504 });
  }
  console.error("Unexpected Qwen error", error instanceof Error ? error.message : "unknown");
  return Response.json({ error: "AI_INTERNAL_ERROR", message: "报告生成失败，请稍后重试。" }, { status: 500 });
}
