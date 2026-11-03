import type { Assessment, Blueprint, Idea, Issue, Persona, Project, Task, WorkspaceState } from "@/lib/types";
import { makeId, type Scores } from "@/lib/research";

export const defaultTranscript = `访谈员：你刚才为什么停在首页？
受访者：我听到“开始探索”和“立即定位”，不知道它们有什么区别，所以先没点。
访谈员：后来你是怎么找到收藏功能的？
受访者：我逐个滑动听按钮名称。那个星形按钮只念了“按钮”，我猜可能是收藏，但不敢确认。
访谈员：位置权限的说明清楚吗？
受访者：如果能先告诉我定位会用来做什么、会不会保存，我会更放心。`;

export const defaultTasks: Task[] = [{ id: "TASK-DEMO-01", name: "首次收藏地点", instruction: "在不了解产品的情况下找到并收藏一个地点。", successCriteria: "独立完成收藏，并能说出下次在哪里找到它。", metric: "任务完成 / 首次点击 / 犹豫点" }];
export const defaultPersonas: Persona[] = [
  { id: "PER-01", name: "初次使用者", role: "低产品熟悉度", context: "第一次接触产品，不理解内部术语。", goal: "快速判断产品能否解决当前任务。", limitation: "容易被同层级入口分散注意。", color: "#4b66d1" },
  { id: "PER-02", name: "效率导向者", role: "高频任务视角", context: "熟悉辅助技术，重视步骤与反馈效率。", goal: "用最少操作重复完成常见任务。", limitation: "冗长引导会被快速跳过。", color: "#168879" },
  { id: "PER-03", name: "谨慎验证者", role: "隐私敏感视角", context: "授权前希望理解用途、保存与撤回方式。", goal: "确认风险可控后再继续。", limitation: "模糊说明会直接降低信任。", color: "#bb557d" },
  { id: "PER-04", name: "低数字熟练度者", role: "慢速探索视角", context: "依赖明确文字和稳定的信息层级。", goal: "不靠猜测也能理解下一步。", limitation: "图标与专业表达增加认知负担。", color: "#c67432" },
];

export function createInitialWorkspace(): WorkspaceState { return { version: 1, assessments: [], tasks: defaultTasks, personas: defaultPersonas, issues: [], sourceText: defaultTranscript, evidence: [], actions: [], reports: [] }; }
export function makeDemoAssessment(idea: Idea, version = 1): Assessment { const scores: Scores = { why: 3.4, who: 3.8, what: 3.2, how: 3.1, validate: 4.0, next: 2.8 }; return { id: makeId("ASSESS"), ideaId: idea.id, version, scores, evidenceLevel: "early", createdAt: new Date().toISOString(), reasons: { why: "问题场景清楚，但仍缺少更广泛的真实需求证据。", who: "目标群体较明确，建议继续收窄首批招募条件。", what: "核心价值可以成立，P0 需要保持单一任务闭环。", how: "静态原型可先验证理解，真实数据与权限路径仍需设计。", validate: "研究问题可转化为可观察的任务与通过标准。", next: "后续价值依赖首轮真人测试和复测结果。" } }; }
export function makeDemoBlueprint(idea: Idea): Blueprint { return { ideaId: idea.id, positioning: `${idea.title}：帮助${idea.targetAudience}更可靠地完成关键任务。`, jtbd: `当我处于${idea.problemStatement}相关场景时，我希望获得清楚、可控制的产品支持。`, p0: ["明确单一主任务入口", "保存并恢复关键进度", "提供可理解的状态反馈"], nonGoals: ["首版不做复杂多 Agent", "不把模拟 Persona 当真人结论", "不承诺市场成功概率"], risks: ["目标用户定义仍可能过宽", "真实使用环境尚未验证", "隐私说明可能影响信任"], validationPlan: ["访谈 5–8 位目标用户核对问题频率", "用静态原型完成 3–5 次任务测试", "记录完成、犹豫点与反对证据"] }; }
export function projectFromIdea(idea: Idea): Project { return { id: makeId("PROJECT"), sourceIdeaId: idea.id, title: idea.title, description: idea.description, targetUsers: idea.targetAudience, objective: `验证：${idea.problemStatement}`, version: "V1", round: "Round 1", updatedAt: new Date().toISOString() }; }
export function makeDemoIssues(projectId: string, taskId: string, personaIds: string[]): Issue[] { return [
  { id: makeId("ISSUE"), projectId, title: "两个主入口可能造成首次决策停顿", detail: "“开始探索”和“立即定位”在同一视觉层级，用户可能无法判断先后。", severity: "high", taskId, personaIds, sourceKind: "ai_inference", status: "unverified_ai_hypothesis", alternative: "用户可能已从此前引导理解两个入口。", proposedTest: "让 5 位新用户说出第一点击并记录犹豫原因。", location: "首页主操作区（待人工确认）" },
  { id: makeId("ISSUE"), projectId, title: "图标按钮的含义可能不足", detail: "收藏入口依赖图形识别，截图无法证明读屏名称与焦点顺序正确。", severity: "high", taskId, personaIds, sourceKind: "ai_inference", status: "unverified_ai_hypothesis", alternative: "实际产品可能已有无障碍名称。", proposedTest: "使用 TalkBack 检查名称、角色、状态和焦点顺序。", location: "首页快捷操作区（待人工确认）" },
  { id: makeId("ISSUE"), projectId, title: "定位授权时机可能影响信任", detail: "用户尚未理解价值时请求权限，可能拒绝并中断任务。", severity: "medium", taskId, personaIds, sourceKind: "ai_inference", status: "unverified_ai_hypothesis", alternative: "目标用户可能已预期该产品需要定位。", proposedTest: "比较进入即请求与点击后请求的理解和完成情况。", location: "定位流程（待人工确认）" },
]; }
