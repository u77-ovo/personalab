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
const latestActiveProject = projectLibrary.find(item => !item.project?.archived);
if (!hasSavedProject(state) && latestActiveProject) state = normalizeStoredState(latestActiveProject);
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
  state.project.updatedAt = state.updatedAt;
  const next = snapshotState();
  const index = projectLibrary.findIndex(item => item.project.id === state.project.id);
  if (index >= 0) projectLibrary[index] = next;
  else projectLibrary.push(next);
  projectLibrary.sort((a, b) => (b.project.updatedAt || 0) - (a.project.updatedAt || 0));
  saveProjectLibrary();
}

function normalizeSparkRun(run) {
  return { ...run, sources: run.sources || ["旧版演示记录"], evidence: run.evidence || [] };
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
  state.updatedAt = Date.now();
  state.project.updatedAt = state.updatedAt;
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
  button.hidden = !resumeProject;
  if (resumeProject) button.textContent = `继续：${resumeProject.project.name}`;
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
    state = sampleState();
    currentSparkResult = null;
    currentMirrorResult = null;
    saveState();
  } else {
    if (!hasSavedProject(state) || state.project.archived) {
      state = normalizeStoredState(projectLibrary.find(item => !item.project.archived) || initialState());
    }
    currentSparkResult = state.sparkRuns[0] || null;
    currentMirrorResult = state.mirrorRuns[0] || null;
  }
  showWorkspace();
  navigate(destination || state.activePage || "workspace");
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
  window.scrollTo({ top: 0 });
}

function navigate(page) {
  state.activePage = page;
  saveState();
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
    <button class="project-card-main" type="button" data-open-project="${escapeHTML(meta.id)}">
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
    <div class="project-card-actions">
      ${archived
        ? `<button type="button" data-project-restore="${escapeHTML(meta.id)}">恢复项目</button><button class="danger" type="button" data-project-delete="${escapeHTML(meta.id)}">永久删除</button>`
        : `<button type="button" data-project-edit="${escapeHTML(meta.id)}">编辑</button><button type="button" data-project-duplicate="${escapeHTML(meta.id)}">复制</button><button type="button" data-project-archive="${escapeHTML(meta.id)}">归档</button>`}
    </div>
  </article>`;
}

function renderWorkspace() {
  const activeProjects = projectLibrary.filter(item => !item.project.archived);
  const archivedProjects = projectLibrary.filter(item => item.project.archived);
  const hasCurrent = hasSavedProject(state) && !state.project.archived;
  const runCount = state.sparkRuns.length + state.mirrorRuns.length;
  const readiness = window.studentWorkbench.readiness();
  const latest = [...state.sparkRuns.map(r => ({ ...r, kind: "Spark", icon: "✦" })), ...state.mirrorRuns.map(r => ({ ...r, kind: "Mirror", icon: "◫" }))]
    .sort((a,b) => b.createdAt - a.createdAt).slice(0,4);
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
    ${archivedProjects.length ? `<details class="archived-projects"><summary>已归档项目 <span>${archivedProjects.length}</span></summary><section class="student-project-gallery archived-grid">${archivedProjects.map(item => projectCardHTML(item, true)).join("")}</section></details>` : ""}
    ${hasCurrent ? `
    <div class="grid grid-4">
      ${metric("◇", `${readiness.score}%`, "验证闭环进度", "purple")}
      ${metric("◎", String(state.personas.length), "可用 Persona", "orange")}
      ${metric("▤", String(state.materials.length), "需求资料", "blue")}
      ${metric("▥", String(state.reports.length), "已生成报告", "green")}
    </div>
    <div class="section-title"><h2>当前项目推进建议</h2><button class="link-button" data-open-modal="project">编辑项目信息 →</button></div>
    <div class="grid grid-main guidance-grid">
      <article class="card card-pad project-guidance-card">
        <span class="project-kicker">CURRENT PRIORITY</span>
        <h3>${escapeHTML(state.project.priorityTask || readiness.next?.label || "补充项目信息")}</h3>
        <p>${state.project.priorityTask ? `这是创建项目时指定的当前优先任务。完成后可以编辑项目，重新调整任务顺序。` : readiness.next?.short || "继续保留真实测试记录和每一轮由证据触发的改动。"}</p>
        <div class="project-progress"><div class="progress-label"><span>验证闭环完成度</span><strong>${readiness.score}%</strong></div><div class="progress-bar"><span style="width:${readiness.score}%"></span></div></div>
        <button class="button button-primary button-sm" data-go="student">进入科创工作台 →</button>
      </article>
      <article class="card card-pad coach-card">
        <div class="coach-card-head"><img src="./assets/personalab-xiaop.webp" alt="" /><span class="tag tag-blue">小P · 建议下一步</span></div>
        <h3 style="font-size:15px;margin:14px 0 7px">${state.materials.length ? "用 Spark 继续挖掘需求" : "先导入一份真实资料"}</h3>
        <p style="color:var(--muted);font-size:10px;line-height:1.7;margin-bottom:18px">${state.materials.length ? "围绕当前方向邀请多个 Persona 模拟讨论，整理下一轮需要验证的问题。" : "先整理一段匿名访谈、用户评价或竞品对照，记录来源以便后续核对。"}</p>
        <button class="button ${state.materials.length ? "button-purple" : "button-primary"} button-sm" data-go="${state.materials.length ? "spark" : "materials"}">${state.materials.length ? "进入 Spark" : "添加资料"} →</button>
      </article>
    </div>
    <div class="section-title"><h2>快速开始</h2><p>按项目阶段选择需求探索或原型预演</p></div>
    <div class="grid grid-3">
      <article class="card quick-card" data-go="spark"><div class="quick-head"><span class="module-icon module-icon-spark">✦</span><div><span class="tag tag-orange">我只有一个想法</span><h3>Spark 播种</h3></div></div><p>并排查看资料和多 Persona 模拟观点，把讨论整理成待验证的产品假设。</p></article>
      <article class="card quick-card" data-go="mirror"><div class="quick-head"><span class="module-icon module-icon-mirror">◫</span><div><span class="tag tag-green">我已有原型</span><h3>Mirror 预演</h3></div></div><p>记录原型流程和核心任务，预演测试步骤，查看八维评分框架中可用文字示范的维度。</p></article>
      <article class="card quick-card" data-go="materials"><div class="quick-head"><span class="module-icon" style="color:var(--blue);background:var(--blue-soft)">▤</span><div><span class="tag tag-blue">保留调研来源</span><h3>需求资料库</h3></div></div><p>集中保存匿名访谈、问卷、评价和竞品记录，供团队核对假设时参考。</p></article>
    </div>
    <div class="section-title"><h2>最近活动</h2><button class="link-button" data-go="reports">查看全部 →</button></div>
    <article class="card card-pad">
      ${latest.length ? `<div class="activity-list">${latest.map(r => `<div class="activity"><span class="activity-icon">${r.icon}</span><div><strong>${escapeHTML(r.title)}</strong><small>${r.kind} · 已生成对应验证报告</small></div><time>${formatRelativeTime(r.createdAt)}</time></div>`).join("")}</div>` : `<div style="text-align:center;padding:28px;color:var(--muted);font-size:11px">还没有验证记录。完成一次 Spark 或 Mirror 后，活动会出现在这里。</div>`}
    </article>` : `<article class="card card-pad no-current-project"><strong>先创建或打开一个项目</strong><p>项目中心会保留多个项目、验证记录和比赛准备状态，不会再用新项目覆盖旧项目。</p><button class="button button-primary" data-action="enter-empty">创建科创项目</button></article>`}`;
}

function onboardingHTML() {
  return `<section class="card onboarding-card">
    <div class="onboarding-copy"><span class="tag tag-purple">首次使用引导</span><h2>先建立一个最小验证项目</h2><p>不用一次准备齐所有资料。先说清产品方向，再选择 Spark 或 Mirror，后续资料可以随时补充。</p></div>
    <div class="onboarding-steps">
      <button class="onboarding-step" data-open-modal="project"><span>1</span><strong>定义项目</strong><small>名称与一句话目标</small></button>
      <button class="onboarding-step" data-go="materials"><span>2</span><strong>补充证据</strong><small>访谈、评价或问卷</small></button>
      <button class="onboarding-step" data-go="spark"><span>3</span><strong>开始验证</strong><small>需求探索或体验预演</small></button>
    </div>
  </section>`;
}

function metric(icon, value, label, color) {
  const vars = { purple: ["var(--purple-soft)","var(--purple)"], orange:["var(--orange-soft)","var(--orange)"], green:["var(--green-soft)","var(--green)"], blue:["var(--blue-soft)","var(--blue)"] }[color];
  return `<article class="card metric-card"><span class="metric-icon" style="background:${vars[0]};color:${vars[1]}">${icon}</span><div><strong>${value}</strong><small>${label}</small></div></article>`;
}

function personaPicker(prefix) {
  return `<div class="persona-picks">${state.personas.map((p,i) => `<span class="persona-pick"><input id="${prefix}-${p.id}" name="${prefix}Persona" value="${p.id}" type="checkbox" ${i < 4 ? "checked" : ""}><label for="${prefix}-${p.id}"><span class="pick-dot" style="background:${p.color}">${escapeHTML(p.short)}</span>${escapeHTML(p.name)}</label></span>`).join("")}</div>`;
}

function renderSpark() {
  return `
    <div class="page-heading"><div><p class="eyebrow" style="color:var(--orange)">SPARK / 播种</p><h1>把项目痛点写成可验证的假设</h1><p>查看资料库的片段，让多个 Persona 提出不同视角，再决定真实调研要验证什么。</p></div><span class="tag tag-orange">需求探索</span></div>
    <div class="callout callout-info" style="margin-bottom:16px">离线演示使用预设讨论和假设模板。用户录入的资料供团队核对，公开资料方向只记录待检索问题。</div>
    <div class="lab-layout">
      <form id="spark-form" class="card lab-panel">
        <div class="panel-head"><h2>设置本轮需求探索</h2><span class="tag tag-gray">约 1 分钟</span></div>
        <div class="panel-body">
          <div class="form-group"><label class="form-label" for="spark-title">产品 / 想法名称</label><input class="input" id="spark-title" name="title" value="${escapeHTML(state.project.name === "未命名项目" ? "" : state.project.name)}" placeholder="例如：校园 AI 学习助手" required></div>
          <div class="form-group"><label class="form-label" for="spark-direction">这轮想验证什么？</label><textarea class="textarea" id="spark-direction" name="direction" required placeholder="描述目标用户、场景、当前替代方案与希望验证的问题">${escapeHTML(currentSparkResult?.direction ?? (state.isSample ? "学生遇到临时任务时需要重排计划。想验证先解释冲突、再给出调整建议能否缩短重排时间。" : ""))}</textarea></div>
          <div class="form-group"><span class="form-label">信息范围</span><div class="choice-grid">
             <span class="choice"><input id="source-own" type="checkbox" name="sources" value="用户资料" checked><label for="source-own"><span class="choice-mark">✓</span><span><strong>我的需求资料库</strong><small>保存最近录入的片段和来源</small></span></label></span>
             <span class="choice"><input id="source-web" type="checkbox" name="sources" value="公开资料" checked><label for="source-web"><span class="choice-mark">✓</span><span><strong>公开资料方向</strong><small>添加一条待检索记录</small></span></label></span>
          </div></div>
          <div class="form-group"><span class="form-label">参与讨论的 Persona <small>多 Persona 对话仅在 Spark 内部</small></span>${personaPicker("spark")}</div>
          <div class="submit-row"><button class="button button-purple" type="submit">✦ 运行模拟圆桌</button><small>本地示例仿真<br>不代表真实用户结论</small></div>
        </div>
      </form>
      <section id="spark-result" class="card lab-panel">${currentSparkResult ? sparkResultHTML(currentSparkResult) : sparkEmptyHTML()}</section>
    </div>`;
}

function sparkEmptyHTML() {
  return `<div class="empty-state"><div><div class="empty-illustration">✦</div><h3>等待开始本轮探索</h3><p>填写产品方向并选择 Persona，查看模拟圆桌、资料来源和下一轮可验证的假设。</p><div class="empty-steps"><span></span><span></span><span></span><span></span></div></div></div>`;
}

function sparkResultHTML(result) {
  const sourceSummary = result.sources?.length ? result.sources.join(" + ") : "Persona 推演";
  return `<div class="result-shell">
    <div class="result-summary"><div class="result-summary-top"><div><p class="eyebrow">SPARK RESULT · 模拟探索</p><h2>${escapeHTML(result.title)} · 需求探索摘要</h2><p>${result.personas.length} 个 Persona 参与模板讨论。本轮选择了 ${escapeHTML(sourceSummary)}，保留 ${result.evidence?.length || 0} 条来源记录。</p></div><span class="tag tag-green">已记录</span></div></div>
    <div class="result-tabs"><button class="result-tab active" data-spark-tab="dialogue">圆桌讨论</button><button class="result-tab" data-spark-tab="insights">待验证假设</button><button class="result-tab" data-spark-tab="evidence">资料来源</button><button class="result-tab" data-spark-tab="concept">验证建议</button></div>
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
  return `<div class="callout callout-warning">本轮探索问题为“${escapeHTML(result.direction)}”。以下是测试设计提示。</div><div class="section-title"><h2>下一轮验证</h2></div><div class="insight-list">${steps.map((step,i)=>`<article class="insight"><div class="insight-top"><h4>0${i+1} · ${step}</h4><span class="tag tag-purple">待执行</span></div></article>`).join("")}</div>`;
}

function runSpark(form) {
  const data = new FormData(form);
  const selectedIds = data.getAll("sparkPersona");
  const selected = state.personas.filter(p => selectedIds.includes(p.id));
  if (selected.length < 2) { showToast("请至少选择 2 个 Persona 参与讨论"); return; }
  const sources = data.getAll("sources").map(String);
  if (!sources.length) { showToast("请至少选择一种信息范围"); return; }
  const title = String(data.get("title") || "").trim();
  const direction = String(data.get("direction") || "").trim();
  if (!title || !direction) { showToast("请填写项目名称和本轮验证问题"); return; }
  const evidence = [];
  if (sources.includes("用户资料")) {
    if (state.materials.length) {
      state.materials.slice(0, 3).forEach((material, index) => evidence.push({
        id: `E-${String(index + 1).padStart(2,"0")}`,
        title: material.title,
        kind: material.type,
        quote: material.content,
        source: material.source,
         materialId: material.id,
         status: material.isSample ? "内置示例资料" : "用户录入 · 待核对"
      }));
    } else {
      evidence.push({ id:"G-01", title:"用户资料缺口", kind:"资料状态", quote:"当前资料库为空，无法用真实用户材料支持需求结论。", source:"系统检查", status:"待补充资料" });
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
  const hypotheses = state.isSample
    ? [
      ["冲突说明能否帮助用户更快重排任务？", "用相同的临时作业情境，对比普通日历与可解释的任务调整原型，记录完成时间和是否找到正确的冲突。", "高"],
      ["用户能否判断何时接受调整建议？", "邀请目标用户说出接受或拒绝建议的理由，并观察他们能否撤回一次调整。", "中"]
    ]
    : [
      ["目标用户是否会反复遇到这个问题？", "访谈时请用户描述最近一次遇到问题的经过、当前做法及其成本，记录可以追溯的片段。", "高"],
      ["方案能否改善最关键的一步？", "用同一项任务对比现有做法和原型，提前约定完成标准，记录耗时、错误或中途放弃。", "高"],
      ["用户是否理解方案的结果并保有控制？", "观察用户能否解释结果、修改建议及处理一次出错情境。", "中"]
    ];
  const result = {
    id: `s${Date.now()}`, title, direction, personas: selected, sources, evidence, createdAt: Date.now(), date: "刚刚", isSample: Boolean(state.isSample),
    dialogue: selected.map(p => ({ ...p, text: texts[p.id] ?? "请用访谈或任务观察核对我最关心的场景与限制。" })),
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
  const description = currentMirrorResult?.material ?? (state.isSample ? sampleDescription : "");
  const task = currentMirrorResult?.task ?? (state.isSample ? "添加临时作业并处理已有任务冲突" : "");
  return `
    <div class="page-heading"><div><p class="eyebrow" style="color:var(--green)">MIRROR / 预演</p><h1>把原型改进点变成测试任务</h1><p>写下原型的关键步骤，记录要让目标用户完成的动作，演练答辩时的操作路径。</p></div><span class="tag tag-green">原型预演</span></div>
    <div class="callout callout-info" style="margin-bottom:16px">文字描述明确涉及的维度可以展示固定示例分。离线版只保存链接和文件名，因此需要查看原型画面的维度暂不评分。</div>
    <div class="lab-layout">
      <form id="mirror-form" class="card lab-panel">
        <div class="panel-head"><h2>配置本轮体验预演</h2><span class="tag tag-gray">八维 · 100分</span></div>
        <div class="panel-body">
          <div class="form-group"><label class="form-label" for="mirror-title">产品 / 页面名称</label><input class="input" id="mirror-title" name="title" value="${escapeHTML(state.project.name === "未命名项目" ? "" : state.project.name)}" placeholder="例如：任务规划首页" required></div>
          <div class="form-group"><label class="form-label" for="material-type">原型材料类型</label><select class="select" id="material-type" name="materialType">${materialTypes.map(type => `<option${type === currentMirrorResult?.materialType ? " selected" : ""}>${type}</option>`).join("")}</select></div>
          <div class="form-group"><label class="form-label" for="mirror-link">原型流程与参考链接</label><textarea class="textarea" id="mirror-link" name="material" placeholder="请描述任务入口、关键动作、反馈和出错后的处理方式，可附链接">${escapeHTML(description)}</textarea><label class="upload-box" for="mirror-file" style="margin-top:8px"><input id="mirror-file" name="file" type="file" accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,video/*"><span><span class="upload-icon">⇧</span><strong id="upload-label">也可以选取本地文件</strong><small>只记录文件名</small></span></label></div>
          <div class="form-group"><label class="form-label" for="mirror-task">希望目标用户完成的核心任务</label><input class="input" id="mirror-task" name="task" value="${escapeHTML(task)}" placeholder="如选定一个空闲时段并确认预约" required></div>
          <div class="form-group"><span class="form-label">参与预演的 Persona</span>${personaPicker("mirror")}</div>
          <div class="submit-row"><button class="button button-green" type="submit">◫ 开始体验预演</button><small>本地示例仿真<br>不代替真实用户测试</small></div>
        </div>
      </form>
      <section id="mirror-result" class="card lab-panel">${currentMirrorResult ? mirrorResultHTML(currentMirrorResult) : mirrorEmptyHTML()}</section>
    </div>`;
}

function mirrorEmptyHTML() {
  return `<div class="empty-state"><div><div class="empty-illustration" style="color:var(--green);background:var(--green-soft)">◫</div><h3>等待开始体验预演</h3><p>添加你现有的产品材料和核心任务。完成后，这里会展示任务路径、主要问题、改进建议与固定八维评分。</p><div class="empty-steps"><span style="background:var(--green)"></span><span></span><span></span><span></span></div></div></div>`;
}

const scoreMeta = [
  ["任务清晰度",15,12,"flow"],["信息架构与可寻找性",15,11,"structure"],["交互一致性",15,12,"visual"],["系统反馈",10,7,"feedback"],
  ["认知负荷",10,7,"visual"],["错误预防与恢复",10,6,"recovery"],["信任与隐私",10,8,"trust"],["Persona适配与无障碍",15,10,"visual"]
];

function mirrorResultHTML(result) {
  const partial = result.unscoredCount > 0;
  const ringValue = partial ? Math.round(result.scoredCount / result.scores.length * 100) : result.total;
  return `<div class="result-shell">
    <div class="score-hero"><div class="score-ring ${partial ? "partial" : ""}" style="--score:${ringValue}"><div class="score-number"><strong>${partial ? "—" : result.total}</strong><small>${partial ? `${result.unscoredCount} 项暂不评分` : "/ 100"}</small></div></div><div><span class="tag tag-green">示例分 · ${result.scoredCount}/8 维</span><h2>${escapeHTML(result.title)}</h2><p>${escapeHTML(result.task)} · ${result.personas.length} 个 Persona 参与预演 · ${escapeHTML(result.materialType)}</p>${result.scoredCount ? `<p class="score-coverage">已展示维度示例分 ${result.rawTotal}/${result.scoredMax}，其余维度待验证。</p>` : `<p class="score-coverage">补充具体流程描述后可查看部分维度的示例分。</p>`}</div></div>
    <div class="result-tabs"><button class="result-tab active" data-mirror-tab="issues">待检查问题</button><button class="result-tab" data-mirror-tab="scores">八维示例评分</button><button class="result-tab" data-mirror-tab="path">测试步骤</button></div>
    <div id="mirror-result-body" class="result-body">${mirrorTabHTML(result,"issues")}</div>
  </div>`;
}

function mirrorTabHTML(result, tab) {
  if (tab === "issues") return `<div class="issue-list">${result.issues.map((issue,i)=>`<article class="issue-card"><span class="issue-index">${i+1}</span><div><h4>${escapeHTML(issue.title)}</h4><p>${escapeHTML(issue.detail)}</p><div class="issue-meta"><span class="tag ${issue.level === "高" ? "tag-red" : "tag-orange"}">${issue.level}优先级</span><span class="tag tag-gray">${escapeHTML(issue.dimension)}</span></div></div></article>`).join("")}</div>`;
  if (tab === "scores") return `<div class="score-bars">${result.scores.map(s=>`<div class="score-item"><div class="score-row ${s.score === null ? "unscored" : ""}"><label>${escapeHTML(s.name)}</label><div class="progress-bar"><span style="width:${s.score === null ? 0 : Math.round(s.score/s.max*100)}%"></span></div><strong>${s.score === null ? "暂不评分" : `${s.score}/${s.max}`}</strong></div>${s.score === null ? `<small class="score-note">${escapeHTML(s.reason)}</small>` : ""}</div>`).join("")}</div><div class="callout callout-warning" style="margin-top:18px">固定示例分用于展示评分表的读法。真实得分需要在任务测试后依据观察记录评定。</div>`;
  return `<div class="insight-list">${result.path.map((step,i)=>`<article class="insight"><div class="insight-top"><h4>步骤 ${i+1} · ${escapeHTML(step.text)}</h4><span class="tag ${step.status === "出现阻塞" ? "tag-red" : step.status === "待观察" ? "tag-gray" : "tag-green"}">${escapeHTML(step.status)}</span></div></article>`).join("")}</div>`;
}

function runMirror(form) {
  const data = new FormData(form);
  const selectedIds = data.getAll("mirrorPersona");
  const selected = state.personas.filter(p => selectedIds.includes(p.id));
  if (!selected.length) { showToast("请至少选择 1 个 Persona"); return; }
  const materialType = String(data.get("materialType") || "");
  const material = String(data.get("material") || "").trim();
  const task = String(data.get("task") || "").trim();
  const title = String(data.get("title") || "").trim();
  const file = data.get("file");
  const fileName = file && typeof file === "object" && "name" in file ? file.name : "";
  if (!title || !task) { showToast("请填写原型名称和核心任务"); return; }
  if (!material && !fileName) { showToast("请补充流程说明、原型链接或选择一个本地文件"); return; }
  const description = material.replace(/https?:\/\/\S+/gi, "").trim();
  const hasDescription = description.length >= 20;
  const evidenceAvailable = {
    flow: hasDescription && /进入|打开|选择|输入|填写|导入|添加|点击/.test(description) && /提交|生成|完成|确认|保存|得到/.test(description),
    structure: hasDescription && /首页|菜单|清单|列表|页面|入口|导航/.test(description) && /进入|打开|找到|跳转/.test(description),
    feedback: hasDescription && /显示|提示|反馈/.test(description) && /成功|失败|错误|进度|状态|结果|原因|理由/.test(description),
    recovery: hasDescription && /撤回|撤销|重试|恢复|返回修改/.test(description),
    trust: hasDescription && /权限|授权|个人信息|个人数据/.test(description) && /用途|范围|同意|拒绝|删除/.test(description),
    visual: false
  };
  const reasonByRequirement = {
    flow: "补充用户的关键动作和任务结束状态",
    structure: "补充用户从哪个页面或入口到达目标",
    feedback: "补充系统在操作后会显示什么提示或结果",
    recovery: "补充用户误操作后的恢复步骤",
    visual: "需要实际查看界面，离线版只保留链接与文件名",
    trust: "补充权限范围、数据用途或拒绝方式"
  };
  const scores = scoreMeta.map(([name,max,baseScore,requirement]) => ({
    name, max, score: evidenceAvailable[requirement] ? baseScore : null,
    reason: evidenceAvailable[requirement] ? "" : reasonByRequirement[requirement]
  }));
  const scored = scores.filter(item=>item.score !== null);
  const rawTotal = scored.reduce((sum,item)=>sum+item.score,0);
  const scoredMax = scored.reduce((sum,item)=>sum+item.max,0);
  const unscoredCount = scores.length - scored.length;
  const total = unscoredCount ? null : rawTotal;
  const issues = [
    { title:"用户能否独立找到入口并完成任务？", detail:"让目标用户从原型首页开始，记录完成时间、求助次数和停顿位置。", level:"高", dimension:"任务清晰度" },
    { title:"用户能否理解结果并处理一次错误？", detail:"设置一次输入错误或误操作，观察用户能否理解反馈、修改或撤回。", level:"高", dimension:"错误预防与恢复" },
    { title:"数据用途和授权范围是否清楚？", detail:"如果任务涉及个人数据，请用户说明产品需要读取什么、为什么读取，以及如何拒绝或删除。", level:"中", dimension:"信任与隐私" }
  ];
  const result = {
    id:`m${Date.now()}`, title, task, materialType, material, fileName, personas:selected, scores,total,rawTotal,scoredMax,scoredCount:scored.length,unscoredCount,issues,createdAt:Date.now(),date:"刚刚",
    path:[
      { text:"从原型首页寻找核心任务入口", status:"待观察" },
      { text:task, status:"待观察" },
      { text:"描述系统反馈及其含义", status:"待观察" },
      { text:"确认结果并尝试恢复一次误操作", status:"待观察" }
    ]
  };
  currentMirrorResult = result;
  state.project.stage = "体验验证";
  state.project.progress = Math.max(state.project.progress,72);
  state.mirrorRuns.unshift(result);
  state.reports.unshift({ id:result.id,kind:"Mirror",title:`${result.title} · 原型预演报告`,desc:`展示 ${result.scoredCount}/8 维示例分，附待执行的任务路径与检查点`,date:"刚刚",createdAt:result.createdAt,data:result });
  saveState();
  document.querySelector("#mirror-result").innerHTML = mirrorResultHTML(result);
  bindResultTabs();
  showToast("Mirror 预演完成，报告已保存");
}

function renderPersonas() {
  return `
    <div class="page-heading"><div><p class="eyebrow">PERSONA LIBRARY</p><h1>Persona 用户库</h1><p>平台提供可直接使用的基础形象，用户也可以根据明确目标自行创建；真实资料暂不被强制聚类成人设。</p></div><div class="heading-actions"><button class="button button-primary" data-open-modal="persona">＋ 创建 Persona</button></div></div>
    <div class="callout callout-info" style="margin-bottom:18px"><strong>资料如何使用：</strong>初版以“检索原始证据 → 提炼需求洞察”为主。后续只有当样本足够、特征稳定时，才生成可追溯的 Persona 草稿，并交给用户确认。</div>
    <div class="grid grid-3">${state.personas.map(p=>`<article class="card persona-card"><div class="persona-cover"><span class="persona-large-avatar" style="background:${p.color}">${escapeHTML(p.short)}</span><span class="tag ${p.type === "平台预设" ? "tag-purple" : "tag-green"}">${escapeHTML(p.type)}</span></div><div class="persona-content"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.desc)}</p><div class="trait-list">${p.traits.map(t=>`<span class="trait">${escapeHTML(t)}</span>`).join("")}</div></div></article>`).join("")}</div>`;
}

function renderMaterials() {
  return `
    <div class="page-heading"><div><p class="eyebrow">EVIDENCE LIBRARY</p><h1>需求资料库</h1><p>保存脱敏访谈、问卷、观察、公开评价与竞品信息，并明确区分演练示例和用户录入资料。</p></div><div class="heading-actions"><button class="button button-primary" data-open-modal="material">＋ 添加资料</button></div></div>
    <div class="grid grid-4" style="margin-bottom:18px">${metric("▤",String(state.materials.length),"全部资料","purple")}${metric("访",String(state.materials.filter(m=>m.type.includes("访谈")).length),"用户访谈","orange")}${metric("问",String(state.materials.filter(m=>m.type.includes("问卷")).length),"问卷资料","green")}${metric("网",String(state.materials.filter(m=>m.source.includes("联网")).length),"公开资料方向","blue")}</div>
    <div class="card card-pad"><div class="section-title" style="margin-top:0"><h2>资料清单</h2><div class="toolbar"><span class="tag tag-gray">初版直接检索原始片段</span></div></div>
      ${state.materials.length ? `<div class="material-list">${state.materials.map(m=>`<article class="card material-card"><span class="material-type">${escapeHTML(m.icon||"文")}</span><div><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.content)}</p><div class="material-meta"><span>${escapeHTML(m.type)}</span><span>来源：${escapeHTML(m.source)}</span><span>${escapeHTML(m.date)}</span></div></div><div class="material-actions"><span class="tag tag-blue">可检索</span></div></article>`).join("")}</div>` : `<div class="empty-state" style="min-height:330px"><div><div class="empty-illustration">▤</div><h3>还没有真实需求资料</h3><p>添加一段访谈摘录、一条用户评价或一份问卷摘要，就可以在 Spark 和 Mirror 中作为证据使用。</p><button class="button button-purple button-sm" data-open-modal="material">添加第一份资料</button></div></div>`}
    </div>`;
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
  document.querySelectorAll("[data-open-project]").forEach(el => el.addEventListener("click", () => openProject(el.dataset.openProject)));
  document.querySelectorAll("[data-project-edit]").forEach(el => el.addEventListener("click", () => editProject(el.dataset.projectEdit)));
  document.querySelectorAll("[data-project-duplicate]").forEach(el => el.addEventListener("click", () => duplicateProject(el.dataset.projectDuplicate)));
  document.querySelectorAll("[data-project-archive]").forEach(el => el.addEventListener("click", () => archiveProject(el.dataset.projectArchive)));
  document.querySelectorAll("[data-project-restore]").forEach(el => el.addEventListener("click", () => restoreProject(el.dataset.projectRestore)));
  document.querySelectorAll("[data-project-delete]").forEach(el => el.addEventListener("click", () => deleteProject(el.dataset.projectDelete)));
  document.querySelector("#spark-form")?.addEventListener("submit", e => { e.preventDefault(); runSpark(e.currentTarget); });
  document.querySelector("#mirror-form")?.addEventListener("submit", e => { e.preventDefault(); runMirror(e.currentTarget); });
  document.querySelectorAll("[data-export-student]").forEach(el => el.addEventListener("click", () => window.studentWorkbench.export()));
  document.querySelector("#mirror-file")?.addEventListener("change", e => { const file=e.target.files[0]; document.querySelector("#upload-label").textContent=file?`已选择：${file.name}`:"也可以上传本地文件"; });
  document.querySelectorAll("[data-download-report]").forEach(el => el.addEventListener("click", () => downloadReport(el.dataset.downloadReport)));
  document.querySelectorAll("[data-view-report]").forEach(el => el.addEventListener("click", () => viewReport(el.dataset.viewReport)));
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
  navigate(destination);
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
    document.querySelectorAll("[data-mirror-tab]").forEach(x=>x.classList.remove("active")); el.classList.add("active");
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
    state.materials.unshift({ id:`m${Date.now()}`,title:name,type:materialType,source:root.querySelector("#modal-source").value.trim()||"用户上传",content:desc||"未填写内容摘要",date:"刚刚",icon:materialType[0] });
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

function downloadReport(id) {
  const report = state.reports.find(r=>r.id===id);
  if (!report) return;
  let body = `# ${report.title}\n\n> PersonaLab 本地演示报告。内容为示例仿真，不代表真实用户研究结论。\n\n${report.desc}\n\n`;
  if (report.kind === "Spark") {
    body += `## 需求与机会\n\n${report.data.insights.map(i=>`- **${i.title}**（${i.level}优先级，来源类型：${i.source}）\n  ${i.detail}${i.evidenceIds?.length ? `\n  依据：${i.evidenceIds.join("、")}` : ""}`).join("\n")}\n\n## 来源记录\n\n${(report.data.evidence || []).map(item=>`- **${item.id} ${item.title}**（${item.status}）\n  ${item.quote}\n  来源：${item.source}`).join("\n") || "本轮没有可追溯资料。"}\n`;
  } else {
    const totalLine = report.data.scoredCount === 0
      ? "当前材料不足，8 个维度均暂不评分"
      : report.data.total === null
        ? `示例评分：${report.data.rawTotal}/${report.data.scoredMax}，${report.data.unscoredCount} 项暂不评分`
        : `示例总分：${report.data.total}/100`;
    body += `## 八维评分\n\n${totalLine}\n\n${report.data.scores.map(s=>`- ${s.name}：${s.score === null ? `暂不评分（${s.reason}）` : `${s.score}/${s.max}`}`).join("\n")}\n\n## 主要问题\n\n${report.data.issues.map(i=>`- **${i.title}**（${i.level}优先级）\n  ${i.detail}`).join("\n")}\n`;
  }
  const blob = new Blob([body],{type:"text/markdown;charset=utf-8"});
  const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${report.title.replace(/[\\/:*?"<>|]/g,"-")}.md`; a.click(); URL.revokeObjectURL(url); showToast("报告已导出");
}

document.addEventListener("click", e => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "enter-sample") enterDemo("sample");
  if (action === "enter-empty") openProjectWizard();
  if (action === "resume-demo") enterDemo("resume");
  if (action === "show-landing") showLanding();
  if (action === "toggle-menu") {
    const open = document.querySelector(".student-sidebar").classList.contains("open");
    setMenuOpen(!open, open);
  }
  if (action === "reset-demo") {
    if (confirm(`重置“${state.project.name}”的资料、Persona 和验证记录？其他项目不会受到影响。`)) {
      const meta = { ...state.project, progress: 0, updatedAt: Date.now() };
      state = initialState(meta);
      currentSparkResult = null;
      currentMirrorResult = null;
      saveState();
      navigate("workspace");
      showToast("当前项目记录已重置");
    }
  }
  if (action === "show-help") showToast("建议按“项目蓝图 → Persona 痛点 → Spark → Mirror → 验证冲刺 → 提交中心”的顺序体验");
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
if (projectLibrary.some(item => !item.project.archived)) {
  enterDemo("resume", "workspace");
}

