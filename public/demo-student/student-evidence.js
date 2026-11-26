const evidenceDatabase = "personalab.student.evidence";
const evidenceStore = "files";
const evidenceFileLimit = 20 * 1024 * 1024;

function hasMaterialExcerpt(item) {
  return Boolean(item.content?.trim() && item.content !== "未填写内容摘要");
}

function materialTimestamp(item) {
  return item.createdAt || (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(item.date) ? item.date : null);
}

async function withEvidenceFiles(mode, action) {
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open(evidenceDatabase, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(evidenceStore);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(evidenceStore, mode);
      transaction.onabort = () => reject(transaction.error);
      const request = action(transaction.objectStore(evidenceStore));
      transaction.oncomplete = () => resolve(request?.result);
    });
  } finally {
    database.close();
  }
}

function saveProjectMaterials(projectId, updateMaterials) {
  const projects = readProjectLibrary() ?? projectLibrary;
  const source = projects.find(item => item.project.id === projectId);
  if (!source || source.project.archived) throw new Error("此项目已归档或删除。请在进行中的项目中操作。");
  const isOpen = state.project.id === projectId;
  const updatedAt = Date.now();
  const updated = {
    ...source,
    materials: updateMaterials(source.materials),
    project: { ...source.project, updatedAt },
    updatedAt
  };
  saveProjectLibrary(projects.map(item => item.project.id === projectId ? snapshotState(updated) : item));
  if (isOpen) {
    state = { ...state, materials: updated.materials, updatedAt, project: { ...state.project, updatedAt } };
    savedProjectSnapshot = {
      ...savedProjectSnapshot,
      materials: snapshotState().materials,
      project: { ...savedProjectSnapshot.project, updatedAt },
      updatedAt
    };
  }
}

async function releaseEvidenceFiles(materials) {
  const projects = readProjectLibrary() ?? projectLibrary;
  const referenced = new Set(projects.flatMap(project => project.materials.map(item => item.attachment?.key)));
  const removed = materials.map(item => item.attachment?.key).filter(key => key && !referenced.has(key));
  if (removed.length) await withEvidenceFiles("readwrite", store => { removed.forEach(key => store.delete(key)); });
}

function renderEvidenceImport() {
  return `<div class="evidence-import">
    <label for="evidence-files">导入本地文件</label>
    <input id="evidence-files" type="file" multiple aria-describedby="evidence-file-help evidence-import-status">
    <p id="evidence-file-help">单个文件最多 20 MB，可多选。原件保存在当前浏览器，导入后可补充摘要供 Spark 参考。</p>
    <p id="evidence-import-status" role="status" aria-live="polite"></p>
  </div>`;
}

function renderEvidenceList(materials) {
  if (!materials.length) return '<p class="workbench-empty">暂无资料。可以录入访谈、问卷摘录，或导入文件。</p>';
  return `<ul class="workbench-evidence-list">${materials.map(item => {
    const size = item.attachment?.size;
    return `<li class="workbench-evidence-row">
      <span class="workbench-evidence-icon" aria-hidden="true">▤</span>
      <div class="workbench-evidence-text"><strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.type)}${item.source ? ` · ${escapeHTML(item.source)}` : ""}${size ? ` · ${size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`}` : ""}</small>
        ${hasMaterialExcerpt(item) ? `<p>${escapeHTML(item.content)}</p>` : ''}
      </div>
      <div class="workbench-evidence-meta">${item.isSample ? '<span class="tag tag-gray">演练示例</span>' : workbenchTime(materialTimestamp(item))}
        ${item.attachment ? `<div class="evidence-file-actions"><button type="button" class="link-button" data-evidence-download="${escapeHTML(item.id)}">下载原件</button><button type="button" class="link-button" data-evidence-note="${escapeHTML(item.id)}">${hasMaterialExcerpt(item) ? "编辑摘要" : "补充摘要"}</button><button type="button" class="link-button evidence-remove" data-evidence-remove="${escapeHTML(item.id)}">移除</button></div>` : ""}
      </div>
    </li>`;
  }).join("")}</ul>`;
}

async function importProjectEvidence(input) {
  const files = [...input.files];
  if (!files.length) return;
  const projectId = state.project.id;
  const status = document.querySelector("#evidence-import-status");
  if (files.some(file => file.size > evidenceFileLimit || !file.size)) {
    status.textContent = "请选择非空且单个大小不超过 20 MB 的文件，再重新导入。";
    input.value = "";
    return;
  }
  const records = files.map(file => {
    const id = createProjectId();
    return { id, title: file.name, type: "文件附件", source: "本地文件", content: "", icon: "文", createdAt: Date.now(), attachment: { key: id, name: file.name, size: file.size } };
  });
  input.disabled = true;
  status.textContent = `正在导入 ${files.length} 份文件…`;
  let savedFiles = false;
  try {
    await withEvidenceFiles("readwrite", store => {
      records.forEach((record, index) => store.add(files[index], record.attachment.key));
    });
    savedFiles = true;
    saveProjectMaterials(projectId, materials => [...records, ...materials]);
  } catch (error) {
    if (savedFiles) await releaseEvidenceFiles(records).catch(() => {});
    const message = error?.message?.startsWith("此项目") ? error.message : "导入失败。请检查浏览器是否允许本地存储，或减少本次导入的文件。";
    status.textContent = message;
    if (!status.isConnected) showToast(message);
    return;
  } finally {
    input.disabled = false;
    input.value = "";
  }
  if (state.project.id === projectId && document.querySelector("#evidence-files")) {
    const restoreFocus = document.activeElement === input || document.activeElement === document.body;
    renderPage();
    if (restoreFocus) document.querySelector("#evidence-files")?.focus({ preventScroll: true });
  }
  showToast(`已将 ${records.length} 份文件保存到项目证据库`);
}

async function downloadEvidenceFile(item) {
  try {
    const blob = await withEvidenceFiles("readonly", store => store.get(item.attachment.key));
    if (!blob) return showToast("当前浏览器找不到这个原件，请重新导入。");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.attachment.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    showToast("暂时无法读取原件，请检查浏览器的本地存储设置。");
  }
}

function editEvidenceNote(item) {
  const projectId = state.project.id;
  const root = document.querySelector("#modal-root");
  root.innerHTML = `<div class="modal-backdrop" data-close-modal><form class="modal" role="dialog" aria-modal="true" aria-labelledby="evidence-note-title">
    <div class="modal-head"><h2 id="evidence-note-title">文件摘要</h2><button type="button" class="modal-close" data-close-modal aria-label="关闭">×</button></div>
    <div class="modal-body"><p class="evidence-note-filename">${escapeHTML(item.title)}</p><label class="form-label" for="evidence-note">脱敏摘录或摘要</label><textarea class="textarea" id="evidence-note" maxlength="4000" rows="5">${escapeHTML(item.content)}</textarea></div>
    <div class="modal-footer"><button class="button button-secondary" type="button" data-close-modal>取消</button><button class="button button-primary" type="submit">保存摘要</button></div>
  </form></div>`;
  bindModalDismissal(root);
  root.querySelector("#evidence-note").focus();
  root.querySelector("form").addEventListener("submit", event => {
    event.preventDefault();
    const content = root.querySelector("#evidence-note").value.trim();
    try {
      saveProjectMaterials(projectId, materials => materials.map(material => material.id === item.id ? { ...material, content } : material));
      dismissModal(false);
      renderPage();
      [...document.querySelectorAll("[data-evidence-note]")].find(button => button.dataset.evidenceNote === item.id)?.focus({ preventScroll: true });
      showToast("文件摘要已保存");
    } catch {
      showToast("摘要暂时无法保存，请先保留已填写的内容。");
    }
  });
}

function bindProjectEvidence() {
  document.querySelector("#evidence-files")?.addEventListener("change", event => importProjectEvidence(event.currentTarget));
  document.querySelectorAll("[data-evidence-download], [data-evidence-note], [data-evidence-remove]").forEach(button => button.addEventListener("click", () => {
    const { evidenceDownload, evidenceNote, evidenceRemove } = button.dataset;
    const item = state.materials.find(material => material.id === (evidenceDownload || evidenceNote || evidenceRemove));
    if (!item?.attachment) return;
    if (evidenceDownload) return downloadEvidenceFile(item);
    if (evidenceNote) return editEvidenceNote(item);
    if (!confirm(`从本项目移除「${item.title}」？`)) return;
    try {
      saveProjectMaterials(state.project.id, materials => materials.filter(material => material.id !== item.id));
    } catch {
      return showToast("资料暂时无法移除，请重试。");
    }
    releaseEvidenceFiles([item]).catch(() => showToast("资料条目已移除，浏览器暂未清理原件。"));
    renderPage();
    document.querySelector("#evidence-files")?.focus({ preventScroll: true });
    showToast("已从本项目移除资料");
  }));
}
