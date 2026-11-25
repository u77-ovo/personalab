const STORAGE_KEY = "personalab.student.v2";
const PROJECTS_KEY = `${STORAGE_KEY}.projects`;

const projectStages = ["只有初步想法", "已确定项目方向", "已有产品原型", "正在进行用户验证", "正在准备比赛材料"];
const projectTasks = ["寻找真实场景和痛点", "明确目标用户", "梳理产品需求", "完善产品原型", "开展用户验证", "整理比赛材料"];

function createProjectId() {
  return globalThis.crypto?.randomUUID?.() || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createProjectMeta(overrides = {}) {
  const now = Date.now();
  return {
    id: createProjectId(),
    name: "未命名项目",
    description: "从真实场景、目标人群与可验证问题开始",
    stage: "探索期",
    phase: projectStages[0],
    progress: 0,
    tasks: [],
    priorityTask: "",
    competition: { name: "", direction: "", deadline: "" },
    archived: false,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

const builtInPersonas = [
  { id: "p1", name: "目标明确的新用户", short: "新", color: "#7666e6", type: "平台预设", desc: "第一次接触产品，需要快速理解价值、入口和下一步动作。", traits: ["低熟悉度", "需要引导", "易流失"] },
  { id: "p2", name: "效率导向的重度用户", short: "效", color: "#eb8753", type: "平台预设", desc: "熟悉同类工具，希望用最少步骤完成高频任务。", traits: ["高频使用", "讨厌冗余", "关注效率"] },
  { id: "p3", name: "隐私敏感型用户", short: "隐", color: "#37a083", type: "平台预设", desc: "会主动确认数据用途、授权范围以及删除与退出方式。", traits: ["谨慎授权", "重视透明", "信任门槛高"] },
  { id: "p4", name: "低数字熟练度用户", short: "低", color: "#4c76d8", type: "平台预设", desc: "不熟悉复杂界面和专业词汇，需要清楚反馈与可恢复操作。", traits: ["慢速探索", "怕误操作", "需要反馈"] },
  { id: "p5", name: "无障碍需求用户", short: "障", color: "#a467b0", type: "平台预设", desc: "依赖清楚层级、键盘操作、文本替代与足够的视觉对比。", traits: ["键盘操作", "信息可达", "清晰结构"] },
  { id: "p6", name: "推广与落地决策者", short: "落", color: "#bf755b", type: "平台预设", desc: "关注部署成本、责任边界、维护方式与能否在真实组织中持续使用。", traits: ["关注成本", "重视责任", "要求可落地"] }
];

const personaFields = [
  { key: "age", label: "年龄或年龄段", hint: "如：21 岁、18–24 岁", max: 40 },
  { key: "role", label: "身份或角色", hint: "如：本科生、社团活动负责人", max: 80 },
  { key: "goal", label: "想完成什么", hint: "如：先记下临时作业，下课后再安排", max: 180 },
  { key: "context", label: "什么时候、在哪里用", hint: "如：上课前，用手机单手操作，只有两分钟", max: 240, multiline: true },
  { key: "behavior", label: "使用习惯或操作限制", hint: "如：熟悉日历，喜欢快速录入，遇到冲突想稍后确认", max: 300, multiline: true },
  { key: "basis", label: "画像依据", hint: "如：访谈 P03 第 2 段，或团队暂定假设", max: 200 },
];

const sampleMaterials = [
  { id: "m1", title: "校园任务冲突访谈片段", type: "用户访谈", source: "内置示例", content: "如果临时新增作业，我希望能直接看到它和已有任务在哪些时段冲突。", date: "示例", icon: "访", isSample: true },
  { id: "m2", title: "学习计划工具对比记录", type: "竞品资料", source: "内置示例", content: "可比较的维度包括任务导入、提醒、冲突提示和推荐理由。实际产品能力待逐项核对。", date: "示例", icon: "竞", isSample: true }
];

const sampleSparkQuestion = "学生遇到临时任务时需要重排计划。想验证先解释冲突、再给出调整建议能否缩短重排时间。";

const initialState = (projectOverrides = {}) => ({
  schemaVersion: 5,
  project: createProjectMeta(projectOverrides),
  personas: [...builtInPersonas],
  materials: [],
  sparkRuns: [],
  mirrorRuns: [],
  reports: [],
  activePage: "workspace",
  updatedAt: Date.now()
});

const sampleState = () => ({
  schemaVersion: 5,
  isSample: true,
  project: createProjectMeta({
    name: "校园 AI 学习助手",
    description: "内置案例：围绕临时任务冲突进行需求探索、原型预演与真人验证",
    stage: "示例项目",
    phase: "正在进行用户验证",
    progress: 45,
    tasks: ["梳理产品需求", "完善产品原型", "开展用户验证"],
    priorityTask: "开展用户验证"
  }),
  personas: [...builtInPersonas],
  materials: [...sampleMaterials],
  sparkRuns: [],
  mirrorRuns: [],
  reports: [],
  activePage: "workspace",
  updatedAt: Date.now()
});

const pageTitles = {
  workspace: "项目总览",
  student: "科创工作台",
  spark: "Spark 播种",
  mirror: "Mirror 预演",
  personas: "Persona 用户库",
  materials: "需求资料库",
  reports: "验证报告"
};

let state = loadState();
let projectLibrary = loadProjectLibrary(state);
const savedActiveProject = projectLibrary.find(item => item.project.id === state.project.id);
const latestActiveProject = projectLibrary.find(item => !item.project?.archived);
if (savedActiveProject) state = normalizeStoredState(savedActiveProject);
else if (!hasSavedProject(state) && latestActiveProject) state = normalizeStoredState(latestActiveProject);
let currentSparkResult = state.sparkRuns[0] || null;
let currentMirrorResult = state.mirrorRuns[0] || null;

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState();
    return normalizeStoredState(JSON.parse(stored));
  } catch {
    return initialState();
  }
}

function normalizeStoredState(parsed = {}) {
  const defaults = initialState();
  const parsedProject = parsed.project || {};
  const competition = parsedProject.competition || {};
  return {
    ...defaults,
    ...parsed,
    activePage: Object.hasOwn(pageTitles, parsed.activePage) ? parsed.activePage : defaults.activePage,
    schemaVersion: 5,
    project: {
      ...defaults.project,
      ...parsedProject,
      id: parsedProject.id || createProjectId(),
      phase: parsedProject.phase || (projectStages.includes(parsedProject.stage) ? parsedProject.stage : projectStages[0]),
      tasks: Array.isArray(parsedProject.tasks) ? parsedProject.tasks.filter(task => projectTasks.includes(task)) : [],
      priorityTask: projectTasks.includes(parsedProject.priorityTask) ? parsedProject.priorityTask : "",
      competition: { ...defaults.project.competition, ...competition },
      archived: Boolean(parsedProject.archived),
      createdAt: parsedProject.createdAt || parsed.updatedAt || Date.now(),
      updatedAt: parsedProject.updatedAt || parsed.updatedAt || Date.now()
    },
    personas: Array.isArray(parsed.personas) ? parsed.personas : defaults.personas,
    materials: Array.isArray(parsed.materials) ? parsed.materials : [],
    sparkRuns: Array.isArray(parsed.sparkRuns) ? parsed.sparkRuns.map(normalizeSparkRun) : [],
    mirrorRuns: Array.isArray(parsed.mirrorRuns) ? parsed.mirrorRuns.map(normalizeMirrorRun) : [],
    reports: Array.isArray(parsed.reports) ? parsed.reports : []
  };
}

function loadProjectLibrary(active) {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]");
    const projects = Array.isArray(parsed) ? parsed.map(normalizeStoredState) : [];
    if (hasSavedProject(active) && !projects.some(item => item.project.id === active.project.id)) projects.push(active);
    return projects.sort((a, b) => (b.project.updatedAt || b.updatedAt || 0) - (a.project.updatedAt || a.updatedAt || 0));
  } catch {
    return hasSavedProject(active) ? [active] : [];
  }
}

function saveProjectLibrary() {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projectLibrary));
}

function snapshotState(source = state) {
  return JSON.parse(JSON.stringify({ ...source, activePage: "workspace" }));
}

function upsertCurrentProject() {
  if (!hasSavedProject(state)) return;
  const next = snapshotState();
  const index = projectLibrary.findIndex(item => item.project.id === state.project.id);
  if (index >= 0) projectLibrary[index] = next;
  else projectLibrary.push(next);
  projectLibrary.sort((a, b) => (b.project.updatedAt || 0) - (a.project.updatedAt || 0));
  saveProjectLibrary();
}

function normalizeSparkRun(run) {
  const legacySteps = Array.isArray(run.validationSteps) ? run.validationSteps : [];
  const pendingIds = new Set((run.evidence || []).filter(item => item.status === "待检索").map(item => item.id));
  return {
    ...run,
    personas: run.personas || [],
    sources: run.sources || ["旧版演示记录"],
    evidence: (run.evidence || []).filter(item => !pendingIds.has(item.id)),
    insights: (run.insights || []).map(item => ({
      ...item,
      evidenceIds: item.evidenceIds?.filter(id => !pendingIds.has(id)),
    })),
    evidenceGaps: run.evidenceGaps || [],
    validationPlan: run.validationPlan || legacySteps.map(step => ({
      objective: step,
      method: "请为这项验证补充参与者、任务、记录方式和执行时间。",
      successSignal: "完成验证后，以真实观察决定保留、修改或否定该假设。"
    }))
  };
}

function normalizeMirrorRun(run) {
  return {
    ...run,
    personas: run.personas || [],
    scores: run.scores || [],
    path: run.path || [],
    issues: run.issues || [],
    personaChecks: run.personaChecks || [],
    metrics: run.metrics || [],
    facilitatorNotes: run.facilitatorNotes || []
  };
}

function saveState({ touch = true } = {}) {
  if (touch) {
    state.updatedAt = Date.now();
    state.project.updatedAt = state.updatedAt;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  upsertCurrentProject();
  syncResumeButton();
}

function syncResumeButton() {
  const button = document.querySelector("#resume-button");
  if (!button) return;
  const resumeProject = hasSavedProject(state) && !state.project.archived
    ? state
    : projectLibrary.find(item => !item.project.archived);
  button.hidden = !resumeProject && !projectLibrary.length;
  button.firstChild.textContent = resumeProject ? "继续项目 " : "项目总览 ";
  button.title = resumeProject ? `继续 ${resumeProject.project.name}` : "查看项目总览";
}

function hasSavedProject() {
  const candidate = arguments[0] || state;
  return candidate.project?.name !== "未命名项目" || Boolean(candidate.studentProject) ||
    candidate.materials?.length > 0 || candidate.personas?.length > builtInPersonas.length ||
    candidate.sparkRuns?.length > 0 || candidate.mirrorRuns?.length > 0;
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

function formatReportTime(timestamp) {
  if (!timestamp) return "时间未记录";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
  }).format(new Date(timestamp));
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

function showWorkspace() {
  document.querySelector("#landing").hidden = true;
  document.querySelector("#app").hidden = false;
}

function enterDemo(mode = "resume", destination) {
  if (mode === "sample") {
    const savedSample = projectLibrary.find(item => item.isSample && !item.project.archived);
    if (savedSample) {
      state = normalizeStoredState(savedSample);
    } else {
      state = sampleState();
      saveState();
    }
  } else if (!hasSavedProject(state) || state.project.archived) {
    state = normalizeStoredState(projectLibrary.find(item => !item.project.archived) || initialState());
  }
  currentSparkResult = state.sparkRuns[0] || null;
  currentMirrorResult = state.mirrorRuns[0] || null;
  showWorkspace();
  navigate(destination || state.activePage || "workspace");
  document.querySelector("#page-content").focus({ preventScroll: true });
}

function setMenuOpen(open, restoreFocus = false) {
  const sidebar = document.querySelector(".student-sidebar");
  const toggle = document.querySelector(".mobile-menu");
  sidebar.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  if (open) sidebar.querySelector(".nav-item.active")?.focus();
  if (restoreFocus) toggle.focus();
}

function showLanding() {
  document.querySelector("#app").hidden = true;
  document.querySelector("#landing").hidden = false;
  setMenuOpen(false);
  syncResumeButton();
  document.querySelector("#home-title").focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

function navigate(page) {
  if (page !== "workspace" && (!hasSavedProject() || state.project.archived)) {
    showToast("请先新建项目，或打开一个进行中的项目");
    return;
  }
  state.activePage = page;
  saveState({ touch: false });
  document.querySelectorAll(".nav-item[data-nav]").forEach(item => {
    const active = item.dataset.nav === page;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  document.querySelector("#page-title").textContent = pageTitles[page];
  const moveFocus = document.querySelector(".student-sidebar").classList.contains("open");
  setMenuOpen(false);
  renderPage();
  if (moveFocus) document.querySelector("#page-content").focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

function renderPage() {
  const renderers = { workspace: renderWorkspace, student: window.studentWorkbench.render, spark: renderSpark, mirror: renderMirror, personas: renderPersonas, materials: renderMaterials, reports: renderReports };
  document.querySelector("#page-content").innerHTML = (renderers[state.activePage] || renderWorkspace)();
  bindPageEvents();
}

function projectCardHTML(snapshot, archived = false) {
  const meta = snapshot.project;
  const readiness = window.studentWorkbench.readinessFor(snapshot);
  const runCount = (snapshot.sparkRuns || []).length + (snapshot.mirrorRuns || []).length;
  const isCurrent = meta.id === state.project.id && !archived;
  const competition = meta.competition?.name ? `<span title="比赛名称">${escapeHTML(meta.competition.name)}</span>` : "";
  const deadline = meta.competition?.deadline ? `<span title="提交日期">截至 ${escapeHTML(meta.competition.deadline)}</span>` : "";
  return `<article class="student-project-tile ${isCurrent ? "is-current" : ""} ${archived ? "is-archived" : ""}">
    <button class="project-card-main" type="button" data-open-project="${escapeHTML(meta.id)}" aria-label="${archived ? "查看归档状态" : "进入科创工作台"} · ${escapeHTML(meta.name)}">
      <span class="student-project-cover">
        <i class="cover-grid"></i><i class="cover-orb cover-orb-one"></i><i class="cover-orb cover-orb-two"></i>
        <span class="project-status"><i></i>${escapeHTML(meta.phase || meta.stage)}</span>
        ${isCurrent ? `<span class="active-project-ribbon">当前项目</span>` : ""}
        <span class="project-cover-mark">P</span>
        <span class="project-cover-progress"><b style="width:${readiness.score}%"></b></span>
      </span>
      <span class="student-project-body">
        <span class="project-title-row"><strong>${escapeHTML(meta.name)}</strong><i>→</i></span>
        <small>${escapeHTML(meta.description)}</small>
        <span class="student-project-priority"><b>当前优先</b>${escapeHTML(meta.priorityTask || "尚未设置")}</span>
        <span class="student-project-tags"><em>${readiness.done}/8 节点</em><em>${(snapshot.personas || []).length} Persona</em><em>${runCount} 轮验证</em></span>
        ${(competition || deadline) ? `<span class="project-competition-meta">${competition}${deadline}</span>` : ""}
        <span class="student-project-footer"><span>资料 ${(snapshot.materials || []).length} · 报告 ${(snapshot.reports || []).length}</span><time>${formatRelativeTime(meta.updatedAt || snapshot.updatedAt)}</time></span>
      </span>
    </button>
    ${!archived ? `<div class="project-card-tools" role="group" aria-label="${escapeHTML(meta.name)} 的验证工具">
      <button class="project-tool-button project-tool-spark" type="button" data-open-project="${escapeHTML(meta.id)}" data-project-destination="spark">
        <span class="project-tool-symbol" aria-hidden="true">✦</span><span><strong>Spark</strong><small>需求探索</small></span>
      </button>
      <button class="project-tool-button project-tool-mirror" type="button" data-open-project="${escapeHTML(meta.id)}" data-project-destination="mirror">
        <span class="project-tool-symbol" aria-hidden="true">◫</span><span><strong>Mirror</strong><small>原型预演</small></span>
      </button>
    </div>` : ""}
    <div class="project-card-actions">${archived
      ? `<button type="button" data-project-restore="${escapeHTML(meta.id)}">恢复项目</button><button class="danger" type="button" data-project-delete="${escapeHTML(meta.id)}">永久删除</button>`
      : `<button type="button" data-project-edit="${escapeHTML(meta.id)}">编辑</button><button type="button" data-project-duplicate="${escapeHTML(meta.id)}">复制</button><button type="button" data-project-archive="${escapeHTML(meta.id)}">归档</button>`}
    </div>
  </article>`;
}

function renderWorkspaceTotals(projects) {
  const presetIds = new Set(builtInPersonas.map(persona => persona.id));
  let custom = 0;
  let evidence = 0;
  let examples = 0;
  let reportCount = 0;
  let spark = 0;
  let mirror = 0;
  for (const project of projects) {
    custom += project.personas.filter(persona => !presetIds.has(persona.id)).length;
    for (const material of project.materials) {
      if (material.isSample) examples++;
      else evidence++;
    }
    reportCount += project.reports.length;
    spark += project.reports.filter(report => report.kind === "Spark").length;
    mirror += project.reports.filter(report => report.kind === "Mirror").length;
  }
  const other = reportCount - spark - mirror;
  const metrics = [
    { label: "Persona 库", value: presetIds.size + custom, unit: "类", detail: `${presetIds.size} 类平台预设 · ${custom} 类项目自定义`, tone: "blue" },
    { label: "证据库", value: evidence, unit: "条", detail: examples ? `项目录入资料 · 另有 ${examples} 条示例` : "各项目录入的资料", tone: "orange" },
    { label: "已生成报告", value: reportCount, unit: "份", detail: `Spark ${spark} · Mirror ${mirror}${other ? ` · 其他 ${other}` : ""}`, tone: "blue" }
  ];

  return `<section class="workspace-section" aria-labelledby="workspace-totals-title">
    <header class="workspace-section-heading">
      <h2 id="workspace-totals-title">网站总览</h2>
      <p>本浏览器内的全部项目，含已归档项目</p>
    </header>
    <ul class="workspace-totals">
      ${metrics.map(metric => `<li class="card workspace-stat workspace-stat-${metric.tone}">
        <h3>${metric.label}</h3>
        <p class="workspace-stat-value"><strong>${metric.value}</strong><span>${metric.unit}</span></p>
        <p class="workspace-stat-detail">${metric.detail}</p>
      </li>`).join("")}
    </ul>
  </section>`;
}

function renderRecentProjects(projects) {
  const recent = [...projects].sort((a, b) => b.project.updatedAt - a.project.updatedAt).slice(0, 5);
  return `<section class="workspace-section" aria-labelledby="recent-projects-title">
    <header class="workspace-section-heading">
      <h2 id="recent-projects-title">最近项目</h2>
      ${recent.length ? "<p>按最近更新排序</p>" : ""}
    </header>
    ${recent.length ? `<ul class="card recent-project-list">${recent.map(({ project, reports }) => `<li>
      <button class="recent-project-row" type="button" data-open-project="${escapeHTML(project.id)}">
        <span class="recent-project-name"><strong>${escapeHTML(project.name)}</strong><small>${escapeHTML(project.phase || project.stage)}</small></span>
        <span class="recent-project-report-count">${reports.length} 份报告</span>
        <span class="recent-project-time">${formatRelativeTime(project.updatedAt)}</span>
        <span class="recent-project-arrow" aria-hidden="true">→</span>
      </button>
    </li>`).join("")}</ul>` : `<div class="card recent-project-empty">暂无进行中项目。新建或恢复项目后，可以从这里继续。</div>`}
  </section>`;
}

function renderWorkspace() {
  const activeProjects = projectLibrary.filter(item => !item.project.archived);
  const archivedProjects = projectLibrary.filter(item => item.project.archived);
  return `
    <div class="page-heading workspace-heading">
      <div><p class="eyebrow">STUDENT WORKSPACE</p><h1>科创项目中心</h1><p>按项目管理需求、原型、验证证据和比赛材料；每个项目的数据彼此独立保存。</p></div>
      <div class="heading-actions"><button class="button button-primary" data-action="enter-empty">＋ 新建项目</button></div>
    </div>
    ${!activeProjects.length ? onboardingHTML() : ""}
    <div class="section-title project-list-title"><div><h2>进行中项目</h2><p>${activeProjects.length ? "按最近更新时间展示" : "创建第一个项目后，进度和验证资产会集中显示在这里"}</p></div><span class="tag tag-blue">${activeProjects.length} 个项目</span></div>
    <section class="student-project-gallery">
      ${activeProjects.map(item => projectCardHTML(item)).join("")}
      <button class="student-new-project-card" data-action="enter-empty"><span>＋</span><strong>新建一个科创项目</strong><small>从一个想法、已有原型或正在准备的比赛项目开始</small></button>
    </section>
    ${renderWorkspaceTotals(projectLibrary)}
    ${renderRecentProjects(activeProjects)}
    ${archivedProjects.length ? `<details class="archived-projects workspace-archive"><summary>已归档项目 <span>${archivedProjects.length}</span></summary><section class="student-project-gallery archived-grid">${archivedProjects.map(item => projectCardHTML(item, true)).join("")}</section></details>` : ""}`;
}

function onboardingHTML() {
  return `<section class="card onboarding-card">
    <div class="onboarding-copy"><h2>先建立科创项目</h2><p>建好后，从项目卡片进入 Spark 需求探索或 Mirror 原型预演，在工具里勾选本轮 Persona。</p></div>
  </section>`;
}

function renderLabProject() {
  const projects = projectLibrary.filter(item => !item.project.archived);
  return `<div class="card lab-project">
    <div class="lab-project-field">
      <label class="form-label" for="lab-project-select">选择本轮项目</label>
      <select class="select" id="lab-project-select" aria-describedby="lab-project-help">${projects.map(({ project }) =>
        `<option value="${escapeHTML(project.id)}"${project.id === state.project.id ? " selected" : ""}>${escapeHTML(project.name)}</option>`).join("")}</select>
      <small id="lab-project-help">切换项目可查看它的最近记录。本轮结果会保存到所选项目。</small>
    </div>
    <div class="lab-project-actions"><button class="link-button" type="button" data-go="workspace">项目中心</button><button class="link-button" type="button" data-return-validation>查看项目验证记录</button></div>
  </div>`;
}

function personaPicker(tool, previousRun) {
  const previousIds = new Set((previousRun?.personas || []).map(persona => persona.id));
  const selectedCount = state.personas.filter(persona => previousIds.has(persona.id)).length;
  return `<fieldset class="run-persona-field" aria-describedby="${tool}-persona-hint">
    <legend>本轮 Persona</legend>
    <p id="${tool}-persona-hint">选择 1–6 张与本轮任务相关的画像。${selectedCount ? "已带入当前记录的人选。" : ""}</p>
    <div class="persona-picks">${state.personas.map(persona => `
      <label class="run-persona-option">
        <input type="checkbox" name="${tool}Persona" value="${escapeHTML(persona.id)}"${previousIds.has(persona.id) ? " checked" : ""}>
        <span>${escapeHTML(persona.name)}${personaSubtitle(persona) ? `<small>${escapeHTML(personaSubtitle(persona))}</small>` : ""}</span>
      </label>`).join("")}</div>
    <output data-persona-count aria-live="polite">已选 ${selectedCount} 类</output>
  </fieldset>`;
}

function selectedRunPersonas(tool, form) {
  const chosen = new Set(new FormData(form).getAll(`${tool}Persona`));
  const selected = state.personas.filter(persona => chosen.has(persona.id));
  if (!selected.length) {
    form.querySelector(".run-persona-option input")?.focus();
    showToast("请至少勾选一类本轮 Persona");
  }
  if (selected.length > 6) {
    showToast("每轮最多选择 6 张 Persona 卡");
    return [];
  }
  return selected;
}

function renderRunParticipants(personas = []) {
  if (!personas.length) return "";
  return `<ul class="run-participants" aria-label="本轮 Persona">${personas.map(persona =>
    `<li title="${escapeHTML(personaSubtitle(persona))}">${escapeHTML(persona.name)}</li>`).join("")}</ul>`;
}

function personaSubtitle(persona) {
  return [persona.profile?.age, persona.profile?.role].filter(Boolean).join(" · ");
}

function reportPersonaNames(ids, personas) {
  return (ids || []).map(id => personas.find(persona => persona.id === id)?.name).filter(Boolean).join("、");
}

function personaComparisonHTML(comparison, labels) {
  if (!comparison) return "";
  return `<div class="report-scope-grid persona-comparison">
    <section><strong>${labels[0]}</strong><p>${escapeHTML(comparison.shared)}</p></section>
    <section><strong>${labels[1]}</strong><p>${escapeHTML(comparison.differences)}</p></section>
  </div>`;
}

async function requestStudentResearch(payload) {
  const response = await fetch("/api/student/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || "千问报告生成失败，请稍后重试。");
  return result;
}

function qwenPersonaInput(persona) {
  return {
    id: String(persona.id),
    name: String(persona.name),
    description: String(persona.desc || "").slice(0, 500),
    traits: Array.isArray(persona.traits) ? persona.traits.map(trait => String(trait).slice(0, 80)).slice(0, 6) : [],
    profile: Object.fromEntries(personaFields.map(field => [field.key, String(persona.profile?.[field.key] || "").slice(0, field.max)]))
  };
}

function setResearchFormBusy(form, busy, busyText) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  if (!button.dataset.idleText) button.dataset.idleText = button.textContent;
  button.disabled = busy;
  button.textContent = busy ? busyText : button.dataset.idleText;
  form.setAttribute("aria-busy", String(busy));
}

function renderSpark() {
  const blueprint = getStudentProject();
  const scene = currentSparkResult?.scene ?? [blueprint.audience, blueprint.scenario, blueprint.problem].filter(Boolean).join("\n");
  const direction = currentSparkResult?.direction ?? (state.isSample ? sampleSparkQuestion : "");
  const currentApproach = currentSparkResult?.currentApproach ?? blueprint.currentApproach ?? "";
  const sources = currentSparkResult?.sources ?? (state.materials.some(hasMaterialExcerpt) ? ["用户资料"] : []);
  const materials = state.materials.filter(hasMaterialExcerpt);
  const chosenMaterials = new Set(currentSparkResult
    ? (currentSparkResult.evidence || []).map(item => item.materialId)
    : materials.slice(0, 3).map(item => item.id));
  return `
    <div class="page-heading"><div><p class="eyebrow" style="color:var(--orange)">SPARK / 播种</p><h1>把项目痛点写成可验证的假设</h1><p>选择本轮要看的用户视角，梳理需求假设和下一轮调研方向。</p></div><span class="tag tag-orange">需求探索</span></div>
    ${renderLabProject()}
    <div class="callout callout-info" style="margin-bottom:16px">千问会根据你填写的场景、Persona 与可回溯资料生成待验证假设。AI 结果不能替代访谈、观察或真人任务测试。</div>
    <div class="lab-layout">
      <form id="spark-form" class="card lab-panel">
        <div class="panel-head"><h2>设置本轮需求探索</h2><span class="tag tag-gray">约 1 分钟</span></div>
        <div class="panel-body">
          <div class="form-group"><label class="form-label" for="spark-scene">目标用户与使用场景 <small>必填</small></label><textarea class="textarea" id="spark-scene" name="scene" required placeholder="谁在什么情况下遇到了什么困难？">${escapeHTML(scene)}</textarea></div>
          <div class="form-group"><label class="form-label" for="spark-direction">你想弄清什么问题？ <small>必填</small></label><textarea class="textarea" id="spark-direction" name="direction" required placeholder="例如：访客找电梯时，是不知道先走哪条路，还是看不懂楼层指引？">${escapeHTML(direction)}</textarea></div>
          ${personaPicker("spark", currentSparkResult)}
          <details class="lab-optional">
            <summary>补充现有做法和参考资料 <small>选填</small></summary>
            <div class="form-group"><label class="form-label" for="spark-approach">用户目前怎么处理？</label><textarea class="textarea" id="spark-approach" name="currentApproach" placeholder="例如：看楼层图、问工作人员，或按手机导航走。">${escapeHTML(currentApproach)}</textarea></div>
            <div class="form-group"><label class="form-label" for="spark-concept">已有方案 <small>选填</small></label><textarea class="textarea" id="spark-concept" name="concept" rows="2" maxlength="800" placeholder="写出你想验证的做法，如：先保存作业，稍后处理冲突">${escapeHTML(currentSparkResult?.concept || "")}</textarea></div>
            <fieldset class="run-persona-field spark-materials"><legend>本轮引用的项目资料</legend><p>选择和研究问题相关的原文或摘要，最多 5 条。</p>
              ${materials.length ? `<div class="persona-picks">${materials.map(item => `<label class="run-persona-option"><input type="checkbox" name="materialIds" value="${escapeHTML(item.id)}"${chosenMaterials.has(item.id) ? " checked" : ""}><span>${escapeHTML(item.title)}<small>${escapeHTML(item.isSample ? "内置示例" : item.type)}</small></span></label>`).join("")}</div>` : '<p>项目资料库暂无带原文或摘要的资料。</p>'}
            </fieldset>
            <div class="form-group"><div class="choice-grid">
              <span class="choice"><input id="source-web" type="checkbox" name="sources" value="公开资料"${sources.includes("公开资料") ? " checked" : ""}><label for="source-web"><span class="choice-mark">✓</span><span><strong>添加公开资料检索任务</strong><small>保存一条待检索记录</small></span></label></span>
            </div></div>
            <div class="form-group"><label class="form-label" for="spark-title">记录名称</label><input class="input" id="spark-title" name="title" value="${escapeHTML(currentSparkResult?.title || "")}" placeholder="${escapeHTML(state.project.name)}"></div>
          </details>
          <div class="submit-row"><button class="button button-purple" type="submit">千问生成需求报告</button><small>真实 AI · 结果待验证</small></div>
          <p class="research-error" role="alert" data-research-error hidden></p>
        </div>
      </form>
      <section id="spark-result" class="card lab-panel">${currentSparkResult ? sparkResultHTML(currentSparkResult) : sparkEmptyHTML()}</section>
    </div>`;
}

function sparkEmptyHTML() {
  return `<div class="empty-state"><div><div class="empty-illustration">✦</div><h3>等待开始本轮探索</h3><p>填写场景和想弄清的问题，再勾选本轮 Persona。</p></div></div>`;
}

function sparkReportStats(result) {
  const evidenceCount = result.evidence?.length || 0;
  const insightCount = result.insights?.length || 0;
  const linkedInsightCount = (result.insights || []).filter(item => item.evidenceIds?.length).length;
  return { evidenceCount, insightCount, linkedInsightCount, gapCount: result.evidenceGaps?.length || 0 };
}

function resultTraceHTML(result) {
  if (result.provider !== "qwen") return `<span class="result-trace">历史演示记录</span>`;
  return `<span class="result-trace">千问 ${escapeHTML(result.model || "")} · ${formatReportTime(result.createdAt)}${result.responseId ? ` · 可追踪生成记录` : ""}</span>`;
}

function sparkResultHTML(result) {
  result = normalizeSparkRun(result);
  const stats = sparkReportStats(result);
  return `<div class="result-shell">
    <div class="result-summary"><div class="result-summary-top"><div><p class="eyebrow">SPARK RESULT · 千问 AI 待验证报告</p><h2>${escapeHTML(result.title)} · 需求探索报告</h2><p>${escapeHTML(result.summary || result.direction)}</p>${renderRunParticipants(result.personas)}${resultTraceHTML(result)}</div><span class="tag tag-orange">AI 推测</span></div>
      <div class="result-kpis"><span><strong>${result.personas.length}</strong><small>Persona 视角</small></span><span><strong>${stats.insightCount}</strong><small>待验证假设</small></span><span><strong>${stats.linkedInsightCount}/${stats.insightCount}</strong><small>资料关联</small></span><span><strong>${stats.gapCount}</strong><small>证据缺口</small></span></div>
    </div>
    <div class="result-tabs"><button class="result-tab active" data-spark-tab="overview">报告概览</button><button class="result-tab" data-spark-tab="dialogue">人群视角</button><button class="result-tab" data-spark-tab="insights">待验证假设</button><button class="result-tab" data-spark-tab="evidence">证据审计</button><button class="result-tab" data-spark-tab="concept">验证计划</button></div>
    <div id="spark-result-body" class="result-body">${sparkTabHTML(result,"overview")}</div>
  </div>`;
}

function sparkTabHTML(result, tab) {
  result = normalizeSparkRun(result);
  const stats = sparkReportStats(result);
  if (tab === "overview") return `<div class="report-overview">
    <section class="report-section"><span class="report-section-label">执行摘要</span><h3>${escapeHTML(result.direction || "本轮研究问题")}</h3><p>${escapeHTML(result.summary || "这条历史记录没有保存执行摘要。")}</p></section>
    <div class="report-scope-grid"><section><small>目标用户与场景</small><p>${escapeHTML(result.scene || "未记录")}</p></section><section><small>现有做法</small><p>${escapeHTML(result.currentApproach || "未记录")}</p></section></div>
    ${result.concept ? `<section class="report-section"><span class="report-section-label">候选方案</span><p>${escapeHTML(result.concept)}</p></section>` : ""}
    <section class="evidence-audit ${stats.linkedInsightCount ? "has-evidence" : "needs-evidence"}"><div><strong>${stats.linkedInsightCount ? "已建立资料关联" : "尚无关联资料"}</strong><p>${stats.linkedInsightCount} / ${stats.insightCount} 条假设关联了本轮资料，结论仍待验证。</p></div><span>${stats.evidenceCount} 条来源</span></section>
    ${result.sources.includes("公开资料") ? '<p class="hint">公开资料检索已记为待办。</p>' : ""}
    ${(result.evidenceGaps || []).length ? `<section class="report-section"><span class="report-section-label">优先补证</span><ul class="evidence-gap-list">${result.evidenceGaps.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul></section>` : ""}
  </div>`;
  if (tab === "dialogue") return `<div class="callout callout-info report-boundary">以下内容为 AI Persona 推演。真实访谈摘录请见证据审计。</div>
    ${personaComparisonHTML(result.comparison, ["共同需求", "人群分歧"])}
    <div class="roundtable">${(result.dialogue || []).map(item => `<div class="speech"><span class="speech-avatar" style="background:${item.color}">${escapeHTML(item.short)}</span><div class="speech-bubble"><strong>${escapeHTML(item.name)}</strong>${personaSubtitle(item) ? `<span class="source-ref">${escapeHTML(personaSubtitle(item))}</span>` : ""}
      ${item.goal ? `<p><b>本轮目标</b> ${escapeHTML(item.goal)}</p>` : ""}<p>${escapeHTML(item.text)}</p>${item.rationale ? `<p><b>推演依据</b> ${escapeHTML(item.rationale)}</p>` : ""}</div></div>`).join("")}</div>`;
  if (tab === "insights") return `<div class="insight-list">${(result.insights || []).map((item, index) => {
    const people = reportPersonaNames(item.personaIds, result.personas);
    return `<article class="insight"><div class="insight-top"><h4>${escapeHTML(item.title)} <span class="source-ref">H${index + 1} · 待验证</span></h4><span class="priority ${item.level === "高" ? "priority-high" : "priority-mid"}">${escapeHTML(item.level)}优先级</span></div>
      <p>${escapeHTML(item.detail)}</p>${people ? `<p><b>适用人群</b> ${escapeHTML(people)}</p>` : ""}${item.condition ? `<p><b>触发条件</b> ${escapeHTML(item.condition)}</p>` : ""}
      ${item.evidenceIds?.length ? `<div class="evidence-links">资料关联：${item.evidenceIds.map(id => `<span>${escapeHTML(id)}</span>`).join("")}</div>` : '<div class="evidence-empty">待补充可回溯证据</div>'}</article>`;
  }).join("")}</div>`;
  if (tab === "evidence") return `<div class="evidence-audit-head"><div><strong>证据覆盖 ${stats.linkedInsightCount}/${stats.insightCount}</strong><p>只展示本轮实际输入并保留来源的资料，不把 AI 生成内容当成证据。</p></div></div><div class="evidence-list">${(result.evidence || []).map(item=>`<article class="evidence-card"><div class="evidence-card-top"><span class="evidence-id">${escapeHTML(item.id)}</span><span class="tag tag-gray">${escapeHTML(item.status)}</span></div><h4>${escapeHTML(item.title)}</h4><blockquote>“${escapeHTML(item.quote)}”</blockquote><p>${escapeHTML(item.kind)} · 来源 ${escapeHTML(item.source)}${item.materialId ? ` · 资料编号 ${escapeHTML(item.materialId)}` : ""}</p></article>`).join("") || `<div class="callout callout-warning">本轮没有可回溯资料。所有洞察目前都只是待验证假设。</div>`}</div>${(result.evidenceGaps || []).length ? `<section class="report-section compact"><span class="report-section-label">证据缺口</span><ul class="evidence-gap-list">${result.evidenceGaps.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul></section>` : ""}`;
  const plans = result.validationPlan?.length ? result.validationPlan : [
    { objective: "验证最关键的一条用户假设", method: "邀请目标用户完成与研究问题直接相关的任务，并记录行为和原话。", successSignal: "获得可追溯记录，能够支持、修改或否定假设。" }
  ];
  return `${result.scene ? `<div class="callout callout-info"><strong>本轮场景：</strong>${escapeHTML(result.scene)}</div>` : ""}<div class="validation-plan-list">${plans.map((plan, index)=>`<article class="validation-plan-card"><span>${index + 1}</span><div><h4>${escapeHTML(plan.objective)}</h4><p><strong>执行方法</strong>${escapeHTML(plan.method)}</p><p><strong>支持信号</strong>${escapeHTML(plan.successSignal)}</p>${plan.reviseSignal ? `<p><strong>何时调整判断</strong>${escapeHTML(plan.reviseSignal)}</p>` : ""}</div><em>待执行</em></article>`).join("")}</div>`;
}

async function runSparkWithQwen(form) {
  const runState = state;
  const data = new FormData(form);
  const selected = selectedRunPersonas("spark", form);
  if (!selected.length) return;
  const sources = data.getAll("sources").map(String);
  const title = String(data.get("title") || "").trim() || state.project.name;
  const scene = String(data.get("scene") || "").trim();
  const direction = String(data.get("direction") || "").trim();
  const currentApproach = String(data.get("currentApproach") || "").trim();
  const concept = String(data.get("concept") || "").trim();
  if (!scene || !direction) {
    form.querySelector(scene ? "#spark-direction" : "#spark-scene").focus();
    showToast("请填写目标用户与使用场景，以及想弄清的问题");
    return;
  }

  const chosenMaterials = new Set(data.getAll("materialIds"));
  if (chosenMaterials.size > 5) {
    showToast("每轮最多引用 5 条资料");
    return;
  }
  const evidence = state.materials.filter(item => chosenMaterials.has(item.id) && hasMaterialExcerpt(item))
    .map((material, index) => ({
      id: `E-${String(index + 1).padStart(2, "0")}`,
      title: String(material.title || "").slice(0, 160),
      kind: material.type,
      quote: material.content.slice(0, 1200),
      source: String(material.source || "").slice(0, 200),
      materialId: material.id,
      status: material.isSample ? "内置示例资料" : "用户录入 · 待核对"
    }));
  if (evidence.length) sources.push("用户资料");

  const errorNotice = form.querySelector("[data-research-error]");
  errorNotice.hidden = true;
  setResearchFormBusy(form, true, "千问正在生成…");
  try {
    const response = await requestStudentResearch({
      kind: "spark",
      project: { name: state.project.name, description: state.project.description || "" },
      scene,
      direction,
      currentApproach,
      concept,
      personas: selected.map(qwenPersonaInput),
      evidence: evidence.map(item => ({
        id: item.id,
        title: item.title,
        quote: item.quote,
        source: item.source,
        status: item.status
      }))
    });
    if (state !== runState) return;
    const dialogueByPersona = new Map(response.data.dialogue.map(item => [item.personaId, item]));
    const result = {
      id: `s${Date.now()}`,
      title,
      scene,
      direction,
      currentApproach,
      concept,
      personas: selected,
      sources,
      evidence,
      summary: response.data.summary,
      comparison: response.data.comparison,
      evidenceGaps: response.data.evidenceGaps,
      validationPlan: response.data.validationPlan,
      provider: "qwen",
      model: response.model,
      responseId: response.responseId,
      quota: response.quota,
      createdAt: Date.now(),
      date: "刚刚",
      dialogue: selected.map(persona => ({
        ...persona,
        ...dialogueByPersona.get(persona.id),
        text: dialogueByPersona.get(persona.id)?.text || "本轮没有可展示的独立行为描述。"
      })),
      insights: response.data.insights.map(item => ({
        ...item,
        source: "千问 AI 推测 · 待验证"
      }))
    };
    currentSparkResult = result;
    state.project.stage = "需求探索";
    state.project.progress = Math.max(state.project.progress, 55);
    state.sparkRuns.unshift(result);
    state.reports.unshift({
      id: result.id,
      kind: "Spark",
      title: `${title} · 需求探索报告`,
      desc: "千问生成的 Persona 视角、资料关联与待验证假设",
      date: "刚刚",
      createdAt: result.createdAt,
      provider: "qwen",
      model: response.model,
      data: result
    });
    saveState();
    const panel = document.querySelector("#spark-result");
    if (panel) {
      panel.innerHTML = sparkResultHTML(result);
      bindResultTabs();
    }
    showToast("千问需求报告已生成并保存");
  } catch (error) {
    errorNotice.textContent = error instanceof Error ? error.message : "千问报告生成失败，请稍后重试";
    errorNotice.hidden = false;
  } finally {
    setResearchFormBusy(form, false, "");
  }
}

function renderMirror() {
  const materialTypes = ["仅有文字流程说明", "产品截图 / 多页面图片", "Figma 原型链接", "已上线网站地址", "流程图或操作文档", "演示视频"];
  const sampleDescription = "用户从首页进入任务清单，添加临时作业并查看冲突说明。系统提示冲突时间和推荐理由，用户确认调整后可撤回。";
  const blueprint = getStudentProject();
  const description = currentMirrorResult?.material ?? (state.isSample ? sampleDescription : "");
  const task = currentMirrorResult?.task ?? blueprint.testTask ?? "";
  const successCriteria = currentMirrorResult?.successCriteria ?? (state.isSample
    ? "临时作业和原有任务都进入新计划，用户能说明调整理由。"
    : blueprint.successMetric ?? "");
  const hypotheses = sparkHypothesisOptions();
  return `
    <div class="page-heading"><div><p class="eyebrow" style="color:var(--green)">MIRROR / 预演</p><h1>把原型改进点变成测试任务</h1><p>写下原型的关键步骤，记录要让目标用户完成的动作，演练答辩时的操作路径。</p></div><span class="tag tag-green">原型预演</span></div>
    ${renderLabProject()}
    <div class="callout callout-info" style="margin-bottom:16px">千问会把你填写的步骤整理成待验证测试计划，并按所选人群生成观察点。文字线索可用于准备测试，界面表现仍需现场走查。</div>
    <div class="lab-layout">
      <form id="mirror-form" class="card lab-panel">
        <div class="panel-head"><h2>配置本轮原型预演</h2></div>
        <div class="panel-body">
          <div class="form-group"><label class="form-label" for="mirror-task">希望用户完成什么任务？ <small>必填</small></label><textarea class="textarea" id="mirror-task" name="task" rows="2" required placeholder="例如：从首页找到电梯并确认无障碍路线。">${escapeHTML(task)}</textarea></div>
          <div class="form-group"><label class="form-label" for="mirror-success">怎样算完成任务？ <small>必填</small></label><textarea class="textarea" id="mirror-success" name="successCriteria" rows="2" required placeholder="例如：用户能确认电梯位置，并说出抵达二层的路线。">${escapeHTML(successCriteria)}</textarea></div>
          <div class="form-group"><label class="form-label" for="mirror-link">原型的操作步骤 <small>必填</small></label><textarea class="textarea" id="mirror-link" name="material" required aria-describedby="mirror-steps-hint" placeholder="示例：用户从首页进入任务清单，点击添加，系统显示作业填写页。">${escapeHTML(description)}</textarea><p class="hint" id="mirror-steps-hint">每行写一个步骤，包括用户看见什么、能做什么，以及操作后的反馈。</p></div>
          ${personaPicker("mirror", currentMirrorResult)}
          <details class="lab-optional">
            <summary>补充测试设定和原型资料 <small>选填</small></summary>
            <div class="grid grid-2">
              <div class="form-group"><label class="form-label" for="mirror-version">原型版本</label><input class="input" id="mirror-version" name="version" maxlength="80" value="${escapeHTML(currentMirrorResult?.version || "")}" placeholder="如：V0.2 排期流程"></div>
              <div class="form-group"><label class="form-label" for="mirror-start">任务起点</label><input class="input" id="mirror-start" name="start" maxlength="300" value="${escapeHTML(currentMirrorResult?.start || "")}" placeholder="如：登录后的任务列表"></div>
            </div>
            <div class="form-group"><label class="form-label" for="mirror-context">测试条件</label><textarea class="textarea" id="mirror-context" name="context" rows="2" maxlength="500" placeholder="如：使用手机，课间两分钟；若误操作，可返回修改">${escapeHTML(currentMirrorResult?.context || "")}</textarea></div>
            ${hypotheses.length ? `<div class="form-group"><label class="form-label" for="mirror-hypothesis">关联 Spark 假设</label><select class="select" id="mirror-hypothesis" name="hypothesisId"><option value="">本轮独立预检</option>${hypotheses.map(item => `<option value="${escapeHTML(item.id)}"${item.id === currentMirrorResult?.sparkHypothesis?.id ? " selected" : ""}>${escapeHTML(item.label)}</option>`).join("")}</select></div>` : ""}
            <div class="form-group"><label class="form-label" for="material-type">原型材料类型</label><select class="select" id="material-type" name="materialType">${materialTypes.map(type => `<option${type === currentMirrorResult?.materialType ? " selected" : ""}>${type}</option>`).join("")}</select></div>
            <div class="form-group"><label class="form-label" for="mirror-reference">原型链接</label><input class="input" id="mirror-reference" name="reference" type="url" value="${escapeHTML(currentMirrorResult?.reference || "")}" placeholder="https://"></div>
            <div class="form-group"><label class="upload-box" for="mirror-file"><input id="mirror-file" name="file" type="file" accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,video/*"><span><span class="upload-icon" aria-hidden="true">⇧</span><strong id="upload-label">选取本地文件</strong><small>只记录文件名</small></span></label></div>
            <div class="form-group"><label class="form-label" for="mirror-title">记录名称</label><input class="input" id="mirror-title" name="title" value="${escapeHTML(currentMirrorResult?.title || "")}" placeholder="${escapeHTML(state.project.name)}"></div>
          </details>
          <div class="submit-row"><button class="button button-green" type="submit">千问生成预检报告</button><small>真实 AI · 结果待验证</small></div>
          <p class="research-error" role="alert" data-research-error hidden></p>
        </div>
      </form>
      <section id="mirror-result" class="card lab-panel">${currentMirrorResult ? mirrorResultHTML(currentMirrorResult) : mirrorEmptyHTML()}</section>
    </div>`;
}

function sparkHypothesisOptions() {
  return state.sparkRuns.flatMap(run => (run.insights || []).map((insight, index) => ({
    id: `${run.id}-H${index + 1}`,
    label: `${run.title} · H${index + 1} ${insight.title}`,
    detail: [insight.detail, insight.condition].filter(Boolean).join(" "),
  })));
}

function mirrorEmptyHTML() {
  return `<div class="empty-state"><div><div class="empty-illustration" style="color:var(--green);background:var(--green-soft)">◫</div><h3>等待开始体验预演</h3><p>填写任务、完成标准和原型的操作步骤，再勾选要测试的人群。</p></div></div>`;
}

const mirrorDimensions = [
  ["任务清晰度", [/点击|进入|打开|选择|输入|添加|填写|导航/, /提交|完成|确认|保存|生成|到达|显示/], "明确用户要做的动作和任务结束状态"],
  ["信息架构与可寻找性", [/首页|菜单|清单|列表|页面|入口|导航/, /进入|打开|找到|选择|跳转/], "补充任务的起始页面和入口位置"],
  ["交互一致性", [], "对照多个页面的按钮名称、位置和操作方式"],
  ["系统反馈", [/显示|提示|反馈/, /成功|失败|错误|进度|状态|结果|原因|理由/], "说明系统怎样提示成功、失败或进度变化"],
  ["认知负荷", [], "观察参与者在哪一步犹豫、回看或需要解释"],
  ["错误预防与恢复", [/撤回|撤销|重试|恢复|返回修改/], "确认误操作后能否返回、修改或重试"],
  ["信任与隐私", [/权限|授权|个人信息|个人数据|定位/, /用途|范围|同意|拒绝|删除/], "涉及个人信息时，说明数据用途和拒绝方式"],
  ["Persona 适配与无障碍", [], "让所选人群用日常设备和辅助方式完成任务"]
];

function mirrorCoverage(description) {
  return mirrorDimensions.map(([name, signals, followUp]) => {
    const status = signals.length === 0
      ? "需现场查看"
      : signals.every(signal => signal.test(description)) ? "有文字线索" : "待补充线索";
    return { name, status, followUp };
  });
}

function prototypeSteps(description) {
  const lines = description.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return (lines.length > 1 ? lines : description.split(/[。；;]|→/))
    .map(step => step.trim().replace(/^(?:[-*•]\s+|\d+[.、)）]\s*)/, ""))
    .filter(Boolean);
}

function mirrorReferenceURL(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function mirrorResultHTML(result) {
  result = normalizeMirrorRun(result);
  const hasCoverage = Array.isArray(result.coverage);
  const reference = mirrorReferenceURL(result.reference);
  const linkedToValidation = state.mirrorValidationRunId === result.id;
  const highPriorityCount = result.issues.filter(issue => issue.level === "高").length;
  return `<div class="result-shell">
    <header class="result-summary mirror-plan-header">
      <div class="result-summary-top"><div><p class="eyebrow">MIRROR · 千问 AI 待验证预检</p><h2>${escapeHTML(result.title)}</h2><p>${escapeHTML(result.summary || result.task)}</p>${renderRunParticipants(result.personas)}${resultTraceHTML(result)}${reference ? `<a class="mirror-reference" href="${escapeHTML(reference)}" target="_blank" rel="noopener noreferrer">打开原型链接 ↗</a>` : ""}</div><span class="tag tag-orange">启发式预检</span></div>
      <div class="result-kpis"><span><strong>${result.path.length}</strong><small>原型步骤</small></span><span><strong>${result.issues.length}</strong><small>待验证问题</small></span><span><strong>${highPriorityCount}</strong><small>高优先级</small></span><span><strong>${result.metrics.length}</strong><small>观察指标</small></span></div>
    </header>
    <div class="mirror-plan-actions">
      <button class="button button-primary" type="button" data-action="use-mirror-plan" data-mirror-run="${escapeHTML(result.id)}">${linkedToValidation ? "前往真人测试" : "用于真人验证"}</button>
      <button class="button button-secondary" type="button" data-action="export-mirror-plan" data-mirror-run="${escapeHTML(result.id)}">导出测试计划</button>
    </div>
    <div class="result-tabs">
      <button class="result-tab active" type="button" data-mirror-tab="path" aria-pressed="true">测试计划</button>
      <button class="result-tab" type="button" data-mirror-tab="issues" aria-pressed="false">人群路径与问题</button>
      <button class="result-tab" type="button" data-mirror-tab="scores" aria-pressed="false">${hasCoverage ? "检查范围" : "历史示例评分"}</button>
    </div>
    <div id="mirror-result-body" class="result-body">${mirrorTabHTML(result, "path")}</div>
  </div>`;
}

function renderMirrorTestPlan(result) {
  result = normalizeMirrorRun(result);
  const steps = result.path || [];
  return `<section class="mirror-test-plan">
    ${result.summary ? `<div class="report-section mirror-executive-summary"><span class="report-section-label">预检摘要</span><p>${escapeHTML(result.summary)}</p></div>` : ""}
    <div class="callout callout-info report-boundary"><strong>边界：</strong>当前报告只检查文字步骤，未实际操作界面，也没有真实用户参与。</div>
    ${(result.version || result.start || result.context || result.sparkHypothesis) ? `<section class="report-section"><span class="report-section-label">本轮测试设定</span>
      ${result.version ? `<p><b>原型版本</b> ${escapeHTML(result.version)}</p>` : ""}
      ${result.start ? `<p><b>任务起点</b> ${escapeHTML(result.start)}</p>` : ""}
      ${result.context ? `<p><b>测试条件</b> ${escapeHTML(result.context)}</p>` : ""}
      ${result.sparkHypothesis ? `<p><b>关联假设</b> ${escapeHTML(result.sparkHypothesis.label)}</p>` : ""}
    </section>` : ""}
    ${result.taskPrompt ? `<div class="mirror-criterion"><h3>读给参与者的任务</h3><p>${escapeHTML(result.taskPrompt)}</p></div>` : ""}
    ${result.successCriteria ? `<div class="mirror-criterion"><h3>完成标准</h3><p>${escapeHTML(result.successCriteria)}</p></div>` : ""}
    <h3>按原型步骤走查</h3>
    ${steps.length ? `<ol class="mirror-test-steps">${steps.map(step => `<li>${escapeHTML(step.text)}</li>`).join("")}</ol>`
      : "<p>这条历史记录没有保存走查步骤。</p>"}
    ${result.metrics.length ? `<h3>真人测试观察指标</h3><div class="mirror-observation-grid">${result.metrics.map(metric => `<article><strong>${escapeHTML(metric.name)}</strong><p><b>怎么记</b>${escapeHTML(metric.howToRecord)}</p><p><b>成功信号</b>${escapeHTML(metric.successSignal)}</p></article>`).join("")}</div>` : `<h3>真人测试时记录</h3><p>用相同起点和任务说明。观察参与者是否达到完成标准，记录耗时、卡住的位置、求助或出错，以及如何恢复。</p>`}
    ${result.facilitatorNotes.length ? `<h3>主持人提示</h3><ul class="facilitator-notes">${result.facilitatorNotes.map(note => `<li>${escapeHTML(note)}</li>`).join("")}</ul>` : ""}
  </section>`;
}

function mirrorTabHTML(result, tab) {
  result = normalizeMirrorRun(result);
  if (tab === "issues") {
    const checks = (result.personaChecks || []).map(check => `<article class="insight">
      <h4>${escapeHTML(check.name)}</h4>
      ${check.path?.length ? `<ol class="persona-route">${check.path.map(step => `<li><b>步骤 ${step}</b> ${escapeHTML(result.path[step - 1]?.text)}</li>`).join("")}</ol>` : check.path ? "<p>依据已提供的步骤，路径待确认。</p>" : ""}
      <p>${escapeHTML(check.concern)}</p>
      ${check.rationale ? `<p><strong>路径依据</strong> ${escapeHTML(check.rationale)}</p>` : ""}
      ${check.recovery ? `<p><strong>遇阻后的处理</strong> ${escapeHTML(check.recovery)}</p>` : ""}
      <p><strong>走查时观察</strong> ${escapeHTML(check.observe)}</p>
    </article>`).join("");
    return `${personaComparisonHTML(result.comparison, ["共同卡点", "操作方式差异"])}
      ${checks ? `<section class="mirror-persona-checks"><h3>按 Persona 预演</h3><div class="insight-list">${checks}</div></section>` : ""}
      <div class="issue-list">${result.issues.map((issue, index) => {
        const people = reportPersonaNames(issue.personaIds, result.personas);
        return `<article class="issue-card"><span class="issue-index">${index + 1}</span><div><h4>${escapeHTML(issue.title)}</h4>
          <p>${escapeHTML(issue.detail)}</p>${issue.step ? `<p><strong>涉及步骤</strong> ${issue.step} · ${escapeHTML(result.path[issue.step - 1]?.text)}</p>` : ""}
          ${people ? `<p><strong>可能受影响</strong> ${escapeHTML(people)}</p>` : ""}
          ${issue.improvement ? `<p><strong>建议改法</strong> ${escapeHTML(issue.improvement)}</p>` : ""}
          ${issue.testMethod ? `<div class="issue-test"><strong>怎么验证</strong><p>${escapeHTML(issue.testMethod)}</p></div>` : ""}
          <div class="issue-meta"><span class="tag ${issue.level === "高" ? "tag-red" : "tag-orange"}">${escapeHTML(issue.level)}优先级</span><span class="tag tag-gray">${escapeHTML(issue.dimension)}</span></div></div></article>`;
      }).join("") || "<p>这轮文字预检未列出具体问题。可以用测试脚本继续观察。</p>"}</div>`;
  }
  if (tab === "scores" && Array.isArray(result.coverage)) {
    return `<div class="insight-list">${result.coverage.map(item => `<article class="insight">
      <div class="insight-top"><h4>${escapeHTML(item.name)}</h4><span class="tag tag-gray">${escapeHTML(item.status)}</span></div>
      <p>${escapeHTML(item.followUp)}</p>
    </article>`).join("")}</div>`;
  }
  if (tab === "scores") {
    return `<p>旧版预演使用固定数字演示评分表。</p><div class="insight-list">${result.scores.map(score => `<article class="insight">
      <div class="insight-top"><h4>${escapeHTML(score.name)}</h4><span class="tag tag-gray">${score.score == null ? "暂不评分" : `${score.score}/${score.max}`}</span></div>
      ${score.reason ? `<p>${escapeHTML(score.reason)}</p>` : ""}
    </article>`).join("") || "<p>这条历史记录没有评分明细。</p>"}</div>`;
  }
  return renderMirrorTestPlan(result);
}

async function runMirrorWithQwen(form) {
  const runState = state;
  const data = new FormData(form);
  const selected = selectedRunPersonas("mirror", form);
  if (!selected.length) return;
  const materialType = String(data.get("materialType") || "");
  const material = String(data.get("material") || "").trim();
  const task = String(data.get("task") || "").trim();
  const title = String(data.get("title") || "").trim() || state.project.name;
  const file = data.get("file");
  const fileName = file && typeof file === "object" && "name" in file ? file.name : "";
  const description = material.replace(/https?:\/\/\S+/gi, "").trim();
  const reference = String(data.get("reference") || "").trim();
  const successCriteria = String(data.get("successCriteria") || "").trim();
  const version = String(data.get("version") || "").trim();
  const start = String(data.get("start") || "").trim();
  const context = String(data.get("context") || "").trim();
  const sparkHypothesis = sparkHypothesisOptions().find(item => item.id === data.get("hypothesisId"));
  if (!task || !successCriteria || !description) {
    const missing = !task ? ["#mirror-task", "请填写要测试的任务"]
      : !successCriteria ? ["#mirror-success", "请填写任务完成标准"]
      : ["#mirror-link", "请描述原型的操作步骤"];
    form.querySelector(missing[0]).focus();
    showToast(missing[1]);
    return;
  }
  const steps = prototypeSteps(description);
  if (!steps.length) {
    form.querySelector("#mirror-link").focus();
    showToast("请输入至少一个可操作的原型步骤");
    return;
  }
  if (steps.length > 30 || steps.some(step => step.length > 500)) {
    form.querySelector("#mirror-link").focus();
    showToast("请保留最多 30 个步骤，每步不超过 500 字");
    return;
  }

  const errorNotice = form.querySelector("[data-research-error]");
  errorNotice.hidden = true;
  setResearchFormBusy(form, true, "千问正在生成…");
  try {
    const response = await requestStudentResearch({
      kind: "mirror",
      project: { name: state.project.name, description: state.project.description || "" },
      task,
      successCriteria,
      version,
      start,
      context,
      sparkHypothesis: sparkHypothesis ? `${sparkHypothesis.label}\n${sparkHypothesis.detail}`.slice(0, 1200) : "",
      prototypeSteps: steps,
      personas: selected.map(qwenPersonaInput)
    });
    if (state !== runState) return;
    const checksByPersona = new Map(response.data.personaChecks.map(item => [item.personaId, item]));
    const personaChecks = selected.map(persona => {
      const check = checksByPersona.get(persona.id);
      return {
        ...check,
        name: persona.name,
        concern: check?.concern || "本轮未返回该 Persona 的独立路径。",
        observe: check?.observe || "围绕画像中的主要困难，记录卡点、求助与恢复方式。"
      };
    });
    const result = {
      id: `m${Date.now()}`,
      title,
      task,
      successCriteria,
      version,
      start,
      context,
      sparkHypothesis,
      materialType,
      material,
      reference,
      fileName,
      personas: selected,
      coverage: mirrorCoverage(description),
      issues: response.data.issues,
      personaChecks,
      metrics: response.data.metrics,
      facilitatorNotes: response.data.facilitatorNotes,
      summary: response.data.summary,
      comparison: response.data.comparison,
      taskPrompt: response.data.taskPrompt,
      provider: "qwen",
      model: response.model,
      responseId: response.responseId,
      quota: response.quota,
      path: steps.map(text => ({ text, status: "待观察" })),
      createdAt: Date.now(),
      date: "刚刚"
    };
    currentMirrorResult = result;
    state.project.stage = "体验验证";
    state.project.progress = Math.max(state.project.progress, 72);
    state.mirrorRuns.unshift(result);
    state.reports.unshift({
      id: result.id,
      kind: "Mirror",
      title: `${result.title} · 原型预检报告`,
      desc: `千问生成：${result.path.length} 个原型步骤、${selected.length} 类人群观察点与待验证问题`,
      date: "刚刚",
      createdAt: result.createdAt,
      provider: "qwen",
      model: response.model,
      data: result
    });
    saveState();
    const panel = document.querySelector("#mirror-result");
    if (panel) {
      panel.innerHTML = mirrorResultHTML(result);
      bindResultTabs();
    }
    showToast("千问原型预检报告已生成并保存");
  } catch (error) {
    errorNotice.textContent = error instanceof Error ? error.message : "千问报告生成失败，请稍后重试";
    errorNotice.hidden = false;
  } finally {
    setResearchFormBusy(form, false, "");
  }
}

function renderPersonas() {
  return `
    <div class="page-heading"><div><p class="eyebrow">PERSONA LIBRARY</p><h1>Persona 用户库</h1><p>为当前项目创建可复用的虚拟用户。Spark 和 Mirror 可以选择同一张画像卡。</p></div><div class="heading-actions"><button class="button button-primary" data-open-modal="persona">＋ 创建 Persona</button></div></div>
    <div class="grid grid-3">${[...state.personas].sort((a, b) => Number(a.type === "平台预设") - Number(b.type === "平台预设")).map(personaCardHTML).join("")}</div>`;
}

function personaCardHTML(persona) {
  const preset = persona.type === "平台预设";
  const subtitle = personaSubtitle(persona);
  const facts = personaFields.filter(field => !["age", "role"].includes(field.key) && persona.profile?.[field.key]);
  return `<article class="card persona-card">
    <div class="persona-cover"><span class="persona-large-avatar" style="background:${persona.color}">${escapeHTML(persona.short)}</span><span class="tag ${preset ? "tag-purple" : "tag-green"}">${escapeHTML(persona.type)}</span></div>
    <div class="persona-content"><h3>${escapeHTML(persona.name)}</h3>
      ${subtitle ? `<p class="persona-subtitle">${escapeHTML(subtitle)}</p>` : ""}
      ${persona.desc ? `<p>${escapeHTML(persona.desc)}</p>` : ""}
      ${facts.length ? `<dl class="persona-facts">${facts.map(field => `<div><dt>${field.label}</dt><dd>${escapeHTML(persona.profile[field.key])}</dd></div>`).join("")}</dl>` : ""}
      <div class="trait-list">${(persona.traits || []).map(trait => `<span class="trait">${escapeHTML(trait)}</span>`).join("")}</div>
      <button class="button button-secondary button-sm persona-edit" type="button" data-edit-persona="${escapeHTML(persona.id)}">${preset ? "以此为模板" : "编辑画像"}</button>
    </div></article>`;
}

function renderMaterials() {
  return `
    <div class="page-heading"><div><h1>项目证据库</h1><p>${escapeHTML(state.project.name)} · 管理访谈、问卷、公开资料和本地文件。</p></div><div class="heading-actions"><button class="button button-primary" data-open-modal="material">＋ 录入资料</button></div></div>
    <section class="card card-pad workbench-evidence-panel" aria-label="本项目资料">
      ${renderEvidenceImport()}
      ${renderEvidenceList(state.materials)}
    </section>`;
}

function reportCardMetrics(report) {
  if (report.kind === "Spark") {
    const run = normalizeSparkRun(report.data || {});
    const stats = sparkReportStats(run);
    return {
      summary: run.summary || report.desc,
      primary: `${stats.insightCount} 条假设`,
      secondary: `${stats.linkedInsightCount} 条有资料关联`,
      highPriority: (run.insights || []).filter(item => item.level === "高").length,
      evidenceLinked: stats.linkedInsightCount
    };
  }
  const run = normalizeMirrorRun(report.data || {});
  return {
    summary: run.summary || report.desc,
    primary: `${run.issues.length} 个待验证问题`,
    secondary: `${run.metrics.length || run.path.length} 项观察记录`,
    highPriority: run.issues.filter(item => item.level === "高").length,
    evidenceLinked: 0
  };
}

function renderReports() {
  const reports = state.reports || [];
  const reportMetrics = reports.map(reportCardMetrics);
  const aiReportCount = reports.filter(report => report.provider === "qwen").length;
  const highPriorityCount = reportMetrics.reduce((sum, item) => sum + item.highPriority, 0);
  const evidenceLinkedCount = reportMetrics.reduce((sum, item) => sum + item.evidenceLinked, 0);
  return `
    <div class="page-heading"><div><p class="eyebrow">REPORTS</p><h1>研究与验证报告</h1><p>集中查看 AI 推测、资料关联、待验证问题和下一步真人研究计划。</p></div></div>
    <div class="callout callout-warning" style="margin-bottom:18px"><strong>结论边界：</strong>千问生成内容属于模型推断和待验证假设；只有可回溯原始资料与真人测试记录才能作为研究证据。</div>
    ${reports.length ? `<div class="report-overview-grid"><article><span>报告总数</span><strong>${reports.length}</strong><small>Spark 与 Mirror</small></article><article><span>真实 AI 报告</span><strong>${aiReportCount}</strong><small>千问结构化生成</small></article><article><span>高优先级问题</span><strong>${highPriorityCount}</strong><small>建议优先验证</small></article><article><span>资料关联假设</span><strong>${evidenceLinkedCount}</strong><small>仍需真人核验</small></article></div><div class="grid grid-3">${reports.map((r,index)=>{ const metrics = reportMetrics[index]; return `<article class="card report-card"><div class="report-card-top"><span class="report-icon" style="${r.kind==="Mirror"?"color:var(--green);background:var(--green-soft)":""}">${r.kind==="Spark"?"✦":"◫"}</span><span class="tag ${r.kind==="Spark"?"tag-orange":"tag-green"}">${escapeHTML(r.kind)}</span></div><h3>${escapeHTML(r.title)}</h3><p class="report-card-summary">${escapeHTML(metrics.summary)}</p><div class="report-card-metrics"><span>${escapeHTML(metrics.primary)}</span><span>${escapeHTML(metrics.secondary)}</span></div><div class="report-card-trace"><span>${r.provider === "qwen" ? `千问 ${escapeHTML(r.model || "")}` : "历史演示记录"}</span><time>${formatReportTime(r.createdAt)}</time></div><div class="report-footer"><span>${formatRelativeTime(r.createdAt)}</span><span><button class="link-button" data-view-report="${escapeHTML(r.id)}">打开报告</button><button class="link-button" data-download-report="${escapeHTML(r.id)}">导出 ↓</button></span></div></article>`; }).join("")}</div>` : `<article class="card empty-state"><div><div class="empty-illustration">▥</div><h3>还没有验证报告</h3><p>完成一次 Spark 或 Mirror 后，报告会自动保存到这里，并支持导出为 Markdown 文档。</p><div style="display:flex;gap:8px;justify-content:center;margin-top:16px"><button class="button button-purple button-sm" data-go="spark">运行 Spark</button><button class="button button-green button-sm" data-go="mirror">运行 Mirror</button></div></div></article>`}`;
}

function bindPageEvents() {
  document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => navigate(el.dataset.go)));
  document.querySelectorAll("[data-open-modal]").forEach(el => el.addEventListener("click", () => openModal(el.dataset.openModal)));
  document.querySelectorAll("[data-edit-persona]").forEach(button => button.addEventListener("click", () =>
    openPersonaEditor(state.personas.find(persona => persona.id === button.dataset.editPersona))));
  document.querySelectorAll("[data-open-project]").forEach(el => el.addEventListener("click", () => openProject(el.dataset.openProject, el.dataset.projectDestination)));
  document.querySelectorAll("[data-project-edit]").forEach(el => el.addEventListener("click", () => editProject(el.dataset.projectEdit)));
  document.querySelectorAll("[data-project-duplicate]").forEach(el => el.addEventListener("click", () => duplicateProject(el.dataset.projectDuplicate)));
  document.querySelectorAll("[data-project-archive]").forEach(el => el.addEventListener("click", () => archiveProject(el.dataset.projectArchive)));
  document.querySelectorAll("[data-project-restore]").forEach(el => el.addEventListener("click", () => restoreProject(el.dataset.projectRestore)));
  document.querySelectorAll("[data-project-delete]").forEach(el => el.addEventListener("click", () => deleteProject(el.dataset.projectDelete)));
  document.querySelector("#spark-form")?.addEventListener("submit", e => { e.preventDefault(); void runSparkWithQwen(e.currentTarget); });
  document.querySelector("#mirror-form")?.addEventListener("submit", e => { e.preventDefault(); void runMirrorWithQwen(e.currentTarget); });
  document.querySelector("#mirror-reference")?.addEventListener("invalid", event => {
    event.currentTarget.closest("details").open = true;
  });
  document.querySelector("#lab-project-select")?.addEventListener("change", event => {
    const destination = state.activePage;
    openProject(event.currentTarget.value, destination);
    document.querySelector("#lab-project-select")?.focus({ preventScroll: true });
  });
  document.querySelector(".run-persona-field")?.addEventListener("change", event => {
    const group = event.currentTarget;
    group.querySelector("[data-persona-count]").textContent = `已选 ${group.querySelectorAll('input:checked').length} 类`;
  });
  document.querySelectorAll("[data-export-student]").forEach(el => el.addEventListener("click", () => window.studentWorkbench.export()));
  document.querySelector("#mirror-file")?.addEventListener("change", e => { const file=e.target.files[0]; document.querySelector("#upload-label").textContent=file?`已选择：${file.name}`:"也可以上传本地文件"; });
  document.querySelectorAll("[data-download-report]").forEach(el => el.addEventListener("click", () => downloadReport(el.dataset.downloadReport)));
  document.querySelectorAll("[data-view-report]").forEach(el => el.addEventListener("click", () => viewReport(el.dataset.viewReport)));
  document.querySelectorAll("[data-return-validation]").forEach(button => button.addEventListener("click", () => {
    studentActiveView = "validation";
    navigate("student");
    document.querySelector("#workbench-tab-validation")?.focus({ preventScroll: true });
  }));
  bindProjectEvidence();
  window.studentWorkbench.bind?.();
  bindResultTabs();
}

function switchToStoredProject(snapshot) {
  state = normalizeStoredState(snapshot);
  currentSparkResult = state.sparkRuns[0] || null;
  currentMirrorResult = state.mirrorRuns[0] || null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function openProject(id, destination = "student") {
  const snapshot = projectLibrary.find(item => item.project.id === id);
  if (!snapshot) return showToast("没有找到这个项目");
  if (snapshot.project.archived) return showToast("请先恢复已归档项目");
  switchToStoredProject(snapshot);
  if (destination === "student") studentActiveView = "overview";
  navigate(destination);
  document.querySelector("#page-content").focus({ preventScroll: true });
}

function editProject(id) {
  const snapshot = projectLibrary.find(item => item.project.id === id);
  if (!snapshot || snapshot.project.archived) return;
  switchToStoredProject(snapshot);
  navigate("workspace");
  setTimeout(() => openProjectWizard(true), 0);
}

function duplicateProject(id) {
  const source = projectLibrary.find(item => item.project.id === id);
  if (!source) return;
  const copy = snapshotState(normalizeStoredState(source));
  const now = Date.now();
  copy.project = {
    ...copy.project,
    id: createProjectId(),
    name: `${copy.project.name}（副本）`,
    archived: false,
    createdAt: now,
    updatedAt: now
  };
  copy.updatedAt = now;
  projectLibrary.unshift(copy);
  saveProjectLibrary();
  renderPage();
  showToast("项目副本已创建");
}

function selectFallbackProject(excludedId = "") {
  const fallback = projectLibrary.find(item => !item.project.archived && item.project.id !== excludedId);
  state = fallback ? normalizeStoredState(fallback) : initialState();
  currentSparkResult = state.sparkRuns[0] || null;
  currentMirrorResult = state.mirrorRuns[0] || null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function archiveProject(id) {
  const index = projectLibrary.findIndex(item => item.project.id === id);
  if (index < 0 || !confirm(`归档“${projectLibrary[index].project.name}”？之后可以在已归档项目中恢复。`)) return;
  projectLibrary[index].project.archived = true;
  projectLibrary[index].project.updatedAt = Date.now();
  saveProjectLibrary();
  if (state.project.id === id) selectFallbackProject(id);
  renderPage();
  syncResumeButton();
  showToast("项目已归档");
}

function restoreProject(id) {
  const project = projectLibrary.find(item => item.project.id === id);
  if (!project) return;
  project.project.archived = false;
  project.project.updatedAt = Date.now();
  project.updatedAt = Date.now();
  projectLibrary.sort((a, b) => (b.project.updatedAt || 0) - (a.project.updatedAt || 0));
  saveProjectLibrary();
  renderPage();
  syncResumeButton();
  showToast("项目已恢复");
}

function deleteProject(id) {
  const project = projectLibrary.find(item => item.project.id === id);
  if (!project || !confirm(`永久删除“${project.project.name}”及其全部本地记录？这个操作无法撤回。`)) return;
  projectLibrary = projectLibrary.filter(item => item.project.id !== id);
  saveProjectLibrary();
  if (state.project.id === id) selectFallbackProject(id);
  releaseEvidenceFiles(project.materials).catch(() => showToast("项目已删除，浏览器暂未清理项目原件。"));
  renderPage();
  syncResumeButton();
  showToast("项目已永久删除");
}

function bindResultTabs() {
  document.querySelectorAll("[data-spark-tab]").forEach(el => el.addEventListener("click", () => {
    document.querySelectorAll("[data-spark-tab]").forEach(x=>x.classList.remove("active")); el.classList.add("active");
    document.querySelector("#spark-result-body").innerHTML = sparkTabHTML(currentSparkResult, el.dataset.sparkTab);
  }));
  document.querySelectorAll("[data-mirror-tab]").forEach(el => el.addEventListener("click", () => {
    document.querySelectorAll("[data-mirror-tab]").forEach(button => {
      button.classList.toggle("active", button === el);
      button.setAttribute("aria-pressed", String(button === el));
    });
    document.querySelector("#mirror-result-body").innerHTML = mirrorTabHTML(currentMirrorResult, el.dataset.mirrorTab);
  }));
}

function suggestedTaskForStage(stage) {
  return ({
    "只有初步想法": "寻找真实场景和痛点",
    "已确定项目方向": "梳理产品需求",
    "已有产品原型": "完善产品原型",
    "正在进行用户验证": "开展用户验证",
    "正在准备比赛材料": "整理比赛材料"
  })[stage] || projectTasks[0];
}

let modalTrigger;

function dismissModal(restoreFocus = true) {
  document.querySelector("#modal-root").replaceChildren();
  if (restoreFocus) (modalTrigger?.isConnected ? modalTrigger : document.querySelector("#page-content")).focus();
  modalTrigger = null;
}

function bindModalDismissal(root) {
  modalTrigger = document.activeElement;
  root.querySelector(".modal").addEventListener("click", event => event.stopPropagation());
  root.querySelectorAll("[data-close-modal]").forEach(element => {
    element.addEventListener("click", () => dismissModal());
  });
}

function openProjectWizard(editing = false) {
  const root = document.querySelector("#modal-root");
  const meta = editing ? state.project : createProjectMeta();
  let lastSuggestedTask = suggestedTaskForStage(meta.phase);
  const selectedTasks = meta.tasks?.length ? meta.tasks : [lastSuggestedTask];
  const priorityTask = selectedTasks.includes(meta.priorityTask) ? meta.priorityTask : selectedTasks[0];
  root.innerHTML = `<div class="modal-backdrop" data-close-modal>
    <div class="modal project-wizard" role="dialog" aria-modal="true" aria-label="${editing ? "编辑科创项目" : "创建科创项目"}">
      <div class="modal-head"><div><span class="wizard-kicker">PROJECT SETUP</span><h2>${editing ? "编辑科创项目" : "创建科创项目"}</h2></div><button class="modal-close" data-close-modal aria-label="关闭">×</button></div>
      <div class="wizard-progress" aria-label="创建进度"><span class="active" data-wizard-dot="1" aria-current="step"><b>1</b>基本信息</span><i></i><span data-wizard-dot="2"><b>2</b>比赛信息</span><i></i><span data-wizard-dot="3"><b>3</b>当前任务</span></div>
      <form id="project-wizard-form">
        <div class="modal-body wizard-panel" data-wizard-panel="1">
          <div class="wizard-intro"><strong>先说明项目现在是什么状态</strong><p>后续可以随时修改，不需要一次填写完整。</p></div>
          <div class="form-group"><label class="form-label" for="wizard-name">项目名称 <em>必填</em></label><input id="wizard-name" class="input" value="${meta.name === "未命名项目" ? "" : escapeHTML(meta.name)}" placeholder="例如：AI 辅助社区无障碍导航" required></div>
          <div class="form-group"><label class="form-label" for="wizard-desc">一句话介绍</label><textarea id="wizard-desc" class="textarea" placeholder="说明目标用户、使用场景和希望解决的问题">${meta.name === "未命名项目" ? "" : escapeHTML(meta.description)}</textarea></div>
          <fieldset class="wizard-fieldset"><legend>当前项目阶段 <em>必选</em></legend><div class="stage-choice-grid">${projectStages.map((stage, index) => `<label class="stage-choice"><input type="radio" name="wizard-stage" value="${escapeHTML(stage)}" ${meta.phase === stage || (!meta.phase && index === 0) ? "checked" : ""}><span><b>0${index + 1}</b><strong>${escapeHTML(stage)}</strong></span></label>`).join("")}</div></fieldset>
        </div>
        <div class="modal-body wizard-panel" data-wizard-panel="2" hidden>
          <div class="wizard-intro optional"><strong>比赛信息可以暂时留空</strong><p>填写后会显示在项目卡片和提交倒计时中，不影响创建项目。</p></div>
          <div class="form-group"><label class="form-label" for="wizard-competition">比赛名称 <span>选填</span></label><input id="wizard-competition" class="input" value="${escapeHTML(meta.competition?.name || "")}" placeholder="例如：科技创新项目挑战赛"></div>
          <div class="grid grid-2"><div class="form-group"><label class="form-label" for="wizard-direction">参赛方向 <span>选填</span></label><input id="wizard-direction" class="input" value="${escapeHTML(meta.competition?.direction || "")}" placeholder="例如：人工智能 / 社会创新"></div><div class="form-group"><label class="form-label" for="wizard-deadline">提交日期 <span>选填</span></label><input id="wizard-deadline" class="input" type="date" value="${escapeHTML(meta.competition?.deadline || "")}"></div></div>
        </div>
        <div class="modal-body wizard-panel" data-wizard-panel="3" hidden>
          <div class="wizard-intro"><strong>选择团队当前需要完成的任务</strong><p>可以多选，再指定一个最优先任务；项目中心会据此推荐下一步。</p></div>
          <fieldset class="wizard-fieldset"><legend>当前任务 <em>至少选择一项</em></legend><div class="task-choice-grid">${projectTasks.map(task => `<label class="task-choice"><input type="checkbox" name="wizard-task" value="${escapeHTML(task)}" ${selectedTasks.includes(task) ? "checked" : ""}><span>${escapeHTML(task)}</span></label>`).join("")}</div></fieldset>
          <div class="form-group priority-select"><label class="form-label" for="wizard-priority">当前最优先任务</label><select id="wizard-priority" class="select" data-current="${escapeHTML(priorityTask)}"></select><small>完成后可以在编辑项目中重新排序。</small></div>
        </div>
        <div class="modal-footer wizard-footer"><button class="button button-secondary" type="button" data-wizard-back hidden>上一步</button><span class="wizard-spacer"></span><button class="button button-secondary" type="button" data-close-modal>取消</button><button class="button button-primary" type="button" data-wizard-next>下一步</button><button class="button button-primary" type="submit" data-wizard-finish hidden>${editing ? "保存修改" : "创建项目"}</button></div>
      </form>
    </div>
  </div>`;

  let step = 1;
  const form = root.querySelector("#project-wizard-form");
  const back = root.querySelector("[data-wizard-back]");
  const next = root.querySelector("[data-wizard-next]");
  const finish = root.querySelector("[data-wizard-finish]");

  function updatePriorityOptions() {
    const selected = [...form.querySelectorAll('[name="wizard-task"]:checked')].map(input => input.value);
    const select = form.querySelector("#wizard-priority");
    const current = select.value || select.dataset.current;
    select.innerHTML = selected.length
      ? selected.map(task => `<option value="${escapeHTML(task)}" ${task === current ? "selected" : ""}>${escapeHTML(task)}</option>`).join("")
      : `<option value="">请先选择任务</option>`;
    select.disabled = !selected.length;
  }

  function showStep(target) {
    step = target;
    root.querySelectorAll("[data-wizard-panel]").forEach(panel => { panel.hidden = Number(panel.dataset.wizardPanel) !== step; });
    root.querySelectorAll("[data-wizard-dot]").forEach(dot => {
      const index = Number(dot.dataset.wizardDot);
      dot.classList.toggle("active", index <= step);
      if (index === step) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });
    back.hidden = step === 1;
    next.hidden = step === 3;
    finish.hidden = step !== 3;
    if (step === 3) updatePriorityOptions();
    const sectionTitle = root.querySelector(`[data-wizard-panel="${step}"] .wizard-intro strong`);
    sectionTitle.tabIndex = -1;
    sectionTitle.focus();
  }

  function validateStepOne() {
    const name = form.querySelector("#wizard-name");
    if (!name.value.trim()) {
      name.focus();
      showToast("请填写项目名称");
      return false;
    }
    if (!form.querySelector('[name="wizard-stage"]:checked')) return showToast("请选择当前项目阶段"), false;
    return true;
  }

  bindModalDismissal(root);
  next.addEventListener("click", () => { if (step === 1 && !validateStepOne()) return; showStep(step + 1); });
  back.addEventListener("click", () => showStep(step - 1));
  form.querySelectorAll('[name="wizard-task"]').forEach(input => input.addEventListener("change", updatePriorityOptions));
  form.querySelectorAll('[name="wizard-stage"]').forEach(input => input.addEventListener("change", () => {
    const checkedTasks = [...form.querySelectorAll('[name="wizard-task"]:checked')];
    const nextSuggestedTask = suggestedTaskForStage(input.value);
    if (checkedTasks.length === 1 && checkedTasks[0].value === lastSuggestedTask) {
      checkedTasks[0].checked = false;
      const nextTaskInput = [...form.querySelectorAll('[name="wizard-task"]')].find(taskInput => taskInput.value === nextSuggestedTask);
      if (nextTaskInput) nextTaskInput.checked = true;
    }
    lastSuggestedTask = nextSuggestedTask;
    updatePriorityOptions();
  }));
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!validateStepOne()) return showStep(1);
    const tasks = [...form.querySelectorAll('[name="wizard-task"]:checked')].map(input => input.value);
    if (!tasks.length) {
      form.querySelector('[name="wizard-task"]').focus();
      return showToast("请至少选择一项当前任务");
    }
    const phase = form.querySelector('[name="wizard-stage"]:checked').value;
    const now = Date.now();
    if (!editing) {
      state = initialState();
      currentSparkResult = null;
      currentMirrorResult = null;
    }
    state.project = {
      ...state.project,
      id: editing ? state.project.id : createProjectId(),
      name: form.querySelector("#wizard-name").value.trim(),
      description: form.querySelector("#wizard-desc").value.trim() || "尚未填写项目说明",
      stage: phase,
      phase,
      tasks,
      priorityTask: form.querySelector("#wizard-priority").value || tasks[0],
      competition: {
        name: form.querySelector("#wizard-competition").value.trim(),
        direction: form.querySelector("#wizard-direction").value.trim(),
        deadline: form.querySelector("#wizard-deadline").value
      },
      archived: false,
      createdAt: editing ? state.project.createdAt : now,
      updatedAt: now,
      progress: Math.max(Number(state.project.progress || 0), [10, 22, 38, 58, 76][projectStages.indexOf(phase)] || 10)
    };
    state.activePage = "workspace";
    saveState();
    dismissModal(false);
    showWorkspace();
    navigate("workspace");
    document.querySelector("#page-content").focus({ preventScroll: true });
    showToast(editing ? "项目信息已更新" : "科创项目已创建");
  });
  updatePriorityOptions();
  form.querySelector("#wizard-name")?.focus();
}

function openPersonaEditor(persona) {
  const editing = persona?.type === "自定义";
  const root = document.querySelector("#modal-root");
  const title = editing ? "编辑 Persona" : "创建 Persona";
  const fields = personaFields.map(field => {
    const value = escapeHTML(persona?.profile?.[field.key] || "");
    const attrs = `id="persona-${field.key}" name="${field.key}" maxlength="${field.max}" placeholder="${field.hint}"`;
    return `<div class="form-group"><label class="form-label" for="persona-${field.key}">${field.label}</label>
      ${field.multiline ? `<textarea class="textarea" ${attrs} rows="2">${value}</textarea>` : `<input class="input" ${attrs} value="${value}">`}</div>`;
  });
  root.innerHTML = `<div class="modal-backdrop" data-close-modal>
    <form class="modal persona-modal" role="dialog" aria-modal="true" aria-labelledby="persona-editor-title">
      <div class="modal-head"><h2 id="persona-editor-title">${title}</h2><button type="button" class="modal-close" data-close-modal aria-label="关闭">×</button></div>
      <div class="modal-body">
        <p class="persona-form-note">名称必填，其余按研究需要填写。请使用虚拟称呼和脱敏资料编号。</p>
        <div class="form-group"><label class="form-label" for="persona-name">画像名称 <small>必填</small></label>
          <input class="input" id="persona-name" name="name" required maxlength="80" value="${escapeHTML(persona?.name || "")}" placeholder="如：赶着上课的学生"></div>
        <div class="grid grid-2 persona-demographics">${fields.slice(0, 2).join("")}</div>
        ${fields.slice(2, 5).join("")}
        <details class="lab-optional"${persona?.profile?.basis || persona?.desc || persona?.traits?.length ? " open" : ""}>
          <summary>补充依据、说明和标签 <small>选填</small></summary>
          ${fields[5]}
          <div class="form-group"><label class="form-label" for="persona-desc">其他说明</label><textarea class="textarea" id="persona-desc" name="description" rows="2" maxlength="500" placeholder="如：只在遇到排期冲突时打开工具">${escapeHTML(persona?.desc || "")}</textarea></div>
          <div class="form-group"><label class="form-label" for="persona-traits">标签</label><input class="input" id="persona-traits" name="traits" maxlength="400" value="${escapeHTML((persona?.traits || []).join("，"))}" placeholder="多个标签用逗号分隔，如：通勤、移动端"></div>
        </details>
      </div>
      <div class="modal-footer"><button type="button" class="button button-secondary" data-close-modal>取消</button><button class="button button-primary" type="submit">保存画像</button></div>
    </form></div>`;
  bindModalDismissal(root);
  root.querySelector("form").addEventListener("submit", event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const read = key => String(values.get(key) || "").trim();
    const name = read("name");
    if (!name) {
      root.querySelector("#persona-name").focus();
      showToast("请填写画像名称");
      return;
    }
    const updated = {
      id: editing ? persona.id : createProjectId(),
      name, short: Array.from(name)[0], type: "自定义",
      color: persona?.color || "#5d7cbf",
      desc: read("description"),
      traits: read("traits").split(/[,，、]/).map(trait => trait.trim().slice(0, 80)).filter(Boolean).slice(0, 6),
      profile: Object.fromEntries(personaFields.map(field => [field.key, read(field.key)])),
    };
    state.personas = editing ? state.personas.map(item => item.id === updated.id ? updated : item) : [...state.personas, updated];
    saveState();
    dismissModal(false);
    renderPage();
    document.querySelector("[data-open-modal='persona']")?.focus({ preventScroll: true });
    showToast("Persona 画像已保存");
  });
  root.querySelector("#persona-name").focus();
}

function openModal(type) {
  if (type === "project") return openProjectWizard(true);
  if (type === "persona") return openPersonaEditor();
  const root = document.querySelector("#modal-root");
  const configs = {
    project: { title:state.project.name === "未命名项目" ? "创建第一个验证项目" : "编辑项目", body:`<div class="callout callout-info" style="margin-bottom:16px"><strong>只需先说明方向：</strong>后续可以在 Spark 中继续澄清需求，或直接在 Mirror 中上传已有材料。</div><div class="form-group"><label class="form-label" for="modal-name">项目名称</label><input id="modal-name" class="input" value="${state.project.name === "未命名项目" ? "" : escapeHTML(state.project.name)}" placeholder="例如：校园 AI 学习助手"></div><div class="form-group"><label class="form-label" for="modal-desc">一句话说明</label><textarea id="modal-desc" class="textarea" placeholder="目标用户、场景和希望解决的问题">${state.project.name === "未命名项目" ? "" : escapeHTML(state.project.description)}</textarea></div>`, save:state.project.name === "未命名项目" ? "创建项目" : "保存项目" },
    material: { title:"添加一份需求资料", body:`<div class="form-group"><label class="form-label" for="modal-name">资料标题</label><input id="modal-name" class="input" placeholder="例如：第 3 位用户访谈摘录"></div><div class="grid grid-2"><div class="form-group"><label class="form-label" for="modal-type">资料类型</label><select id="modal-type" class="select"><option>用户访谈</option><option>问卷</option><option>用户评价</option><option>客服记录</option><option>行业资料</option><option>竞品资料</option></select></div><div class="form-group"><label class="form-label" for="modal-source">来源</label><input id="modal-source" class="input" placeholder="用户上传 / 公开网页"></div></div><div class="form-group"><label class="form-label" for="modal-desc">原始内容或摘要</label><textarea id="modal-desc" class="textarea" placeholder="尽量保留原始表达，便于后续追溯"></textarea></div>`, save:"保存资料" }
  };
  const c = configs[type];
  root.innerHTML = `<div class="modal-backdrop" data-close-modal><div class="modal" role="dialog" aria-modal="true" aria-label="${c.title}"><div class="modal-head"><h2>${c.title}</h2><button class="modal-close" data-close-modal>×</button></div><div class="modal-body">${c.body}</div><div class="modal-footer"><button class="button button-secondary" data-close-modal>取消</button><button class="button button-primary" data-save-modal="${type}">${c.save}</button></div></div></div>`;
  bindModalDismissal(root);
  root.querySelector("[data-save-modal]").addEventListener("click",()=>saveModal(type));
  root.querySelector("#modal-name")?.focus();
}

function saveModal(type) {
  const root = document.querySelector("#modal-root");
  const name = root.querySelector("#modal-name")?.value.trim();
  const desc = root.querySelector("#modal-desc")?.value.trim();
  if (!name) { showToast("请先填写名称"); return; }
  if (type === "project") {
    state.project.name = name; state.project.description = desc || "尚未填写项目说明"; state.project.stage = "探索期"; state.project.progress = Math.max(state.project.progress,20);
  } else {
    const materialType = root.querySelector("#modal-type").value;
    state.materials.unshift({ id:createProjectId(),title:name,type:materialType,source:root.querySelector("#modal-source").value.trim()||"用户录入",content:desc||"未填写内容摘要",createdAt:Date.now(),icon:materialType[0] });
    state.project.progress = Math.max(state.project.progress,35);
  }
  saveState(); dismissModal(false); renderPage(); showToast("已保存到本地演示项目");
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

function useMirrorPlan(id) {
  const run = state.mirrorRuns.find(item => item.id === id);
  if (!run) return;
  state.mirrorValidationRunId = id;
  const project = getStudentProject();
  const updates = {};
  if (run.task && !hasStudentFields(project, "testTask")) updates.testTask = run.taskPrompt || run.task;
  if (run.successCriteria && !hasStudentFields(project, "successMetric")) updates.successMetric = run.successCriteria;
  if (Object.keys(updates).length) state.studentProject = { ...state.studentProject, ...updates };
  saveState();
  studentActiveView = "validation";
  navigate("student");
  document.querySelector(".linked-mirror-plan h2")?.focus();
  showToast("Mirror 测试计划已关联到真人测试");
}

function downloadReport(id) {
  const report = state.reports.find(r=>r.id===id);
  if (!report) return;
  const data = report.kind === "Spark" ? normalizeSparkRun(report.data) : normalizeMirrorRun(report.data);
  let body = `# ${report.title}\n\n`;
  body += `> 研究边界：${report.provider === "qwen" ? `由千问 ${report.model || ""} 生成，内容属于 AI 推测与待验证假设` : "历史演示内容"}。只有可回溯资料和真人测试记录可以作为研究证据。\n\n`;
  body += `- 报告类型：${report.kind}\n- 生成时间：${formatReportTime(report.createdAt)}\n- 生成方式：${report.provider === "qwen" ? `千问 ${report.model || ""}` : "历史演示记录"}\n${data.responseId ? `- 生成记录 ID：${data.responseId}\n` : ""}\n`;
  if (data.summary) body += `## 执行摘要\n\n${data.summary}\n\n`;
  const inputFields = report.kind === "Spark"
    ? [["目标用户与使用场景", data.scene], ["研究问题", data.direction], ["现有做法", data.currentApproach], ["候选方案", data.concept]]
    : [["测试任务", data.task], ["完成标准", data.successCriteria], ["原型版本", data.version],
      ["任务起点", data.start], ["测试条件", data.context], ["关联 Spark 假设", data.sparkHypothesis?.label],
      ["读给参与者的任务", data.taskPrompt], ["原型操作步骤", data.material],
      ["原型链接", data.reference], ["附件名称", data.fileName]];
  body += inputFields.filter(([, value]) => value).map(([label, value]) => `## ${label}\n\n${value}\n\n`).join("");
  const personas = data.personas || [];
  if (personas.length) body += `## 本轮 Persona\n\n${personas.map(persona => {
    const fields = personaFields.filter(field => persona.profile?.[field.key]).map(field => `  - ${field.label}：${persona.profile[field.key]}`);
    return [`- **${persona.name}**`, ...fields].join("\n");
  }).join("\n")}\n\n`;
  if (data.comparison) {
    const labels = report.kind === "Spark" ? ["共同需求", "人群分歧"] : ["共同卡点", "操作方式差异"];
    body += `## 人群比较\n\n- ${labels[0]}：${data.comparison.shared}\n- ${labels[1]}：${data.comparison.differences}\n\n`;
  }
  if (report.kind === "Spark") {
    if (data.dialogue?.length) body += `## AI Persona 视角\n\n${data.dialogue.map(item => [
      `- **${item.name}**：${item.text}`,
      item.goal && `  - 本轮目标：${item.goal}`,
      item.rationale && `  - 推演依据：${item.rationale}`,
    ].filter(Boolean).join("\n")).join("\n")}\n\n`;
    body += `## 待验证假设\n\n${(data.insights || []).map((item, index) => {
      const people = reportPersonaNames(item.personaIds, personas);
      return [`- **H${index + 1} ${item.title}**（${item.level}优先级）`, `  ${item.detail}`,
        people && `  - 适用人群：${people}`, item.condition && `  - 触发条件：${item.condition}`,
        `  - 资料关联：${item.evidenceIds?.length ? item.evidenceIds.join("、") : "待补充"}`].filter(Boolean).join("\n");
    }).join("\n") || "本轮没有生成假设。"}\n\n`;
    body += `## 来源记录\n\n${(data.evidence || []).map(item=>`- **${item.id} ${item.title}**（${item.status}）\n  ${item.quote}\n  来源：${item.source}`).join("\n") || "本轮没有可追溯资料。"}\n\n`;
    if (data.evidenceGaps?.length) body += `## 证据缺口\n\n${data.evidenceGaps.map(item => `- ${item}`).join("\n")}\n\n`;
    if (data.validationPlan?.length) body += `## 下一步验证计划\n\n${data.validationPlan.map((item,index) => `${index + 1}. **${item.objective}**\n   - 执行方法：${item.method}\n   - 支持信号：${item.successSignal}${item.reviseSignal ? `\n   - 何时调整判断：${item.reviseSignal}` : ""}`).join("\n")}\n\n`;
  } else {
    const run = data;
    if (run.path.length) {
      body += `## 按原型步骤走查\n\n${run.path.map((step, index) => `${index + 1}. ${step.text}`).join("\n")}\n\n`;
    }
    if (run.metrics.length) {
      body += `## 真人测试观察指标\n\n${run.metrics.map(item => `- **${item.name}**\n  - 记录方式：${item.howToRecord}\n  - 成功信号：${item.successSignal}`).join("\n")}\n\n`;
    } else {
      body += "## 真人测试记录项\n\n- 是否达到完成标准\n- 耗时\n- 停顿、错误或求助出现在哪一步\n- 用户如何恢复或放弃\n\n";
    }
    if (Array.isArray(run.coverage)) {
      body += `## 检查范围\n\n${run.coverage.map(item => `- ${item.name}（${item.status}）\n  ${item.followUp}`).join("\n")}\n\n`;
    } else if (run.scores.length) {
      body += `## 历史示例评分\n\n${run.scores.map(score => `- ${score.name}：${score.score == null ? "暂不评分" : `${score.score}/${score.max}`}`).join("\n")}\n\n`;
    }
    if (run.issues?.length) {
      body += `## 待验证问题\n\n${run.issues.map(issue => {
        const people = reportPersonaNames(issue.personaIds, personas);
        return [`- **${issue.title}**（${issue.level}优先级 · ${issue.dimension}）`, `  ${issue.detail}`,
          issue.step && `  - 涉及步骤：${issue.step}`, people && `  - 可能受影响：${people}`,
          issue.improvement && `  - 建议改法：${issue.improvement}`, issue.testMethod && `  - 验证方法：${issue.testMethod}`].filter(Boolean).join("\n");
      }).join("\n")}\n\n`;
    }
    if (run.personaChecks?.length) {
      body += `## 本轮人群操作路径\n\n${run.personaChecks.map(check => [
        `- **${check.name}** · ${check.concern}`,
        check.path && `  - 预演路径：${check.path.length ? check.path.map(step => `步骤 ${step}`).join(" → ") : "待确认"}`,
        check.rationale && `  - 路径依据：${check.rationale}`,
        check.recovery && `  - 遇阻后的处理：${check.recovery}`,
        `  - 走查时观察：${check.observe}`,
      ].filter(Boolean).join("\n")).join("\n")}\n`;
    }
    if (run.facilitatorNotes?.length) body += `\n## 主持人提示\n\n${run.facilitatorNotes.map(note => `- ${note}`).join("\n")}\n`;
  }
  body += `\n---\n\n导出自 PersonaLab。请在正式结论中补充参与者信息、研究日期、原文或观察记录，并保留去标识化处理说明。\n`;
  const blob = new Blob([body],{type:"text/markdown;charset=utf-8"});
  const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${report.title.replace(/[\\/:*?"<>|]/g,"-")}.md`; a.click(); URL.revokeObjectURL(url); showToast("报告已导出");
}

document.addEventListener("click", e => {
  const trigger = e.target.closest("[data-action]");
  const action = trigger?.dataset.action;
  if (!action) return;
  if (action === "enter-sample") {
    const view = trigger.dataset.samplePage;
    studentActiveView = view === "test" ? "validation" : "overview";
    enterDemo("sample", ["spark", "mirror", "personas"].includes(view) ? view : "student");
    if (view === "personas") openModal("persona");
    if (view === "test") focusWorkbenchSection(document.querySelector("#workbench-live-test h2"));
  }
  if (action === "enter-empty") openProjectWizard();
  if (action === "resume-demo") enterDemo("resume");
  if (action === "show-landing") showLanding();
  if (action === "use-mirror-plan") useMirrorPlan(e.target.closest("[data-mirror-run]").dataset.mirrorRun);
  if (action === "export-mirror-plan") downloadReport(e.target.closest("[data-mirror-run]").dataset.mirrorRun);
  if (action === "toggle-menu") {
    const open = document.querySelector(".student-sidebar").classList.contains("open");
    setMenuOpen(!open, open);
  }
  if (action === "reset-demo") {
    if (confirm(`重置“${state.project.name}”的资料、Persona 和验证记录？其他项目不会受到影响。`)) {
      const oldMaterials = state.materials;
      const meta = { ...state.project, progress: 0, updatedAt: Date.now() };
      state = initialState(meta);
      currentSparkResult = null;
      currentMirrorResult = null;
      saveState();
      releaseEvidenceFiles(oldMaterials).catch(() => showToast("项目已重置，浏览器暂未清理项目原件。"));
      navigate("workspace");
      showToast("当前项目记录已重置");
    }
  }
  if (action === "show-help") showToast("先建立项目，再进入 Spark 或 Mirror，勾选本轮 Persona 并运行。");
});

document.addEventListener("keydown", event => {
  const modal = document.querySelector("#modal-root .modal");
  if (event.key === "Escape") {
    if (modal) dismissModal();
    else if (document.querySelector(".student-sidebar.open")) setMenuOpen(false, true);
    return;
  }
  if (event.key !== "Tab" || !modal) return;
  const controls = [...modal.querySelectorAll('button, input, textarea, select, a[href]')]
    .filter(element => !element.disabled && element.getClientRects().length);
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.querySelectorAll("[data-nav]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); navigate(el.dataset.nav); }));
syncResumeButton();
const homeAnchor = document.getElementById(location.hash.slice(1));
const directHome = new URLSearchParams(location.search).get("view") === "home" || document.querySelector("#landing").contains(homeAnchor);
if (projectLibrary.length && !directHome) {
  enterDemo("resume", "workspace");
}

