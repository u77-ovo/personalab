import { z } from "zod";
import { makeDemoIssues } from "@/lib/demo-data";

const inputSchema = z.object({ projectId: z.string().min(3), taskId: z.string().min(3), personaIds: z.array(z.string()).min(1).max(4) });

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "INVALID_INPUT", detail: parsed.error.flatten() }, { status: 400 });
  return Response.json({ mode: "demo_fixture", model: null, runState: "succeeded", issues: makeDemoIssues(parsed.data.projectId, parsed.data.taskId, parsed.data.personaIds) });
}
