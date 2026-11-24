const casePreview = document.querySelector("#case-preview");
const caseTabs = [...casePreview.querySelectorAll("[data-case-tab]")];
const caseOpen = casePreview.querySelector("[data-case-open]");
const caseOpenLabels = { spark: "打开 Spark", mirror: "打开 Mirror", test: "打开验证计划" };
const workflowPreviewLinks = document.querySelectorAll(".home-workflow [data-preview-link]");
const caseShortcuts = [...casePreview.querySelectorAll("[data-case-shortcut]")];

function activateHomeTab(tabs, tab, focus) {
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden = !active;
  }
  if (focus) tab.focus({ preventScroll: true });
}

function bindHomeTabs(tabs, select) {
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", event => {
      const last = tabs.length - 1;
      const next = { ArrowLeft: (index + last) % tabs.length, ArrowRight: (index + 1) % tabs.length, Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next], true);
    });
  });
}

function selectHomeCase(tab, focus = false) {
  activateHomeTab(caseTabs, tab, focus);
  const view = tab.dataset.caseTab;
  caseOpen.dataset.samplePage = view;
  caseOpen.firstChild.textContent = `${caseOpenLabels[view]} `;
  workflowPreviewLinks.forEach(link => link.setAttribute("aria-current", String(link.dataset.previewLink === view)));
  caseShortcuts.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.caseShortcut === view)));
}

bindHomeTabs(caseTabs, selectHomeCase);
selectHomeCase(caseTabs[0]);

caseShortcuts.forEach(button => button.addEventListener("click", () => {
  selectHomeCase(caseTabs.find(tab => tab.dataset.caseTab === button.dataset.caseShortcut));
}));

document.querySelectorAll("[data-preview-link]").forEach(link => link.addEventListener("click", () => {
  const tab = caseTabs.find(item => item.dataset.caseTab === link.dataset.previewLink);
  selectHomeCase(tab, true);
}));

const featureTabs = [...document.querySelectorAll(".home-feature-list [role='tab']")];
bindHomeTabs(featureTabs, (tab, focus) => activateHomeTab(featureTabs, tab, focus));

const pathNotes = {
  add: "学生能否找到新增入口，并在一次操作里填完任务和截止时间？",
  conflict: "学生能否从冲突说明中找到受影响的任务，并说清调整的理由？",
  confirm: "学生能否核对调整后的计划，并在选错时撤回这次改动？"
};
const casePath = [...casePreview.querySelectorAll("[data-case-path]")];
const casePathNote = casePreview.querySelector(".home-path-note p");
casePath.forEach(button => button.addEventListener("click", () => {
  casePath.forEach(step => step.setAttribute("aria-pressed", String(step === button)));
  casePathNote.textContent = pathNotes[button.dataset.casePath];
}));

const personaPreviews = {
  new: ["先看懂为什么要改计划", "你上一次发现课程和待办冲突时，先去哪里找原因？"],
  frequent: ["尽快找出可替换的空档", "临时要重排好几项任务时，哪一步最花时间？"],
  privacy: ["知道日程会被怎么使用", "如果只有允许读取日程才能得到建议，你想先确认什么？"]
};
const personaOptions = [...document.querySelectorAll("[data-persona-preview]")];
const personaConcern = document.querySelector("[data-persona-concern]");
const personaQuestion = document.querySelector("[data-persona-question]");
const homeMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
personaOptions.forEach(button => button.addEventListener("click", () => {
  if (button.getAttribute("aria-pressed") === "true") return;
  const [concern, question] = personaPreviews[button.dataset.personaPreview];
  personaOptions.forEach(option => option.setAttribute("aria-pressed", String(option === button)));
  personaConcern.textContent = concern;
  personaQuestion.textContent = `访谈可以追问 · ${question}`;
  if (homeMotion.matches) personaConcern.parentElement.animate([{ opacity: .65, translate: "0 4px" }, { opacity: 1, translate: "0 0" }], { duration: 200, easing: "ease-out" });
}));

if ("IntersectionObserver" in window && homeMotion.matches) {
  const homeSections = document.querySelectorAll(".home-workflow ol, .home-trace, .home-persona-layout, .home-feature-showcase");
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(entry => {
      entry.target.classList.add("home-arrived");
      observer.unobserve(entry.target);
    });
  }, { threshold: .16 });
  homeSections.forEach(section => observer.observe(section));
}
