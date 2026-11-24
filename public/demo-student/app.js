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
  return { ...run, personas: run.personas || [], sources: run.sources || ["旧版演示记录"], evidence: run.evidence || [] };
}

function normalizeMirrorRun(run) {
  return {
    ...run,
    personas: run.personas || [],
    scores: run.scores || [],
    path: run.path || []
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
    <p id="${tool}-persona-hint">至少勾选一类人群。${selectedCount ? "已带入当前记录的人选，可以重新勾选。" : "可以同时勾选多类。"}</p>
    <div class="persona-picks">${state.personas.map(persona => `
      <label class="run-persona-option">
        <input type="checkbox" name="${tool}Persona" value="${escapeHTML(persona.id)}"${previousIds.has(persona.id) ? " checked" : ""}>
        <span>${escapeHTML(persona.name)}${persona.type === "自定义" ? '<small>项目自定义</small>' : ""}</span>
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
  return selected;
}

function renderRunParticipants(personas = []) {
  if (!personas.length) return "";
  return `<ul class="run-participants" aria-label="本轮 Persona">${personas.map(persona =>
    `<li>${escapeHTML(persona.name)}</li>`).join("")}</ul>`;
}

function renderSpark() {
  const blueprint = getStudentProject();
  const scene = currentSparkResult?.scene ?? [blueprint.audience, blueprint.scenario, blueprint.problem].filter(Boolean).join("\n");
  const direction = currentSparkResult?.direction ?? (state.isSample ? sampleSparkQuestion : "");
  const currentApproach = currentSparkResult?.currentApproach ?? blueprint.currentApproach ?? "";
  const sources = currentSparkResult?.sources ?? (state.materials.some(hasMaterialExcerpt) ? ["用户资料"] : []);
  return `
    <div class="page-heading"><div><p class="eyebrow" style="color:var(--orange)">SPARK / 播种</p><h1>把项目痛点写成可验证的假设</h1><p>选择本轮要看的用户视角，梳理需求假设和下一轮调研方向。</p></div><span class="tag tag-orange">需求探索</span></div>
    ${renderLabProject()}
    <div class="callout callout-info" style="margin-bottom:16px">根据你填写的场景和选中的人群生成本地推演与调研建议。真实需求需要结合访谈、观察或其他资料核对。</div>
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
            <div class="form-group"><span class="form-label">参考资料</span><div class="choice-grid">
              <span class="choice"><input id="source-own" type="checkbox" name="sources" value="用户资料"${sources.includes("用户资料") ? " checked" : ""}><label for="source-own"><span class="choice-mark">✓</span><span><strong>本项目资料库</strong><small>随报告保存最新的三条有摘要的资料</small></span></label></span>
              <span class="choice"><input id="source-web" type="checkbox" name="sources" value="公开资料"${sources.includes("公开资料") ? " checked" : ""}><label for="source-web"><span class="choice-mark">✓</span><span><strong>添加公开资料检索任务</strong><small>保存一条待检索记录</small></span></label></span>
            </div></div>
            <div class="form-group"><label class="form-label" for="spark-title">记录名称</label><input class="input" id="spark-title" name="title" value="${escapeHTML(currentSparkResult?.title || "")}" placeholder="${escapeHTML(state.project.name)}"></div>
          </details>
          <div class="submit-row"><button class="button button-purple" type="submit">运行需求推演</button><small>本地规则推演</small></div>
        </div>
      </form>
      <section id="spark-result" class="card lab-panel">${currentSparkResult ? sparkResultHTML(currentSparkResult) : sparkEmptyHTML()}</section>
    </div>`;
}

function sparkEmptyHTML() {
  return `<div class="empty-state"><div><div class="empty-illustration">✦</div><h3>等待开始本轮探索</h3><p>填写场景和想弄清的问题，再勾选本轮 Persona。</p></div></div>`;
}

function sparkResultHTML(result) {
  const sourceSummary = result.sources?.length ? result.sources.join(" + ") : "未勾选参考资料";
  return `<div class="result-shell">
    <div class="result-summary"><div class="result-summary-top"><div><p class="eyebrow">SPARK RESULT · 模拟探索</p><h2>${escapeHTML(result.title)} · 需求探索摘要</h2><p>${escapeHTML(result.direction)}</p><p>资料范围为 ${escapeHTML(sourceSummary)}，保留 ${result.evidence?.length || 0} 条来源记录。</p>${renderRunParticipants(result.personas)}</div><span class="tag tag-green">已记录</span></div></div>
    <div class="result-tabs"><button class="result-tab active" data-spark-tab="dialogue">人群视角</button><button class="result-tab" data-spark-tab="insights">待验证假设</button><button class="result-tab" data-spark-tab="evidence">资料来源</button><button class="result-tab" data-spark-tab="concept">验证建议</button></div>
    <div id="spark-result-body" class="result-body">${sparkTabHTML(result,"dialogue")}</div>
  </div>`;
}

function sparkTabHTML(result, tab) {
  if (tab === "dialogue") return `<div class="roundtable">${result.dialogue.map(d => `<div class="speech"><span class="speech-avatar" style="background:${d.color}">${escapeHTML(d.short)}</span><div class="speech-bubble"><strong>${escapeHTML(d.name)}</strong><span class="source-ref">Persona 推演</span><p>${escapeHTML(d.text)}</p></div></div>`).join("")}</div>`;
  if (tab === "insights") return `<div class="insight-list">${result.insights.map(i => `<article class="insight"><div class="insight-top"><h4>${escapeHTML(i.title)} <span class="source-ref">${escapeHTML(i.source)}</span></h4><span class="priority ${i.level === "高" ? "priority-high" : "priority-mid"}">${i.level}优先级</span></div><p>${escapeHTML(i.detail)}</p>${i.evidenceIds?.length ? `<div class="evidence-links">依据：${i.evidenceIds.map(id=>`<span>${escapeHTML(id)}</span>`).join("")}</div>` : ""}</article>`).join("")}</div>`;
  if (tab === "evidence") return `<div class="evidence-list">${(result.evidence || []).map(item=>`<article class="evidence-card"><div class="evidence-card-top"><span class="evidence-id">${escapeHTML(item.id)}</span><span class="tag tag-gray">${escapeHTML(item.status)}</span></div><h4>${escapeHTML(item.title)}</h4><blockquote>“${escapeHTML(item.quote)}”</blockquote><p>${escapeHTML(item.kind)} · 来源 ${escapeHTML(item.source)}${item.materialId ? ` · 资料编号 ${escapeHTML(item.materialId)}` : ""}</p></article>`).join("") || `<div class="callout callout-warning">本轮只有 Persona 推演。请记录需要补充的资料来源。</div>`}</div>`;
  const steps = result.isSample
    ? ["做出从新增作业到查看冲突的最短流程", "对比普通日历和带解释的重排建议", "观察用户是否理解理由并能撤回操作", "记录每次重排用时、出错步骤和匿名反馈"]
    : ["挑选一条最关键的用户任务", "写清当前做法与新原型的区别", "邀请目标用户完成相同任务并记录结果", "将实际观察和预期比较，决定下一轮改动"];
  return `${result.scene ? `<div class="callout callout-info"><strong>使用场景</strong><p>${escapeHTML(result.scene)}</p></div>` : ""}<div class="section-title"><h2>下一轮验证</h2></div><div class="insight-list">${steps.map(step=>`<article class="insight"><div class="insight-top"><h4>${step}</h4><span class="tag tag-purple">待执行</span></div></article>`).join("")}</div>`;
}

function runSpark(form) {
  const data = new FormData(form);
  const selected = selectedRunPersonas("spark", form);
  if (!selected.length) return;
  const sources = data.getAll("sources").map(String);
  const title = String(data.get("title") || "").trim() || state.project.name;
  const scene = String(data.get("scene") || "").trim();
  const direction = String(data.get("direction") || "").trim();
  const currentApproach = String(data.get("currentApproach") || "").trim();
  if (!scene || !direction) {
    form.querySelector(scene ? "#spark-direction" : "#spark-scene").focus();
    showToast("请填写目标用户与使用场景，以及想弄清的问题");
    return;
  }
  const evidence = [];
  if (sources.includes("用户资料")) {
    const referenceMaterials = state.materials.filter(hasMaterialExcerpt).slice(0, 3);
    if (referenceMaterials.length) {
      referenceMaterials.forEach((material, index) => evidence.push({
        id: `E-${String(index + 1).padStart(2,"0")}`,
        title: material.title,
        kind: material.type,
        quote: material.content,
        source: material.source,
         materialId: material.id,
         status: material.isSample ? "内置示例资料" : "用户录入 · 待核对"
      }));
    } else {
      evidence.push({ id:"G-01", title:"用户资料缺口", kind:"资料状态", quote:"本项目暂无可引用的资料摘要。可在证据库录入摘录，或给导入的文件补充摘要。", source:"系统检查", status:"待补充资料" });
    }
  }
  if (sources.includes("公开资料")) evidence.push({
    id:"W-01", title:"公开资料检索方向", kind:"检索任务", quote:direction, source:"本轮填写的探索问题", status:"待检索"
  });
  const texts = {
    p1: "第一次使用时，我需要能找到核心任务入口，并看懂做完会得到什么。",
    p2: "我想知道相对现在的做法，这个方案能省下哪几步。",
    p3: "如果任务需要提供个人信息，我会先确认用途和删除方式。",
    p4: "如果操作结果和预期不同，我需要清楚的提示和恢复方法。",
    p5: "我需要用键盘完成任务，并通过文字识别关键状态。",
    p6: "我会先和手头的替代方案比较，确认这个方案值得投入时间。"
  };
  const isSample = Boolean(state.isSample && direction === sampleSparkQuestion);
  const hypotheses = isSample
    ? [
      ["冲突说明能否帮助用户更快重排任务？", "用相同的临时作业情境，对比普通日历与可解释的任务调整原型，记录完成时间和是否找到正确的冲突。", "高"],
      ["用户能否判断何时接受调整建议？", "邀请目标用户说出接受或拒绝建议的理由，并观察他们能否撤回一次调整。", "中"]
    ]
    : [
      ["目标用户是否会反复遇到这个问题？", `围绕「${direction}」，请用户回忆最近一次遇到类似情况的经过，并记录卡点及其影响。`, "高"],
      ["现有做法哪里最需要改进？", currentApproach
        ? `请用户演示「${currentApproach}」，记录在哪一步停顿、求助或换用其他方法。`
        : "请用户演示现在的做法，记录在哪一步停顿、求助或换用其他方法。", "高"],
      ["用户是否理解方案的结果并保有控制？", "观察用户能否解释结果、修改建议及处理一次出错情境。", "中"]
    ];
  const result = {
    id: `s${Date.now()}`, title, scene, direction, currentApproach, personas: selected, sources, evidence, createdAt: Date.now(), date: "刚刚", isSample,
    dialogue: selected.map(persona => ({
      ...persona,
      text: texts[persona.id] || `根据画像描述「${persona.desc}」，访谈这一人群最近一次遇到的困难和采用的办法。`
    })),
    insights: hypotheses.map(([title, detail, level]) => ({ title, detail, source: "模板 · 待验证", level, evidenceIds: [] }))
  };
  currentSparkResult = result;
  state.project.stage = "需求探索";
  state.project.progress = Math.max(state.project.progress, 55);
  state.sparkRuns.unshift(result);
  state.reports.unshift({ id: result.id, kind: "Spark", title: `${title} · 需求探索报告`, desc: "Persona 模拟讨论、资料来源与待验证假设", date: "刚刚", createdAt: result.createdAt, data: result });
  saveState();
  document.querySelector("#spark-result").innerHTML = sparkResultHTML(result);
  bindResultTabs();
  showToast("Spark 模拟完成，报告已保存");
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
  return `
    <div class="page-heading"><div><p class="eyebrow" style="color:var(--green)">MIRROR / 预演</p><h1>把原型改进点变成测试任务</h1><p>写下原型的关键步骤，记录要让目标用户完成的动作，演练答辩时的操作路径。</p></div><span class="tag tag-green">原型预演</span></div>
    ${renderLabProject()}
    <div class="callout callout-info" style="margin-bottom:16px">Mirror 把你填写的步骤整理成测试计划，并按所选人群给出观察点。文字线索可用于准备测试，界面表现需要现场走查。</div>
    <div class="lab-layout">
      <form id="mirror-form" class="card lab-panel">
        <div class="panel-head"><h2>配置本轮原型预演</h2></div>
        <div class="panel-body">
          <div class="form-group"><label class="form-label" for="mirror-task">希望用户完成什么任务？ <small>必填</small></label><textarea class="textarea" id="mirror-task" name="task" rows="2" required placeholder="例如：从首页找到电梯并确认无障碍路线。">${escapeHTML(task)}</textarea></div>
          <div class="form-group"><label class="form-label" for="mirror-success">怎样算完成任务？ <small>必填</small></label><textarea class="textarea" id="mirror-success" name="successCriteria" rows="2" required placeholder="例如：用户能确认电梯位置，并说出抵达二层的路线。">${escapeHTML(successCriteria)}</textarea></div>
          <div class="form-group"><label class="form-label" for="mirror-link">原型的操作步骤 <small>必填</small></label><textarea class="textarea" id="mirror-link" name="material" required aria-describedby="mirror-steps-hint" placeholder="从哪个页面开始？用户要点什么？系统会显示什么反馈？">${escapeHTML(description)}</textarea><p class="hint" id="mirror-steps-hint">每行写一个动作。Mirror 会按顺序整理成走查清单。</p></div>
          ${personaPicker("mirror", currentMirrorResult)}
          <details class="lab-optional">
            <summary>添加原型链接或附件 <small>选填</small></summary>
            <div class="form-group"><label class="form-label" for="material-type">原型材料类型</label><select class="select" id="material-type" name="materialType">${materialTypes.map(type => `<option${type === currentMirrorResult?.materialType ? " selected" : ""}>${type}</option>`).join("")}</select></div>
            <div class="form-group"><label class="form-label" for="mirror-reference">原型链接</label><input class="input" id="mirror-reference" name="reference" type="url" value="${escapeHTML(currentMirrorResult?.reference || "")}" placeholder="https://"></div>
            <div class="form-group"><label class="upload-box" for="mirror-file"><input id="mirror-file" name="file" type="file" accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,video/*"><span><span class="upload-icon" aria-hidden="true">⇧</span><strong id="upload-label">选取本地文件</strong><small>只记录文件名</small></span></label></div>
            <div class="form-group"><label class="form-label" for="mirror-title">记录名称</label><input class="input" id="mirror-title" name="title" value="${escapeHTML(currentMirrorResult?.title || "")}" placeholder="${escapeHTML(state.project.name)}"></div>
          </details>
          <div class="submit-row"><button class="button button-green" type="submit">开始体验预演</button><small>本地规则预演</small></div>
        </div>
      </form>
      <section id="mirror-result" class="card lab-panel">${currentMirrorResult ? mirrorResultHTML(currentMirrorResult) : mirrorEmptyHTML()}</section>
    </div>`;
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
  return description.split(/\r?\n|[。；;]|→/)
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
  const hasCoverage = Array.isArray(result.coverage);
  const reference = mirrorReferenceURL(result.reference);
  const linkedToValidation = state.mirrorValidationRunId === result.id;
  return `<div class="result-shell">
    <header class="result-summary mirror-plan-header">
      <p class="eyebrow">MIRROR · 原型预演</p>
      <h2>${escapeHTML(result.title)}</h2>
      <p>${escapeHTML(result.task)}</p>
      ${renderRunParticipants(result.personas)}
      ${reference ? `<a class="mirror-reference" href="${escapeHTML(reference)}" target="_blank" rel="noopener noreferrer">打开原型链接 ↗</a>` : ""}
    </header>
    <div class="mirror-plan-actions">
      <button class="button button-primary" type="button" data-action="use-mirror-plan" data-mirror-run="${escapeHTML(result.id)}">${linkedToValidation ? "前往真人测试" : "用于真人验证"}</button>
      <button class="button button-secondary" type="button" data-action="export-mirror-plan" data-mirror-run="${escapeHTML(result.id)}">导出测试计划</button>
    </div>
    <div class="result-tabs">
      <button class="result-tab active" type="button" data-mirror-tab="path" aria-pressed="true">测试计划</button>
      <button class="result-tab" type="button" data-mirror-tab="issues" aria-pressed="false">人群观察点</button>
      <button class="result-tab" type="button" data-mirror-tab="scores" aria-pressed="false">${hasCoverage ? "检查范围" : "历史示例评分"}</button>
    </div>
    <div id="mirror-result-body" class="result-body">${mirrorTabHTML(result, "path")}</div>
  </div>`;
}

function renderMirrorTestPlan(result) {
  const steps = result.path || [];
  return `<section class="mirror-test-plan">
    ${result.successCriteria ? `<div class="mirror-criterion"><h3>完成标准</h3><p>${escapeHTML(result.successCriteria)}</p></div>` : ""}
    <h3>按原型步骤走查</h3>
    ${steps.length ? `<ol class="mirror-test-steps">${steps.map(step => `<li>${escapeHTML(step.text)}</li>`).join("")}</ol>`
      : "<p>这条历史记录没有保存走查步骤。</p>"}
    <h3>真人测试时记录</h3>
    <p>用相同起点和任务说明。观察参与者是否达到完成标准，记录耗时、卡住的位置、求助或出错，以及如何恢复。</p>
  </section>`;
}

function mirrorTabHTML(result, tab) {
  if (tab === "issues") {
    const checks = (result.personaChecks || []).map(check => `<article class="insight">
      <h4>${escapeHTML(check.name)}</h4>
      <p>${escapeHTML(check.concern)}</p>
      <p><strong>走查时观察</strong> ${escapeHTML(check.observe)}</p>
    </article>`).join("");
    return `${checks ? `<section class="mirror-persona-checks">
      <h3>本轮人群观察点</h3><div class="insight-list">${checks}</div>
    </section>` : ""}<div class="issue-list">${result.issues.map((issue,i)=>`<article class="issue-card"><span class="issue-index">${i+1}</span><div><h4>${escapeHTML(issue.title)}</h4><p>${escapeHTML(issue.detail)}</p><div class="issue-meta"><span class="tag ${issue.level === "高" ? "tag-red" : "tag-orange"}">${issue.level}优先级</span><span class="tag tag-gray">${escapeHTML(issue.dimension)}</span></div></div></article>`).join("")}</div>`;
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

function runMirror(form) {
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
  const issues = [
    { title:"用户能否独立找到入口并完成任务？", detail:"让目标用户从原型首页开始，记录完成时间、求助次数和停顿位置。", level:"高", dimension:"任务清晰度" },
    { title:"用户能否理解结果并处理一次错误？", detail:"设置一次输入错误或误操作，观察用户能否理解反馈、修改或撤回。", level:"高", dimension:"错误预防与恢复" },
    { title:"数据用途和授权范围是否清楚？", detail:"如果任务涉及个人数据，请用户说明产品需要读取什么、为什么读取，以及如何拒绝或删除。", level:"中", dimension:"信任与隐私" }
  ];
  const personaChecks = selected.map(persona => ({
    name: persona.name,
    ...(personaPainPrompts[persona.id] || {
      concern: persona.desc,
      observe: "围绕画像中的主要困难，记录这类用户在本轮任务的卡点、求助与恢复方式。"
    })
  }));
  const result = {
    id: `m${Date.now()}`,
    title, task, successCriteria, materialType, material, reference, fileName,
    personas: selected,
    coverage: mirrorCoverage(description),
    issues,
    personaChecks,
    path: steps.map(text => ({ text, status: "待观察" })),
    createdAt: Date.now(),
    date: "刚刚"
  };
  currentMirrorResult = result;
  state.project.stage = "体验验证";
  state.project.progress = Math.max(state.project.progress,72);
  state.mirrorRuns.unshift(result);
  state.reports.unshift({
    id: result.id,
    kind: "Mirror",
    title: `${result.title} · 原型预演报告`,
    desc: `${result.path.length} 个原型步骤、${selected.length} 类人群的观察点和测试计划`,
    date: "刚刚",
    createdAt: result.createdAt,
    data: result
  });
  saveState();
  document.querySelector("#mirror-result").innerHTML = mirrorResultHTML(result);
  bindResultTabs();
  showToast("Mirror 预演完成，报告已保存");
}

function renderPersonas() {
  return `
    <div class="page-heading"><div><p class="eyebrow">PERSONA LIBRARY</p><h1>Persona 用户库</h1><p>查看预设人群，或为当前项目添加自定义人群。每轮参与的人群在 Spark 或 Mirror 中勾选。</p></div><div class="heading-actions"><button class="button button-primary" data-open-modal="persona">＋ 创建 Persona</button></div></div>
    <div class="grid grid-3">${state.personas.map(p=>`<article class="card persona-card"><div class="persona-cover"><span class="persona-large-avatar" style="background:${p.color}">${escapeHTML(p.short)}</span><span class="tag ${p.type === "平台预设" ? "tag-purple" : "tag-green"}">${escapeHTML(p.type)}</span></div><div class="persona-content"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.desc)}</p><div class="trait-list">${p.traits.map(t=>`<span class="trait">${escapeHTML(t)}</span>`).join("")}</div></div></article>`).join("")}</div>`;
}

function renderMaterials() {
  return `
    <div class="page-heading"><div><h1>项目证据库</h1><p>${escapeHTML(state.project.name)} · 管理访谈、问卷、公开资料和本地文件。</p></div><div class="heading-actions"><button class="button button-primary" data-open-modal="material">＋ 录入资料</button></div></div>
    <section class="card card-pad workbench-evidence-panel" aria-label="本项目资料">
      ${renderEvidenceImport()}
      ${renderEvidenceList(state.materials)}
    </section>`;
}

function renderReports() {
  return `
    <div class="page-heading"><div><p class="eyebrow">REPORTS</p><h1>验证报告</h1><p>集中查看每次 Spark 需求探索和 Mirror 体验预演的结论、来源类型与优先级。</p></div></div>
    <div class="callout callout-warning" style="margin-bottom:18px"><strong>结论边界：</strong>Demo 中的报告是展示用示例。正式版会区分“原始资料事实、Persona 推演、模型推断与待验证假设”，避免把模拟结果当成真实用户结论。</div>
    ${state.reports.length ? `<div class="grid grid-3">${state.reports.map(r=>`<article class="card report-card"><div class="report-card-top"><span class="report-icon" style="${r.kind==="Mirror"?"color:var(--green);background:var(--green-soft)":""}">${r.kind==="Spark"?"✦":"◫"}</span><span class="tag ${r.kind==="Spark"?"tag-orange":"tag-green"}">${r.kind}</span></div><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.desc)}</p><div class="report-footer"><span>${formatRelativeTime(r.createdAt)} · 本地演示</span><span><button class="link-button" data-view-report="${r.id}">查看</button><button class="link-button" data-download-report="${r.id}">导出 ↓</button></span></div></article>`).join("")}</div>` : `<article class="card empty-state"><div><div class="empty-illustration">▥</div><h3>还没有验证报告</h3><p>完成一次 Spark 或 Mirror 后，报告会自动保存到这里，并支持导出为 Markdown 文档。</p><div style="display:flex;gap:8px;justify-content:center;margin-top:16px"><button class="button button-purple button-sm" data-go="spark">运行 Spark</button><button class="button button-green button-sm" data-go="mirror">运行 Mirror</button></div></div></article>`}`;
}

function bindPageEvents() {
  document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => navigate(el.dataset.go)));
  document.querySelectorAll("[data-open-modal]").forEach(el => el.addEventListener("click", () => openModal(el.dataset.openModal)));
  document.querySelectorAll("[data-open-project]").forEach(el => el.addEventListener("click", () => openProject(el.dataset.openProject, el.dataset.projectDestination)));
  document.querySelectorAll("[data-project-edit]").forEach(el => el.addEventListener("click", () => editProject(el.dataset.projectEdit)));
  document.querySelectorAll("[data-project-duplicate]").forEach(el => el.addEventListener("click", () => duplicateProject(el.dataset.projectDuplicate)));
  document.querySelectorAll("[data-project-archive]").forEach(el => el.addEventListener("click", () => archiveProject(el.dataset.projectArchive)));
  document.querySelectorAll("[data-project-restore]").forEach(el => el.addEventListener("click", () => restoreProject(el.dataset.projectRestore)));
  document.querySelectorAll("[data-project-delete]").forEach(el => el.addEventListener("click", () => deleteProject(el.dataset.projectDelete)));
  document.querySelector("#spark-form")?.addEventListener("submit", e => { e.preventDefault(); runSpark(e.currentTarget); });
  document.querySelector("#mirror-form")?.addEventListener("submit", e => { e.preventDefault(); runMirror(e.currentTarget); });
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

function openModal(type) {
  if (type === "project") return openProjectWizard(true);
  const root = document.querySelector("#modal-root");
  const configs = {
    project: { title:state.project.name === "未命名项目" ? "创建第一个验证项目" : "编辑项目", body:`<div class="callout callout-info" style="margin-bottom:16px"><strong>只需先说明方向：</strong>后续可以在 Spark 中继续澄清需求，或直接在 Mirror 中上传已有材料。</div><div class="form-group"><label class="form-label" for="modal-name">项目名称</label><input id="modal-name" class="input" value="${state.project.name === "未命名项目" ? "" : escapeHTML(state.project.name)}" placeholder="例如：校园 AI 学习助手"></div><div class="form-group"><label class="form-label" for="modal-desc">一句话说明</label><textarea id="modal-desc" class="textarea" placeholder="目标用户、场景和希望解决的问题">${state.project.name === "未命名项目" ? "" : escapeHTML(state.project.description)}</textarea></div>`, save:state.project.name === "未命名项目" ? "创建项目" : "保存项目" },
    persona: { title:"创建自定义 Persona", body:`<div class="form-group"><label class="form-label" for="modal-name">Persona 名称</label><input id="modal-name" class="input" placeholder="例如：通勤场景下的研究生"></div><div class="form-group"><label class="form-label" for="modal-desc">行为与需求说明</label><textarea id="modal-desc" class="textarea" placeholder="描述目标、情境、行为特点和主要顾虑"></textarea></div><div class="form-group"><label class="form-label" for="modal-traits">特征标签</label><input id="modal-traits" class="input" placeholder="用逗号分隔，如：时间紧张, 移动端, 重视效率"></div>`, save:"创建 Persona" },
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
  } else if (type === "persona") {
    const traits = root.querySelector("#modal-traits").value.split(/[,，]/).map(x=>x.trim()).filter(Boolean).slice(0,4);
    state.personas.push({ id:`p${Date.now()}`,name,short:name[0],color:"#5d7cbf",type:"自定义",desc:desc||"用户创建的自定义 Persona",traits:traits.length?traits:["自定义"] });
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
  if (run.task && !hasStudentFields(project, "testTask")) updates.testTask = run.task;
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
  let body = `# ${report.title}\n\n> PersonaLab 本地演示报告。内容为示例仿真，不代表真实用户研究结论。\n\n${report.desc}\n\n`;
  const inputFields = report.kind === "Spark"
    ? [["目标用户与使用场景", report.data.scene], ["想弄清的问题", report.data.direction], ["现有做法", report.data.currentApproach]]
    : [["测试任务", report.data.task], ["完成标准", report.data.successCriteria], ["原型操作步骤", report.data.material],
      ["原型链接", report.data.reference], ["附件名称", report.data.fileName]];
  body += inputFields.filter(([, value]) => value).map(([label, value]) => `## ${label}\n\n${value}\n\n`).join("");
  const names = (report.data.personas || []).map(persona => persona.name);
  if (names.length) body += `## 本轮 Persona\n\n${names.map(name => `- ${name}`).join("\n")}\n\n`;
  if (report.kind === "Spark") {
    body += `## 需求与机会\n\n${report.data.insights.map(i=>`- **${i.title}**（${i.level}优先级，来源类型：${i.source}）\n  ${i.detail}${i.evidenceIds?.length ? `\n  依据：${i.evidenceIds.join("、")}` : ""}`).join("\n")}\n\n## 来源记录\n\n${(report.data.evidence || []).map(item=>`- **${item.id} ${item.title}**（${item.status}）\n  ${item.quote}\n  来源：${item.source}`).join("\n") || "本轮没有可追溯资料。"}\n`;
  } else {
    const run = normalizeMirrorRun(report.data);
    if (run.path.length) {
      body += `## 按原型步骤走查\n\n${run.path.map((step, index) => `${index + 1}. ${step.text}`).join("\n")}\n\n`;
    }
    body += "## 真人测试记录项\n\n- 是否达到完成标准\n- 耗时\n- 停顿、错误或求助出现在哪一步\n- 用户如何恢复或放弃\n\n";
    if (Array.isArray(run.coverage)) {
      body += `## 检查范围\n\n${run.coverage.map(item => `- ${item.name}（${item.status}）\n  ${item.followUp}`).join("\n")}\n\n`;
    } else if (run.scores.length) {
      body += `## 历史示例评分\n\n${run.scores.map(score => `- ${score.name}：${score.score == null ? "暂不评分" : `${score.score}/${score.max}`}`).join("\n")}\n\n`;
    }
    if (run.issues?.length) {
      body += `## 主要问题\n\n${run.issues.map(issue => `- **${issue.title}**\n  ${issue.detail}`).join("\n")}\n`;
    }
    if (report.data.personaChecks?.length) {
      body += `\n## 本轮人群观察点\n\n${report.data.personaChecks.map(check =>
        `- ${check.name} · ${check.concern}\n  走查时观察 ${check.observe}`).join("\n")}\n`;
    }
  }
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
    enterDemo("sample", view === "spark" || view === "mirror" ? view : "student");
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

