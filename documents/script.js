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
const documentName=document.querySelector("#document-name");
const documentHeadline=document.querySelector("#document-headline");
const documentLocation=document.querySelector("#document-location");
const emptyDocument=document.querySelector("#empty-document");
const toast=document.querySelector("#documents-toast");
let records=[];
let order=readOrder();
let photoObjectUrl="";
let draggedSection="";
let dropTarget="";
let dropPosition="before";
let keyboardGrabbed="";

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
  saveOrder();
  renderOrder();renderDocument();
  orderList.querySelector(`[data-handle="${section}"]`)?.focus();
  showToast(`${sectionTitles[section]} moved ${direction<0?"up":"down"}.`);
}

function saveOrder(){localStorage.setItem(ORDER_KEY,JSON.stringify(order))}

function placeSection(section,target,position){
  if(!section||!target||section===target)return;
  const from=order.indexOf(section);
  if(from<0)return;
  order.splice(from,1);
  const targetIndex=order.indexOf(target);
  order.splice(targetIndex+(position==="after"?1:0),0,section);
  saveOrder();renderOrder();renderDocument();
  orderList.querySelector(`[data-handle="${section}"]`)?.focus();
  showToast(`${sectionTitles[section]} moved.`);
}

function renderOrder(){
  orderList.innerHTML=order.map((section,index)=>`<li draggable="true" data-section="${section}"><button class="drag-handle" type="button" data-handle="${section}" aria-pressed="${keyboardGrabbed===section}" aria-label="Reorder ${sectionTitles[section]}. Press Space, then use Up or Down arrow keys."><span class="drag-icon" aria-hidden="true"></span></button><span>${index+1}. ${sectionTitles[section]}</span></li>`).join("");
}

function renderPhoto(){
  const blob=records.find(record=>record.section==="profile-photo")?.blob;
  if(photoObjectUrl)URL.revokeObjectURL(photoObjectUrl);
  photoObjectUrl=blob?URL.createObjectURL(blob):"";
  documentPhoto.src=photoObjectUrl;
  documentPhoto.hidden=!blob;
}

function renderIdentity(){
  const identity=records.find(record=>record.section==="profile-identity");
  documentName.textContent=identity?.name||"Gabo";
  documentHeadline.textContent=identity?.headline||"Remote Virtual Assistant | Operations & Client Support";
  documentLocation.textContent=identity?.location||"Guayaquil, Ecuador";
}

function showToast(message){toast.textContent=message;toast.hidden=false;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>{toast.hidden=true},2800)}

function clearDropIndicators(){orderList.querySelectorAll(".drop-before,.drop-after").forEach(item=>item.classList.remove("drop-before","drop-after"))}
function updateDropTarget(clientX,clientY){
  const item=document.elementFromPoint(clientX,clientY)?.closest("li[data-section]");
  if(!item||item.dataset.section===draggedSection)return;
  clearDropIndicators();
  const box=item.getBoundingClientRect();
  dropTarget=item.dataset.section;
  dropPosition=clientY<box.top+box.height/2?"before":"after";
  item.classList.add(dropPosition==="before"?"drop-before":"drop-after");
}

orderList.addEventListener("dragstart",event=>{
  const item=event.target.closest("li[data-section]");
  if(!item)return;
  draggedSection=item.dataset.section;
  item.classList.add("dragging");
  event.dataTransfer.effectAllowed="move";
  event.dataTransfer.setData("text/plain",draggedSection);
});
orderList.addEventListener("dragover",event=>{if(!draggedSection)return;event.preventDefault();event.dataTransfer.dropEffect="move";updateDropTarget(event.clientX,event.clientY)});
orderList.addEventListener("drop",event=>{event.preventDefault();const section=draggedSection;const target=dropTarget;const position=dropPosition;draggedSection="";dropTarget="";clearDropIndicators();placeSection(section,target,position)});
orderList.addEventListener("dragend",()=>{draggedSection="";dropTarget="";clearDropIndicators();orderList.querySelectorAll(".dragging").forEach(item=>item.classList.remove("dragging"))});

orderList.addEventListener("pointerdown",event=>{
  const handle=event.target.closest("[data-handle]");
  if(!handle||event.pointerType==="mouse")return;
  draggedSection=handle.dataset.handle;
  dropTarget="";
  handle.setPointerCapture(event.pointerId);
  handle.closest("li").classList.add("dragging");
  event.preventDefault();
});
orderList.addEventListener("pointermove",event=>{if(!draggedSection||event.pointerType==="mouse")return;updateDropTarget(event.clientX,event.clientY)});
orderList.addEventListener("pointerup",event=>{
  if(!draggedSection||event.pointerType==="mouse")return;
  const section=draggedSection,target=dropTarget,position=dropPosition;
  draggedSection="";dropTarget="";clearDropIndicators();
  if(target)placeSection(section,target,position);else renderOrder();
});

orderList.addEventListener("keydown",event=>{
  const handle=event.target.closest("[data-handle]");
  if(!handle)return;
  const section=handle.dataset.handle;
  if(event.key===" "||event.key==="Enter"){
    event.preventDefault();
    keyboardGrabbed=keyboardGrabbed===section?"":section;
    renderOrder();
    orderList.querySelector(`[data-handle="${section}"]`)?.focus();
    showToast(keyboardGrabbed?`${sectionTitles[section]} selected. Use Up or Down arrows.`:`${sectionTitles[section]} position saved.`);
  }
  if(keyboardGrabbed===section&&(event.key==="ArrowUp"||event.key==="ArrowDown")){
    event.preventDefault();moveSection(section,event.key==="ArrowUp"?-1:1);
  }
  if(event.key==="Escape"&&keyboardGrabbed){event.preventDefault();keyboardGrabbed="";renderOrder();orderList.querySelector(`[data-handle="${section}"]`)?.focus();showToast("Reordering cancelled.")}
});
document.querySelector("#reset-order").addEventListener("click",()=>{order=[...defaultOrder];localStorage.removeItem(ORDER_KEY);renderOrder();renderDocument();showToast("Default document order restored.")});
document.querySelector("#print-document").addEventListener("click",()=>{if(documentSheet.hidden){showToast("Save a Profile section before creating a PDF.");return}window.print()});
window.addEventListener("pagehide",()=>{if(photoObjectUrl)URL.revokeObjectURL(photoObjectUrl)});

window.GaboResumePreview.seed(openDatabase).then(()=>readRecords()).then(result=>{records=result;renderOrder();renderPhoto();renderIdentity();renderDocument()}).catch(()=>{renderOrder();documentSheet.hidden=true;emptyDocument.hidden=false;showToast("Saved Profile information is temporarily unavailable.")});
