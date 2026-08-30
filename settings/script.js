const STORAGE_KEY = "gabo:consumer:settings:v1";
const form = document.querySelector("#settings-form");
const toast = document.querySelector("#settings-toast");

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 3600);
}

function readSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function collectSettings() {
  const data = new FormData(form);
  return {
    contactFirstName: String(data.get("contactFirstName") || "").trim(),
    contactLastName: String(data.get("contactLastName") || "").trim(),
    contactAddress: String(data.get("contactAddress") || "").trim(),
    contactPhone: String(data.get("contactPhone") || "").trim(),
    contactEmail: String(data.get("contactEmail") || "").trim(),
    shareResume: data.has("shareResume"),
    shareLocation: data.has("shareLocation"),
    shareContact: data.has("shareContact"),
    showFirstName: data.has("showFirstName"),
    showLastName: data.has("showLastName"),
    showAddress: data.has("showAddress"),
    showPhone: data.has("showPhone"),
    showEmail: data.has("showEmail"),
    sharePicture: data.has("sharePicture")
  };
}

function restoreSettings() {
  const settings = readSettings();
  for (const [name, value] of Object.entries(settings)) {
    const field = form.elements.namedItem(name);
    if (!field) continue;
    if (field.type === "checkbox") field.checked = Boolean(value);
    else field.value = value;
  }
  refreshSwitches();
}

function refreshSwitches() {
  form.querySelectorAll('.toggle-row input[type="checkbox"],.field-toggle input[type="checkbox"]').forEach(input => {
    input.closest("label").querySelector(".switch-state").textContent = input.checked ? "ON" : "OFF";
  });
  const contactAllowed=form.elements.namedItem("shareContact").checked;
  document.querySelector("#contact-access-state").textContent=contactAllowed?"Recruiter access ON":"Recruiter access OFF";
  document.querySelector(".contact-visibility").classList.toggle("contact-access-on",contactAllowed);
}

form.addEventListener("change", event => {
  if (event.target.matches('input[type="checkbox"]')) refreshSwitches();
});

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectSettings()));
  showToast("Settings saved in this browser.");
});

restoreSettings();
