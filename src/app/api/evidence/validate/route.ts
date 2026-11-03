import { z } from "zod";
import { validateEvidence } from "@/lib/research";

const schema = z.object({ source: z.string().min(1).max(200_000), exactQuote: z.string().min(1).max(10_000), startOffset: z.number().int().nonnegative(), endOffset: z.number().int().positive() });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ valid: false, error: "INVALID_INPUT" }, { status: 400 });
  const { source, ...evidence } = parsed.data; const valid = validateEvidence(source, evidence);
  return Response.json({ valid, status: valid ? "verified" : "rejected", error: valid ? null : "QUOTE_RANGE_MISMATCH" });
}
