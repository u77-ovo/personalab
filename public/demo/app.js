const STORAGE_KEY = "personalab.rebuild.demo.v1";

const projectStages = ["想法阶段", "已有资料阶段", "原型验证阶段", "完整产品阶段", "已上线迭代阶段"];

function normalizeProjectStage(stage) {
  if (stage === "原型半成品阶段") return "原型验证阶段";
  return projectStages.includes(stage) ? stage : "想法阶段";
}

function projectStageOptions(selected) {
  const normalized = normalizeProjectStage(selected);
  return projectStages.map(stage=>`<option ${stage === normalized ? "selected" : ""}>${stage}</option>`).join("");
}

function preferredRouteForStage(stage) {
  return ["想法阶段", "已有资料阶段"].includes(normalizeProjectStage(stage)) ? "spark" : "mirror";
}

function materialEvidenceMeta(item) {
  const type = String(item.type || "");
  const source = String(item.source || "");
  if (/访谈|问卷|客服|观察|日志/.test(type)) return { label:"原始用户证据", className:"evidence-primary" };
  if (/评价|评论/.test(type) || /公开|联网/.test(source)) return { label:"公开反馈", className:"evidence-public" };
  return { label:"背景资料", className:"evidence-context" };
}

const builtInPersonas = [
  { id: "p1", name: "目标明确的新用户", short: "新", color: "#7666e6", type: "平台预设", desc: "第一次接触产品，需要快速理解价值、入口和下一步动作。", traits: ["低熟悉度", "需要引导", "易流失"] },
  { id: "p2", name: "效率导向的重度用户", short: "效", color: "#eb8753", type: "平台预设", desc: "熟悉同类工具，希望用最少步骤完成高频任务。", traits: ["高频使用", "讨厌冗余", "关注效率"] },
  { id: "p3", name: "隐私敏感型用户", short: "隐", color: "#37a083", type: "平台预设", desc: "会主动确认数据用途、授权范围以及删除与退出方式。", traits: ["谨慎授权", "重视透明", "信任门槛高"] },
  { id: "p4", name: "低数字熟练度用户", short: "低", color: "#4c76d8", type: "平台预设", desc: "不熟悉复杂界面和专业词汇，需要清楚反馈与可恢复操作。", traits: ["慢速探索", "怕误操作", "需要反馈"] },
  { id: "p5", name: "无障碍需求用户", short: "障", color: "#a467b0", type: "平台预设", desc: "依赖清楚层级、键盘操作、文本替代与足够的视觉对比。", traits: ["键盘操作", "信息可达", "清晰结构"] },
  { id: "p6", name: "价格敏感型决策者", short: "价", color: "#bf755b", type: "平台预设", desc: "会反复比较收益、成本与替代方案，再决定是否继续使用。", traits: ["重视性价比", "多方比较", "决策谨慎"] }
];

const PERSONA_IP_IMAGE = "./assets/personalab-xiaop.webp";
const personaTilts = [-3, 2, -1, 3, -2, 1];

const sampleMaterials = [
  { id: "m1", title: "学生深度访谈摘录（8人）", type: "用户访谈", source: "用户上传", content: "多数学生能制定计划，但难以在课程、作业和临时任务变化后持续调整。", date: "今天", icon: "访" },
  { id: "m2", title: "同类学习工具公开评价", type: "公开评价", source: "联网方向", content: "高频负面反馈集中在提醒过多、计划维护成本高，以及 AI 建议缺少依据。", date: "今天", icon: "评" },
  { id: "m3", title: "校园学习场景问卷", type: "问卷", source: "用户上传", content: "64% 的受访者表示最困难的不是制定计划，而是任务冲突时重新排序。", date: "昨天", icon: "问" },
  { id: "m4", title: "竞品功能拆解笔记", type: "竞品资料", source: "团队整理", content: "竞品普遍覆盖日历与提醒，但较少解释推荐优先级及其调整原因。", date: "3天前", icon: "竞" }
];

const sampleTasks = [
  { id: "t1", projectId: "p-campus", name: "梳理任务冲突场景下的真实需求", kind: "Spark", status: "已完成", personas: ["目标明确的新用户", "效率导向的重度用户", "隐私敏感型用户"], note: "聚焦计划被打断后的重新排序成本。", createdAt: Date.now() - 1000 * 60 * 60 * 28, updatedAt: Date.now() - 1000 * 60 * 60 * 8 },
  { id: "t2", projectId: "p-campus", name: "预演新增临时作业后的调整路径", kind: "Mirror", status: "运行中", personas: ["目标明确的新用户", "效率导向的重度用户", "低数字熟练度用户", "无障碍需求用户"], note: "检查冲突解释、确认反馈和撤回机制。", createdAt: Date.now() - 1000 * 60 * 60 * 6, updatedAt: Date.now() - 1000 * 60 * 35 },
  { id: "t3", projectId: "p-campus", name: "验证推荐理由的表达方式", kind: "Spark", status: "草稿", personas: ["隐私敏感型用户", "价格敏感型决策者"], note: "待补充公开评价与访谈证据。", createdAt: Date.now() - 1000 * 60 * 18, updatedAt: Date.now() - 1000 * 60 * 18 },
  { id: "t4", projectId: "p-access", name: "预演校内导航无障碍路径", kind: "Mirror", status: "已完成", personas: ["无障碍需求用户", "低数字熟练度用户"], note: "关注入口、路径反馈与错误恢复。", createdAt: Date.now() - 1000 * 60 * 60 * 72, updatedAt: Date.now() - 1000 * 60 * 60 * 48 },
  { id: "t5", projectId: "p-voice", name: "探索情绪语音反馈的使用场景", kind: "Spark", status: "草稿", personas: ["目标明确的新用户"], note: "先澄清用户价值与使用边界。", createdAt: Date.now() - 1000 * 60 * 60 * 96, updatedAt: Date.now() - 1000 * 60 * 60 * 80 }
];

const initialState = () => {
  const project = { id: "p-new", name: "未命名项目", description: "从 Spark 或 Mirror 开始第一次验证", stage: "想法阶段", status: "进行中", tags: ["待定义"], cover: "warm", progress: 0, updatedAt: Date.now() };
  return {
    schemaVersion: 3,
    project,
    projects: [project],
    activeProjectId: project.id,
    tasks: [],
    personas: [...builtInPersonas],
    materials: [],
    sparkRuns: [],
    mirrorRuns: [],
    reports: [],
    activePage: "workspace",
    workspaceView: "projects",
    boardTab: "tasks",
    materialView: "grid",
    projectFilter: "active",
    activeDraftTaskId: "",
    theme: "light",
    updatedAt: Date.now()
  };
};

const sampleState = () => {
  const projects = [
    { id: "p-campus", name: "校园 AI 学习助手", description: "验证动态任务规划能否降低大学生面对临时变化时的维护负担。", stage: "原型验证阶段", status: "进行中", tags: ["教育", "AI 助手", "效率"], cover: "warm", progress: 72, updatedAt: Date.now() - 1000 * 60 * 35 },
    { id: "p-access", name: "无障碍校园导航", description: "面向视障与低数字熟练度用户，验证校内路线引导和异常反馈。", stage: "完整产品阶段", status: "待复盘", tags: ["无障碍", "校园", "导航"], cover: "mint", progress: 56, updatedAt: Date.now() - 1000 * 60 * 60 * 48 },
    { id: "p-voice", name: "情绪语音交互概念", description: "探索情绪语音反馈在陪伴与任务支持场景中的适用边界。", stage: "想法阶段", status: "草稿", tags: ["语音交互", "情绪", "研究"], cover: "violet", progress: 34, updatedAt: Date.now() - 1000 * 60 * 60 * 80 }
  ];
  return {
    schemaVersion: 3,
    project: projects[0],
    projects,
    activeProjectId: projects[0].id,
    tasks: sampleTasks.map(task=>({ ...task })),
    personas: [...builtInPersonas],
    materials: sampleMaterials.map(item=>({ ...item, projectId:"p-campus" })),
    sparkRuns: [],
    mirrorRuns: [],
    reports: [],
    activePage: "workspace",
    workspaceView: "projects",
    boardTab: "tasks",
    materialView: "grid",
    theme: "light",
    updatedAt: Date.now()
  };
};

let state = loadState();
let currentSparkResult = state.sparkRuns[0] || null;
let currentMirrorResult = state.mirrorRuns[0] || null;

const pageTitles = {
  workspace: "我的工作台",
  spark: "Spark 播种",
  mirror: "Mirror 预演",
  personas: "Persona 用户库",
  materials: "真实需求资料库",
  reports: "验证报告"
};

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState();
    const parsed = JSON.parse(stored);
    const defaults = initialState();
    const legacyProject = { ...defaults.project, ...(parsed.project || {}) };
    const projects = Array.isArray(parsed.projects) && parsed.projects.length
      ? parsed.projects.map((project,index)=>({ id:project.id || `p${index+1}`, status:"进行中", tags:[], cover:index % 2 ? "mint" : "warm", updatedAt:parsed.updatedAt || Date.now(), ...project })).map(project=>({ ...project, stage:normalizeProjectStage(project.stage) }))
      : [{ ...legacyProject, id:legacyProject.id || "p-new", status:legacyProject.status || "进行中", tags:legacyProject.tags || [], cover:legacyProject.cover || "warm", updatedAt:parsed.updatedAt || Date.now(), stage:normalizeProjectStage(legacyProject.stage) }];
    const activeProjectId = parsed.activeProjectId || projects[0].id;
    const project = projects.find(item=>item.id === activeProjectId) || projects[0];
    return {
      ...defaults,
      ...parsed,
      schemaVersion: 3,
      project,
      projects,
      activeProjectId: project.id,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      personas: Array.isArray(parsed.personas) ? parsed.personas : defaults.personas,
      materials: Array.isArray(parsed.materials) ? parsed.materials : [],
      sparkRuns: Array.isArray(parsed.sparkRuns) ? parsed.sparkRuns.map(normalizeSparkRun) : [],
      mirrorRuns: Array.isArray(parsed.mirrorRuns) ? parsed.mirrorRuns.map(normalizeMirrorRun) : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports.map(report=>({ ...report, round:report.round || 1, previousReportId:report.previousReportId || report.data?.previousReportId || "" })) : [],
      workspaceView: parsed.workspaceView || "projects",
      boardTab: parsed.boardTab || "tasks",
      materialView: parsed.materialView || "grid",
      projectFilter: parsed.projectFilter === "archived" ? "archived" : "active",
      activeDraftTaskId: parsed.activeDraftTaskId || "",
      theme: parsed.theme === "dark" ? "dark" : "light"
    };
  } catch {
    return initialState();
  }
}

function normalizeSparkRun(run) {
  return { ...run, sources: run.sources || ["旧版本地记录"], evidence: run.evidence || [] };
}

function normalizeMirrorRun(run) {
  const scores = (run.scores || []).map(item=>({ ...item, reason:item.reason || "" }));
  const scored = scores.filter(item=>item.score !== null && item.score !== undefined);
  return {
    ...run,
    scores,
    rawTotal: run.rawTotal ?? scored.reduce((sum,item)=>sum+item.score,0),
    scoredMax: run.scoredMax ?? scored.reduce((sum,item)=>sum+item.max,0),
    scoredCount: run.scoredCount ?? scored.length,
    unscoredCount: run.unscoredCount ?? Math.max(0, scores.length - scored.length),
    path: run.path || [
      { text:"进入产品并寻找核心任务入口", status:"已完成" },
      { text:run.task || "完成核心任务", status:"已完成" },
      { text:"查看系统反馈与推荐依据", status:"出现阻塞" },
      { text:"确认结果并检查撤回方式", status:"出现阻塞" }
    ]
  };
}

function saveState() {
  const projectIndex = state.projects.findIndex(item=>item.id === state.activeProjectId);
  if (projectIndex >= 0) state.projects[projectIndex] = state.project;
  state.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  syncResumeButton();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme || "light";
  const button = document.querySelector(".theme-toggle");
  if (button) {
    const dark = state.theme === "dark";
    button.textContent = dark ? "☀" : "☾";
    button.setAttribute("aria-label", dark ? "切换浅色模式" : "切换深色模式");
    button.title = dark ? "切换浅色模式" : "切换深色模式";
  }
}

function syncResumeButton() {
  const button = document.querySelector("#resume-button");
  if (!button) return;
  const hasWork = state.projects.some(project=>project.name !== "未命名项目") || state.materials.length || state.sparkRuns.length || state.mirrorRuns.length;
  button.hidden = !hasWork;
  if (hasWork) button.textContent = `继续：${state.project.name}`;
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return "刚刚";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function enterDemo(mode = "resume") {
  if (mode === "sample") {
    state = sampleState();
    currentSparkResult = null;
    currentMirrorResult = null;
    saveState();
  } else if (mode === "blank") {
    state = initialState();
    currentSparkResult = null;
    currentMirrorResult = null;
    saveState();
  } else {
    state = loadState();
    currentSparkResult = state.sparkRuns[0] || null;
    currentMirrorResult = state.mirrorRuns[0] || null;
  }
  document.querySelector("#landing").hidden = true;
  document.querySelector("#app").hidden = false;
  applyTheme();
  navigate(state.activePage || "workspace");
  if (mode === "blank") setTimeout(() => openModal("project"), 0);
}

function navigate(page) {
  state.activePage = page;
  saveState();
  document.querySelectorAll("[data-nav]").forEach(item => item.classList.toggle("active", item.dataset.nav === page && item.classList.contains("nav-item")));
  document.querySelector("#page-title").textContent = pageTitles[page];
  document.querySelector(".sidebar").classList.remove("open");
  document.querySelector("#app").classList.remove("menu-open");
  renderPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPage() {
  const renderers = { workspace: renderWorkspace, spark: renderSpark, mirror: renderMirror, personas: renderPersonas, materials: renderMaterials, reports: renderReports };
  document.querySelector("#page-content").innerHTML = (renderers[state.activePage] || renderWorkspace)();
  document.querySelector("#page-title").textContent = state.activePage === "workspace" && state.workspaceView === "board" ? state.project.name : pageTitles[state.activePage];
  bindPageEvents();
}

function renderWorkspace() {
  if (state.workspaceView === "board") return renderProjectBoard();
  const activeProjects = state.projects.filter(project=>project.status !== "已归档");
  const archivedProjects = state.projects.filter(project=>project.status === "已归档");
  const visibleProjects = state.projectFilter === "archived" ? archivedProjects : activeProjects;
  const archivedCount = archivedProjects.length;
  const runningCount = state.tasks.filter(task=>task.status === "运行中").length;
  return `
    <div class="page-heading workspace-heading">
      <div><p class="eyebrow">WORKSPACE</p><h1>我的项目</h1><p>每个项目拥有独立的任务、素材和报告。选一个项目，继续你的产品验证。</p></div>
      <div class="heading-actions"><button class="button button-primary" data-open-modal="new-project">＋ 新建项目</button></div>
    </div>
    <section class="workspace-summary">
      <div><strong>${activeProjects.length}</strong><span>进行中的项目</span></div>
      <div><strong>${runningCount}</strong><span>正在运行的任务</span></div>
      <div><strong>${state.reports.length}</strong><span>已生成报告</span></div>
      <div><strong>${state.personas.length}</strong><span>可调用 Persona</span></div>
    </section>
    <div class="section-title project-list-title"><div><h2>${state.projectFilter === "archived" ? "归档项目" : "最近项目"}</h2><p>${state.projectFilter === "archived" ? "进入项目后可以恢复，不会丢失任务、素材和报告" : archivedCount ? `${archivedCount} 个项目已归档` : "按最近更新时间排序"}</p></div><div class="project-filter-group"><button class="soft-filter ${state.projectFilter === "active" ? "active" : ""}" data-project-filter="active">进行中 ${activeProjects.length}</button><button class="soft-filter ${state.projectFilter === "archived" ? "active" : ""}" data-project-filter="archived">已归档 ${archivedCount}</button></div></div>
    <section class="project-gallery">
      ${visibleProjects.length ? visibleProjects.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).map(project=>projectTileHTML(project)).join("") : `<div class="board-empty wide project-filter-empty"><span>${state.projectFilter === "archived" ? "↺" : "＋"}</span><h3>${state.projectFilter === "archived" ? "还没有归档项目" : "创建第一个验证项目"}</h3><p>${state.projectFilter === "archived" ? "归档项目会安全保留在这里，之后可以随时恢复。" : "无论你现在只有一个想法、已有原型，还是正在迭代完整产品，都可以从这里开始。"}</p></div>`}
      ${state.projectFilter === "active" ? `<button class="new-project-card" data-open-modal="new-project"><span>＋</span><strong>新建一个项目</strong><small>从想法、原型或完整产品开始</small></button>` : ""}
    </section>`;
}

function projectTileHTML(project) {
  const taskCount = getProjectTasks(project.id).length;
  const reportCount = getProjectReports(project.id).length;
  const statusClass = project.status === "进行中" ? "status-running" : project.status === "待复盘" ? "status-review" : "status-draft";
  return `<button class="project-tile" data-open-project="${project.id}">
    <span class="project-cover cover-${escapeHTML(project.cover || "warm")}">
      <span class="cover-orb cover-orb-one"></span><span class="cover-orb cover-orb-two"></span>
      <span class="project-status ${statusClass}"><i></i>${escapeHTML(project.status || "进行中")}</span>
      <span class="project-cover-mark">P</span>
    </span>
    <span class="project-tile-body">
      <span class="project-title-row"><strong>${escapeHTML(project.name)}</strong><i>→</i></span><span class="project-stage-badge">${escapeHTML(normalizeProjectStage(project.stage))}</span>
      <small>${escapeHTML(project.description)}</small>
      <span class="project-tags">${(project.tags || []).slice(0,3).map(tag=>`<em>${escapeHTML(tag)}</em>`).join("")}</span>
      <span class="project-tile-footer"><span>${taskCount} 个任务 · ${reportCount} 份报告</span><time>${formatRelativeTime(project.updatedAt)}</time></span>
    </span>
  </button>`;
}

function getProjectTasks(projectId = state.activeProjectId) {
  const stored = state.tasks.filter(task=>task.projectId === projectId || (!task.projectId && projectId === state.activeProjectId));
  const known = new Set(stored.map(task=>task.sourceRunId || task.id));
  const fromRuns = [
    ...state.sparkRuns.map(run=>({ id:`task-${run.id}`, sourceRunId:run.id, projectId:run.projectId || state.activeProjectId, name:run.title || "Spark 需求探索", kind:"Spark", status:"已完成", personas:run.personas || [], note:"已完成需求探索并生成报告。", createdAt:run.createdAt, updatedAt:run.createdAt, reportId:run.id })),
    ...state.mirrorRuns.map(run=>({ id:`task-${run.id}`, sourceRunId:run.id, projectId:run.projectId || state.activeProjectId, name:run.title || "Mirror 体验预演", kind:"Mirror", status:"已完成", personas:run.personas || [], note:run.task || "已完成体验预演并生成报告。", createdAt:run.createdAt, updatedAt:run.createdAt, reportId:run.id }))
  ].filter(task=>task.projectId === projectId && !known.has(task.sourceRunId));
  return [...stored, ...fromRuns].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
}

function getProjectMaterials(projectId = state.activeProjectId) {
  return state.materials.filter(item=>item.projectId === projectId || (!item.projectId && projectId === state.activeProjectId));
}

function getProjectReports(projectId = state.activeProjectId) {
  return state.reports.filter(item=>item.projectId === projectId || (!item.projectId && projectId === state.activeProjectId));
}

function getActiveDraftTask(kind) {
  return state.tasks.find(task=>task.id === state.activeDraftTaskId && task.kind === kind && task.status !== "已完成") || null;
}

function getTaskSeed(task) {
  if (!task) return {};
  if (task.formSeed) return task.formSeed;
  const sourceReport = state.reports.find(report=>report.id === task.sourceReportId);
  if (!sourceReport) return { direction:task.note || "", task:task.note || "" };
  if (task.kind === "Spark") return {
    title:sourceReport.data.title,
    direction:sourceReport.data.direction || task.note || ""
  };
  return {
    title:sourceReport.data.title,
    materialType:sourceReport.data.materialType,
    material:sourceReport.data.material,
    task:sourceReport.data.task
  };
}

function reportRound(report) {
  return Number(report?.round || 1);
}

function comparisonPartner(report) {
  if (!report) return null;
  if (report.previousReportId) return state.reports.find(item=>item.id === report.previousReportId) || null;
  return state.reports.find(item=>item.previousReportId === report.id) || null;
}

function getProjectGuidance(project, tasks, materials, reports) {
  if (project.status === "已归档") return {
    key:`archived-${project.id}`,
    eyebrow:"项目已归档",
    title:"需要继续研究时，可以完整恢复这个项目",
    detail:"任务、素材和报告仍然保留；恢复后可继续运行 Spark 或 Mirror。",
    action:"restore",
    actionLabel:"恢复项目",
    tone:"neutral"
  };
  const stage = normalizeProjectStage(project.stage);
  const preferred = preferredRouteForStage(stage);
  const completedSpark = tasks.some(task=>task.kind === "Spark" && task.status === "已完成");
  const completedMirror = tasks.some(task=>task.kind === "Mirror" && task.status === "已完成");
  const activeTask = tasks.find(task=>["草稿", "运行中"].includes(task.status));
  const latestReport = [...reports].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))[0];
  const key = `${stage}-${materials.length}-${tasks.length}-${reports.length}-${completedSpark}-${completedMirror}`;
  if (!tasks.length && !materials.length) return {
    key, eyebrow:`${stage} · 建议起点`,
    title:preferred === "spark" ? "先明确研究方向，再补充一份真实资料" : "先放入现有产品材料，预演一条关键任务路径",
    detail:preferred === "spark" ? "Spark 可以从目标用户、场景和问题开始；添加访谈、问卷或公开评价后，结论会更容易追溯。" : "Mirror 支持截图、流程说明、Figma 或网站地址；资料不足的维度会保持“暂不评分”。",
    route:preferred,
    actionLabel:preferred === "spark" ? "开始 Spark 探需" : "开始 Mirror 预演",
    secondary:"material",
    tone:preferred
  };
  if (!tasks.length) return {
    key, eyebrow:`已准备 ${materials.length} 份资料`,
    title:preferred === "spark" ? "用现有资料探索需求、分歧与产品机会" : "结合现有材料评估一条完整体验路径",
    detail:`这些资料会保留在项目证据库中，后续报告可继续引用。`,
    route:preferred,
    actionLabel:preferred === "spark" ? "新建 Spark 任务" : "新建 Mirror 任务",
    secondary:"material",
    tone:preferred
  };
  if (activeTask && !latestReport) return {
    key, eyebrow:`${activeTask.kind} 任务待完成`,
    title:`继续“${activeTask.name}”`,
    detail:"完成任务后会自动生成报告，并保存到当前项目的报告归档。",
    route:activeTask.kind.toLowerCase(),
    actionLabel:activeTask.status === "草稿" ? "继续编辑" : "继续查看",
    tone:activeTask.kind.toLowerCase()
  };
  if (completedSpark && !completedMirror) return {
    key, eyebrow:"需求探索已完成",
    title:"把已经发现的需求放进一条具体产品路径中验证",
    detail:"下一步建议用 Mirror 检查入口、理解成本、任务效率、反馈与错误恢复；即使只有文字流程也可以开始。",
    route:"mirror",
    actionLabel:"开始 Mirror 预演",
    reportId:latestReport?.id,
    tone:"mirror"
  };
  if (completedMirror && latestReport) return {
    key, eyebrow:"进入迭代阶段",
    title:"先处理高优先级问题，再创建下一轮验证",
    detail:"报告保留了关键问题和证据边界。打开报告即可创建下一轮草稿，持续比较修改前后的结果。",
    reportId:latestReport.id,
    actionLabel:"查看最新报告",
    tone:"iteration"
  };
  return {
    key, eyebrow:"继续验证",
    title:"根据当前研究问题选择 Spark 或 Mirror",
    detail:"探索新需求与新方向使用 Spark；评估已有方案和完整产品体验使用 Mirror。",
    route:preferred,
    actionLabel:preferred === "spark" ? "新建 Spark 任务" : "新建 Mirror 任务",
    tone:preferred
  };
}

function projectGuidanceHTML(guidance) {
  if (!guidance || state.project.guidanceDismissedKey === guidance.key) return "";
  const primary = guidance.action === "restore"
    ? `<button class="button button-primary" data-project-action="restore">${guidance.actionLabel}</button>`
    : guidance.reportId
      ? `<button class="button button-primary" data-preview-report="${guidance.reportId}">${guidance.actionLabel}</button>`
      : `<button class="button button-primary" data-go="${guidance.route}">${guidance.actionLabel}</button>`;
  const secondary = guidance.secondary === "material" ? `<button class="button button-secondary" data-open-modal="material">添加资料</button>` : "";
  return `<aside class="next-step-card next-${guidance.tone || "neutral"}"><span class="next-step-icon">${guidance.tone === "mirror" ? "◫" : guidance.tone === "iteration" ? "↻" : guidance.tone === "spark" ? "✦" : "✓"}</span><div><small>${escapeHTML(guidance.eyebrow)}</small><h2>${escapeHTML(guidance.title)}</h2><p>${escapeHTML(guidance.detail)}</p></div><div class="next-step-actions">${primary}${secondary}<button class="next-step-dismiss" data-dismiss-guidance="${escapeHTML(guidance.key)}" aria-label="关闭本条建议">×</button></div></aside>`;
}

function renderProjectBoard() {
  const project = state.project;
  const tasks = getProjectTasks();
  const materials = getProjectMaterials();
  const reports = getProjectReports();
  const running = tasks.filter(task=>task.status === "运行中").length;
  const sparkCount = tasks.filter(task=>task.kind === "Spark").length;
  const mirrorCount = tasks.filter(task=>task.kind === "Mirror").length;
  const preferredRoute = preferredRouteForStage(project.stage);
  const isArchived = project.status === "已归档";
  const guidance = getProjectGuidance(project, tasks, materials, reports);
  return `<section class="project-board page-enter">
    <button class="back-to-projects" data-back-projects>← 返回项目列表</button>
    <header class="project-board-head">
      <div class="project-board-title">
        <button class="editable-title" ${isArchived ? "disabled" : `data-open-modal="project" title="点击编辑项目名称"`}><h1>${escapeHTML(project.name)}</h1>${isArchived ? "" : "<span>✎</span>"}</button>
        <button class="editable-description" ${isArchived ? "disabled" : `data-open-modal="project" title="点击编辑项目简介"`}>${escapeHTML(project.description)} ${isArchived ? "" : "<span>编辑</span>"}</button>
        <div class="board-tags">${(project.tags || []).map(tag=>`<span>${escapeHTML(tag)}</span>`).join("")}${isArchived ? "" : `<button data-open-modal="tag">＋ 标签</button>`}</div>
      </div>
      <div class="project-board-actions">
        <label class="stage-picker"><span>项目阶段</span><select id="project-stage" ${isArchived ? "disabled" : ""}>${projectStageOptions(project.stage)}</select></label>
        <details class="more-menu"><summary aria-label="更多项目操作">•••</summary><div>${isArchived ? `<button data-project-action="restore">恢复项目</button>` : `<button data-project-action="archive">归档项目</button><button class="danger" data-project-action="delete">删除项目</button>`}</div></details>
        ${isArchived ? `<button class="button button-primary board-action" data-project-action="restore"><span>↺</span> 恢复并继续</button>` : `<button class="button ${preferredRoute === "spark" ? "button-primary" : "button-secondary"} board-action" data-go="spark"><span>✦</span> 新建 Spark 任务</button><button class="button ${preferredRoute === "mirror" ? "button-primary" : "button-secondary"} board-action" data-go="mirror"><span>◫</span> 新建 Mirror 任务</button>`}
      </div>
    </header>
    ${projectGuidanceHTML(guidance)}
    <div class="board-metrics">
      ${boardMetric("tasks", tasks.length, "任务总数", "▣")}
      ${boardMetric("tasks", running, "进行中", "◌", "running")}
      ${boardMetric("tasks", sparkCount, "Spark 任务", "✦", "spark")}
      ${boardMetric("tasks", mirrorCount, "Mirror 任务", "◫", "mirror")}
      ${boardMetric("reports", reports.length, "已生成报告", "▥")}
    </div>
    <nav class="board-tabs" aria-label="项目内容">
      <button class="${state.boardTab === "tasks" ? "active" : ""}" data-board-tab="tasks">任务列表 <span>${tasks.length}</span></button>
      <button class="${state.boardTab === "materials" ? "active" : ""}" data-board-tab="materials">项目素材 <span>${materials.length}</span></button>
      <button class="${state.boardTab === "reports" ? "active" : ""}" data-board-tab="reports">报告归档 <span>${reports.length}</span></button>
    </nav>
    <div class="board-panel">${state.boardTab === "materials" ? boardMaterialsHTML(materials,isArchived) : state.boardTab === "reports" ? boardReportsHTML(reports) : boardTasksHTML(tasks,isArchived)}</div>
  </section>`;
}

function boardMetric(tab, value, label, icon, filter = "") {
  return `<button data-board-tab="${tab}" ${filter ? `data-task-filter="${filter}"` : ""}><span>${icon}</span><strong>${value}</strong><small>${label}</small></button>`;
}

function boardTasksHTML(tasks, readOnly = false) {
  const preferredRoute = preferredRouteForStage(state.project.stage);
  return `<div class="board-toolbar">
      <label class="board-search"><span>⌕</span><input id="task-search" placeholder="搜索任务名称或备注"></label>
      <select id="task-kind-filter"><option value="">全部类型</option><option>Spark</option><option>Mirror</option></select>
      <select id="task-status-filter"><option value="">全部状态</option><option>草稿</option><option>运行中</option><option>已完成</option><option>已终止</option></select>
      <select id="task-sort"><option value="updated">最近更新</option><option value="created">创建时间</option></select>
      ${readOnly ? `<span class="archived-readonly">归档项目 · 只读</span>` : `<button class="toolbar-create ${preferredRoute === "spark" ? "" : "secondary"}" data-go="spark">✦ 新建 Spark</button><button class="toolbar-create ${preferredRoute === "mirror" ? "" : "secondary"}" data-go="mirror">◫ 新建 Mirror</button>`}
    </div>
    <div class="task-list" id="task-list">${tasks.length ? tasks.map(task=>taskCardHTML(task,readOnly)).join("") : `<div class="board-empty"><span>✦</span><h3>还没有验证任务</h3><p>${readOnly ? "恢复项目后，可以继续创建验证任务。" : "探索需求、用户分歧或新方向时使用 Spark；评估原型、完整产品或已上线体验时使用 Mirror。"}</p>${readOnly ? "" : `<div><button class="button ${preferredRoute === "spark" ? "button-primary" : "button-secondary"}" data-go="spark">新建 Spark</button><button class="button ${preferredRoute === "mirror" ? "button-primary" : "button-secondary"}" data-go="mirror">新建 Mirror</button></div>`}</div>`}</div>`;
}

function taskCardHTML(task, readOnly = false) {
  const kindClass = task.kind === "Spark" ? "task-spark" : "task-mirror";
  const statusClass = { "运行中":"is-running", "已完成":"is-done", "已终止":"is-stopped" }[task.status] || "is-draft";
  const title = readOnly
    ? `<strong class="task-title-readonly">${escapeHTML(task.name)}</strong>`
    : task.status === "已完成" && task.reportId
      ? `<button data-preview-report="${task.reportId}">${escapeHTML(task.name)}</button>`
      : `<button ${task.status === "已完成" ? `data-task-go="${task.kind.toLowerCase()}"` : `data-edit-task="${task.id}"`}>${escapeHTML(task.name)}</button>`;
  const actions = readOnly
    ? task.status === "已完成" && task.reportId ? `<button data-preview-report="${task.reportId}">查看报告</button><span class="archived-task-note">只读</span>` : `<span class="archived-task-note">只读</span>`
    : `${task.status === "已完成" ? `<button data-preview-report="${task.reportId || ""}" data-task-go="${task.reportId ? "" : task.kind.toLowerCase()}">查看报告</button>` : `<button class="primary" data-edit-task="${task.id}">${task.status === "草稿" ? "继续编辑" : "继续"}</button>`}${task.status === "运行中" ? `<button data-task-action="stop" data-task-id="${task.id}">终止</button>` : ""}<button class="icon-more" data-task-action="delete" data-task-id="${task.id}" aria-label="删除任务">•••</button>`;
  return `<article class="task-card" data-task-name="${escapeHTML(`${task.name} ${task.note || ""}`).toLowerCase()}" data-task-kind="${task.kind}" data-task-status="${task.status}">
    <div class="task-type ${kindClass}">${task.kind === "Spark" ? "✦" : "◫"}</div>
    <div class="task-main"><div class="task-heading">${title}<span class="task-kind ${kindClass}">${task.kind}</span><span class="task-status ${statusClass}"><i></i>${escapeHTML(task.status)}</span></div><p>${escapeHTML(task.note || "尚未填写任务备注")}</p><div class="task-personas">${(task.personas || []).slice(0,3).map((name,index)=>`<span style="--avatar:${builtInPersonas[index]?.color || "#ee7b42"}">${escapeHTML(name.slice(0,1))}</span>`).join("")}<small>${(task.personas || []).length ? `引用 ${(task.personas || []).length} 个 Persona` : "尚未选择 Persona"}</small></div></div>
    <div class="task-meta"><time>${formatRelativeTime(task.updatedAt)}</time><div>${actions}</div></div>
  </article>`;
}

function boardMaterialsHTML(materials, readOnly = false) {
  const types = [...new Set(materials.map(item=>item.type).filter(Boolean))];
  return `<div class="board-toolbar"><label class="board-search"><span>⌕</span><input id="material-search" placeholder="搜索资料标题、内容或来源"></label><select id="material-type-filter"><option value="">全部类型</option>${types.map(type=>`<option>${escapeHTML(type)}</option>`).join("")}</select><div class="view-switch"><button class="${state.materialView === "grid" ? "active" : ""}" data-material-view="grid" aria-label="网格视图">▦</button><button class="${state.materialView === "list" ? "active" : ""}" data-material-view="list" aria-label="列表视图">☷</button></div>${readOnly ? `<span class="archived-readonly">归档项目 · 只读</span>` : `<button class="toolbar-create" data-open-modal="material">＋ 添加资料</button>`}</div>
    <div class="board-materials ${state.materialView === "list" ? "list" : ""}">${materials.length ? materials.map(item=>{ const evidence=materialEvidenceMeta(item); return `<article class="board-material-card" data-material-search="${escapeHTML(`${item.title} ${item.content} ${item.source}`).toLowerCase()}" data-material-type="${escapeHTML(item.type)}"><span class="material-preview">${escapeHTML(item.icon || "文")}</span><div><span class="evidence-badge ${evidence.className}">${evidence.label}</span><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.content)}</p><small>${escapeHTML(item.type)} · ${escapeHTML(item.source)} · ${escapeHTML(item.date)}</small></div>${readOnly ? "" : `<button data-delete-material="${item.id}" aria-label="删除资料“${escapeHTML(item.title)}”" title="删除资料">×</button>`}</article>`; }).join("") : `<div class="board-empty"><span>＋</span><h3>还没有项目资料</h3><p>${readOnly ? "恢复项目后，可以继续添加或整理资料。" : "先保存资料标题、来源和关键原文或摘要；当前本地版不会上传或解析附件。"}</p>${readOnly ? "" : `<button class="button button-primary" data-open-modal="material">添加第一份资料</button>`}</div>`}</div>`;
}

function boardReportsHTML(reports) {
  return `<div class="board-toolbar"><label class="board-search"><span>⌕</span><input id="report-search" placeholder="搜索报告标题或摘要"></label><select id="report-kind-filter"><option value="">全部类型</option><option>Spark</option><option>Mirror</option></select><select id="report-time-filter"><option value="">全部时间</option><option value="7">最近 7 天</option><option value="30">最近 30 天</option></select></div>
    <div class="board-report-grid">${reports.length ? reports.map(report=>`<article class="board-report-card" data-report-search="${escapeHTML(`${report.title} ${report.desc}`).toLowerCase()}" data-report-kind="${report.kind}" data-report-time="${report.createdAt || 0}"><div><span class="report-kind ${report.kind === "Spark" ? "spark" : "mirror"}">${report.kind === "Spark" ? "✦" : "◫"} ${report.kind}</span><span class="report-round">第 ${reportRound(report)} 轮</span></div><h3>${escapeHTML(report.title)}</h3><p>${escapeHTML(report.desc)}</p><small>${formatRelativeTime(report.createdAt)} · 来自对应任务</small><footer><button data-preview-report="${report.id}">预览</button>${comparisonPartner(report) ? `<button data-compare-report="${report.id}">轮次对比</button>` : ""}<button data-download-report="${report.id}">导出</button></footer></article>`).join("") : `<div class="board-empty wide"><span>▥</span><h3>完成任务后，报告会自动归档</h3><p>Spark 保存需求洞察，Mirror 保存路径问题与八维评分。</p></div>`}</div>`;
}

function metric(icon, value, label, color) {
  const vars = { purple: ["var(--purple-soft)","var(--purple)"], orange:["var(--orange-soft)","var(--orange)"], green:["var(--green-soft)","var(--green)"], blue:["var(--blue-soft)","var(--blue)"] }[color];
  return `<article class="card metric-card"><span class="metric-icon" style="background:${vars[0]};color:${vars[1]}">${icon}</span><div><strong>${value}</strong><small>${label}</small></div></article>`;
}

function personaPicker(prefix, selectedNames = null) {
  const hasSavedSelection = Array.isArray(selectedNames) && selectedNames.length > 0;
  return `<div class="persona-picks">${state.personas.map((p,i) => `<span class="persona-pick"><input id="${prefix}-${p.id}" name="${prefix}Persona" value="${p.id}" type="checkbox" ${(hasSavedSelection ? selectedNames.includes(p.name) : i < 4) ? "checked" : ""}><label for="${prefix}-${p.id}"><span class="pick-dot persona-pick-avatar" style="--persona:${p.color}"><img src="${PERSONA_IP_IMAGE}" alt=""><b>${escapeHTML(p.short)}</b></span>${escapeHTML(p.name)}</label></span>`).join("")}</div>`;
}

function renderSpark() {
  const draft = getActiveDraftTask("Spark");
  const seed = getTaskSeed(draft);
  const title = seed.title || (state.project.name === "未命名项目" ? "" : state.project.name);
  const direction = seed.direction || (state.materials.length ? "大学生经常制定学习计划，但面对临时任务时很难持续调整。希望验证 AI 动态规划能否真正减轻负担。" : "");
  return `
    <div class="page-heading"><div><p class="eyebrow" style="color:var(--orange)">SPARK / 播种</p><h1>从一个方向，找到值得验证的问题</h1><p>结合用户资料与公开信息方向，通过多 Persona 内部圆桌提炼需求、分歧、风险和机会。</p></div><span class="tag tag-orange">适合：想法与概念阶段</span></div>
    <div class="callout callout-info" style="margin-bottom:16px"><strong>当前能力：</strong>本地版使用内置逻辑生成研究准备结果，不会真正联网或调用外部模型；接入正式服务后会保留每条公开资料的来源链接。</div>
    ${draft ? `<div class="draft-context draft-spark"><span>草稿已恢复</span><strong>${escapeHTML(draft.name)}</strong><p>${escapeHTML(draft.iterationFocus || draft.note || "继续完善本轮需求探索")}</p><button data-clear-draft>退出草稿</button></div>` : ""}
    <div class="lab-layout">
      <form id="spark-form" class="card lab-panel">
        <div class="panel-head"><h2>设置本轮需求探索</h2><span class="tag tag-gray">约 1 分钟</span></div>
        <div class="panel-body">
          <div class="form-group"><label class="form-label" for="spark-title">产品 / 想法名称</label><input class="input" id="spark-title" name="title" value="${escapeHTML(title)}" placeholder="例如：校园 AI 学习助手" required></div>
          <div class="form-group"><label class="form-label" for="spark-direction">你想解决什么问题？<small>方向越具体，结果越聚焦</small></label><textarea class="textarea" id="spark-direction" name="direction" required placeholder="描述目标用户、使用场景、当前痛点或你希望验证的假设">${escapeHTML(direction)}</textarea></div>
          <div class="form-group"><span class="form-label">信息范围</span><div class="choice-grid">
            <span class="choice"><input id="source-own" type="checkbox" name="sources" value="用户资料" checked><label for="source-own"><span class="choice-mark">✓</span><span><strong>我的需求资料库</strong><small>检索访谈、问卷、评价等原始片段</small></span></label></span>
            <span class="choice"><input id="source-web" type="checkbox" name="sources" value="公开资料" checked><label for="source-web"><span class="choice-mark">✓</span><span><strong>公开资料方向</strong><small>正式版按方向联网搜索并保留来源</small></span></label></span>
          </div></div>
          <div class="form-group"><span class="form-label">参与讨论的 Persona <small>多 Persona 对话仅在 Spark 内部</small></span>${personaPicker("spark", draft?.personas)}</div>
          <div class="submit-row"><button class="button button-purple" type="submit">✦ ${draft ? "继续并完成本轮探索" : "运行模拟圆桌"}</button><small>本地示例仿真<br>不代表真实用户结论</small></div>
        </div>
      </form>
      <section id="spark-result" class="card lab-panel">${currentSparkResult ? sparkResultHTML(currentSparkResult) : sparkEmptyHTML()}</section>
    </div>`;
}

function sparkEmptyHTML() {
  return `<div class="empty-state"><div><div class="empty-illustration">✦</div><h3>等待开始本轮探索</h3><p>填写产品方向并选择 Persona。完成后，这里会显示圆桌讨论、需求证据、分歧点、风险和机会优先级。</p><div class="empty-steps"><span></span><span></span><span></span><span></span></div></div></div>`;
}

function sparkResultHTML(result) {
  const sourceSummary = result.sources?.length ? result.sources.join(" + ") : "Persona 推演";
  return `<div class="result-shell">
    <div class="result-summary"><div class="result-summary-top"><div><p class="eyebrow">SPARK RESULT · 第 ${result.round || 1} 轮 · 示例仿真</p><h2>${escapeHTML(result.title)}：需求探索摘要</h2><p>基于 ${result.personas.length} 个 Persona 与“${escapeHTML(sourceSummary)}”生成；共保留 ${result.evidence?.length || 0} 条来源记录。所有模型推断仍需后续真实验证。</p></div><span class="tag tag-green">已完成</span></div></div>
    <div class="result-tabs"><button class="result-tab active" data-spark-tab="dialogue">圆桌讨论</button><button class="result-tab" data-spark-tab="insights">需求与机会</button><button class="result-tab" data-spark-tab="evidence">来源证据</button><button class="result-tab" data-spark-tab="concept">概念建议</button></div>
    <div id="spark-result-body" class="result-body">${sparkTabHTML(result,"dialogue")}</div>
  </div>`;
}

function sparkTabHTML(result, tab) {
  if (tab === "dialogue") return `<div class="roundtable">${result.dialogue.map(d => `<div class="speech"><span class="speech-avatar" style="background:${d.color}">${escapeHTML(d.short)}</span><div class="speech-bubble"><strong>${escapeHTML(d.name)}</strong><span class="source-ref">Persona 推演</span><p>${escapeHTML(d.text)}</p></div></div>`).join("")}</div>`;
  if (tab === "insights") return `<div class="insight-list">${result.insights.map(i => `<article class="insight"><div class="insight-top"><h4>${escapeHTML(i.title)} <span class="source-ref">${escapeHTML(i.source)}</span></h4><span class="priority ${i.level === "高" ? "priority-high" : "priority-mid"}">${i.level}优先级</span></div><p>${escapeHTML(i.detail)}</p>${i.evidenceIds?.length ? `<div class="evidence-links">依据：${i.evidenceIds.map(id=>`<span>${escapeHTML(id)}</span>`).join("")}</div>` : ""}</article>`).join("")}</div>`;
  if (tab === "evidence") return `<div class="evidence-list">${(result.evidence || []).map(item=>`<article class="evidence-card"><div class="evidence-card-top"><span class="evidence-id">${escapeHTML(item.id)}</span><span class="tag ${item.status === "原始资料片段" ? "tag-blue" : "tag-gray"}">${escapeHTML(item.status)}</span></div><h4>${escapeHTML(item.title)}</h4><blockquote>“${escapeHTML(item.quote)}”</blockquote><p>${escapeHTML(item.kind)} · 来源：${escapeHTML(item.source)}</p></article>`).join("") || `<div class="callout callout-warning"><strong>没有可追溯资料：</strong>本轮只有 Persona 推演，所有结论都应视为待验证假设。</div>`}</div>`;
  return `<div class="callout callout-warning"><strong>建议的最小产品概念：</strong>先验证“冲突解释 + 一键调整 + 用户确认”这一条闭环，不要把完整智能计划系统一次做完。</div><div class="section-title"><h2>第一轮原型应包含</h2></div><div class="insight-list">${["导入一周任务并识别时间冲突","解释为什么建议调整某项任务","允许用户接受、修改或拒绝建议","保留调整记录并让用户随时撤回"].map((x,i)=>`<article class="insight"><div class="insight-top"><h4>0${i+1} · ${x}</h4><span class="tag tag-purple">待验证</span></div></article>`).join("")}</div>`;
}

function runSpark(form) {
  const data = new FormData(form);
  const draft = getActiveDraftTask("Spark");
  const previousReport = state.reports.find(report=>report.id === draft?.sourceReportId) || null;
  const previousReportId = previousReport?.id || "";
  const round = previousReport ? reportRound(previousReport) + 1 : 1;
  const selectedIds = data.getAll("sparkPersona");
  const selected = state.personas.filter(p => selectedIds.includes(p.id));
  if (selected.length < 2) { showToast("请至少选择 2 个 Persona 参与讨论"); return; }
  const sources = data.getAll("sources").map(String);
  if (!sources.length) { showToast("请至少选择一种信息范围"); return; }
  const title = String(data.get("title") || "未命名想法");
  const direction = String(data.get("direction") || "");
  const evidence = [];
  if (sources.includes("用户资料")) {
    if (state.materials.length) {
      state.materials.slice(0, 3).forEach((material, index) => evidence.push({
        id: `E-${String(index + 1).padStart(2,"0")}`,
        title: material.title,
        kind: material.type,
        quote: material.content,
        source: material.source,
        status: "原始资料片段"
      }));
    } else {
      evidence.push({ id:"G-01", title:"用户资料缺口", kind:"资料状态", quote:"当前资料库为空，无法用真实用户材料支持需求结论。", source:"系统检查", status:"待补充资料" });
    }
  }
  if (sources.includes("公开资料")) evidence.push({
    id:"W-01", title:"公开资料检索方向", kind:"联网方向", quote:`正式版将围绕“${direction.slice(0, 80)}”搜索公开评价与行业资料，并保存网页来源。`, source:"本地版未联网", status:"待正式检索"
  });
  const texts = [
    "我真正需要的不是更多提醒，而是在任务冲突时看懂系统为什么这样调整，以及我还能怎么选。",
    "如果每次变化都要重新维护计划，这个工具反而会增加负担。高频操作应该能一步完成。",
    "系统要明确告诉我哪些课程、日历和行为数据会被读取；默认授权范围不能过大。",
    "不要一次展示太多优先级和参数。先告诉我发生了什么，再给一个可以撤回的建议。",
    "重要状态不能只靠颜色区分，建议、确认和撤回都要支持键盘操作与清楚标签。",
    "如果价值不能在第一周被感知，我不会为长期订阅付费。需要先让我看到节省了多少时间。"
  ];
  const result = {
    id: `s${Date.now()}`, projectId:state.activeProjectId, title, direction, personas: selected, sources, evidence, previousReportId, round, createdAt: Date.now(), date: "刚刚",
    dialogue: selected.map((p,i) => ({ ...p, text: texts[i % texts.length] })),
    insights: [
      { title: "变化发生时，用户更需要重新排序而非再次制定计划", detail: "资料片段与多类 Persona 都指向“维护成本”问题，应优先验证动态调整场景。", source: state.materials.length && sources.includes("用户资料") ? "用户资料 + Persona" : "待真实验证", level: "高", evidenceIds: evidence.filter(x=>x.status === "原始资料片段").slice(0,2).map(x=>x.id) },
      { title: "推荐必须可解释、可修改、可撤回", detail: "系统给出结论但不解释依据，会同时损害效率感与信任感。", source: "Persona 共识", level: "高", evidenceIds: [] },
      { title: "提醒数量不是价值，减少决策负担才是", detail: "建议把成功指标从提醒触达率改为冲突解决时间与用户确认率。", source: "综合推断", level: "中", evidenceIds: evidence.filter(x=>x.id === "W-01").map(x=>x.id) },
      { title: "授权范围和数据用途需要前置说明", detail: "日历、课程与行为数据较敏感，隐私说明应进入首次体验而非藏在设置页。", source: "风险推断", level: "中", evidenceIds: [] }
    ]
  };
  currentSparkResult = result;
  state.project.name = title;
  state.project.description = direction.slice(0,70) || state.project.description;
  state.project.status = "进行中";
  state.project.progress = Math.max(state.project.progress, 55);
  state.project.updatedAt = result.createdAt;
  state.sparkRuns.unshift(result);
  if (draft) Object.assign(draft,{ sourceRunId:result.id, reportId:result.id, status:"已完成", personas:selected.map(persona=>persona.name), note:"核心需求、Persona 分歧、风险与最小概念建议", updatedAt:result.createdAt });
  else state.tasks.unshift({ id:`task-${result.id}`, sourceRunId:result.id, projectId:state.activeProjectId, reportId:result.id, name:`${title} · 需求探索`, kind:"Spark", status:"已完成", personas:selected.map(persona=>persona.name), note:"核心需求、Persona 分歧、风险与最小概念建议", createdAt:result.createdAt, updatedAt:result.createdAt });
  state.reports.unshift({ id: result.id, projectId:state.activeProjectId, kind: "Spark", title: `${title} · 需求探索报告`, desc: "核心需求、Persona 分歧、风险与最小概念建议", previousReportId, round, date: "刚刚", createdAt: result.createdAt, data: result });
  state.activeDraftTaskId = "";
  saveState();
  document.querySelector(".draft-context")?.remove();
  form.querySelector('button[type="submit"]').textContent = "✦ 运行模拟圆桌";
  document.querySelector("#spark-result").innerHTML = sparkResultHTML(result);
  bindResultTabs();
  showToast("Spark 模拟完成，报告已保存");
}

function renderMirror() {
  const draft = getActiveDraftTask("Mirror");
  const seed = getTaskSeed(draft);
  const title = seed.title || (state.project.name === "未命名项目" ? "" : state.project.name);
  const materialType = seed.materialType || "产品截图 / 多页面图片";
  const material = seed.material || "用户在首页导入课程与任务，系统生成本周安排；当新任务加入时，用户查看冲突并确认调整。";
  const coreTask = seed.task || "添加一个临时作业，并完成本周任务的重新安排";
  const materialTypes = ["产品截图 / 多页面图片","Figma 原型链接","已上线网站地址","流程图或操作文档","演示视频","仅有文字流程说明"];
  return `
    <div class="page-heading"><div><p class="eyebrow" style="color:var(--green)">MIRROR / 预演</p><h1>让虚拟用户先走一遍产品路径</h1><p>接受截图、流程、文档、视频、Figma 链接或网站地址，按固定八维体系诊断体验问题。</p></div><span class="tag tag-green">适合：已有原型或产品</span></div>
    <div class="callout callout-info" style="margin-bottom:16px"><strong>评分边界：</strong>只有输入足以判断时才给分；证据不足的维度会标记“暂不评分”。本地版结果用于研究准备，不等同于真实可用性测试。</div>
    ${draft ? `<div class="draft-context draft-mirror"><span>${draft.sourceReportId ? `第 ${reportRound(state.reports.find(report=>report.id === draft.sourceReportId)) + 1} 轮复测草稿` : "草稿已恢复"}</span><strong>${escapeHTML(draft.name)}</strong><p>${escapeHTML(draft.iterationFocus || draft.note || "继续完善本轮体验预演")}</p><button data-clear-draft>退出草稿</button></div>` : ""}
    <div class="lab-layout">
      <form id="mirror-form" class="card lab-panel">
        <div class="panel-head"><h2>配置本轮体验预演</h2><span class="tag tag-gray">八维 · 100分</span></div>
        <div class="panel-body">
          <div class="form-group"><label class="form-label" for="mirror-title">产品 / 页面名称</label><input class="input" id="mirror-title" name="title" value="${escapeHTML(title)}" placeholder="例如：任务规划首页" required></div>
          <div class="form-group"><label class="form-label" for="material-type">你现在有什么？</label><select class="select" id="material-type" name="materialType">${materialTypes.map(type=>`<option ${type === materialType ? "selected" : ""}>${type}</option>`).join("")}</select></div>
          <div class="form-group"><label class="form-label" for="mirror-link">链接或流程说明 <small>两者任选其一</small></label><textarea class="textarea" id="mirror-link" name="material" placeholder="粘贴 Figma/网站链接，或描述主要页面和操作流程">${escapeHTML(material)}</textarea><label class="upload-box" for="mirror-file" style="margin-top:8px"><input id="mirror-file" name="file" type="file" accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,video/*"><span><span class="upload-icon">⇧</span><strong id="upload-label">选择本地文件</strong><small>当前只记录文件名，不读取或上传文件内容</small></span></label></div>
          <div class="form-group"><label class="form-label" for="mirror-task">希望 Persona 完成的核心任务</label><input class="input" id="mirror-task" name="task" value="${escapeHTML(coreTask)}" required></div>
          <div class="form-group"><span class="form-label">参与预演的 Persona</span>${personaPicker("mirror", draft?.personas)}</div>
          <div class="submit-row"><button class="button button-green" type="submit">◫ ${draft ? "运行本轮复测" : "开始体验预演"}</button><small>本地示例仿真<br>不代替真实用户测试</small></div>
        </div>
      </form>
      <section id="mirror-result" class="card lab-panel">${currentMirrorResult ? mirrorResultHTML(currentMirrorResult) : mirrorEmptyHTML()}</section>
    </div>`;
}

function mirrorEmptyHTML() {
  return `<div class="empty-state"><div><div class="empty-illustration" style="color:var(--green);background:var(--green-soft)">◫</div><h3>等待开始体验预演</h3><p>添加你现有的产品材料和核心任务。完成后，这里会展示任务路径、主要问题、改进建议与固定八维评分。</p><div class="empty-steps"><span style="background:var(--green)"></span><span></span><span></span><span></span></div></div></div>`;
}

const scoreMeta = [
  ["任务清晰度",15,12,"flow"],["信息架构与可寻找性",15,11,"structure"],["交互一致性",15,12,"visual"],["系统反馈",10,7,"flow"],
  ["认知负荷",10,7,"visual"],["错误预防与恢复",10,6,"flow"],["信任与隐私",10,8,"trust"],["Persona适配与无障碍",15,10,"visual"]
];

function mirrorResultHTML(result) {
  const partial = result.unscoredCount > 0;
  const ringValue = partial ? Math.round(result.scoredCount / result.scores.length * 100) : result.total;
  return `<div class="result-shell">
    <div class="score-hero"><div class="score-ring ${partial ? "partial" : ""}" style="--score:${ringValue}"><div class="score-number"><strong>${partial ? "—" : result.total}</strong><small>${partial ? `${result.unscoredCount} 项暂不评分` : "/ 100"}</small></div></div><div><span class="tag tag-green">第 ${result.round || 1} 轮 · ${partial ? `${result.scoredCount}/8 维已评` : "MIRROR 示例评分"}</span><h2>${escapeHTML(result.title)}</h2><p>${escapeHTML(result.task)} · ${result.personas.length} 个 Persona 参与预演 · ${escapeHTML(result.materialType)}</p>${partial ? `<p class="score-coverage">已评分维度合计 ${result.rawTotal}/${result.scoredMax}，不强行折算总分。</p>` : ""}</div></div>
    <div class="result-tabs"><button class="result-tab active" data-mirror-tab="issues">主要问题</button><button class="result-tab" data-mirror-tab="scores">八维评分</button><button class="result-tab" data-mirror-tab="path">模拟路径</button></div>
    <div id="mirror-result-body" class="result-body">${mirrorTabHTML(result,"issues")}</div>
  </div>`;
}

function mirrorTabHTML(result, tab) {
  if (tab === "issues") return `<div class="issue-list">${result.issues.map((issue,i)=>`<article class="issue-card"><span class="issue-index">${i+1}</span><div><h4>${escapeHTML(issue.title)}</h4><p>${escapeHTML(issue.detail)}</p><div class="issue-meta"><span class="tag ${issue.level === "高" ? "tag-red" : "tag-orange"}">${issue.level}优先级</span><span class="tag tag-gray">${escapeHTML(issue.dimension)}</span></div></div></article>`).join("")}</div>`;
  if (tab === "scores") return `<div class="score-bars">${result.scores.map(s=>`<div class="score-item"><div class="score-row ${s.score === null ? "unscored" : ""}"><label>${escapeHTML(s.name)}</label><div class="progress-bar"><span style="width:${s.score === null ? 0 : Math.round(s.score/s.max*100)}%"></span></div><strong>${s.score === null ? "暂不评分" : `${s.score}/${s.max}`}</strong></div>${s.score === null ? `<small class="score-note">${escapeHTML(s.reason)}</small>` : ""}</div>`).join("")}</div><div class="callout callout-warning" style="margin-top:18px"><strong>评分解释：</strong>分数只用于同一产品的多轮对照。缺少可观察证据的维度保持“暂不评分”，不会用模型猜测补齐。</div>`;
  return `<div class="insight-list">${result.path.map((step,i)=>`<article class="insight"><div class="insight-top"><h4>步骤 ${i+1} · ${escapeHTML(step.text)}</h4><span class="tag ${step.status === "出现阻塞" ? "tag-red" : step.status === "待观察" ? "tag-gray" : "tag-green"}">${escapeHTML(step.status)}</span></div></article>`).join("")}</div>`;
}

function runMirror(form) {
  const data = new FormData(form);
  const draft = getActiveDraftTask("Mirror");
  const previousReport = state.reports.find(report=>report.id === draft?.sourceReportId) || null;
  const previousReportId = previousReport?.id || "";
  const round = previousReport ? reportRound(previousReport) + 1 : 1;
  const resolvedIssue = previousReport?.data?.issues?.[0] || null;
  const selectedIds = data.getAll("mirrorPersona");
  const selected = state.personas.filter(p => selectedIds.includes(p.id));
  if (!selected.length) { showToast("请至少选择 1 个 Persona"); return; }
  const materialType = String(data.get("materialType") || "");
  const material = String(data.get("material") || "").trim();
  const task = String(data.get("task") || "").trim();
  const file = data.get("file");
  const fileName = file && typeof file === "object" && "name" in file ? file.name : "";
  if (material.length < 15 && !fileName) { showToast("请补充链接、流程说明或上传一份材料"); return; }
  const hasLink = /^https?:\/\//i.test(material);
  const hasVisual = Boolean(fileName) || ((materialType.includes("Figma") || materialType.includes("网站")) && hasLink);
  const evidenceAvailable = {
    flow: material.length >= 20,
    structure: hasVisual || material.length >= 45,
    visual: hasVisual,
    trust: hasVisual || material.length >= 35
  };
  const reasonByRequirement = {
    flow: "需要更完整的任务步骤或流程说明",
    structure: "需要多页面结构、流程图或可访问链接",
    visual: "需要截图、视频、Figma 或可访问网站才能观察",
    trust: "需要补充授权、数据使用或隐私提示相关界面"
  };
  const scores = scoreMeta.map(([name,max,baseScore,requirement]) => ({
    name, max, score: evidenceAvailable[requirement] ? Math.min(max, baseScore + (resolvedIssue?.dimension === name ? 2 : 0)) : null,
    reason: evidenceAvailable[requirement] ? "" : reasonByRequirement[requirement]
  }));
  const scored = scores.filter(item=>item.score !== null);
  const rawTotal = scored.reduce((sum,item)=>sum+item.score,0);
  const scoredMax = scored.reduce((sum,item)=>sum+item.max,0);
  const unscoredCount = scores.length - scored.length;
  const total = unscoredCount ? null : rawTotal;
  const issues = [
    { title:"调整建议需要同时说明推荐依据", detail:"从当前流程说明看，用户会收到调整建议，但推荐理由没有成为明确步骤。建议在确认前展示冲突来源与调整原则。", level:"高", dimension:"系统反馈" },
    { title:"确认调整后应提供明确撤回动作", detail:"当前任务路径没有描述恢复机制。建议在结果页提供撤回入口，并说明可恢复范围。", level:"高", dimension:"错误恢复" },
    { title:"数据用途需要在导入前说明", detail:"若产品读取日历、课程或行为数据，应先解释用途并逐项请求最小必要授权。", level:"中", dimension:"信任与隐私" }
  ].filter(issue=>issue.title !== resolvedIssue?.title);
  if (hasVisual) issues.push({ title:"部分状态需要同时使用文字与图标", detail:"视觉材料允许进一步检查状态表达；正式分析仍应逐页确认对比度、焦点顺序和文本替代。", level:"中", dimension:"无障碍适配" });
  else issues.push({ title:"补充界面证据后再判断视觉与交互质量", detail:"当前材料不足以判断交互一致性、视觉认知负荷和无障碍适配，因此相关维度保持暂不评分。", level:"中", dimension:"证据完整性" });
  const result = {
    id:`m${Date.now()}`, projectId:state.activeProjectId, title:String(data.get("title")||"未命名产品"), task:task||"核心任务", materialType, material, fileName, personas:selected, scores,total,rawTotal,scoredMax,scoredCount:scored.length,unscoredCount,issues,resolvedIssues:resolvedIssue ? [resolvedIssue.title] : [],previousReportId,round,createdAt:Date.now(),date:"刚刚",
    path:[
      { text:"进入产品并寻找核心任务入口", status:evidenceAvailable.structure?"已观察":"待观察" },
      { text:task||"完成核心任务", status:"已完成" },
      { text:"查看系统反馈与推荐依据", status:resolvedIssue?.dimension === "系统反馈" ? "已改善" : "出现阻塞" },
      { text:"确认结果并检查撤回方式", status:resolvedIssue?.dimension === "错误恢复" ? "已改善" : "出现阻塞" }
    ]
  };
  currentMirrorResult = result;
  state.project.name = result.title;
  state.project.status = "进行中";
  state.project.progress = Math.max(state.project.progress,72);
  state.project.updatedAt = result.createdAt;
  state.mirrorRuns.unshift(result);
  const scoreDescription = total === null ? `已评分 ${result.scoredCount}/8 维（${rawTotal}/${scoredMax}），${unscoredCount} 维暂不评分` : `固定八维评分 ${total}/100`;
  if (draft) Object.assign(draft,{ sourceRunId:result.id, reportId:result.id, status:"已完成", personas:selected.map(persona=>persona.name), note:result.task, updatedAt:result.createdAt });
  else state.tasks.unshift({ id:`task-${result.id}`, sourceRunId:result.id, projectId:state.activeProjectId, reportId:result.id, name:`${result.title} · 体验预演`, kind:"Mirror", status:"已完成", personas:selected.map(persona=>persona.name), note:result.task, createdAt:result.createdAt, updatedAt:result.createdAt });
  state.reports.unshift({ id:result.id,projectId:state.activeProjectId,kind:"Mirror",title:`${result.title} · 体验预演报告`,desc:`${scoreDescription}、任务路径与问题优先级`,previousReportId,round,date:"刚刚",createdAt:result.createdAt,data:result });
  state.activeDraftTaskId = "";
  saveState();
  document.querySelector(".draft-context")?.remove();
  form.querySelector('button[type="submit"]').textContent = "◫ 开始体验预演";
  document.querySelector("#mirror-result").innerHTML = mirrorResultHTML(result);
  bindResultTabs();
  showToast("Mirror 预演完成，报告已保存");
}

function renderPersonas() {
  return `
    <div class="page-heading"><div><p class="eyebrow">PERSONA LIBRARY</p><h1>Persona 用户库</h1><p>平台提供可直接使用的基础形象，用户也可以根据明确目标自行创建；真实资料暂不被强制聚类成人设。</p></div><div class="heading-actions"><button class="button button-primary" data-open-modal="persona">＋ 创建 Persona</button></div></div>
    <section class="card persona-ip-intro">
      <div class="persona-ip-copy"><span class="persona-ip-kicker">PERSONA 如何参与研究</span><h2>让不同人设，帮你看见不同问题</h2><p>每个 Persona 代表一种典型的目标、经验、顾虑和使用方式。选择多个 Persona 后，它们会从各自的立场理解需求、体验产品并提出反馈，帮助你发现单一视角容易忽略的问题，也更容易区分哪些是共同需求、哪些存在分歧、哪些还需要真实用户验证。</p><div><span>Spark：从不同立场讨论需求</span><span>Mirror：沿不同习惯体验产品</span><span>结果：整理共识、分歧与风险</span></div></div>
      <figure class="persona-turnaround persona-front-reference"><img src="${PERSONA_IP_IMAGE}" alt="PersonaLab 小P正面主视图"><figcaption>小P会带着选定的人设参与每一轮研究</figcaption></figure>
    </section>
    <div class="persona-evidence-note"><span>资料使用原则</span><p>初版先检索原始证据并提炼需求；只有样本足够、特征稳定时，才生成可追溯的 Persona 草稿，并由用户确认。</p></div>
    <div class="grid grid-3 persona-library-grid">${state.personas.map((p,index)=>`<article class="card persona-card" style="--persona:${p.color};--tilt:${personaTilts[index % personaTilts.length]}deg"><div class="persona-cover"><div class="persona-card-meta"><span class="persona-role-mark">${escapeHTML(p.short)}</span><small>小P视角 ${String(index + 1).padStart(2,"0")}</small></div><img class="persona-ip-avatar" src="${PERSONA_IP_IMAGE}" alt="小P代表${escapeHTML(p.name)}视角"><span class="tag persona-type ${p.type === "平台预设" ? "tag-purple" : "tag-green"}">${escapeHTML(p.type)}</span></div><div class="persona-content"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.desc)}</p><div class="trait-list">${p.traits.map(t=>`<span class="trait">${escapeHTML(t)}</span>`).join("")}</div></div></article>`).join("")}</div>`;
}

function renderMaterials() {
  return `
    <div class="page-heading"><div><p class="eyebrow">EVIDENCE LIBRARY</p><h1>真实需求资料库</h1><p>保存访谈、问卷、评论、客服记录、行业资料与竞品信息，并保留内容类型和来源。</p></div><div class="heading-actions"><button class="button button-primary" data-open-modal="material">＋ 添加资料</button></div></div>
    <div class="grid grid-4" style="margin-bottom:18px">${metric("▤",String(state.materials.length),"全部资料","purple")}${metric("访",String(state.materials.filter(m=>m.type.includes("访谈")).length),"用户访谈","orange")}${metric("问",String(state.materials.filter(m=>m.type.includes("问卷")).length),"问卷资料","green")}${metric("网",String(state.materials.filter(m=>m.source.includes("联网")).length),"公开资料方向","blue")}</div>
    <div class="card card-pad"><div class="section-title" style="margin-top:0"><h2>资料清单</h2><div class="toolbar"><span class="tag tag-gray">初版直接检索原始片段</span></div></div>
      ${state.materials.length ? `<div class="material-list">${state.materials.map(m=>{ const evidence=materialEvidenceMeta(m); return `<article class="card material-card"><span class="material-type">${escapeHTML(m.icon||"文")}</span><div><span class="evidence-badge ${evidence.className}">${evidence.label}</span><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.content)}</p><div class="material-meta"><span>${escapeHTML(m.type)}</span><span>来源：${escapeHTML(m.source)}</span><span>${escapeHTML(m.date)}</span></div></div><div class="material-actions"><span class="tag tag-blue">可检索</span></div></article>`; }).join("")}</div>` : `<div class="empty-state" style="min-height:330px"><div><div class="empty-illustration">▤</div><h3>还没有真实需求资料</h3><p>添加一段访谈摘录、一条用户评价或一份问卷摘要，就可以在 Spark 和 Mirror 中作为证据使用。</p><button class="button button-purple button-sm" data-open-modal="material">添加第一份资料</button></div></div>`}
    </div>`;
}

function renderReports() {
  return `
    <div class="page-heading"><div><p class="eyebrow">REPORTS</p><h1>验证报告</h1><p>集中查看每次 Spark 需求探索和 Mirror 体验预演的结论、来源类型与优先级。</p></div></div>
    <div class="callout callout-warning" style="margin-bottom:18px"><strong>结论边界：</strong>本地版报告用于研究准备。正式服务会区分“原始资料事实、Persona 推演、模型推断与待验证假设”，避免把模拟结果当成真实用户结论。</div>
    ${state.reports.length ? `<div class="grid grid-3">${state.reports.map(r=>`<article class="card report-card"><div class="report-card-top"><span class="report-icon" style="${r.kind==="Mirror"?"color:var(--green);background:var(--green-soft)":""}">${r.kind==="Spark"?"✦":"◫"}</span><span><span class="report-round">第 ${reportRound(r)} 轮</span><span class="tag ${r.kind==="Spark"?"tag-orange":"tag-green"}">${r.kind}</span></span></div><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.desc)}</p><div class="report-footer"><span>${formatRelativeTime(r.createdAt)} · 本地保存</span><span><button class="link-button" data-view-report="${r.id}">查看</button>${comparisonPartner(r) ? `<button class="link-button" data-compare-report="${r.id}">对比</button>` : ""}<button class="link-button" data-download-report="${r.id}">导出 ↓</button></span></div></article>`).join("")}</div>` : `<article class="card empty-state"><div><div class="empty-illustration">▥</div><h3>还没有验证报告</h3><p>完成一次 Spark 或 Mirror 后，报告会自动保存到这里，并支持导出为 Markdown 文档。</p><div style="display:flex;gap:8px;justify-content:center;margin-top:16px"><button class="button button-purple button-sm" data-go="spark">运行 Spark</button><button class="button button-green button-sm" data-go="mirror">运行 Mirror</button></div></div></article>`}`;
}

function bindPageEvents() {
  document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => {
    if (["spark","mirror"].includes(el.dataset.go)) state.activeDraftTaskId = "";
    navigate(el.dataset.go);
  }));
  document.querySelectorAll("[data-open-modal]").forEach(el => el.addEventListener("click", () => openModal(el.dataset.openModal)));
  document.querySelectorAll("[data-open-project]").forEach(el=>el.addEventListener("click",()=>{
    const project = state.projects.find(item=>item.id === el.dataset.openProject);
    if (!project) return;
    state.activeProjectId = project.id;
    state.project = project;
    state.workspaceView = "board";
    state.boardTab = "tasks";
    saveState();
    renderPage();
    window.scrollTo({ top:0, behavior:"smooth" });
  }));
  document.querySelectorAll("[data-project-filter]").forEach(el=>el.addEventListener("click",()=>{
    state.projectFilter = el.dataset.projectFilter;
    saveState();
    renderPage();
  }));
  document.querySelector("[data-back-projects]")?.addEventListener("click",()=>{ state.workspaceView="projects"; saveState(); renderPage(); });
  document.querySelectorAll("[data-board-tab]").forEach(el=>el.addEventListener("click",()=>{
    state.boardTab = el.dataset.boardTab;
    saveState();
    renderPage();
    const quickFilter = el.dataset.taskFilter;
    const statusFilter = document.querySelector("#task-status-filter");
    const kindFilter = document.querySelector("#task-kind-filter");
    if (quickFilter === "running" && statusFilter) statusFilter.value = "运行中";
    if ((quickFilter === "spark" || quickFilter === "mirror") && kindFilter) kindFilter.value = quickFilter === "spark" ? "Spark" : "Mirror";
    applyTaskFilters();
  }));
  document.querySelector("#project-stage")?.addEventListener("change",e=>{ state.project.stage=e.target.value; state.project.guidanceDismissedKey=""; state.project.updatedAt=Date.now(); saveState(); renderPage(); showToast("项目阶段已更新，下一步建议已同步"); });
  document.querySelectorAll("[data-project-action]").forEach(el=>el.addEventListener("click",()=>handleProjectAction(el.dataset.projectAction)));
  document.querySelector("[data-dismiss-guidance]")?.addEventListener("click",el=>{ state.project.guidanceDismissedKey=el.currentTarget.dataset.dismissGuidance; saveState(); renderPage(); });
  document.querySelectorAll("[data-task-go]").forEach(el=>el.addEventListener("click",()=>{ if (el.dataset.taskGo) navigate(el.dataset.taskGo); }));
  document.querySelectorAll("[data-edit-task]").forEach(el=>el.addEventListener("click",()=>openTaskDraft(el.dataset.editTask)));
  document.querySelector("[data-clear-draft]")?.addEventListener("click",()=>{ state.activeDraftTaskId=""; saveState(); renderPage(); showToast("已退出草稿，切换为新任务"); });
  document.querySelectorAll("[data-task-action]").forEach(el=>el.addEventListener("click",()=>handleTaskAction(el.dataset.taskAction,el.dataset.taskId)));
  document.querySelectorAll("[data-material-view]").forEach(el=>el.addEventListener("click",()=>{ state.materialView=el.dataset.materialView; saveState(); renderPage(); }));
  document.querySelectorAll("[data-delete-material]").forEach(el=>el.addEventListener("click",()=>deleteMaterial(el.dataset.deleteMaterial)));
  document.querySelector("#spark-form")?.addEventListener("submit", e => { e.preventDefault(); runSpark(e.currentTarget); });
  document.querySelector("#mirror-form")?.addEventListener("submit", e => { e.preventDefault(); runMirror(e.currentTarget); });
  document.querySelector("#mirror-file")?.addEventListener("change", e => { const file=e.target.files[0]; document.querySelector("#upload-label").textContent=file?`已选择：${file.name}`:"也可以上传本地文件"; });
  document.querySelectorAll("[data-download-report]").forEach(el => el.addEventListener("click", () => downloadReport(el.dataset.downloadReport)));
  document.querySelectorAll("[data-view-report]").forEach(el => el.addEventListener("click", () => viewReport(el.dataset.viewReport)));
  document.querySelectorAll("[data-preview-report]").forEach(el=>el.addEventListener("click",event=>{ event.stopPropagation(); if (el.dataset.previewReport) openReportDrawer(el.dataset.previewReport); }));
  document.querySelectorAll("[data-compare-report]").forEach(el=>el.addEventListener("click",event=>{ event.stopPropagation(); openReportComparison(el.dataset.compareReport); }));
  ["#task-search","#task-kind-filter","#task-status-filter","#task-sort"].forEach(selector=>document.querySelector(selector)?.addEventListener(selector === "#task-search" ? "input" : "change",applyTaskFilters));
  ["#material-search","#material-type-filter"].forEach(selector=>document.querySelector(selector)?.addEventListener(selector === "#material-search" ? "input" : "change",applyMaterialFilters));
  ["#report-search","#report-kind-filter","#report-time-filter"].forEach(selector=>document.querySelector(selector)?.addEventListener(selector === "#report-search" ? "input" : "change",applyReportFilters));
  bindResultTabs();
}

function openTaskDraft(id) {
  const task = state.tasks.find(item=>item.id === id);
  if (!task) return;
  state.activeDraftTaskId = task.id;
  saveState();
  navigate(task.kind.toLowerCase());
  showToast(`已恢复“${task.name}”`);
}

function applyTaskFilters() {
  const search = (document.querySelector("#task-search")?.value || "").trim().toLowerCase();
  const kind = document.querySelector("#task-kind-filter")?.value || "";
  const status = document.querySelector("#task-status-filter")?.value || "";
  document.querySelectorAll(".task-card").forEach(card=>{
    const visible = (!search || card.dataset.taskName.includes(search)) && (!kind || card.dataset.taskKind === kind) && (!status || card.dataset.taskStatus === status);
    card.hidden = !visible;
  });
}

function applyMaterialFilters() {
  const search = (document.querySelector("#material-search")?.value || "").trim().toLowerCase();
  const type = document.querySelector("#material-type-filter")?.value || "";
  document.querySelectorAll(".board-material-card").forEach(card=>{
    card.hidden = !((!search || card.dataset.materialSearch.includes(search)) && (!type || card.dataset.materialType === type));
  });
}

function applyReportFilters() {
  const search = (document.querySelector("#report-search")?.value || "").trim().toLowerCase();
  const kind = document.querySelector("#report-kind-filter")?.value || "";
  const days = Number(document.querySelector("#report-time-filter")?.value || 0);
  const cutoff = days ? Date.now() - days * 86400000 : 0;
  document.querySelectorAll(".board-report-card").forEach(card=>{
    const recent = !cutoff || Number(card.dataset.reportTime) >= cutoff;
    card.hidden = !((!search || card.dataset.reportSearch.includes(search)) && (!kind || card.dataset.reportKind === kind) && recent);
  });
}

function deleteMaterial(id) {
  const material = state.materials.find(item=>item.id === id);
  if (!material || !confirm(`确定删除资料“${material.title}”吗？相关历史报告不会被删除。`)) return;
  state.materials = state.materials.filter(item=>item.id !== id);
  saveState();
  renderPage();
  showToast("资料已删除");
}

function handleProjectAction(action) {
  if (action === "restore") {
    state.project.status = "进行中";
    state.project.guidanceDismissedKey = "";
    state.project.updatedAt = Date.now();
    state.projectFilter = "active";
    saveState(); renderPage(); showToast("项目已恢复，可以继续验证");
  }
  if (action === "archive") {
    state.project.status = "已归档";
    state.project.updatedAt = Date.now();
    state.workspaceView = "projects";
    state.projectFilter = "active";
    saveState(); renderPage(); showToast("项目已归档，可在“已归档”中恢复");
  }
  if (action === "delete" && confirm(`确定删除“${state.project.name}”吗？该项目内的任务、素材和报告也会被清除。`)) {
    const id = state.activeProjectId;
    state.projects = state.projects.filter(project=>project.id !== id);
    state.tasks = state.tasks.filter(task=>task.projectId !== id);
    state.materials = state.materials.filter(item=>item.projectId !== id);
    state.reports = state.reports.filter(item=>item.projectId !== id);
    if (!state.projects.length) {
      const replacement = initialState();
      state.projects = replacement.projects;
    }
    state.project = state.projects[0];
    state.activeProjectId = state.project.id;
    state.workspaceView = "projects";
    saveState(); renderPage(); showToast("项目已从当前浏览器删除");
  }
}

function handleTaskAction(action,id) {
  const task = state.tasks.find(item=>item.id === id);
  if (!task) return;
  if (action === "stop") {
    task.status = "已终止"; task.updatedAt = Date.now(); saveState(); renderPage(); showToast("任务已终止");
  }
  if (action === "delete" && confirm(`确定删除任务“${task.name}”吗？项目素材不会受影响。`)) {
    state.tasks = state.tasks.filter(item=>item.id !== id); saveState(); renderPage(); showToast("任务已删除");
  }
}

function openReportDrawer(id) {
  const report = state.reports.find(item=>item.id === id);
  if (!report) { showToast("这条示例任务还没有可预览的报告"); return; }
  const partner = comparisonPartner(report);
  const root = document.querySelector("#modal-root");
  const details = report.kind === "Spark"
    ? (report.data.insights || []).slice(0,3).map(item=>`<article><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.detail)}</p></article>`).join("")
    : (report.data.issues || []).slice(0,3).map(item=>`<article><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.detail)}</p></article>`).join("");
  const iterationFocus = report.kind === "Spark"
    ? "把已确认的需求转成一条最小产品路径，并使用 Mirror 检查理解、效率、反馈与风险。"
    : `优先修改“${escapeHTML(report.data.issues?.[0]?.title || "最高优先级体验问题")}”，然后用相同任务和 Persona 再验证一次。`;
  root.innerHTML = `<div class="drawer-backdrop" data-close-modal><aside class="report-drawer" role="dialog" aria-modal="true" aria-label="报告预览"><header><div><span class="report-kind ${report.kind.toLowerCase()}">${report.kind}</span><span class="report-round">第 ${reportRound(report)} 轮</span><h2>${escapeHTML(report.title)}</h2></div><button data-close-modal aria-label="关闭报告">×</button></header><div class="drawer-body"><section class="drawer-summary"><span>本轮摘要</span><p>${escapeHTML(report.desc)}</p></section><h3>关键发现</h3><div class="drawer-findings">${details || "<p>暂无更多摘要。</p>"}</div><section class="iteration-plan"><span>建议的下一轮</span><strong>${report.kind === "Spark" ? "从需求进入方案验证" : "修复问题后进行复测"}</strong><p>${iterationFocus}</p></section></div><footer><button class="button button-secondary" data-close-modal>关闭</button>${partner ? `<button class="button button-secondary" data-compare-report="${report.id}">轮次对比</button>` : ""}<button class="button button-secondary" data-create-iteration="${report.id}">创建下一轮草稿</button><button class="button button-primary" data-view-report="${report.id}">进入原始结果</button></footer></aside></div>`;
  root.querySelector(".report-drawer").addEventListener("click",event=>event.stopPropagation());
  root.querySelectorAll("[data-close-modal]").forEach(el=>el.addEventListener("click",()=>root.innerHTML=""));
  root.querySelector("[data-view-report]").addEventListener("click",()=>{ root.innerHTML=""; viewReport(report.id); });
  root.querySelector("[data-create-iteration]").addEventListener("click",()=>createIterationFromReport(report.id));
  root.querySelector("[data-compare-report]")?.addEventListener("click",()=>openReportComparison(report.id));
}

function openReportComparison(id) {
  const selected = state.reports.find(report=>report.id === id);
  const partner = comparisonPartner(selected);
  if (!selected || !partner) { showToast("完成关联的下一轮验证后才能进行对比"); return; }
  const previous = selected.previousReportId ? partner : selected;
  const current = selected.previousReportId ? selected : partner;
  const root = document.querySelector("#modal-root");
  let body = "";
  if (previous.kind === "Mirror" && current.kind === "Mirror") {
    const previousScores = new Map((previous.data.scores || []).map(score=>[score.name,score]));
    const rows = (current.data.scores || []).map(score=>{
      const before = previousScores.get(score.name);
      const comparable = before?.score !== null && before?.score !== undefined && score.score !== null && score.score !== undefined;
      const delta = comparable ? score.score - before.score : null;
      const bothUnscored = (before?.score === null || before?.score === undefined) && score.score === null;
      const changeLabel = delta === null ? (bothUnscored ? "—" : "证据变化") : delta > 0 ? `+${delta}` : String(delta);
      return `<div class="comparison-row"><strong>${escapeHTML(score.name)}</strong><span>${before?.score === null || before?.score === undefined ? "暂不评分" : `${before.score}/${before.max}`}</span><i>→</i><span>${score.score === null ? "暂不评分" : `${score.score}/${score.max}`}</span><em class="${delta > 0 ? "up" : delta < 0 ? "down" : "same"}">${changeLabel}</em></div>`;
    }).join("");
    const resolved = current.data.resolvedIssues || [];
    body = `<section class="comparison-metrics"><article><small>评分覆盖</small><strong>${previous.data.scoredCount || 0}/8 → ${current.data.scoredCount || 0}/8</strong></article><article><small>已评分合计</small><strong>${previous.data.rawTotal ?? "—"}/${previous.data.scoredMax ?? "—"} → ${current.data.rawTotal ?? "—"}/${current.data.scoredMax ?? "—"}</strong></article><article><small>剩余问题</small><strong>${previous.data.issues?.length || 0} → ${current.data.issues?.length || 0}</strong></article></section><h3>八维变化</h3><div class="comparison-table"><div class="comparison-head"><span>维度</span><span>上一轮</span><i></i><span>本轮</span><em>变化</em></div>${rows}</div><section class="resolved-panel"><span>本轮已改善</span>${resolved.length ? resolved.map(item=>`<p>✓ ${escapeHTML(item)}</p>`).join("") : "<p>暂未记录明确改善项，建议继续核对修改证据。</p>"}</section>`;
  } else if (previous.kind === "Spark" && current.kind === "Spark") {
    const beforeInsights = previous.data.insights || [];
    const currentInsights = current.data.insights || [];
    const newInsights = currentInsights.filter(item=>!beforeInsights.some(before=>before.title === item.title));
    body = `<section class="comparison-metrics"><article><small>来源记录</small><strong>${previous.data.evidence?.length || 0} → ${current.data.evidence?.length || 0}</strong></article><article><small>需求洞察</small><strong>${beforeInsights.length} → ${currentInsights.length}</strong></article><article><small>新增洞察</small><strong>${newInsights.length}</strong></article></section><h3>洞察变化</h3><div class="comparison-insights">${currentInsights.map(item=>`<article><span>${newInsights.includes(item) ? "新增" : "保留"}</span><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.detail)}</p></article>`).join("")}</div>`;
  } else {
    body = `<section class="phase-progress"><article><span>第 ${reportRound(previous)} 轮 · ${previous.kind}</span><strong>发现与定义问题</strong><p>形成 ${previous.data.insights?.length || 0} 条需求洞察，保留 ${previous.data.evidence?.length || 0} 条来源记录。</p></article><i>→</i><article><span>第 ${reportRound(current)} 轮 · ${current.kind}</span><strong>进入方案与体验验证</strong><p>检查 ${current.data.scoredCount || 0}/8 个评分维度，识别 ${current.data.issues?.length || 0} 个待改进问题。</p></article></section><div class="callout callout-info"><strong>阶段推进：</strong>两轮任务类型不同，因此不直接比较分数；这里展示从需求探索到产品体验评估的证据链。</div>`;
  }
  root.innerHTML = `<div class="modal-backdrop comparison-backdrop" data-close-modal><section class="comparison-modal" role="dialog" aria-modal="true" aria-label="多轮报告对比"><header><div><p class="eyebrow">ITERATION COMPARISON</p><h2>第 ${reportRound(previous)} 轮与第 ${reportRound(current)} 轮对比</h2><span>${escapeHTML(state.project.name)}</span></div><button data-close-modal aria-label="关闭对比">×</button></header><div class="comparison-body">${body}</div><footer><button class="button button-secondary" data-close-modal>关闭</button><button class="button button-primary" data-create-iteration="${current.id}">继续下一轮</button></footer></section></div>`;
  root.querySelector(".comparison-modal").addEventListener("click",event=>event.stopPropagation());
  root.querySelectorAll("[data-close-modal]").forEach(el=>el.addEventListener("click",()=>root.innerHTML=""));
  root.querySelector("[data-create-iteration]").addEventListener("click",()=>createIterationFromReport(current.id));
}

function createIterationFromReport(id) {
  const report = state.reports.find(item=>item.id === id);
  if (!report) return;
  const nextKind = report.kind === "Spark" ? "Mirror" : report.kind;
  const existingDraft = state.tasks.find(task=>task.sourceReportId === report.id && task.status === "草稿");
  if (existingDraft) {
    state.activeDraftTaskId = existingDraft.id;
    saveState();
    document.querySelector("#modal-root").innerHTML = "";
    navigate(existingDraft.kind.toLowerCase());
    showToast("已恢复现有的下一轮草稿");
    return;
  }
  const personaNames = (report.data.personas || []).map(persona=>typeof persona === "string" ? persona : persona.name).filter(Boolean);
  const iterationFocus = report.kind === "Spark"
    ? `验证“${report.data.insights?.[0]?.title || "最高优先级需求"}”对应的最小产品路径`
    : `优先修复“${report.data.issues?.[0]?.title || "高优先级问题"}”并使用相同任务复测`;
  const formSeed = report.kind === "Spark"
    ? {
        title:report.data.title,
        materialType:"仅有文字流程说明",
        material:`基于上一轮 Spark 洞察构建最小方案：${report.data.insights?.slice(0,2).map(item=>item.title).join("；") || "围绕核心需求完成关键路径"}。`,
        task:`完成与“${report.data.insights?.[0]?.title || "核心需求"}”相关的关键任务`
      }
    : {
        title:report.data.title,
        materialType:report.data.materialType,
        material:report.data.material,
        task:report.data.task
      };
  const task = {
    id:`task-iteration-${Date.now()}`,
    projectId:state.activeProjectId,
    name:`${state.project.name} · 下一轮${nextKind === "Spark" ? "需求探索" : "体验复测"}`,
    kind:nextKind,
    status:"草稿",
    personas:personaNames,
    note:iterationFocus,
    iterationFocus,
    formSeed,
    sourceReportId:report.id,
    createdAt:Date.now(),
    updatedAt:Date.now()
  };
  state.tasks.unshift(task);
  state.project.updatedAt = task.updatedAt;
  state.project.guidanceDismissedKey = "";
  state.activeDraftTaskId = task.id;
  saveState();
  document.querySelector("#modal-root").innerHTML = "";
  navigate(nextKind.toLowerCase());
  showToast(`已创建并打开 ${nextKind} 下一轮草稿`);
}

function bindResultTabs() {
  document.querySelectorAll("[data-spark-tab]").forEach(el => el.addEventListener("click", () => {
    document.querySelectorAll("[data-spark-tab]").forEach(x=>x.classList.remove("active")); el.classList.add("active");
    document.querySelector("#spark-result-body").innerHTML = sparkTabHTML(currentSparkResult, el.dataset.sparkTab);
  }));
  document.querySelectorAll("[data-mirror-tab]").forEach(el => el.addEventListener("click", () => {
    document.querySelectorAll("[data-mirror-tab]").forEach(x=>x.classList.remove("active")); el.classList.add("active");
    document.querySelector("#mirror-result-body").innerHTML = mirrorTabHTML(currentMirrorResult, el.dataset.mirrorTab);
  }));
}

function downloadTextFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportWorkspaceData() {
  const payload = {
    format: "personalab-local-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state
  };
  const date = new Date().toISOString().slice(0,10);
  downloadTextFile(JSON.stringify(payload, null, 2), `PersonaLab-本地备份-${date}.json`, "application/json;charset=utf-8");
  showToast("本地数据已导出");
}

function openDataTools() {
  const root = document.querySelector("#modal-root");
  root.innerHTML = `<div class="modal-backdrop" data-close-modal><section class="modal data-tools-modal" role="dialog" aria-modal="true" aria-label="数据管理与备份"><div class="modal-head"><div><span class="modal-kicker">LOCAL DATA</span><h2>管理与备份数据</h2></div><button class="modal-close" data-close-modal aria-label="关闭">×</button></div><div class="modal-body"><div class="local-data-summary"><article><strong>${state.projects.length}</strong><span>项目</span></article><article><strong>${state.materials.length}</strong><span>资料</span></article><article><strong>${state.personas.length}</strong><span>Persona</span></article><article><strong>${state.reports.length}</strong><span>报告</span></article></div><div class="callout callout-info"><strong>数据保存在当前浏览器。</strong>不会自动上传到服务器；清理浏览器数据或更换设备前，请先导出备份。</div><div class="data-tool-list"><article><div><strong>导出完整备份</strong><p>保存项目、资料、Persona、任务和报告，可在另一台设备导入。</p></div><button class="button button-primary" data-export-workspace>导出 JSON</button></article><article><div><strong>导入已有备份</strong><p>导入会替换当前浏览器中的 PersonaLab 数据。</p></div><label class="button button-secondary" for="workspace-import">选择备份文件</label><input id="workspace-import" type="file" accept="application/json,.json" hidden></article></div><div class="data-danger-zone"><div><strong>清空当前数据</strong><p>恢复为空白工作区。该操作不会影响你已经导出的备份。</p></div><button class="button button-danger" data-clear-workspace>清空数据</button></div></div><div class="modal-footer"><button class="button button-secondary" data-close-modal>完成</button></div></section></div>`;
  root.querySelector(".modal").addEventListener("click",event=>event.stopPropagation());
  root.querySelectorAll("[data-close-modal]").forEach(el=>el.addEventListener("click",()=>root.innerHTML=""));
  root.querySelector("[data-export-workspace]").addEventListener("click",exportWorkspaceData);
  root.querySelector("#workspace-import").addEventListener("change",event=>importWorkspaceData(event.target.files?.[0]));
  root.querySelector("[data-clear-workspace]").addEventListener("click",()=>{
    if (!confirm("确定清空当前浏览器中的全部 PersonaLab 数据吗？建议先导出备份。")) return;
    state = initialState();
    currentSparkResult = null;
    currentMirrorResult = null;
    saveState();
    root.innerHTML = "";
    enterDemo("resume");
    showToast("已恢复为空白工作区");
  });
}

function importWorkspaceData(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast("备份文件不能超过 5MB"); return; }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const imported = payload?.format === "personalab-local-backup" ? payload.data : payload;
      if (!imported || !Array.isArray(imported.projects) || !Array.isArray(imported.personas) || !Array.isArray(imported.materials) || !Array.isArray(imported.reports)) throw new Error("invalid");
      if (!confirm("导入将替换当前浏览器中的 PersonaLab 数据，是否继续？")) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      state = loadState();
      currentSparkResult = state.sparkRuns[0] || null;
      currentMirrorResult = state.mirrorRuns[0] || null;
      saveState();
      document.querySelector("#modal-root").innerHTML = "";
      enterDemo("resume");
      showToast("备份已导入");
    } catch {
      showToast("无法识别这个备份文件");
    }
  };
  reader.readAsText(file, "utf-8");
}

function openHelp() {
  const root = document.querySelector("#modal-root");
  root.innerHTML = `<div class="modal-backdrop" data-close-modal><section class="modal help-modal" role="dialog" aria-modal="true" aria-label="使用说明"><div class="modal-head"><div><span class="modal-kicker">QUICK START</span><h2>从哪里开始？</h2></div><button class="modal-close" data-close-modal aria-label="关闭">×</button></div><div class="modal-body"><div class="help-steps"><article><span>1</span><div><strong>建立项目</strong><p>写下产品名称、阶段和希望验证的问题。</p></div></article><article><span>2</span><div><strong>补充资料与 Persona</strong><p>保存已有的用户资料，并选择本轮需要的用户视角。</p></div></article><article><span>3</span><div><strong>选择 Spark 或 Mirror</strong><p>探索需求时使用 Spark；评估原型或完整产品时使用 Mirror。</p></div></article><article><span>4</span><div><strong>保存报告并继续下一轮</strong><p>比较不同轮次，记录修改方向，并定期导出本地备份。</p></div></article></div><div class="callout callout-warning"><strong>当前能力边界：</strong>本地版的分析结果用于流程体验和研究准备，不代表真实 AI、联网检索或真实用户结论。</div></div><div class="modal-footer"><button class="button button-primary" data-close-modal>知道了</button></div></section></div>`;
  root.querySelector(".modal").addEventListener("click",event=>event.stopPropagation());
  root.querySelectorAll("[data-close-modal]").forEach(el=>el.addEventListener("click",()=>root.innerHTML=""));
}

function openModal(type) {
  const root = document.querySelector("#modal-root");
  const configs = {
    project: { title:"编辑项目信息", body:`<div class="form-group"><label class="form-label" for="modal-name">项目名称</label><input id="modal-name" class="input" value="${state.project.name === "未命名项目" ? "" : escapeHTML(state.project.name)}" placeholder="例如：校园 AI 学习助手"></div><div class="form-group"><label class="form-label" for="modal-desc">项目简介</label><textarea id="modal-desc" class="textarea" placeholder="目标用户、场景和希望解决的问题">${state.project.name === "未命名项目" ? "" : escapeHTML(state.project.description)}</textarea></div>`, save:"保存修改" },
    "new-project": { title:"新建验证项目", body:`<div class="callout callout-info" style="margin-bottom:16px"><strong>先建立最小项目：</strong>名称和目标足够开始，任务、素材和 Persona 可以稍后补充。</div><div class="form-group"><label class="form-label" for="modal-name">项目名称</label><input id="modal-name" class="input" placeholder="例如：校园 AI 学习助手"></div><div class="form-group"><label class="form-label" for="modal-desc">项目简介</label><textarea id="modal-desc" class="textarea" placeholder="说明目标用户、使用场景和希望验证的问题"></textarea></div><div class="form-group"><label class="form-label" for="modal-stage">当前阶段</label><select id="modal-stage" class="select">${projectStageOptions("想法阶段")}</select></div>`, save:"创建并进入" },
    tag: { title:"添加项目标签", body:`<div class="form-group"><label class="form-label" for="modal-name">标签名称</label><input id="modal-name" class="input" placeholder="例如：教育、无障碍、AI 助手"></div>`, save:"添加标签" },
    persona: { title:"创建自定义 Persona", body:`<div class="form-group"><label class="form-label" for="modal-name">Persona 名称</label><input id="modal-name" class="input" placeholder="例如：通勤场景下的研究生"></div><div class="form-group"><label class="form-label" for="modal-desc">行为与需求说明</label><textarea id="modal-desc" class="textarea" placeholder="描述目标、情境、行为特点和主要顾虑"></textarea></div><div class="form-group"><label class="form-label" for="modal-traits">特征标签</label><input id="modal-traits" class="input" placeholder="用逗号分隔，如：时间紧张, 移动端, 重视效率"></div>`, save:"创建 Persona" },
    material: { title:"添加一份需求资料", body:`<div class="form-group"><label class="form-label" for="modal-name">资料标题</label><input id="modal-name" class="input" placeholder="例如：第 3 位用户访谈摘录"></div><div class="grid grid-2"><div class="form-group"><label class="form-label" for="modal-type">资料类型</label><select id="modal-type" class="select"><option>用户访谈</option><option>问卷</option><option>用户评价</option><option>客服记录</option><option>行业资料</option><option>竞品资料</option></select></div><div class="form-group"><label class="form-label" for="modal-source">来源</label><input id="modal-source" class="input" placeholder="用户上传 / 公开网页"></div></div><div class="form-group"><label class="form-label" for="modal-desc">原始内容或摘要</label><textarea id="modal-desc" class="textarea" placeholder="尽量保留原始表达，便于后续追溯"></textarea></div>`, save:"保存资料" }
  };
  const c = configs[type];
  root.innerHTML = `<div class="modal-backdrop" data-close-modal><div class="modal" role="dialog" aria-modal="true" aria-label="${c.title}"><div class="modal-head"><h2>${c.title}</h2><button class="modal-close" data-close-modal>×</button></div><div class="modal-body">${c.body}</div><div class="modal-footer"><button class="button button-secondary" data-close-modal>取消</button><button class="button button-primary" data-save-modal="${type}">${c.save}</button></div></div></div>`;
  root.querySelector(".modal").addEventListener("click", e=>e.stopPropagation());
  root.querySelectorAll("[data-close-modal]").forEach(el=>el.addEventListener("click",()=>root.innerHTML=""));
  root.querySelector("[data-save-modal]").addEventListener("click",()=>saveModal(type));
  root.querySelector("#modal-name")?.focus();
}

function saveModal(type) {
  const root = document.querySelector("#modal-root");
  const name = root.querySelector("#modal-name")?.value.trim();
  const desc = root.querySelector("#modal-desc")?.value.trim();
  if (!name) { showToast("请先填写名称"); return; }
  if (type === "project") {
    state.project.name = name; state.project.description = desc || "尚未填写项目说明"; state.project.progress = Math.max(state.project.progress,20); state.project.updatedAt=Date.now();
  } else if (type === "new-project") {
    const project = { id:`p${Date.now()}`, name, description:desc || "尚未填写项目说明", stage:root.querySelector("#modal-stage").value, status:"进行中", tags:[], cover:["warm","mint","violet"][state.projects.length%3], progress:20, updatedAt:Date.now() };
    state.projects.push(project); state.project=project; state.activeProjectId=project.id; state.workspaceView="board"; state.boardTab="tasks";
  } else if (type === "tag") {
    state.project.tags = [...new Set([...(state.project.tags || []), name])].slice(0,6); state.project.updatedAt=Date.now();
  } else if (type === "persona") {
    const traits = root.querySelector("#modal-traits").value.split(/[,，]/).map(x=>x.trim()).filter(Boolean).slice(0,4);
    state.personas.push({ id:`p${Date.now()}`,name,short:name[0],color:"#5d7cbf",type:"自定义",desc:desc||"用户创建的自定义 Persona",traits:traits.length?traits:["自定义"] });
  } else {
    const materialType = root.querySelector("#modal-type").value;
    state.materials.unshift({ id:`m${Date.now()}`,projectId:state.activeProjectId,title:name,type:materialType,source:root.querySelector("#modal-source").value.trim()||"用户上传",content:desc||"未填写内容摘要",date:"刚刚",icon:materialType[0] });
    state.project.progress = Math.max(state.project.progress,35);
    state.project.updatedAt = Date.now();
  }
  saveState(); root.innerHTML=""; renderPage(); showToast("已保存到当前项目");
}

function viewReport(id) {
  const report = state.reports.find(item=>item.id === id);
  if (!report) return;
  if (report.kind === "Spark") {
    currentSparkResult = normalizeSparkRun(report.data);
    navigate("spark");
  } else {
    currentMirrorResult = normalizeMirrorRun(report.data);
    navigate("mirror");
  }
  showToast("已恢复这次验证结果");
}

function downloadReport(id) {
  const report = state.reports.find(r=>r.id===id);
  if (!report) return;
  let body = `# ${report.title}\n\n> PersonaLab 本地工作报告。自动生成内容用于研究准备，不代表真实用户研究结论。\n\n${report.desc}\n\n`;
  if (report.kind === "Spark") {
    body += `## 需求与机会\n\n${report.data.insights.map(i=>`- **${i.title}**（${i.level}优先级，来源类型：${i.source}）\n  ${i.detail}${i.evidenceIds?.length ? `\n  依据：${i.evidenceIds.join("、")}` : ""}`).join("\n")}\n\n## 来源记录\n\n${(report.data.evidence || []).map(item=>`- **${item.id} ${item.title}**（${item.status}）\n  ${item.quote}\n  来源：${item.source}`).join("\n") || "本轮没有可追溯资料。"}\n`;
  } else {
    const totalLine = report.data.total === null ? `部分评分：${report.data.rawTotal}/${report.data.scoredMax}，${report.data.unscoredCount} 项暂不评分` : `总分：${report.data.total}/100`;
    body += `## 八维评分\n\n${totalLine}\n\n${report.data.scores.map(s=>`- ${s.name}：${s.score === null ? `暂不评分（${s.reason}）` : `${s.score}/${s.max}`}`).join("\n")}\n\n## 主要问题\n\n${report.data.issues.map(i=>`- **${i.title}**（${i.level}优先级）\n  ${i.detail}`).join("\n")}\n`;
  }
  downloadTextFile(body, `${report.title.replace(/[\\/:*?"<>|]/g,"-")}.md`, "text/markdown;charset=utf-8");
  showToast("报告已导出");
}

document.addEventListener("click", e => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "enter-sample") enterDemo("sample");
  if (action === "enter-empty") enterDemo("blank");
  if (action === "resume-demo") enterDemo("resume");
  if (action === "toggle-menu") {
    const sidebar = document.querySelector(".sidebar");
    const opening = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", opening);
    document.querySelector("#app").classList.toggle("menu-open", opening);
  }
  if (action === "close-menu") {
    document.querySelector(".sidebar").classList.remove("open");
    document.querySelector("#app").classList.remove("menu-open");
  }
  if (action === "toggle-theme") {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    applyTheme();
    showToast(state.theme === "dark" ? "已切换为深色模式" : "已切换为浅色模式");
  }
  if (action === "data-tools") openDataTools();
  if (action === "show-help") openHelp();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") document.querySelector("#modal-root").innerHTML = "";
});

document.querySelectorAll("[data-nav]").forEach(el => el.addEventListener("click", e => {
  e.preventDefault();
  if (el.dataset.nav === "workspace") state.workspaceView = "projects";
  if (["spark","mirror"].includes(el.dataset.nav)) state.activeDraftTaskId = "";
  navigate(el.dataset.nav);
}));
applyTheme();
syncResumeButton();

