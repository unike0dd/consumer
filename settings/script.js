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
    phone: String(data.get("phone") || "").trim(),
    recoveryEmail: String(data.get("recoveryEmail") || "").trim(),
    username: String(data.get("username") || "").trim(),
    shareResume: data.has("shareResume"),
    shareLocation: data.has("shareLocation"),
    shareContact: data.has("shareContact"),
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
  form.querySelectorAll('.toggle-row input[type="checkbox"]').forEach(input => {
    input.closest(".toggle-row").querySelector(".switch-state").textContent = input.checked ? "ON" : "OFF";
  });
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

document.querySelector("#change-username").addEventListener("click", () => {
  const username = form.elements.namedItem("username");
  if (!username.reportValidity() || !username.value.trim()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectSettings()));
  showToast("Username preference saved. Secure username sign-in activates with authenticated services.");
});

document.querySelectorAll(".secure-action").forEach(button => {
  button.addEventListener("click", () => showToast(`${button.dataset.feature} activates when secure account services are reconnected.`));
});

restoreSettings();
