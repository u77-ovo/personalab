const studentFields = [
  { key: "background", label: "项目背景", placeholder: "什么观察、事件或需求让团队决定开始这个项目？" },
  { key: "goal", label: "项目目标", placeholder: "团队希望为谁带来什么具体改善？" },
  { key: "audience", label: "目标用户", placeholder: "谁最需要这个方案？描述他们的任务、特征和限制。" },
  { key: "scenario", label: "典型使用场景", placeholder: "在什么时间、地点或条件下，这类用户要完成什么任务？" },
  { key: "problem", label: "核心痛点", placeholder: "哪一步最容易卡住？它具体造成了什么影响？" },
  { key: "currentApproach", label: "现有解决方式", placeholder: "用户现在怎么处理？什么有效，什么仍然解决不了？" },
  { key: "solution", label: "产品方案", placeholder: "从用户输入到得到结果，写清方案如何解决核心痛点。" },
  { key: "coreFeatures", label: "核心功能", placeholder: "列出首版必须做的功能，每行一个，并写明它解决的问题。" },
  { key: "innovation", label: "创新亮点", placeholder: "和现有做法相比，你具体改善了哪一步？" },
  { key: "feasibility", label: "技术可行性", placeholder: "现有资源、技术依赖和主要风险是什么？第一版怎样验证可行？" },
  { key: "aiRole", label: "AI 的输入、输出与人工确认", placeholder: "若使用 AI，说明它读取什么、生成什么，以及谁确认。", optional: true },
  { key: "hypothesis", label: "核心验证假设", placeholder: "如果为哪类用户提供什么能力，那么什么可观察行为会发生变化？" },
  { key: "successMetric", label: "成功标准", placeholder: "用什么指标判断方案有效？例如完成时间、错误数、理解度。" },
  { key: "testTask", label: "统一测试任务", placeholder: "所有参与者完成同一个什么任务？给出相同材料、起点和完成条件。" },
  { key: "testPlan", label: "下一轮真人验证计划", placeholder: "招募谁、完成什么任务、记录什么现象？" },
  { key: "testResult", label: "真实验证记录", placeholder: "尚未测试可留空。测试后记录样本、观察、失败案例和反例。" },
  { key: "iterationPlan", label: "由证据触发的下一轮改动", placeholder: "哪条观察促使你改什么？保留、不改或继续验证的理由是什么？" }
];

const blueprintSteps = [
  { id: "goals", title: "项目目标与背景", fields: ["background", "goal"], tip: "把目标写成用户能感受到的变化，例如让用户更快完成临时任务重排。" },
  { id: "audience", title: "目标用户与使用场景", fields: ["audience", "scenario"], tip: "选一个最常出现的场景，例如当天计划已排满，却又收到一项两小时后截止的任务。" },
  { id: "problem", title: "核心痛点与现有做法", fields: ["problem", "currentApproach"], tip: "指出用户卡在哪一步，并关联一条能追溯的访谈、观察或问卷摘录。" },
  { id: "solution", title: "产品方案与核心功能", fields: ["solution", "coreFeatures"], tip: "先写能完成一次核心任务的功能，再列要延后的功能。" },
  { id: "feasibility", title: "创新亮点与技术可行性", fields: ["innovation", "feasibility", "aiRole"], tip: "用一个对照说明差异，再写出首版所需的数据、工具和团队能力。" },
  { id: "validation", title: "验证假设与成功指标", fields: ["hypothesis", "successMetric"], tip: "先约定比较对象、可观察指标和目标值，再开始测试。" }
];

const validationFieldKeys = ["hypothesis", "successMetric", "testTask", "testPlan", "testResult", "iterationPlan"];

const studentSample = {
  background: "演练设定中，临时课程或作业变更会打乱原本排好的当天计划。",
  goal: "让用户更快完成当天任务重排，减少遗漏，并能解释调整理由。",
  audience: "通过课表和待办清单管理学习任务的学生。",
  scenario: "当天日程已排满时，收到一项两小时后截止的新作业，必须重新安排课程、作业和小组任务。",
  problem: "多项任务冲突时，用户需要逐项判断优先级，容易漏掉原来的待办。",
  currentApproach: "在课程表和待办清单之间切换，手动找冲突、改时间和检查遗漏。",
  solution: "收集用户确认的任务与时间变更，解释冲突并给出可编辑的重排草案，由用户确认。",
  coreFeatures: "冲突提示：说明哪些任务重叠。\n调整草案：建议可更改的安排。\n确认与撤回：避免直接覆盖用户的计划。",
  innovation: "先解释冲突与依赖，再提供草案，用户能逐条接受、修改或撤回。",
  feasibility: "用虚构任务和已知截止时间做首版，先以规则检测重叠，用同一组任务验证走查流程。",
  aiRole: "智能体读取学生主动确认的任务清单和临时变更，生成备选顺序并解释依据，最终安排由学生确认。",
  hypothesis: "若先展示冲突原因再给出可修改的重排草案，学生会更快完成重排，并减少任务遗漏。",
  successMetric: "与手动重排相比，任务遗漏更少、完成时间更短，且用户能够复述调整理由。",
  testTask: "新增一项两小时后截止的作业，要求参与者在不遗漏原任务的前提下完成当天计划重排，并解释为什么这样调整。",
  testPlan: "邀请有临时调课经历的同学，使用同一组虚构任务分别手动重排和使用原型重排，记录完成时间、遗漏项和理由理解度。",
  testResult: "",
  iterationPlan: "",
  materialId: ""
};

function getRunPersonas(source) {
  const personas = new Map();
  for (const run of [...source.sparkRuns, ...source.mirrorRuns]) {
    for (const persona of run.personas || []) personas.set(persona.id, persona);
  }
  return [...personas.values()];
}

let studentActiveView = "overview";

function getStudentProject(source = state) {
  return {
    ...(source.isSample ? studentSample : {}),
    ...(source.studentProject || {})
  };
}

function hasOwnEvidence(source) {
  return source.materials.some(item => !item.isSample && hasMaterialExcerpt(item));
}

function hasStudentFields(project, ...keys) {
  return keys.every(key => typeof project[key] === "string" && project[key].trim());
}

function hasSolutionDetails(project) {
  return hasStudentFields(project, "innovation") && ["solution", "aiRole"].some(key => hasStudentFields(project, key));
}

function getReadiness(project = getStudentProject(), source = state) {
  const milestones = [
    { id: "problem", label: "问题定义", short: "说明用户、场景和现有做法", done: hasStudentFields(project, "audience", "problem"), action: "canvas" },
    { id: "evidence", label: "需求证据", short: "关联至少一条脱敏真实资料", done: hasOwnEvidence(source), action: "materials" },
    { id: "solution", label: "方案边界", short: "写清产品方案和它与现有做法的差异", done: hasSolutionDetails(project), action: "canvas" },
    { id: "spark", label: "需求探索", short: "完成一轮 Spark 假设梳理", done: source.sparkRuns.length > 0, action: "spark" },
    { id: "mirror", label: "原型预演", short: "完成一轮 Mirror 任务走查", done: source.mirrorRuns.length > 0, action: "mirror" },
    { id: "persona", label: "人群视角", short: "在一轮 Spark 或 Mirror 中记录参与人群", done: getRunPersonas(source).length > 0, action: "spark" },
    { id: "plan", label: "真人测试", short: "确定假设、统一任务、样本和成功指标", done: hasStudentFields(project, "hypothesis", "testTask", "testPlan", "successMetric"), action: "validation" },
    { id: "result", label: "验证闭环", short: "录入真实观察与证据触发的改动", done: hasStudentFields(project, "testResult", "iterationPlan"), action: "validation" }
  ];
  const done = milestones.filter(item => item.done).length;
  return { milestones, done, score: Math.round(done / milestones.length * 100), next: milestones.find(item => !item.done) };
}

function getStudentReview(project = getStudentProject()) {
  const linkedMaterial = state.materials.find(item => item.id === project.materialId);
  const linkedOwnEvidence = linkedMaterial && !linkedMaterial.isSample && hasMaterialExcerpt(linkedMaterial);
  const participantCount = getRunPersonas(state).length;
  return [
    {
      title: "问题是否来自真实使用情境？",
      ready: hasStudentFields(project, "audience", "problem") && Boolean(linkedOwnEvidence),
      detail: !hasStudentFields(project, "audience", "problem")
        ? "补全目标用户、触发情境和当前替代做法。"
        : linkedOwnEvidence
          ? "已关联用户录入资料。提交前请回看原文并确认脱敏。"
          : "关联一条脱敏访谈、观察或公开资料。示例资料只演示流程。"
    },
    {
      title: "方案的关键改动是否具体？",
      ready: hasSolutionDetails(project),
      detail: hasSolutionDetails(project)
        ? "已说明方案差异。演示时可以用同一任务对比现有做法。"
        : "写明方案如何改善关键步骤，以及它与现有做法的差异。"
    },
    {
      title: "是否记录了每轮的用户视角？",
      ready: participantCount > 0,
      detail: participantCount
        ? `工具记录覆盖 ${participantCount} 类 Persona，可在各轮报告中查看人选。`
        : "进入 Spark 或 Mirror 时，按本轮问题勾选相关 Persona。"
    },
    {
      title: "是否形成真实验证闭环？",
      ready: hasStudentFields(project, "testPlan", "successMetric", "testTask", "testResult", "iterationPlan"),
      detail: project.testResult && project.iterationPlan
        ? "已记录测试结果和证据触发的改动。请保留失败案例与原始记录。"
        : "先写统一任务和成功指标，再邀请真实目标用户完成并记录观察与改动。"
    }
  ];
}

function getEvidenceLedger(project = getStudentProject()) {
  const materialRows = state.materials.map(item => ({
    id: item.id, createdAt: materialTimestamp(item),
    title: item.title,
    type: item.isSample ? "演练资料" : "用户录入",
    status: item.isSample ? "仅作示例" : item.attachment && !hasMaterialExcerpt(item) ? "附件已存 · 待补摘要" : "待核对原始来源",
    tone: item.isSample ? "gray" : "blue"
  }));
  const hypothesisRows = state.sparkRuns.flatMap(run => (run.insights || []).slice(0, 2).map((item, index) => ({
    id: `${run.id}-H${index + 1}`, createdAt: run.createdAt,
    recordId: validationRecordId({ kind: "spark", id: run.id }),
    title: item.title,
    type: "待验证假设",
    status: run.title ? `${run.title} · 需要真人验证` : "需要真人验证",
    tone: "orange"
  })));
  const mirrorRows = state.mirrorRuns.slice(0, 1).map(run => ({
    id: run.id, createdAt: run.createdAt,
    recordId: validationRecordId({ kind: "mirror", id: run.id }),
    title: `${run.title} · ${run.task}`,
    type: "原型预演",
    status: Array.isArray(run.coverage) ? "待真人验证的测试计划" : "历史演示记录",
    tone: "green"
  }));
  const resultRows = project.testResult ? [{
    id: "TEST-01", createdAt: state.testResultRecordedAt,
    title: project.testResult,
    type: "真人测试记录",
    status: "用户录入 · 待复核",
    tone: "purple"
  }] : [];
  return [...resultRows, ...mirrorRows, ...hypothesisRows, ...materialRows].slice(0, 8);
}

function latestStudentReports() {
  return ["Spark", "Mirror"].map(kind => ({
    kind,
    report: state.reports.find(item => item.kind === kind)
  }));
}

const studentViews = [["overview", "项目概况"], ["canvas", "项目蓝图"], ["validation", "验证记录"], ["delivery", "提交中心"]];

const workbenchDate = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
const workbenchClock = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });

function workbenchTime(value, timeOnly = false) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '<span class="workbench-time">未记录时间</span>';
  const day = workbenchDate.format(date);
  const clock = workbenchClock.format(date);
  return `<time class="workbench-time" datetime="${date.toISOString()}" title="${day} ${clock}">${timeOnly ? clock : `${day} ${clock}`}</time>`;
}

function renderStudent() {
  const project = getStudentProject();
  const readiness = getReadiness(project);
  const activeProjects = projectLibrary.filter(item => !item.project.archived);
  return `
    <div class="student-workbench">
      <header class="workbench-header student-page-heading">
        <div class="workbench-identity"><p class="workbench-context">科创工作台${state.isSample ? ' <span class="tag tag-gray">演练案例</span>' : ""}</p>
          <h1>${escapeHTML(state.project.name)}</h1>
          <p class="workbench-description">${escapeHTML(state.project.description)}</p>
        </div>
        <div class="workbench-controls">
          <label for="workbench-project">切换项目</label><select class="select" id="workbench-project">${activeProjects.map(({ project: item }) => `<option value="${escapeHTML(item.id)}" ${item.id === state.project.id ? "selected" : ""}>${escapeHTML(item.name)}</option>`).join("")}</select>
          <label for="workbench-phase">项目阶段</label><select class="select" id="workbench-phase">${projectStages.map(phase => `<option ${phase === state.project.phase ? "selected" : ""}>${escapeHTML(phase)}</option>`).join("")}</select>
        </div>
      </header>
      <div class="student-view-tabs" role="tablist" aria-label="科创工作台">
        ${studentViews.map(([id, label]) => `<button type="button" role="tab" id="workbench-tab-${id}" class="student-view-tab ${studentActiveView === id ? "active" : ""}" data-student-view="${id}" aria-selected="${studentActiveView === id}" ${studentActiveView === id ? 'aria-controls="workbench-panel"' : 'tabindex="-1"'}>${label}</button>`).join("")}
      </div>
      <section class="student-view-panel" id="workbench-panel" role="tabpanel" aria-labelledby="workbench-tab-${studentActiveView}">
        ${studentActiveView === "canvas" ? renderCanvasView(project) : studentActiveView === "validation" ? renderValidationView(project) : studentActiveView === "delivery" ? renderDeliveryView(project) : renderOverviewView(project, readiness)}
      </section>
    </div>`;
}

function renderOverviewView(project, readiness) {
  const ledger = getEvidenceLedger(project);
  const review = getStudentReview(project);
  const counters = [
    { id: "evidence", label: "本项目资料", value: state.materials.length, unit: "份", symbol: "▤" },
    { id: "spark", label: "Spark 需求探索", value: state.sparkRuns.length, unit: "轮", symbol: "✦" },
    { id: "mirror", label: "Mirror 原型预演", value: state.mirrorRuns.length, unit: "轮", symbol: "◫" }
  ];
  return `
    <div class="workbench-overview-grid">
      <article class="card workbench-progress">
        <div class="workbench-ring" style="--ring-value:${readiness.score}%" role="progressbar" aria-label="项目打磨进度" aria-valuenow="${readiness.score}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="${readiness.done} 个节点已完成，共 ${readiness.milestones.length} 个">
          <span>${readiness.score}<small>%</small></span>
        </div>
        <div><h2>项目进度</h2><p><strong>${readiness.done} / ${readiness.milestones.length}</strong> 个关键节点已完成</p>
          ${readiness.next ? `<button class="link-button" type="button" data-readiness-action="${readiness.next.action}">下一步 · ${readiness.next.label} →</button>` : `<p>已记录完整验证流程</p>`}
        </div>
      </article>
      <ul class="workbench-counts">
        ${counters.map(({id, label, value, unit, symbol}) => `<li><button class="card workbench-count workbench-tone-${id}" type="button" data-validation-section="${id}"><span class="workbench-count-icon" aria-hidden="true">${symbol}</span><span><small>${label}</small><strong>${value}<small> ${unit}</small></strong></span><span class="workbench-count-arrow" aria-hidden="true">→</span></button></li>`).join("")}
      </ul>
    </div>
    <div class="student-main-grid">
      <article class="card card-pad project-snapshot-card">
        <div class="student-card-head"><div><span class="student-card-kicker">PROJECT SNAPSHOT</span><h2>项目摘要</h2></div><button class="link-button" type="button" data-student-view="canvas">编辑项目蓝图 →</button></div>
        <div class="snapshot-block"><small>目标用户与场景</small><p>${escapeHTML([project.audience, project.scenario].filter(Boolean).join("\n") || "待补充目标用户和触发情境")}</p></div>
        <div class="snapshot-block"><small>核心痛点</small><p>${escapeHTML(project.problem || "待补充当前做法和最关键的障碍")}</p></div>
        <div class="snapshot-block highlight"><small>方案差异</small><p>${escapeHTML(project.innovation || "待说明与现有方案相比具体改善了哪一步")}</p></div>
      </article>
      <article class="card card-pad review-card">
        <div class="student-card-head"><div><span class="student-card-kicker">READINESS REVIEW</span><h2>答辩前四问</h2></div><span class="tag tag-gray">自动自查</span></div>
        <div class="compact-review-list">${review.map(item => `<div class="compact-review-item"><span class="review-dot ${item.ready ? "ready" : ""}">${item.ready ? "✓" : "!"}</span><div><strong>${item.title}</strong><p>${item.detail}</p></div></div>`).join("")}</div>
      </article>
    </div>
    <article class="card card-pad ledger-card">
      <div class="student-card-head"><div><span class="student-card-kicker">EVIDENCE LEDGER</span><h2>证据、假设与预演记录</h2><p>不同类型的信息分别标记，避免把 Persona 推演写成真实用户结论。</p></div><button class="button button-secondary button-sm" type="button" data-go="materials">管理资料</button></div>
      ${ledger.length ? `<ul class="workbench-ledger">${ledger.map(item => `<li><div>${item.recordId ? `<button type="button" class="link-button" data-run-jump="${escapeHTML(item.recordId)}">${escapeHTML(item.title)} →</button>` : `<strong>${escapeHTML(item.title)}</strong>`}<small>${escapeHTML(item.status)}</small></div><span class="tag tag-${item.tone}">${item.type}</span>${workbenchTime(item.createdAt)}</li>`).join("")}</ul>` : `<div class="student-empty-inline"><span>▤</span><div><strong>还没有验证记录</strong><p>先添加一条需求资料，或运行 Spark 梳理第一批待验证假设。</p></div><button class="button button-primary button-sm" data-validation-section="evidence">添加资料</button></div>`}
    </article>`;
}

function blueprintStepStatus(step, project) {
  const expected = step.fields.filter(key => !studentFields.find(field => field.key === key).optional);
  if (hasStudentFields(project, ...expected)) return "已填写";
  return step.fields.some(key => hasStudentFields(project, key)) ? "填写中" : "待填写";
}

function renderBlueprintEvidence(project) {
  const materials = state.materials.map(item => {
    const label = item.isSample ? `${item.title}（示例）` : item.title;
    return `<option value="${escapeHTML(item.id)}"${item.id === project.materialId ? " selected" : ""}>${escapeHTML(label)}</option>`;
  }).join("");
  return `<div class="form-group">
    <label class="form-label" for="student-material">核心需求来源 <small>选填</small></label>
    <select class="select" id="student-material" name="materialId"><option value="">尚未关联</option>${materials}</select>
    <button class="link-button blueprint-add-evidence" type="button" data-open-modal="material">＋ 添加脱敏资料</button>
  </div>`;
}

function renderCanvasView(project) {
  const statuses = blueprintSteps.map(step => blueprintStepStatus(step, project));
  const complete = statuses.filter(status => status === "已填写").length;
  const savedIndex = blueprintSteps.findIndex(step => step.id === state.blueprintStep);
  const currentIndex = savedIndex >= 0 ? savedIndex : Math.max(0, statuses.findIndex(status => status !== "已填写"));
  const step = blueprintSteps[currentIndex];
  const previous = blueprintSteps[currentIndex - 1];
  const next = blueprintSteps[currentIndex + 1];

  return `
    <div class="blueprint-layout">
      <aside class="card blueprint-nav">
        <h2>科创项目蓝图</h2>
        <label for="blueprint-progress" id="blueprint-progress-label">${complete} / ${blueprintSteps.length} 步已填写</label>
        <progress id="blueprint-progress" value="${complete}" max="${blueprintSteps.length}"></progress>
        <nav class="blueprint-steps" aria-label="项目蓝图步骤">
          ${blueprintSteps.map((item, index) => `<button type="button" class="blueprint-step" data-blueprint-step="${item.id}" ${item === step ? 'aria-current="step"' : ""}>
            <span class="blueprint-step-number" aria-hidden="true">${index + 1}</span>
            <span class="blueprint-step-label"><strong>${item.title}</strong><small data-blueprint-step-status="${statuses[index]}">${statuses[index]}</small></span>
          </button>`).join("")}
        </nav>
      </aside>
      <article class="card blueprint-editor" aria-labelledby="blueprint-step-title">
        <header class="blueprint-editor-head">
          <div><span>第 ${currentIndex + 1} 步 / 共 ${blueprintSteps.length} 步</span><h3 id="blueprint-step-title" tabindex="-1">${step.title}</h3></div>
          <p id="blueprint-save-status" role="status">自动保存到当前浏览器</p>
        </header>
        <p class="blueprint-tip">${step.tip}</p>
        <form id="student-form">
          ${step.fields.map(key => renderStudentField(studentFields.find(field => field.key === key), project)).join("")}
          ${step.id === "problem" ? renderBlueprintEvidence(project) : ""}
          <div class="blueprint-footer">
            ${previous ? `<button class="button button-secondary" type="button" data-blueprint-step="${previous.id}">上一步</button>` : ""}
            <span>暂时不确定的字段可以留空</span>
            ${next
              ? `<button class="button button-primary" type="button" data-blueprint-step="${next.id}">下一步 →</button>`
              : `<button class="button button-primary" type="button" data-student-view="validation">进入验证记录 →</button>`}
          </div>
        </form>
      </article>
    </div>`;
}

function renderStudentField(field, project) {
  const hint = field.key === "testResult" ? "真实测试后填写" : field.optional ? "选填" : "";
  return `<div class="form-group student-form-wide"><label class="form-label" for="student-${field.key}">${field.label}${hint ? ` <small>${hint}</small>` : ""}</label><textarea class="textarea" id="student-${field.key}" name="${field.key}" rows="3" maxlength="1600" placeholder="${field.placeholder}">${escapeHTML(project[field.key] || "")}</textarea></div>`;
}

const validationTools = {
  spark: { label: "Spark", purpose: "需求探索", itemLabel: "需求假设", symbol: "✦", itemKey: "insights", contextKey: "direction" },
  mirror: { label: "Mirror", purpose: "原型预演", itemLabel: "原型问题", symbol: "◫", itemKey: "issues", contextKey: "task" }
};

function getValidationRuns(kind) {
  const tool = validationTools[kind];
  const reports = new Map(state.reports.filter(report => report.kind === tool.label).map(report => [report.id, report]));
  const runs = kind === "spark" ? state.sparkRuns : state.mirrorRuns;
  return runs.map(run => {
    const report = reports.get(run.id);
    return {
      id: run.id, kind, report, date: run.createdAt || report?.createdAt,
      title: run.title || report?.title || tool.purpose,
      items: run[tool.itemKey] || [],
      context: run[tool.contextKey] || report?.desc,
      personas: run.personas
    };
  }).sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));
}

function validationRecordId(record) {
  return `validation-run-${record.kind}-${record.id}`;
}

function renderValidationItems(items) {
  return `<ul class="validation-item-list">${items.map(item => `<li>
    <div><strong>${escapeHTML(item.title)}</strong>${item.detail ? `<p>${escapeHTML(item.detail)}</p>` : ""}${item.count > 1 ? `<small>在 ${item.count} 条结果中出现</small>` : ""}</div>
    <div class="validation-item-meta">${item.level ? `<span class="tag ${item.level === "高" ? "tag-orange" : "tag-gray"}">${escapeHTML(item.level)}优先级</span>` : ""}
      ${item.record ? `<button type="button" class="link-button" data-run-jump="${escapeHTML(validationRecordId(item.record))}">查看轮次 →</button>` : ""}
    </div>
  </li>`).join("")}</ul>`;
}

function renderValidationColumn(kind, records) {
  const tool = validationTools[kind];
  const allItems = new Map();
  for (const record of records) {
    for (const item of record.items) {
      const key = JSON.stringify([item.title, item.detail]);
      const previous = allItems.get(key);
      if (previous) previous.count++;
      else allItems.set(key, { ...item, count: 1, record });
    }
  }
  return `<section class="card card-pad validation-column workbench-tone-${kind}" id="workbench-${kind}" aria-labelledby="heading-${kind}">
    <header class="workbench-section-head">
      <div class="validation-column-label"><span class="workbench-count-icon" aria-hidden="true">${tool.symbol}</span><div><h2 id="heading-${kind}" tabindex="-1">${tool.label} ${tool.purpose}</h2><p>${records.length} 轮记录</p></div></div>
      <button type="button" class="button button-secondary button-sm validation-start" data-start-validation="${kind}">＋ 开始 ${tool.label}</button>
    </header>
    ${records.length ? `<div class="validation-run-list">${records.map(record => `<details class="validation-run" id="${escapeHTML(validationRecordId(record))}">
      <summary><span class="validation-summary-title"><strong>${escapeHTML(record.title)}</strong><small>${escapeHTML(record.context || record.items[0]?.title || "暂无摘要")}</small></span><span class="validation-summary-meta">${workbenchTime(record.date)}<small>${record.items.length} 条${tool.itemLabel}</small></span></summary>
      <div class="validation-run-body">
        ${record.context ? `<p class="validation-run-context">${escapeHTML(record.context)}</p>` : ""}
        ${record.personas?.length ? `<p class="validation-personas">参与 Persona · ${escapeHTML(record.personas.map(persona => persona.name).join("、"))}</p>` : ""}
        ${record.items.length ? renderValidationItems(record.items) : '<p class="workbench-empty">此轮没有保存明细。</p>'}
        ${record.report ? `<button type="button" class="link-button" data-view-report="${escapeHTML(record.report.id)}">查看完整报告 →</button>` : ""}
      </div>
    </details>`).join("")}</div>` : `<p class="workbench-empty">完成一次${tool.purpose}后，本轮结果会自动显示在这里。</p>`}
    <details class="validation-collection" ${allItems.size ? "" : "hidden"}>
      <summary>全部${tool.itemLabel}<span>${allItems.size} 条</span></summary>
      ${renderValidationItems([...allItems.values()])}
    </details>
  </section>`;
}

function renderValidationTimeline(spark, mirror) {
  const groups = new Map();
  const runs = [...spark, ...mirror].sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));
  for (const run of runs) {
    const date = run.date ? new Date(run.date) : null;
    const key = date && Number.isFinite(date.getTime()) ? workbenchDate.format(date) : "未记录日期";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(run);
  }
  return `<section class="card card-pad validation-timeline" aria-labelledby="timeline-title">
    <header class="workbench-section-head"><h2 id="timeline-title">验证时间线</h2><span class="workbench-time">${runs.length} 轮</span></header>
    ${groups.size ? [...groups].map(([day, records]) => `<section class="timeline-day"><h3>${day}</h3><ol>
      ${records.map(record => `<li class="workbench-tone-${record.kind}"><button class="timeline-event" type="button" data-run-jump="${escapeHTML(validationRecordId(record))}"><span class="timeline-tool">${validationTools[record.kind].label}</span><strong>${escapeHTML(record.title)}</strong>${workbenchTime(record.date, true)}<span class="timeline-arrow" aria-hidden="true">↗</span></button></li>`).join("")}
    </ol></section>`).join("") : '<p class="workbench-empty">完成 Spark 或 Mirror 后，此处会按时间记录每一轮。</p>'}
  </section>`;
}

function renderValidationView(project) {
  const spark = getValidationRuns("spark");
  const mirror = getValidationRuns("mirror");
  return `<div class="workbench-validation">
    <section class="card card-pad workbench-evidence-panel" id="workbench-evidence" aria-labelledby="validation-evidence-title">
      <header class="workbench-section-head"><div><h2 id="validation-evidence-title" tabindex="-1">本项目资料</h2><p>${state.materials.length} 份资料，保存在项目证据库</p></div><button type="button" class="button button-secondary button-sm" data-open-modal="material">＋ 录入资料</button></header>
      ${renderEvidenceImport()}
      ${renderEvidenceList(state.materials)}
    </section>
    <div class="validation-columns">${renderValidationColumn("spark", spark)}${renderValidationColumn("mirror", mirror)}</div>
    ${renderValidationTimeline(spark, mirror)}
    ${renderLiveValidation(project)}
  </div>`;
}

function renderLiveValidation(project) {
  const validationFields = studentFields.filter(field => validationFieldKeys.includes(field.key));
  const mirrorPlan = state.mirrorRuns.find(run => run.id === state.mirrorValidationRunId);
  const hasPlan = Boolean(project.hypothesis && project.successMetric && project.testTask && project.testPlan);
  const hasResult = Boolean(project.testResult);
  const hasIteration = Boolean(project.iterationPlan);
  return `
    <div class="validation-sprint" id="workbench-live-test">
      <article class="card card-pad canvas-form-card">
        <div class="sprint-header">
          <div><h2>真人测试与迭代</h2><p>先确定假设、统一任务和成功标准，再记录观察和下一轮改动。</p></div>
          <span class="sprint-status">${hasIteration ? "已形成一轮闭环" : hasResult ? "等待决定改动" : hasPlan ? "可以开始招募" : "正在设计测试"}</span>
        </div>
        <div class="student-boundary-note" style="margin-bottom:18px">
          <span class="boundary-icon">i</span>
          <div><strong>只把真实参与者完成任务后的记录写入“验证结果”</strong><p>Spark 和 Mirror 用于发现问题与完善测试，不替代真人观察。</p></div>
        </div>
        ${mirrorPlan ? `<section class="linked-mirror-plan">
          <div class="student-card-head">
            <div><h2 tabindex="-1">已关联的 Mirror 测试计划</h2><p>${escapeHTML(mirrorPlan.title)} · ${workbenchTime(mirrorPlan.createdAt)}</p></div>
            <button class="link-button" type="button" data-view-report="${escapeHTML(mirrorPlan.id)}">查看原预演</button>
          </div>
          <p class="linked-mirror-task">${escapeHTML(mirrorPlan.task)}</p>
          ${renderRunParticipants(mirrorPlan.personas)}
          <details><summary>展开测试计划</summary>${renderMirrorTestPlan(mirrorPlan)}
            ${mirrorPlan.personaChecks?.length ? `<h3>按人群观察</h3>
            <ul>${mirrorPlan.personaChecks.map(check => `<li><strong>${escapeHTML(check.name)}</strong> ${escapeHTML(check.observe)}</li>`).join("")}</ul>` : ""}
          </details>
        </section>` : ""}
        <form id="student-validation-form" class="student-form-grid">
          <div class="canvas-section-title"><span>01</span><div><strong>预先定义</strong><small>测试开始前写好，不根据结果临时更换标准</small></div></div>
          ${validationFields.slice(0, 4).map(field => renderStudentField(field, project)).join("")}
          <div class="canvas-section-title"><span>02</span><div><strong>记录与迭代</strong><small>保留成功、失败、反例和关键原话</small></div></div>
          ${validationFields.slice(4).map(field => renderStudentField(field, project)).join("")}
          <div class="student-form-wide canvas-save-row"><span>建议在招募前保存测试方案</span><button class="button button-primary" type="submit">保存真人测试记录</button></div>
        </form>
      </article>
      <aside class="canvas-side-stack">
        <article class="card card-pad">
          <div class="student-card-head"><div><span class="student-card-kicker">TEST PROTOCOL</span><h2>一轮最小真人测试</h2></div></div>
          <div class="test-protocol">
            <div class="protocol-step"><span>1</span><div><strong>同一入口</strong><small>每位参与者收到相同背景、材料和起点。</small></div></div>
            <div class="protocol-step"><span>2</span><div><strong>同一任务</strong><small>让参与者完成任务；少提示，先观察行为。</small></div></div>
            <div class="protocol-step"><span>3</span><div><strong>同一指标</strong><small>记录完成时间、错误、求助、放弃和理由理解。</small></div></div>
            <div class="protocol-step"><span>4</span><div><strong>同一复盘</strong><small>把观察对应到具体界面与下一轮改动。</small></div></div>
          </div>
          <div class="evidence-rule"><strong>证据规则</strong><p>“参与者说喜欢”只能作为态度反馈；“完成时间下降、遗漏减少、能复述理由”才是可观察结果。</p></div>
        </article>
      </aside>
    </div>`;
}

const submissionItems = [
    ["pledge", "个人承诺书 PDF", "打印签字，确认原创、真实和无知识产权争议"],
    ["description", "800 字以内作品说明 PDF", "包含场景痛点、设计思路、功能、使用、创新和价值"],
    ["product", "可访问、可交互的完整成品", "提供有效访问链接或清楚的访问方式"],
    ["video", "5 分钟以内有解说 MP4", "完整展示核心任务、实际运行和落地场景"]
];

function renderDeliveryView(project) {
  const checklist = state.submissionChecklist || {};
  const done = submissionItems.filter(([key]) => checklist[key]).length;
  const reportRows = latestStudentReports();
  const { name, deadline } = state.project.competition;
  return `
    <section class="card card-pad workbench-submission" aria-labelledby="submission-title"><div>
      <h2 id="submission-title">参赛材料准备</h2><p>${escapeHTML(name || "当前项目")}${deadline ? ` · 截止 ${escapeHTML(deadline)}` : ""}</p>
    </div><div class="submission-progress"><label for="submission-coverage"><strong>${done} / ${submissionItems.length}</strong> 项已完成</label><progress id="submission-coverage" value="${done}" max="${submissionItems.length}"></progress></div></section>
    <div class="delivery-layout">
      <article class="card card-pad"><div class="student-card-head"><div><h2>参考清单</h2><p>材料格式与篇幅请核对所选赛事的要求。</p></div></div><div class="deliverable-list">${submissionItems.map(([key, title, detail]) => `<label class="deliverable-item ${checklist[key] ? "done" : ""}"><input type="checkbox" data-deliverable="${key}" ${checklist[key] ? "checked" : ""}><span class="deliverable-check" aria-hidden="true">${checklist[key] ? "✓" : "○"}</span><span><strong>${title}</strong><small>${detail}</small></span></label>`).join("")}</div></article>
      <article class="card card-pad"><div class="student-card-head"><div><span class="student-card-kicker">STORYLINE</span><h2>5 分钟演示叙事</h2></div></div><ol class="storyline-list"><li><span>00:00–00:40</span><strong>真实校园问题</strong><p>${escapeHTML(project.problem || "展示用户、场景和当前做法")}</p></li><li><span>00:40–01:40</span><strong>不同人群与需求依据</strong><p>展示资料来源和 Persona 共识、分歧。</p></li><li><span>01:40–03:30</span><strong>完整核心任务</strong><p>从输入到结果走完一条可交互链路。</p></li><li><span>03:30–04:30</span><strong>验证与改动</strong><p>展示 Mirror 问题、真人观察和一次具体改动。</p></li><li><span>04:30–05:00</span><strong>价值与推广</strong><p>说明适用对象、落地方式和可复制场景。</p></li></ol></article>
    </div>
    <div class="delivery-layout lower">
      <article class="card card-pad"><div class="student-card-head"><div><h2>最近验证报告</h2></div><button class="link-button" data-go="reports">全部报告 →</button></div><div class="student-source-list">${reportRows.map(({ kind, report }) => `<div class="student-review-item"><div class="student-review-content"><strong>${report ? escapeHTML(report.title) : `${kind} 尚未运行`}</strong>${report ? `<p>${workbenchTime(report.createdAt)}</p>` : ""}</div>${report ? `<button class="link-button" type="button" data-view-report="${escapeHTML(report.id)}">查看</button>` : `<button class="link-button" type="button" data-start-validation="${kind.toLowerCase()}">开始 →</button>`}</div>`).join("")}</div></article>
      <article class="card card-pad export-card"><span class="export-icon">⇩</span><h2>导出科创项目打磨记录</h2><p>汇总立项画布、重点 Persona、证据分类、Spark / Mirror 报告编号和提交准备状态。</p><button class="button button-primary" type="button" data-export-student>导出 Markdown</button></article>
    </div>`;
}

function storeStudentProject(form, { trim = true, retry = false } = {}) {
  const data = new FormData(form);
  const current = getStudentProject();
  const updates = {};
  [...studentFields.map(field => field.key), "materialId"].forEach(key => {
    if (!data.has(key)) return;
    const value = String(data.get(key) || "");
    updates[key] = trim ? value.trim() : value;
  });
  if (!retry && Object.entries(updates).every(([key, value]) => (current[key] || "") === value)) return false;
  state.studentProject = {
    ...current,
    ...updates
  };
  if (Object.hasOwn(updates, "testResult") && updates.testResult !== (current.testResult || "")) {
    state.testResultRecordedAt = updates.testResult ? Date.now() : null;
  }
  saveState();
  return true;
}

function saveStudentProject(form) {
  storeStudentProject(form);
  renderPage();
  document.querySelector("#student-validation-form [type='submit']")?.focus({ preventScroll: true });
  showToast("真人测试记录已保存");
}

function saveBlueprint(form) {
  const status = document.querySelector("#blueprint-save-status");
  try {
    const changed = storeStudentProject(form, { trim: false, retry: form.dataset.saveFailed === "true" });
    if (!changed) return true;
    delete form.dataset.saveFailed;
    status.textContent = "已保存到当前浏览器";
    status.classList.remove("save-error");
    updateBlueprintProgress();
    return true;
  } catch {
    form.dataset.saveFailed = "true";
    status.textContent = "本地保存失败。请先复制已填内容，保留此页面。";
    status.classList.add("save-error");
    return false;
  }
}

function updateBlueprintProgress() {
  const project = getStudentProject();
  let complete = 0;
  for (const step of blueprintSteps) {
    const status = blueprintStepStatus(step, project);
    const label = document.querySelector(`.blueprint-steps [data-blueprint-step="${step.id}"] [data-blueprint-step-status]`);
    if (label.textContent !== status) {
      label.textContent = status;
      label.dataset.blueprintStepStatus = status;
    }
    if (status === "已填写") complete++;
  }
  const progress = document.querySelector("#blueprint-progress");
  if (progress.value !== complete) {
    progress.value = complete;
    document.querySelector("#blueprint-progress-label").textContent = `${complete} / ${blueprintSteps.length} 步已填写`;
  }
}

function bindBlueprint() {
  const form = document.querySelector("#student-form");
  if (!form) return;
  form.addEventListener("input", () => saveBlueprint(form));
  form.addEventListener("change", () => saveBlueprint(form));
  form.addEventListener("submit", event => {
    event.preventDefault();
    saveBlueprint(form);
  });
  document.querySelectorAll("[data-blueprint-step]").forEach(button => button.addEventListener("click", () => {
    if (button.getAttribute("aria-current") === "step" || !saveBlueprint(form)) return;
    state.blueprintStep = button.dataset.blueprintStep;
    try {
      saveState();
    } catch {
      showToast("本地存储未能记录上次打开的步骤");
    }
    renderPage();
    document.querySelector("#blueprint-step-title")?.focus();
  }));
}

function handleReadinessAction(action) {
  if (studentViews.some(([id]) => id === action)) {
    studentActiveView = action;
    renderPage();
    if (action === "validation") {
      focusWorkbenchSection(document.querySelector("#workbench-live-test h2"));
    } else {
      document.querySelector(`#workbench-tab-${action}`)?.focus({ preventScroll: true });
    }
  } else {
    navigate(action);
  }
}

function focusWorkbenchSection(element) {
  if (!element) return;
  element.setAttribute("tabindex", "-1");
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block: "start" });
}

function openWorkbenchView(button) {
  const blueprint = document.querySelector("#student-form");
  if (blueprint && !saveBlueprint(blueprint)) return;
  const fromBlueprintFooter = button.closest(".blueprint-footer");
  studentActiveView = button.dataset.studentView;
  renderPage();
  if (fromBlueprintFooter) focusWorkbenchSection(document.querySelector("#workbench-live-test h2"));
  else document.querySelector(`#workbench-tab-${studentActiveView}`)?.focus({ preventScroll: true });
}

function bindStudentPage() {
  const workbench = document.querySelector(".student-workbench");
  if (!workbench) return;
  bindBlueprint();
  workbench.querySelector("#workbench-project").addEventListener("change", event => {
    openProject(event.currentTarget.value);
    document.querySelector("#workbench-project")?.focus({ preventScroll: true });
  });
  workbench.querySelector("#workbench-phase").addEventListener("change", event => {
    const select = event.currentTarget;
    const previous = state.project;
    const phase = select.value;
    if (!projectStages.includes(phase)) return;
    state.project = { ...previous, phase, stage: phase };
    try {
      saveState();
      showToast("项目阶段已同步到项目卡片");
    } catch {
      state.project = previous;
      select.value = previous.phase;
      showToast("暂时无法保存项目阶段，请重试。");
    }
  });
  const validationForm = document.querySelector("#student-validation-form");
  validationForm?.addEventListener("change", event => storeStudentProject(event.currentTarget));
  validationForm?.addEventListener("submit", event => { event.preventDefault(); saveStudentProject(event.currentTarget); });
  workbench.querySelectorAll("[data-student-view]").forEach(button => button.addEventListener("click", () => openWorkbenchView(button)));
  const tabs = [...workbench.querySelectorAll('[role="tab"]')];
  workbench.querySelector('[role="tablist"]').addEventListener("keydown", event => {
    const current = tabs.indexOf(event.target);
    const target = { ArrowLeft: (current + tabs.length - 1) % tabs.length, ArrowRight: (current + 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    if (target !== current) openWorkbenchView(tabs[target]);
  });
  workbench.querySelectorAll("[data-validation-section]").forEach(button => button.addEventListener("click", () => {
    studentActiveView = "validation";
    renderPage();
    focusWorkbenchSection(document.querySelector(`#workbench-${button.dataset.validationSection} h2`));
  }));
  workbench.querySelectorAll("[data-run-jump]").forEach(button => button.addEventListener("click", () => {
    if (studentActiveView !== "validation") {
      studentActiveView = "validation";
      renderPage();
    }
    const record = document.getElementById(button.dataset.runJump);
    if (!record) return;
    record.open = true;
    focusWorkbenchSection(record.querySelector("summary"));
    record.querySelector("summary").removeAttribute("tabindex");
  }));
  workbench.querySelectorAll("[data-start-validation]").forEach(button => button.addEventListener("click", () => {
    const kind = button.dataset.startValidation;
    if (kind === "spark") currentSparkResult = null;
    else currentMirrorResult = null;
    navigate(kind);
    document.querySelector(`#${kind}-form textarea`)?.focus({ preventScroll: true });
  }));
  document.querySelectorAll("[data-readiness-action]").forEach(button => button.addEventListener("click", () => handleReadinessAction(button.dataset.readinessAction)));
  document.querySelectorAll("[data-deliverable]").forEach(input => input.addEventListener("change", () => {
    const key = input.dataset.deliverable;
    const previous = state.submissionChecklist;
    state.submissionChecklist = { ...previous, [key]: input.checked };
    try {
      saveState();
    } catch {
      state.submissionChecklist = previous;
      input.checked = Boolean(previous?.[key]);
      return showToast("清单暂时无法保存，请重试。");
    }
    renderPage();
    document.querySelector(`[data-deliverable="${key}"]`)?.focus({ preventScroll: true });
  }));
}

function exportStudentProject() {
  const form = document.querySelector("#student-form");
  if (form) saveBlueprint(form);
  const project = getStudentProject();
  const readiness = getReadiness(project);
  const linkedMaterial = state.materials.find(item => item.id === project.materialId);
  const usedPersonas = getRunPersonas(state);
  const legacyPersonas = state.personas.filter(item => state.studentProject?.focusPersonas?.includes(item.id));
  const materialRecord = linkedMaterial
    ? `- 标题：${linkedMaterial.title}\n- 来源：${linkedMaterial.source}\n- 资料 ID：${linkedMaterial.id}\n\n> ${linkedMaterial.content}\n\n${linkedMaterial.isSample ? "这条记录是内置演练资料。" : "以上为用户录入资料，提交前需回看原始来源并确认脱敏。"}`
    : "尚未关联核心需求来源。";
  const fieldSummary = (key, level) => {
    const field = studentFields.find(item => item.key === key);
    return `${"#".repeat(level)} ${field.label}\n\n${project[key]?.trim() || (field.optional ? "未填写（选填）" : "待填写")}`;
  };
  const fields = blueprintSteps.map(step => `### ${step.title}\n\n${step.fields.map(key => fieldSummary(key, 4)).join("\n\n")}`).join("\n\n");
  const validation = validationFieldKeys.slice(2).map(key => fieldSummary(key, 3)).join("\n\n");
  const milestones = readiness.milestones.map(item => `- ${item.done ? "已完成" : "待完成"} · ${item.label}：${item.short}`).join("\n");
  const personaRows = usedPersonas.length ? usedPersonas.map(item => `- ${item.name}`).join("\n") : "尚未记录参与推演的人群。";
  const legacyPersonaNote = legacyPersonas.length ? `\n\n旧版项目重点人群：${legacyPersonas.map(item => item.name).join("、")}。` : "";
  const ledger = getEvidenceLedger(project).map(item => `- [${item.type}] ${item.title}（${item.status}，记录 ID ${item.id}）`).join("\n") || "尚无记录。";
  const reports = latestStudentReports().map(({ kind, report }) => report ? `- ${kind}：${report.title}（报告 ID ${report.id}）。${report.desc}` : `- ${kind}：尚未运行。`).join("\n");
  const submission = submissionItems.map(([key, title]) => `- [${state.submissionChecklist?.[key] ? "x" : " "}] ${title}`).join("\n");
  const linkedMirrorPlan = state.mirrorRuns.find(run => run.id === state.mirrorValidationRunId);
  const mirrorSource = linkedMirrorPlan ? `关联的 Mirror 测试计划：${linkedMirrorPlan.title}（记录 ID ${linkedMirrorPlan.id}）\n\n` : "";
  const body = `# ${state.project.name} · PersonaLab 科创项目打磨记录

> PersonaLab V2.0-student · ${state.isSample ? "当前为内置演练案例。" : "当前为用户本地项目。"} Persona 和规则推演用于发现问题，真实结论需要可追溯资料与真人测试支持。

## 当前进度

打磨进度：${readiness.score}%（${readiness.done}/8 个关键节点）

${milestones}

## 项目蓝图

${fields}

## 真人验证计划、结果与迭代

${mirrorSource}${validation}

## 核心需求来源

${materialRecord}

## 工具记录中的 Persona

${personaRows}${legacyPersonaNote}

## 证据、假设与预演台账

${ledger}

## 最近推演报告

${reports}

## 参赛材料准备清单

${submission}
`;
  const url = URL.createObjectURL(new Blob([body], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.project.name.replace(/[\\/:*?"<>|]/g, "-")}-科创项目打磨记录.md`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("打磨记录已导出");
}

window.studentWorkbench = {
  render: renderStudent,
  export: exportStudentProject,
  bind: bindStudentPage,
  readiness: getReadiness,
  readinessFor: source => getReadiness(getStudentProject(source), source)
};
