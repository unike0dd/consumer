const storageKey="gabo:consumer:task-alerts:v1";
const buttons=[...document.querySelectorAll("[data-alert]")];
const toast=document.querySelector(".toast");
let alerts={};
try{alerts=JSON.parse(localStorage.getItem(storageKey)||"{}")}catch{alerts={}}
const showToast=message=>{toast.textContent=message;toast.hidden=false;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>{toast.hidden=true},2800)};
const renderButton=button=>{const enabled=Boolean(alerts[button.dataset.alert]);button.setAttribute("aria-pressed",String(enabled));button.querySelector("span:last-child").textContent=enabled?"Email alert on":button.dataset.alert.startsWith("saved-")?"Add job alert":"Email alert"};
buttons.forEach(button=>{renderButton(button);button.addEventListener("click",()=>{const key=button.dataset.alert;alerts[key]=!alerts[key];localStorage.setItem(storageKey,JSON.stringify(alerts));renderButton(button);showToast(alerts[key]?"Email alert preference saved.":"Email alert preference removed.")})});
