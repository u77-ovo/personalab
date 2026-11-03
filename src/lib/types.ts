import type { ExtractedEvidence, Scores } from "@/lib/research";

export type Idea = { id: string; title: string; description: string; problemStatement: string; targetAudience: string; stage: string; status: "draft" | "ready_for_review" | "accepted"; updatedAt: string };
export type Assessment = { id: string; ideaId: string; version: number; scores: Scores; evidenceLevel: "insufficient" | "early" | "moderate"; reasons: Record<keyof Scores, string>; createdAt: string };
export type Blueprint = { ideaId: string; positioning: string; jtbd: string; p0: string[]; nonGoals: string[]; risks: string[]; validationPlan: string[] };
export type Task = { id: string; name: string; instruction: string; successCriteria: string; metric: string };
export type Persona = { id: string; name: string; role: string; context: string; goal: string; limitation: string; color: string };
export type Project = { id: string; sourceIdeaId?: string; title: string; description: string; targetUsers: string; objective: string; prototypeName?: string; prototypeDataUrl?: string; version: string; round: string; updatedAt: string };
export type Issue = { id: string; projectId: string; title: string; detail: string; severity: "high" | "medium" | "low"; taskId: string; personaIds: string[]; sourceKind: "ai_inference"; status: "unverified_ai_hypothesis" | "planned_for_test" | "supported" | "contradicted" | "mixed" | "action_planned"; alternative: string; proposedTest: string; location: string };
export type Evidence = ExtractedEvidence & { sourceId: string };
export type ActionItem = { id: string; issueId: string; evidenceIds: string[]; title: string; priority: "P0" | "P1" | "P2"; acceptance: string; status: "proposed" | "approved" | "in_progress" | "done" };
export type Report = { id: string; projectId: string; title: string; markdown: string; generatedAt: string };
export type WorkspaceState = { version: 1; idea?: Idea; assessments: Assessment[]; blueprint?: Blueprint; project?: Project; tasks: Task[]; personas: Persona[]; issues: Issue[]; sourceText: string; evidence: Evidence[]; actions: ActionItem[]; reports: Report[] };
