const studentFields = [
  { key: "audience", label: "目标用户与校园场景", placeholder: "哪类同学在什么时刻会遇到这个问题？" },
  { key: "problem", label: "核心痛点与现有做法", placeholder: "他们现在怎么处理？哪一步最费时、最容易出错？" },
  { key: "innovation", label: "方案与关键差异", placeholder: "和现有做法相比，你具体改善了哪一步？" },
  { key: "aiRole", label: "AI 的输入、输出与人工确认", placeholder: "AI 读取什么、生成什么、由谁核对和决定？" },
  { key: "hypothesis", label: "核心验证假设", placeholder: "如果为哪类用户提供什么能力，那么什么可观察行为会发生变化？" },
  { key: "successMetric", label: "成功标准", placeholder: "用什么指标判断方案有效？例如完成时间、错误数、理解度。" },
  { key: "testTask", label: "统一测试任务", placeholder: "所有参与者完成同一个什么任务？给出相同材料、起点和完成条件。" },
  { key: "testPlan", label: "下一轮真人验证计划", placeholder: "招募谁、完成什么任务、记录什么现象？" },
  { key: "testResult", label: "真实验证记录", placeholder: "尚未测试可留空。测试后记录样本、观察、失败案例和反例。" },
  { key: "iterationPlan", label: "由证据触发的下一轮改动", placeholder: "哪条观察促使你改什么？保留、不改或继续验证的理由是什么？" }
];

const studentSample = {
  audience: "学生在课程或作业临时变化后，需要重新安排当天的课程、作业和小组任务。",
  problem: "学生通常在课程表和待办清单之间手动调整，遇到任务冲突时需要逐项判断优先级，也难以看清调整理由。",
  innovation: "系统先解释时间冲突和任务依赖，再给出可修改的调整草案，让学生逐条接受、修改或撤回。",
  aiRole: "智能体读取学生主动确认的任务清单和临时变更，生成备选顺序并解释依据，最终安排由学生确认。",
  hypothesis: "若先展示冲突原因再给出可修改的重排草案，学生会更快完成重排，并减少任务遗漏。",
  successMetric: "与手动重排相比，任务遗漏更少、完成时间更短，且用户能够复述调整理由。",
  testTask: "新增一项两小时后截止的作业，要求参与者在不遗漏原任务的前提下完成当天计划重排，并解释为什么这样调整。",
  testPlan: "邀请有临时调课经历的同学，使用同一组虚构任务分别手动重排和使用原型重排，记录完成时间、遗漏项和理由理解度。",
  testResult: "",
  iterationPlan: "",
  materialId: "",
  focusPersonas: ["p1", "p2", "p3"]
};

const personaPainPrompts = {
  p1: { concern: "首次进入时看不懂价值与入口", observe: "能否在 30 秒内说出产品用途并找到核心任务" },
  p2: { concern: "重复操作和维护成本过高", observe: "完成高频任务需要几步，是否出现重复录入" },
  p3: { concern: "不清楚数据用途和授权范围", observe: "能否说明产品读取了什么，以及如何拒绝或删除" },
  p4: { concern: "专业词汇和复杂流程造成误操作", observe: "遇到错误后能否理解提示并恢复" },
  p5: { concern: "关键信息只靠颜色或鼠标操作", observe: "能否使用键盘、文字提示和清晰层级完成任务" },
  p6: { concern: "部署成本、责任边界和维护方式不清楚", observe: "能否说清谁负责、需要哪些资源，以及出现错误时如何处理" }
};

let studentActiveView = "overview";

function getStudentProject() {
  return {
    ...(state.isSample ? studentSample : {}),
    ...(state.studentProject || {}),
    focusPersonas: state.studentProject?.focusPersonas || (state.isSample ? studentSample.focusPersonas : [])
  };
}

function hasOwnEvidence() {
  return state.materials.some(item => !item.isSample && item.content?.trim() && item.content !== "未填写内容摘要");
}

function getReadiness(project = getStudentProject()) {
  const milestones = [
    { id: "problem", label: "问题定义", short: "说明用户、场景和现有做法", done: Boolean(project.audience && project.problem), action: "canvas" },
    { id: "evidence", label: "需求证据", short: "关联至少一条脱敏真实资料", done: hasOwnEvidence(), action: "materials" },
    { id: "solution", label: "方案边界", short: "写清差异和 AI 的人工确认", done: Boolean(project.innovation && project.aiRole), action: "canvas" },
    { id: "persona", label: "人群视角", short: "选择至少三类重点 Persona", done: project.focusPersonas.length >= 3, action: "personas" },
    { id: "spark", label: "需求探索", short: "完成一轮 Spark 假设梳理", done: state.sparkRuns.length > 0, action: "spark" },
    { id: "mirror", label: "原型预演", short: "完成一轮 Mirror 任务走查", done: state.mirrorRuns.length > 0, action: "mirror" },
    { id: "plan", label: "真人测试", short: "确定假设、统一任务、样本和成功指标", done: Boolean(project.hypothesis && project.testTask && project.testPlan && project.successMetric), action: "validation" },
    { id: "result", label: "验证闭环", short: "录入真实观察与证据触发的改动", done: Boolean(project.testResult && project.iterationPlan), action: "validation" }
  ];
  const done = milestones.filter(item => item.done).length;
  return { milestones, done, score: Math.round(done / milestones.length * 100), next: milestones.find(item => !item.done) };
}

function getStudentReview(project = getStudentProject()) {
  const linkedMaterial = state.materials.find(item => item.id === project.materialId);
  const linkedOwnEvidence = linkedMaterial && !linkedMaterial.isSample && linkedMaterial.content?.trim() && linkedMaterial.content !== "未填写内容摘要";
  return [
    {
      title: "问题是否来自真实校园情境？",
      ready: Boolean(project.audience && project.problem && linkedOwnEvidence),
      detail: !project.audience || !project.problem
        ? "补全目标用户、触发情境和当前替代做法。"
        : linkedOwnEvidence
          ? "已关联用户录入资料。提交前请回看原文并确认脱敏。"
          : "关联一条脱敏访谈、观察或公开资料。示例资料只演示流程。"
    },
    {
      title: "方案和 AI 的作用是否具体？",
      ready: Boolean(project.innovation && project.aiRole),
      detail: project.innovation && project.aiRole
        ? "已说明方案差异和人工确认。演示时使用同一任务对比现有做法。"
        : "写明改善的关键步骤，以及 AI 的输入、输出和最终决策者。"
    },
    {
      title: "是否覆盖不同人群的关键顾虑？",
      ready: project.focusPersonas.length >= 3,
      detail: project.focusPersonas.length >= 3
        ? `已选择 ${project.focusPersonas.length} 类重点 Persona，下一步把关注点写进测试任务。`
        : "至少选择三类差异明显的 Persona，比较共识、分歧与使用障碍。"
    },
    {
      title: "是否形成真实验证闭环？",
      ready: Boolean(project.testPlan && project.successMetric && project.testTask && project.testResult && project.iterationPlan),
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
        <p>把校园痛点、需求依据、多类 Persona、原型预演和真人测试连成一条可说明的证据链。</p>
      </div>
      <div class="heading-actions">
        <button class="button button-secondary" type="button" data-export-student>导出打磨记录</button>
        <button class="button button-primary" type="button" data-go="spark">开始需求探索 →</button>
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
        ["overview", "项目总览"], ["canvas", "项目蓝图"], ["personas", "Persona 痛点"], ["validation", "验证冲刺"], ["delivery", "提交中心"]
      ].map(([id, label]) => `<button type="button" role="tab" class="student-view-tab ${studentActiveView === id ? "active" : ""}" data-student-view="${id}" aria-selected="${studentActiveView === id}">${label}</button>`).join("")}
    </div>
    <section class="student-view-panel">
      ${studentActiveView === "canvas" ? renderCanvasView(project) : studentActiveView === "personas" ? renderPersonaView(project) : studentActiveView === "validation" ? renderValidationView(project) : studentActiveView === "delivery" ? renderDeliveryView(project) : renderOverviewView(project, readiness)}
    </section>`;
}

function renderStageRail(readiness) {
  const stages = [
    ["problem", "01", "定义问题"], ["evidence", "02", "补充证据"], ["persona", "03", "选择人群"],
    ["spark", "04", "探索假设"], ["mirror", "05", "预演原型"], ["result", "06", "形成闭环"]
  ];
  return `<div class="stage-rail" aria-label="验证流程">
    ${stages.map(([id, index, label], position) => {
      const milestone = readiness.milestones.find(item => item.id === id);
      return `${position ? `<span class="stage-connector ${milestone.done ? "done" : ""}"></span>` : ""}<button type="button" class="stage-step ${milestone.done ? "done" : ""}" data-readiness-action="${milestone.action}"><span>${milestone.done ? "✓" : index}</span><strong>${label}</strong></button>`;
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
        <div class="student-card-head"><div><span class="student-card-kicker">PROJECT SNAPSHOT</span><h2>一句话说清你的项目</h2></div><button class="link-button" type="button" data-student-view="canvas">编辑立项画布 →</button></div>
        <div class="snapshot-block"><small>目标用户与场景</small><p>${escapeHTML(project.audience || "待补充目标用户和触发情境")}</p></div>
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

function renderCanvasView(project) {
  const materials = state.materials.map(item => `<option value="${escapeHTML(item.id)}"${item.id === project.materialId ? " selected" : ""}>${escapeHTML(item.title)} · ${escapeHTML(item.source)}</option>`).join("");
  const review = getStudentReview(project);
  return `
    <div class="student-canvas-layout">
      <article class="card card-pad canvas-form-card">
        <div class="student-card-head"><div><span class="student-card-kicker">PROJECT BLUEPRINT</span><h2>科创项目蓝图</h2><p>先写事实和当前判断，后续再用资料、原型预演与真人测试逐项核对。</p></div><button class="link-button" type="button" data-open-modal="project">编辑项目名称</button></div>
        <form id="student-form" class="student-form-grid">
          <div class="canvas-section-title"><span>01</span><div><strong>问题与人群</strong><small>说明问题发生在谁身上、何时发生</small></div></div>
          ${studentFields.slice(0, 2).map(field => renderStudentField(field, project)).join("")}
          <div class="form-group student-form-wide"><label class="form-label" for="student-material">关联一条核心需求来源</label><select class="select" id="student-material" name="materialId"><option value="">尚未关联</option>${materials}</select><div class="inline-form-actions"><small>只关联能直接支持核心问题的资料</small><button class="link-button" type="button" data-open-modal="material">＋ 添加脱敏资料</button></div></div>
          <div class="canvas-section-title"><span>02</span><div><strong>方案与 AI 边界</strong><small>说明改善点、智能体作用和人工确认</small></div></div>
          ${studentFields.slice(2, 4).map(field => renderStudentField(field, project)).join("")}
          <div class="canvas-section-title"><span>03</span><div><strong>验证设计</strong><small>先定义成功，再开展真实任务测试</small></div></div>
          ${studentFields.slice(4).map(field => renderStudentField(field, project)).join("")}
          <div class="student-form-wide canvas-save-row"><span>内容自动保存在当前浏览器</span><button class="button button-primary" type="submit">保存并更新自查</button></div>
        </form>
      </article>
      <aside class="canvas-side-stack">
        <article class="card card-pad sticky-review-card"><div class="student-card-head"><div><span class="student-card-kicker">LIVE REVIEW</span><h2>实时自查</h2></div></div><div class="compact-review-list">${review.map(item => `<div class="compact-review-item"><span class="review-dot ${item.ready ? "ready" : ""}">${item.ready ? "✓" : "!"}</span><div><strong>${item.title}</strong><p>${item.detail}</p></div></div>`).join("")}</div></article>
        <article class="card card-pad"><span class="tag tag-orange">写作提示</span><h3 class="side-tip-title">避免空泛表达</h3><p class="side-tip-copy">把“学生需要高效学习”改成“临时新增作业后，学生需要在 10 分钟内完成任务重排，并看懂每项调整的理由”。</p></article>
      </aside>
    </div>`;
}

function renderStudentField(field, project) {
  return `<div class="form-group student-form-wide"><label class="form-label" for="student-${field.key}">${field.label}${field.key === "testResult" ? " <small>真实测试后填写</small>" : ""}</label><textarea class="textarea" id="student-${field.key}" name="${field.key}" rows="3" maxlength="1600" placeholder="${field.placeholder}">${escapeHTML(project[field.key] || "")}</textarea></div>`;
}

function renderPersonaView(project) {
  const selected = new Set(project.focusPersonas);
  return `
    <div class="persona-view-heading"><div><span class="student-card-kicker">PAIN MAP</span><h2>不同人群的痛点与观察问题</h2><p>选择本项目需要重点覆盖的人群。Persona 用于扩展思考范围，结论仍需真人验证。</p></div><div><strong>${selected.size}</strong><small>已选重点人群</small></div></div>
    <div class="persona-pain-grid">${state.personas.map(persona => {
      const prompt = personaPainPrompts[persona.id] || { concern: persona.desc, observe: "围绕真实使用情境设计一个可观察任务" };
      const isSelected = selected.has(persona.id);
      return `<article class="card persona-pain-card ${isSelected ? "selected" : ""}"><button type="button" class="persona-select-button" data-toggle-persona="${escapeHTML(persona.id)}" aria-pressed="${isSelected}"><span>${isSelected ? "✓ 已选" : "＋ 设为重点"}</span></button><div class="persona-pain-top"><span class="persona-large-avatar" style="background:${persona.color}">${escapeHTML(persona.short)}</span><div><span class="tag ${persona.type === "平台预设" ? "tag-purple" : "tag-green"}">${escapeHTML(persona.type)}</span><h3>${escapeHTML(persona.name)}</h3></div></div><div class="pain-block"><small>可能痛点</small><p>${escapeHTML(prompt.concern)}</p></div><div class="pain-block observe"><small>测试时观察</small><p>${escapeHTML(prompt.observe)}</p></div><div class="trait-list">${persona.traits.map(trait => `<span class="trait">${escapeHTML(trait)}</span>`).join("")}</div></article>`;
    }).join("")}</div>
    <div class="persona-view-footer"><div><strong>项目有更具体的人群？</strong><p>创建自定义 Persona，写清目标、情境、行为特点和主要顾虑。</p></div><button class="button button-secondary" type="button" data-open-modal="persona">＋ 创建自定义 Persona</button><button class="button button-primary" type="button" data-go="spark">带着这些人群运行 Spark →</button></div>`;
}

function renderValidationView(project) {
  const validationFields = studentFields.filter(field => ["hypothesis", "successMetric", "testTask", "testPlan", "testResult", "iterationPlan"].includes(field.key));
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

function storeStudentProject(form) {
  const data = new FormData(form);
  const current = getStudentProject();
  const updates = {};
  [...studentFields.map(field => field.key), "materialId"].forEach(key => {
    if (data.has(key)) updates[key] = String(data.get(key) || "").trim();
  });
  state.studentProject = {
    ...current,
    ...updates
  };
  saveState();
}

function saveStudentProject(form) {
  storeStudentProject(form);
  renderPage();
  showToast("立项画布已保存，自查和进度已更新");
}

function toggleFocusPersona(personaId) {
  const project = getStudentProject();
  const selected = new Set(project.focusPersonas);
  if (selected.has(personaId)) selected.delete(personaId); else selected.add(personaId);
  state.studentProject = { ...project, focusPersonas: [...selected] };
  saveState();
  renderPage();
}

function handleReadinessAction(action) {
  if (["overview", "canvas", "personas", "validation", "delivery"].includes(action)) {
    studentActiveView = action;
    renderPage();
  } else {
    navigate(action);
  }
}

function bindStudentPage() {
  const validationForm = document.querySelector("#student-validation-form");
  validationForm?.addEventListener("change", event => storeStudentProject(event.currentTarget));
  validationForm?.addEventListener("submit", event => { event.preventDefault(); saveStudentProject(event.currentTarget); });
  document.querySelectorAll("[data-student-view]").forEach(button => button.addEventListener("click", () => {
    studentActiveView = button.dataset.studentView;
    renderPage();
  }));
  document.querySelectorAll("[data-readiness-action]").forEach(button => button.addEventListener("click", () => handleReadinessAction(button.dataset.readinessAction)));
  document.querySelectorAll("[data-toggle-persona]").forEach(button => button.addEventListener("click", () => toggleFocusPersona(button.dataset.togglePersona)));
  document.querySelectorAll("[data-deliverable]").forEach(input => input.addEventListener("change", () => {
    state.submissionChecklist = { ...(state.submissionChecklist || {}), [input.dataset.deliverable]: input.checked };
    saveState();
    renderPage();
  }));
}

function exportStudentProject() {
  const form = document.querySelector("#student-form");
  if (form) storeStudentProject(form);
  const project = getStudentProject();
  const readiness = getReadiness(project);
  const linkedMaterial = state.materials.find(item => item.id === project.materialId);
  const selectedPersonas = state.personas.filter(item => project.focusPersonas.includes(item.id));
  const materialRecord = linkedMaterial
    ? `- 标题：${linkedMaterial.title}\n- 来源：${linkedMaterial.source}\n- 资料 ID：${linkedMaterial.id}\n\n> ${linkedMaterial.content}\n\n${linkedMaterial.isSample ? "这条记录是内置演练资料。" : "以上为用户录入资料，提交前需回看原始来源并确认脱敏。"}`
    : "尚未关联核心需求来源。";
  const fields = studentFields.map(({ key, label }) => `### ${label}\n\n${project[key] || "待填写"}`).join("\n\n");
  const milestones = readiness.milestones.map(item => `- ${item.done ? "已完成" : "待完成"} · ${item.label}：${item.short}`).join("\n");
  const personaRows = selectedPersonas.length ? selectedPersonas.map(item => {
    const prompt = personaPainPrompts[item.id] || { concern: item.desc, observe: "设计一个真实任务进行观察" };
    return `- **${item.name}**：${prompt.concern}。验证时观察：${prompt.observe}。`;
  }).join("\n") : "尚未选择重点 Persona。";
  const ledger = getEvidenceLedger(project).map(item => `- [${item.type}] ${item.title}（${item.status}，记录 ID ${item.id}）`).join("\n") || "尚无记录。";
  const reports = latestStudentReports().map(({ kind, report }) => report ? `- ${kind}：${report.title}（报告 ID ${report.id}）。${report.desc}` : `- ${kind}：尚未运行。`).join("\n");
  const body = `# ${state.project.name} · PersonaLab 科创项目打磨记录

> PersonaLab V2.0-student · ${state.isSample ? "当前为内置演练案例。" : "当前为用户本地项目。"} Persona 和规则推演用于发现问题，真实结论需要可追溯资料与真人测试支持。

## 当前进度

打磨进度：${readiness.score}%（${readiness.done}/8 个关键节点）

${milestones}

## 立项画布

${fields}

## 核心需求来源

${materialRecord}

## 重点 Persona 与痛点

${personaRows}

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
  store: storeStudentProject,
  save: saveStudentProject,
  export: exportStudentProject,
  bind: bindStudentPage,
  readiness: getReadiness
};
