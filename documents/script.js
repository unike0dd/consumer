const DB_NAME="gabo-consumer-profile";
const DB_VERSION=1;
const STORE="sections";
const ORDER_KEY="gabo:consumer:document-order:v1";
const defaultOrder=["summary","skills","experience","education","projects","interests"];
const sectionTitles={summary:"Executive Summary",skills:"Skills & Knowledge",experience:"Experience Summary",education:"Education",projects:"Proof of Work",interests:"Interests & Hobbies"};
const orderList=document.querySelector("#section-order");
const documentSections=document.querySelector("#document-sections");
const documentPhoto=document.querySelector("#document-photo");
const documentSheet=document.querySelector("#professional-document");
const emptyDocument=document.querySelector("#empty-document");
const toast=document.querySelector("#documents-toast");
let records=[];
let order=readOrder();
let photoObjectUrl="";

function readOrder(){
  try{
    const saved=JSON.parse(localStorage.getItem(ORDER_KEY)||"[]");
    return [...saved.filter(section=>defaultOrder.includes(section)),...defaultOrder.filter(section=>!saved.includes(section))];
  }catch{return [...defaultOrder]}
}

function openDatabase(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"section"})};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

async function readRecords(){
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const request=db.transaction(STORE,"readonly").objectStore(STORE).getAll();
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

function escapeHtml(value){return String(value).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character])}
function safeUrl(value){try{const url=new URL(value);return ["http:","https:"].includes(url.protocol)?url.href:""}catch{return ""}}

function entryMarkup(entry){
  const details=[entry.proficiency&&entry.proficiency!=="Not specified"?`Proficiency: ${escapeHtml(entry.proficiency)}`:"",entry.evidence&&entry.evidence!=="Not specified"?`Evidence: ${escapeHtml(entry.evidence)}`:""].filter(Boolean).join(" · ");
  const url=safeUrl(entry.url||"");
  return `<article class="document-entry"><h4>${escapeHtml(entry.name||"Untitled entry")}</h4>${entry.description?`<p>${escapeHtml(entry.description)}</p>`:""}${details?`<small>${details}</small>`:""}${url?`<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`:""}</article>`;
}

function savedRecord(section){return records.find(record=>record.section===section&&record.status==="saved"&&record.entries?.length)}

function renderDocument(){
  const completed=order.map(section=>({section,record:savedRecord(section)})).filter(item=>item.record);
  documentSections.innerHTML=completed.map(({section,record})=>`<section class="document-section" data-section="${section}"><h3>${sectionTitles[section]}</h3>${record.entries.map(entryMarkup).join("")}</section>`).join("");
  documentSheet.hidden=!completed.length;
  emptyDocument.hidden=Boolean(completed.length);
}

function moveSection(section,direction){
  const index=order.indexOf(section),next=index+direction;
  if(index<0||next<0||next>=order.length)return;
  [order[index],order[next]]=[order[next],order[index]];
  localStorage.setItem(ORDER_KEY,JSON.stringify(order));
  renderOrder();renderDocument();
  orderList.querySelector(`[data-section="${section}"]`)?.focus();
  showToast(`${sectionTitles[section]} moved ${direction<0?"up":"down"}.`);
}

function renderOrder(){
  orderList.innerHTML=order.map((section,index)=>`<li><span>${index+1}. ${sectionTitles[section]}</span><div><button type="button" data-section="${section}" data-move="up" ${index===0?"disabled":""} aria-label="Move ${sectionTitles[section]} up">↑</button><button type="button" data-section="${section}" data-move="down" ${index===order.length-1?"disabled":""} aria-label="Move ${sectionTitles[section]} down">↓</button></div></li>`).join("");
}

function renderPhoto(){
  const blob=records.find(record=>record.section==="profile-photo")?.blob;
  if(photoObjectUrl)URL.revokeObjectURL(photoObjectUrl);
  photoObjectUrl=blob?URL.createObjectURL(blob):"";
  documentPhoto.src=photoObjectUrl;
  documentPhoto.hidden=!blob;
}

function showToast(message){toast.textContent=message;toast.hidden=false;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>{toast.hidden=true},2800)}

orderList.addEventListener("click",event=>{const button=event.target.closest("button[data-move]");if(button)moveSection(button.dataset.section,button.dataset.move==="up"?-1:1)});
document.querySelector("#reset-order").addEventListener("click",()=>{order=[...defaultOrder];localStorage.removeItem(ORDER_KEY);renderOrder();renderDocument();showToast("Default document order restored.")});
document.querySelector("#print-document").addEventListener("click",()=>{if(documentSheet.hidden){showToast("Save a Profile section before creating a PDF.");return}window.print()});
window.addEventListener("pagehide",()=>{if(photoObjectUrl)URL.revokeObjectURL(photoObjectUrl)});

readRecords().then(result=>{records=result;renderOrder();renderPhoto();renderDocument()}).catch(()=>{renderOrder();documentSheet.hidden=true;emptyDocument.hidden=false;showToast("Saved Profile information is temporarily unavailable.")});
