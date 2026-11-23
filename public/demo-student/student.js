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

const personaPainPrompts = {
  p1: { concern: "首次进入时看不懂价值与入口", observe: "能否在 30 秒内说出产品用途并找到核心任务" },
  p2: { concern: "重复操作和维护成本过高", observe: "完成高频任务需要几步，是否出现重复录入" },
  p3: { concern: "不清楚数据用途和授权范围", observe: "能否说明产品读取了什么，以及如何拒绝或删除" },
  p4: { concern: "专业词汇和复杂流程造成误操作", observe: "遇到错误后能否理解提示并恢复" },
  p5: { concern: "关键信息只靠颜色或鼠标操作", observe: "能否使用键盘、文字提示和清晰层级完成任务" },
  p6: { concern: "部署成本、责任边界和维护方式不清楚", observe: "能否说清谁负责、需要哪些资源，以及出现错误时如何处理" }
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
  return source.materials.some(item => !item.isSample && item.content?.trim() && item.content !== "未填写内容摘要");
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
  const linkedOwnEvidence = linkedMaterial && !linkedMaterial.isSample && linkedMaterial.content?.trim() && linkedMaterial.content !== "未填写内容摘要";
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
    id: item.id,
    title: item.title,
    type: item.isSample ? "演练资料" : "用户录入",
    status: item.isSample ? "仅作示例" : "待核对原始来源",
    tone: item.isSample ? "gray" : "blue"
  }));
  const hypothesisRows = state.sparkRuns.flatMap(run => (run.insights || []).slice(0, 2).map((item, index) => ({
    id: `${run.id}-H${index + 1}`,
    title: item.title,
    type: "待验证假设",
    status: "需要真人验证",
    tone: "orange"
  })));
  const mirrorRows = state.mirrorRuns.slice(0, 1).map(run => ({
    id: run.id,
    title: `${run.title} · ${run.task}`,
    type: "原型预演",
    status: `${run.scoredCount}/8 维示例分`,
    tone: "green"
  }));
  const resultRows = project.testResult ? [{
    id: "TEST-01",
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

function renderStudent() {
  const project = getStudentProject();
  const readiness = getReadiness(project);
  return `
    <div class="page-heading student-page-heading">
      <div>
        <p class="eyebrow">PERSONALAB V2.0-STUDENT · COMPETITION WORKBENCH</p>
        <h1>${escapeHTML(state.project.name)} · 赛前验证驾驶舱</h1>
        <p>梳理项目痛点、需求依据和不同人群的意见，再通过原型预演与真人测试验证方案。</p>
      </div>
      <div class="heading-actions">
        <button class="button button-secondary" type="button" data-export-student>导出打磨记录</button>
        <button class="button button-primary" type="button" data-go="spark">Spark 需求探索</button>
        <button class="button button-secondary" type="button" data-go="mirror">Mirror 原型预演</button>
      </div>
    </div>
    <div class="student-boundary-note">
      <span class="boundary-icon">i</span>
      <div><strong>${state.isSample ? "当前为内置演练案例" : "当前为本地项目工作区"}</strong><p>Persona 与本地规则用于发现问题。真实结论必须来自可追溯资料和真人任务测试。</p></div>
      <span class="tag tag-gray">证据边界已开启</span>
    </div>
    ${renderStageRail(readiness)}
    <div class="student-view-tabs" role="tablist" aria-label="项目打磨视图">
      ${[
        ["overview", "项目总览"], ["canvas", "项目蓝图"], ["validation", "验证冲刺"], ["delivery", "提交中心"]
      ].map(([id, label]) => `<button type="button" role="tab" class="student-view-tab ${studentActiveView === id ? "active" : ""}" data-student-view="${id}" aria-selected="${studentActiveView === id}">${label}</button>`).join("")}
    </div>
    <section class="student-view-panel">
      ${studentActiveView === "canvas" ? renderCanvasView(project) : studentActiveView === "validation" ? renderValidationView(project) : studentActiveView === "delivery" ? renderDeliveryView(project) : renderOverviewView(project, readiness)}
    </section>`;
}

function renderStageRail(readiness) {
  const stages = [
    ["problem", "项目蓝图"], ["evidence", "需求资料"],
    ["spark", "Spark 探索"], ["mirror", "Mirror 预演"], ["result", "验证冲刺"]
  ];
  return `<div class="stage-rail" aria-label="项目工具">
    ${stages.map(([id, label]) => {
      const milestone = readiness.milestones.find(item => item.id === id);
      return `<button type="button" class="stage-step ${milestone.done ? "done" : ""}" data-readiness-action="${milestone.action}"><span aria-hidden="true">${milestone.done ? "✓" : "·"}</span><strong>${label}</strong></button>`;
    }).join("")}
  </div>`;
}

function renderOverviewView(project, readiness) {
  const ledger = getEvidenceLedger(project);
  const review = getStudentReview(project);
  const evidenceCount = state.materials.filter(item => !item.isSample).length;
  const hypothesisCount = state.sparkRuns.reduce((sum, run) => sum + (run.insights?.length || 0), 0);
  return `
    <div class="student-dashboard-grid">
      <article class="card readiness-card">
        <div class="readiness-ring" style="--readiness:${readiness.score}"><div><strong>${readiness.score}</strong><small>打磨进度</small></div></div>
        <div class="readiness-copy"><span class="tag tag-purple">${readiness.done}/8 个关键节点</span><h2>${readiness.next ? `下一步 · ${readiness.next.label}` : "已形成完整验证闭环"}</h2><p>${readiness.next?.short || "继续保留真实测试记录和每轮原型改动。"}</p>${readiness.next ? `<button class="button button-primary button-sm" type="button" data-readiness-action="${readiness.next.action}">去完成 →</button>` : ""}</div>
      </article>
      <article class="card dashboard-stat-card"><span class="dashboard-stat-icon blue">▤</span><div><small>用户录入资料</small><strong>${evidenceCount}</strong><p>${evidenceCount ? "回看原始来源并确认脱敏" : "示例资料不会计入真实证据"}</p></div></article>
      <article class="card dashboard-stat-card"><span class="dashboard-stat-icon orange">◇</span><div><small>待验证假设</small><strong>${hypothesisCount}</strong><p>${hypothesisCount ? "把假设转成真人测试任务" : "运行 Spark 形成首轮问题"}</p></div></article>
      <article class="card dashboard-stat-card"><span class="dashboard-stat-icon green">◫</span><div><small>原型预演轮次</small><strong>${state.mirrorRuns.length}</strong><p>${state.mirrorRuns.length ? "查看问题后安排真人测试" : "用 Mirror 走查一个核心任务"}</p></div></article>
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
      ${ledger.length ? `<div class="ledger-table"><div class="ledger-row ledger-head"><span>编号</span><span>记录</span><span>类型</span><span>当前状态</span></div>${ledger.map(item => `<div class="ledger-row"><code>${escapeHTML(item.id)}</code><strong>${escapeHTML(item.title)}</strong><span class="tag tag-${item.tone}">${item.type}</span><small>${item.status}</small></div>`).join("")}</div>` : `<div class="student-empty-inline"><span>▤</span><div><strong>还没有验证记录</strong><p>先添加一条需求资料，或运行 Spark 梳理第一批待验证假设。</p></div><button class="button button-primary button-sm" data-go="materials">添加资料</button></div>`}
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
              : `<button class="button button-primary" type="button" data-student-view="validation">进入验证冲刺 →</button>`}
          </div>
        </form>
      </article>
    </div>`;
}

function renderStudentField(field, project) {
  const hint = field.key === "testResult" ? "真实测试后填写" : field.optional ? "选填" : "";
  return `<div class="form-group student-form-wide"><label class="form-label" for="student-${field.key}">${field.label}${hint ? ` <small>${hint}</small>` : ""}</label><textarea class="textarea" id="student-${field.key}" name="${field.key}" rows="3" maxlength="1600" placeholder="${field.placeholder}">${escapeHTML(project[field.key] || "")}</textarea></div>`;
}

function renderValidationView(project) {
  const validationFields = studentFields.filter(field => validationFieldKeys.includes(field.key));
  const hasPlan = Boolean(project.hypothesis && project.successMetric && project.testTask && project.testPlan);
  const hasResult = Boolean(project.testResult);
  const hasIteration = Boolean(project.iterationPlan);
  const ownEvidenceCount = state.materials.filter(item => !item.isSample).length;
  return `
    <div class="validation-sprint">
      <article class="card card-pad canvas-form-card">
        <div class="sprint-header">
          <div><span class="student-card-kicker">VALIDATION SPRINT</span><h2>把“我觉得好用”改成可观察的验证</h2><p>先锁定假设、统一任务和成功标准，再记录真实行为、反例与由此触发的改动。</p></div>
          <span class="sprint-status">${hasIteration ? "已形成一轮闭环" : hasResult ? "等待决定改动" : hasPlan ? "可以开始招募" : "正在设计测试"}</span>
        </div>
        <div class="student-boundary-note" style="margin-bottom:18px">
          <span class="boundary-icon">i</span>
          <div><strong>只把真实参与者完成任务后的记录写入“验证结果”</strong><p>Spark 和 Mirror 用于发现问题与完善测试，不替代真人观察。</p></div>
        </div>
        <form id="student-validation-form" class="student-form-grid">
          <div class="canvas-section-title"><span>01</span><div><strong>预先定义</strong><small>测试开始前写好，不根据结果临时更换标准</small></div></div>
          ${validationFields.slice(0, 4).map(field => renderStudentField(field, project)).join("")}
          <div class="canvas-section-title"><span>02</span><div><strong>记录与迭代</strong><small>保留成功、失败、反例和关键原话</small></div></div>
          ${validationFields.slice(4).map(field => renderStudentField(field, project)).join("")}
          <div class="student-form-wide canvas-save-row"><span>建议先保存空白测试方案，再开始招募</span><button class="button button-primary" type="submit">保存验证冲刺</button></div>
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
        <article class="card card-pad">
          <div class="student-card-head"><div><span class="student-card-kicker">EVIDENCE STATUS</span><h2>当前可用资产</h2></div></div>
          <div class="mini-evidence-grid"><div><b>${ownEvidenceCount}</b><small>用户录入资料</small></div><div><b>${state.sparkRuns.length}</b><small>Spark 轮次</small></div><div><b>${state.mirrorRuns.length}</b><small>Mirror 轮次</small></div></div>
          <button class="button button-secondary button-sm" style="margin-top:14px;width:100%" type="button" data-go="mirror">先用 Mirror 检查任务 →</button>
        </article>
      </aside>
    </div>`;
}

function renderDeliveryView(project) {
  const checklist = state.submissionChecklist || {};
  const items = [
    ["pledge", "个人承诺书 PDF", "打印签字，确认原创、真实和无知识产权争议"],
    ["description", "800 字以内作品说明 PDF", "包含场景痛点、设计思路、功能、使用、创新和价值"],
    ["product", "可访问、可交互的完整成品", "提供有效访问链接或清楚的访问方式"],
    ["video", "5 分钟以内有解说 MP4", "完整展示核心任务、实际运行和落地场景"]
  ];
  const done = items.filter(([key]) => checklist[key]).length;
  const reportRows = latestStudentReports();
  return `
    <div class="delivery-hero"><div><span class="student-card-kicker">SUBMISSION READINESS</span><h2>把验证过程转成有说服力的参赛材料</h2><p>先确保作品能运行，再用需求证据、Persona 分歧和原型改动讲清项目价值。</p></div><div class="delivery-score"><strong>${done}/4</strong><small>材料已准备</small></div></div>
    <div class="delivery-layout">
      <article class="card card-pad"><div class="student-card-head"><div><span class="student-card-kicker">REQUIRED FILES</span><h2>提交材料清单</h2></div><span class="tag ${done === 4 ? "tag-green" : "tag-orange"}">${done === 4 ? "已齐备" : `还差 ${4 - done} 项`}</span></div><div class="deliverable-list">${items.map(([key, title, detail], index) => `<label class="deliverable-item ${checklist[key] ? "done" : ""}"><input type="checkbox" data-deliverable="${key}" ${checklist[key] ? "checked" : ""}><span class="deliverable-check">${checklist[key] ? "✓" : index + 1}</span><span><strong>${title}</strong><small>${detail}</small></span></label>`).join("")}</div></article>
      <article class="card card-pad"><div class="student-card-head"><div><span class="student-card-kicker">STORYLINE</span><h2>5 分钟演示叙事</h2></div></div><ol class="storyline-list"><li><span>00:00–00:40</span><strong>真实校园问题</strong><p>${escapeHTML(project.problem || "展示用户、场景和当前做法")}</p></li><li><span>00:40–01:40</span><strong>不同人群与需求依据</strong><p>展示资料来源和 Persona 共识、分歧。</p></li><li><span>01:40–03:30</span><strong>完整核心任务</strong><p>从输入到结果走完一条可交互链路。</p></li><li><span>03:30–04:30</span><strong>验证与改动</strong><p>展示 Mirror 问题、真人观察和一次具体改动。</p></li><li><span>04:30–05:00</span><strong>价值与推广</strong><p>说明适用对象、落地方式和可复制场景。</p></li></ol></article>
    </div>
    <div class="delivery-layout lower">
      <article class="card card-pad"><div class="student-card-head"><div><span class="student-card-kicker">REPORT ASSETS</span><h2>现有验证资产</h2></div><button class="link-button" data-go="reports">报告中心 →</button></div><div class="student-source-list">${reportRows.map(({ kind, report }) => `<div class="student-review-item"><div class="student-review-content"><strong>${kind === "Spark" ? "Spark 需求探索" : "Mirror 原型预演"}</strong><p>${report ? escapeHTML(report.desc) : "尚未运行"}</p></div>${report ? `<button class="link-button" type="button" data-view-report="${escapeHTML(report.id)}">查看</button>` : `<button class="link-button" type="button" data-go="${kind.toLowerCase()}">开始 →</button>`}</div>`).join("")}</div></article>
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
  saveState();
  return true;
}

function saveStudentProject(form) {
  storeStudentProject(form);
  renderPage();
  showToast("验证冲刺已保存");
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
  if (["overview", "canvas", "validation", "delivery"].includes(action)) {
    studentActiveView = action;
    renderPage();
  } else {
    navigate(action);
  }
}

function bindStudentPage() {
  bindBlueprint();
  const validationForm = document.querySelector("#student-validation-form");
  validationForm?.addEventListener("change", event => storeStudentProject(event.currentTarget));
  validationForm?.addEventListener("submit", event => { event.preventDefault(); saveStudentProject(event.currentTarget); });
  document.querySelectorAll("[data-student-view]").forEach(button => button.addEventListener("click", () => {
    const blueprint = document.querySelector("#student-form");
    if (blueprint && !saveBlueprint(blueprint)) return;
    const fromBlueprintFooter = button.closest(".blueprint-footer");
    studentActiveView = button.dataset.studentView;
    renderPage();
    if (fromBlueprintFooter) document.querySelector("#student-hypothesis")?.focus();
  }));
  document.querySelectorAll("[data-readiness-action]").forEach(button => button.addEventListener("click", () => handleReadinessAction(button.dataset.readinessAction)));
  document.querySelectorAll("[data-deliverable]").forEach(input => input.addEventListener("change", () => {
    state.submissionChecklist = { ...(state.submissionChecklist || {}), [input.dataset.deliverable]: input.checked };
    saveState();
    renderPage();
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
  const body = `# ${state.project.name} · PersonaLab 科创项目打磨记录

> PersonaLab V2.0-student · ${state.isSample ? "当前为内置演练案例。" : "当前为用户本地项目。"} Persona 和规则推演用于发现问题，真实结论需要可追溯资料与真人测试支持。

## 当前进度

打磨进度：${readiness.score}%（${readiness.done}/8 个关键节点）

${milestones}

## 项目蓝图

${fields}

## 真人验证计划、结果与迭代

${validation}

## 核心需求来源

${materialRecord}

## 工具记录中的 Persona

${personaRows}${legacyPersonaNote}

## 证据、假设与预演台账

${ledger}

## 最近推演报告

${reports}
`;
  const url = URL.createObjectURL(new Blob([body], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "PersonaLab-V2.0-科创项目打磨记录.md";
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
