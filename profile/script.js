const DB_NAME = "gabo-consumer-profile";
const DB_VERSION = 1;
const STORE = "sections";

const sectionConfig = {
  summary: {
    eyebrow: "Professional value", title: "Summary",
    guidance: "Describe your professional focus, the business problems you solve, the people you support, and the measurable value you create.",
    name: "Professional value title", nameHint: "Use a concise professional headline or area of contribution.",
    description: "Professional value explanation", descriptionHint: "Explain your contribution, scope, approach, and the results an employer can expect."
  },
  skills: {
    eyebrow: "Evidence", title: "Skills & knowledge",
    guidance: "Add one capability per entry. State what you can do, how you apply it, and the evidence that supports your proficiency.",
    name: "Skill or knowledge area", nameHint: "Enter a recognized skill, tool, language, method, or knowledge discipline.",
    description: "Application and evidence", descriptionHint: "Explain how you apply this capability, the responsibilities involved, and any measurable or verifiable outcomes.",
    supportsUrl: true, urlLabel: "Supporting URL", urlHint: "Add a professional portfolio, credential, publication, or verification link."
  },
  experience: {
    eyebrow: "Career history", title: "Experience",
    guidance: "Focus on responsibility, scope, contribution, and measurable outcomes. Exclude protected personal information.",
    name: "Role or experience area", nameHint: "Enter a role, function, assignment, or transferable experience area.",
    description: "Responsibilities and outcomes", descriptionHint: "Summarize what you were responsible for, how you performed the work, and the results you achieved."
  },
  education: {
    eyebrow: "Education", title: "Studies",
    guidance: "Add formal education, professional training, or continuing studies that support your qualifications.",
    name: "Program or field of study", nameHint: "Enter the program, discipline, qualification, or training subject.",
    description: "Study details", descriptionHint: "Describe the focus, relevant coursework, completed work, distinction, or practical knowledge gained.",
    supportsUrl: true, urlLabel: "Education URL", urlHint: "Add an institution, program, credential, transcript, or verification link."
  },
  projects: {
    eyebrow: "Proof of work", title: "Projects",
    guidance: "Show evidence of applied ability. Explain the objective, your role, the methods or tools used, and the outcome.",
    name: "Project name or objective", nameHint: "Enter a concise project title or the objective it addressed.",
    description: "Project contribution and results", descriptionHint: "Describe the challenge, your contribution, the process or tools used, and measurable or demonstrable results.",
    supportsUrl: true, urlLabel: "Project URL", urlHint: "Add a portfolio, repository, case study, publication, or live project link."
  },
  interests: {
    eyebrow: "Additional context", title: "Interests & hobbies",
    guidance: "Include only optional activities that demonstrate relevant curiosity, discipline, collaboration, creativity, or applied ability.",
    name: "Interest or activity", nameHint: "Enter a relevant interest, practice, volunteer activity, or hobby.",
    description: "Professional relevance", descriptionHint: "Explain what you practice or learn and how it strengthens relevant professional qualities."
  }
};

const proficiencyOptions = ["Not specified", "Foundational", "Amateur", "Junior", "Intermediate", "Mid-level", "Advanced", "Senior", "Expert", "Engineer / Specialist"];
const evidenceOptions = ["Not specified", "Self-declared", "Work experience", "Verified portfolio", "Professional certification", "License", "Degree or diploma", "Course", "Seminar", "Workshop", "Assessment verified"];

const dialog = document.querySelector("#profile-dialog");
const form = document.querySelector("#profile-form");
const list = document.querySelector("#entry-list");
const toast = document.querySelector("#profile-toast");
const photoInput = document.querySelector("#photo-input");
const photoSelect = document.querySelector("#photo-select");
const photoRemove = document.querySelector("#photo-remove");
const photoImage = document.querySelector("#profile-photo");
const photoPlaceholder = document.querySelector("#photo-placeholder");
const identityDialog = document.querySelector("#identity-dialog");
const identityForm = document.querySelector("#identity-form");
const identityEdit = document.querySelector("#identity-edit");
const identityName = document.querySelector("#profile-name");
const identityNameInput = document.querySelector("#identity-name-input");
const identityPhotoPreview = document.querySelector("#identity-photo-preview");
const identityPreviewPlaceholder = document.querySelector("#identity-preview-placeholder");
let photoObjectUrl = "";
let identityPreviewUrl = "";
let pendingPhotoFile = null;
let removePhotoRequested = false;
let activeSection = "";
let workingEntries = [];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "section" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readAll() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function writeSection(section, entries, status) {
  const db = await openDatabase();
  const updatedAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put({ section, entries, status, updatedAt });
    transaction.oncomplete = () => resolve(updatedAt);
    transaction.onerror = () => reject(transaction.error);
  });
}

async function writePhoto(blob) {
  const db = await openDatabase();
  const updatedAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put({ section: "profile-photo", blob, updatedAt });
    transaction.oncomplete = () => resolve(updatedAt);
    transaction.onerror = () => reject(transaction.error);
  });
}

async function writeIdentity(name) {
  const db = await openDatabase();
  const updatedAt = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put({ section: "profile-identity", name, updatedAt });
    transaction.oncomplete = () => resolve(updatedAt);
    transaction.onerror = () => reject(transaction.error);
  });
}

async function deletePhoto() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).delete("profile-photo");
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

async function refreshPhoto() {
  const records = await readAll();
  const photo = records.find(item => item.section === "profile-photo")?.blob;
  if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
  photoObjectUrl = photo ? URL.createObjectURL(photo) : "";
  photoImage.src = photoObjectUrl;
  photoImage.hidden = !photo;
  photoPlaceholder.hidden = Boolean(photo);
  return photo;
}

async function refreshIdentity() {
  const records = await readAll();
  const identity = records.find(item => item.section === "profile-identity");
  identityName.textContent = identity?.name || "Your name";
  return identity?.name || "";
}

function setIdentityPreview(source) {
  identityPhotoPreview.src = source || "";
  identityPhotoPreview.hidden = !source;
  identityPreviewPlaceholder.hidden = Boolean(source);
}

async function openIdentityEditor() {
  const records = await readAll();
  const identity = records.find(item => item.section === "profile-identity");
  const photo = records.find(item => item.section === "profile-photo")?.blob;
  pendingPhotoFile = null;
  removePhotoRequested = false;
  identityNameInput.value = identity?.name || "";
  photoRemove.hidden = !photo;
  photoSelect.textContent = photo ? "Change picture" : "Choose picture";
  if (identityPreviewUrl) URL.revokeObjectURL(identityPreviewUrl);
  identityPreviewUrl = photo ? URL.createObjectURL(photo) : "";
  setIdentityPreview(identityPreviewUrl);
  identityDialog.showModal();
  identityNameInput.focus();
}

function closeIdentityEditor() {
  identityDialog.close();
  photoInput.value = "";
  pendingPhotoFile = null;
  removePhotoRequested = false;
  if (identityPreviewUrl) URL.revokeObjectURL(identityPreviewUrl);
  identityPreviewUrl = "";
}

const optionMarkup = (options, selected) => options.map(value =>
  `<option value="${value}" ${value === selected ? "selected" : ""}>${value}</option>`
).join("");

function entryMarkup(entry = {}) {
  const config = sectionConfig[activeSection];
  const urlField = config.supportsUrl ? `<label>${config.urlLabel}
      <input type="url" name="url" value="${escapeHtml(entry.url || "")}" placeholder="https://example.com">
      <small>${config.urlHint}</small>
    </label>` : "";
  return `<fieldset class="profile-entry">
    <legend>Entry <span></span></legend>
    <label>${config.name}
      <input name="name" maxlength="150" value="${escapeHtml(entry.name || "")}" placeholder="${config.nameHint}" required>
      <small><span data-count="name">${(entry.name || "").length}</span>/150 characters</small>
    </label>
    <label>${config.description}
      <textarea name="description" maxlength="600" rows="6" placeholder="${config.descriptionHint}" required>${escapeHtml(entry.description || "")}</textarea>
      <small><span data-count="description">${(entry.description || "").length}</span>/600 characters</small>
    </label>
    ${urlField}
    <div class="select-grid">
      <label>Proficiency level<select name="proficiency">${optionMarkup(proficiencyOptions, entry.proficiency || "Not specified")}</select></label>
      <label>Evidence or verification<select name="evidence">${optionMarkup(evidenceOptions, entry.evidence || "Not specified")}</select></label>
    </div>
  </fieldset>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

function renumberEntries() {
  [...list.querySelectorAll(".profile-entry")].forEach((entry, index) => {
    entry.querySelector("legend span").textContent = index + 1;
  });
  form.querySelector('[data-action="remove"]').disabled = list.children.length <= 1;
}

function bindCounters(root = list) {
  root.querySelectorAll("input[maxlength],textarea[maxlength]").forEach(field => {
    field.addEventListener("input", () => {
      field.closest("label").querySelector("[data-count]").textContent = field.value.length;
    });
  });
}

function collectEntries() {
  return [...list.querySelectorAll(".profile-entry")].map(entry => ({
    name: entry.querySelector('[name="name"]').value.trim(),
    description: entry.querySelector('[name="description"]').value.trim(),
    proficiency: entry.querySelector('[name="proficiency"]').value,
    evidence: entry.querySelector('[name="evidence"]').value,
    url: entry.querySelector('[name="url"]')?.value.trim() || ""
  })).filter(entry => entry.name || entry.description || entry.url);
}

async function openEditor(section) {
  activeSection = section;
  const config = sectionConfig[section];
  const records = await readAll();
  const record = records.find(item => item.section === section);
  workingEntries = record?.entries?.length ? record.entries : [{}];
  document.querySelector("#editor-eyebrow").textContent = config.eyebrow;
  document.querySelector("#editor-title").textContent = config.title;
  document.querySelector("#editor-guidance").textContent = config.guidance;
  list.innerHTML = workingEntries.map(entryMarkup).join("");
  bindCounters();
  renumberEntries();
  dialog.showModal();
  list.querySelector("input")?.focus();
}

function closeEditor() {
  dialog.close();
  activeSection = "";
  workingEntries = [];
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 3200);
}

function formatUpdated(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function refreshSummary() {
  const records = await readAll();
  document.querySelectorAll(".profile-card").forEach(card => {
    const record = records.find(item => item.section === card.dataset.section);
    const count = record?.entries?.length || 0;
    const status = record?.status === "draft" ? " · Draft" : "";
    card.querySelector(".entry-count").textContent = count ? `${count} ${count === 1 ? "entry" : "entries"}${status}` : "No entries yet";
  });
  const newest = records.map(record => record.updatedAt).filter(Boolean).sort().at(-1);
  const output = document.querySelector("#last-updated");
  output.textContent = newest ? formatUpdated(newest) : "Not saved yet";
  output.dateTime = newest || "";
}

document.querySelectorAll(".profile-card").forEach(card => {
  card.addEventListener("click", () => openEditor(card.dataset.section).catch(() => showToast("The profile editor could not be opened.")));
});

form.addEventListener("click", event => {
  const action = event.target.dataset.action;
  if (action === "cancel") closeEditor();
  if (action === "add") {
    list.insertAdjacentHTML("beforeend", entryMarkup());
    bindCounters(list.lastElementChild);
    renumberEntries();
    list.lastElementChild.querySelector("input").focus();
  }
  if (action === "remove" && list.children.length > 1) {
    list.lastElementChild.remove();
    renumberEntries();
  }
  if (action === "draft") {
    const entries = collectEntries();
    writeSection(activeSection, entries, "draft").then(() => {
      closeEditor(); refreshSummary(); showToast("Draft saved in this browser.");
    }).catch(() => showToast("The draft could not be saved."));
  }
});

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const entries = collectEntries();
  writeSection(activeSection, entries, "saved").then(() => {
    closeEditor(); refreshSummary(); showToast("Profile section saved.");
  }).catch(() => showToast("The profile section could not be saved."));
});

dialog.addEventListener("click", event => {
  if (event.target === dialog) closeEditor();
});

identityEdit.addEventListener("click", () => openIdentityEditor().catch(() => showToast("The identity editor could not be opened.")));
identityDialog.addEventListener("click", event => {
  if (event.target === identityDialog || event.target.closest('[data-identity-action="cancel"]')) closeIdentityEditor();
});
photoSelect.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    showToast("Choose a JPEG, PNG, or WebP picture.");
    photoInput.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("The profile picture must be 5 MB or smaller.");
    photoInput.value = "";
    return;
  }
  pendingPhotoFile = file;
  removePhotoRequested = false;
  if (identityPreviewUrl) URL.revokeObjectURL(identityPreviewUrl);
  identityPreviewUrl = URL.createObjectURL(file);
  setIdentityPreview(identityPreviewUrl);
  photoRemove.hidden = false;
  photoSelect.textContent = "Change picture";
});
photoRemove.addEventListener("click", () => {
  pendingPhotoFile = null;
  removePhotoRequested = true;
  if (identityPreviewUrl) URL.revokeObjectURL(identityPreviewUrl);
  identityPreviewUrl = "";
  setIdentityPreview("");
  photoRemove.hidden = true;
  photoSelect.textContent = "Choose picture";
});

identityForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!identityForm.reportValidity()) return;
  const name = identityNameInput.value.trim();
  if (!name) return;
  const pictureChange = pendingPhotoFile ? writePhoto(pendingPhotoFile) : removePhotoRequested ? deletePhoto() : Promise.resolve();
  Promise.all([writeIdentity(name), pictureChange]).then(() => Promise.all([refreshIdentity(), refreshPhoto(), refreshSummary()])).then(() => {
    closeIdentityEditor();
    showToast("Profile picture and name updated.");
  }).catch(() => showToast("The profile identity could not be saved."));
});

window.addEventListener("pagehide", () => {
  if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
  if (identityPreviewUrl) URL.revokeObjectURL(identityPreviewUrl);
});

Promise.all([refreshSummary(), refreshPhoto(), refreshIdentity()]).catch(() => showToast("Saved profile information is temporarily unavailable."));
