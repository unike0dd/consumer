const STATE_KEY="gabo:consumer:job-workflow:v1";
const NEXT_STEPS_KEY="gabo:consumer:next-steps:v1";
const DB_NAME="gabo-consumer-career";
const DB_VERSION=1;
const STORE="applications";
const jobs={
  operations:{id:"operations",title:"Operations Coordinator",company:"Casa Verde Market",location:"Hybrid",type:"Full-time",market:true,description:"Coordinate daily operational workflows across teams, maintain accurate records, resolve service exceptions, and help managers keep commitments visible and on schedule.",responsibilities:["Coordinate schedules, priorities, and operational follow-up.","Maintain accurate activity, inventory, and service records.","Communicate exceptions and recommended actions to stakeholders.","Support continuous improvement through clear documentation."],requirements:["Experience coordinating operations, logistics, or administrative workflows.","Strong written communication and organizational judgment.","Ability to manage several priorities with accurate follow-through."]},
  support:{id:"support",title:"Customer Support Specialist",company:"Norte Studio",location:"Remote",type:"Full-time",market:true,description:"Deliver thoughtful customer support across digital channels, investigate service questions, document outcomes, and represent the organization with clarity and empathy.",responsibilities:["Respond to customer questions through approved service channels.","Investigate issues and coordinate timely resolutions.","Document interactions, outcomes, and recurring themes.","Contribute to service knowledge and process improvements."],requirements:["Professional customer-service or client-support experience.","Clear written communication and dependable documentation.","Comfort working independently in a remote environment."]},
  assistant:{id:"assistant",title:"Virtual Assistant",company:"Sol & Mar",location:"Remote",type:"Contract",market:true,description:"Provide dependable remote administrative support, organize information, coordinate calendars and follow-up, and help leaders maintain focus on priority work.",responsibilities:["Coordinate calendars, meetings, reminders, and action items.","Prepare documents and organize business information.","Track assignments and communicate progress clearly.","Support routine research and operational administration."],requirements:["Experience in administrative, executive, or virtual assistance.","Strong organization, discretion, and written communication.","Reliable access to a professional remote-work environment."]},
  hr:{id:"hr",title:"HR Coordinator",company:"Andina Collective",location:"Hybrid",type:"Full-time",market:false,description:"Support structured people operations through accurate coordination, candidate communication, record management, and dependable follow-up across the employee lifecycle.",responsibilities:["Coordinate interviews, documentation, and onboarding actions.","Maintain accurate candidate and employee records.","Support managers with timely status communication."],requirements:["Experience supporting HR, recruiting, or administrative workflows.","Confidentiality, accuracy, and professional communication."]}
};
const nextSteps=[
  {id:"interview-operations",title:"Prepare for Operations Coordinator interview",date:"Tuesday",time:"10:00 AM"},
  {id:"profile-summary",title:"Update professional summary",date:"Today",time:"4:30 PM"},
  {id:"resume-upload",title:"Upload latest résumé",date:"Tomorrow",time:"9:00 AM"},
  {id:"review-matches",title:"Review three new matches",date:"Friday",time:"2:00 PM"}
];
const initialState={operations:{tracked:true,status:"Interview scheduled",interviewDate:"2026-09-01",interviewTime:"10:00"},support:{tracked:true,status:"Under review"},assistant:{tracked:true,status:"Applied"},hr:{saved:true,status:"Saved"}};
const jobList=document.querySelector("#job-list");
const savedList=document.querySelector("#saved-list");
const trackerList=document.querySelector("#tracker-list");
const interviewList=document.querySelector("#interview-list");
const dialog=document.querySelector("#job-dialog");
const toast=document.querySelector(".toast");
const nextStepList=document.querySelector("#next-step-list");
const resumeInput=document.querySelector("#resume-input");
const interviewForm=document.querySelector("#interview-form");
let state=readState();
let nextStepState=readNextStepState();
let activeJob="";

function readState(){try{return {...structuredClone(initialState),...JSON.parse(localStorage.getItem(STATE_KEY)||"{}")}}catch{return structuredClone(initialState)}}
function readNextStepState(){try{return JSON.parse(localStorage.getItem(NEXT_STEPS_KEY)||"{}")}catch{return {}}}
function saveState(){localStorage.setItem(STATE_KEY,JSON.stringify(state))}
function jobState(id){return state[id]||(state[id]={})}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character])}
function showToast(message){toast.textContent=message;toast.hidden=false;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>{toast.hidden=true},3000)}

function openDatabase(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,DB_VERSION);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"jobId"})};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function writeResume(jobId,file){const db=await openDatabase();return new Promise((resolve,reject)=>{const transaction=db.transaction(STORE,"readwrite");transaction.objectStore(STORE).put({jobId,resumeName:file.name,resumeBlob:file,updatedAt:new Date().toISOString()});transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error)})}
async function readResume(jobId){const db=await openDatabase();return new Promise((resolve,reject)=>{const request=db.transaction(STORE,"readonly").objectStore(STORE).get(jobId);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}

function actionButtons(job){
  const current=jobState(job.id);
  return `<div class="job-actions"><button type="button" data-job-action="save" data-job="${job.id}" aria-pressed="${Boolean(current.saved)}">${current.saved?"Saved":"Save Job"}</button><button type="button" data-job-action="track" data-job="${job.id}" aria-pressed="${Boolean(current.tracked)}">${current.tracked?"Tracked":"Track"}</button><button type="button" data-job-action="interview" data-job="${job.id}" aria-pressed="${Boolean(current.interviewDate)}">${current.interviewDate?"Interview Set":"Set Up Interview"}</button></div>`;
}

function renderNextSteps(){
  const complete=nextSteps.filter(task=>nextStepState[task.id]).length;
  document.querySelector("#next-step-count").textContent=`${complete} of ${nextSteps.length} completed`;
  nextStepList.innerHTML=nextSteps.map(task=>`<article class="next-step ${nextStepState[task.id]?"done":""}" data-next-step="${task.id}"><div><strong>${escapeHtml(task.title)}</strong><small><span aria-hidden="true">▣</span> ${task.date} · ${task.time}</small></div><span class="task-status">${nextStepState[task.id]?"Done":"Pending"}</span><button type="button" data-toggle-next-step="${task.id}">${nextStepState[task.id]?"Reopen":"Mark Done"}</button></article>`).join("");
}

function renderJobs(){
  const marketJobs=Object.values(jobs).filter(job=>job.market);
  jobList.innerHTML=marketJobs.map(job=>`<article data-job-row="${job.id}"><button class="job-open" type="button" data-open-job="${job.id}"><strong>${escapeHtml(job.title)}</strong><small>${escapeHtml(job.company)} · ${escapeHtml(job.location)}</small><span>View job description</span></button>${actionButtons(job)}</article>`).join("");
  document.querySelector("#job-count").textContent=`${marketJobs.length} available`;
}

function renderSaved(){
  const saved=Object.values(jobs).filter(job=>jobState(job.id).saved);
  savedList.innerHTML=saved.length?saved.map(job=>`<article class="saved-job"><button class="saved-open" type="button" data-open-job="${job.id}"><strong>${escapeHtml(job.title)}</strong><small>${escapeHtml(job.company)}</small></button><button class="remove-saved" type="button" data-job-action="save" data-job="${job.id}">Remove</button></article>`).join(""):`<p class="empty-state">No saved jobs yet.</p>`;
}

function renderTracker(){
  const tracked=Object.values(jobs).filter(job=>jobState(job.id).tracked||jobState(job.id).applied);
  trackerList.innerHTML=tracked.length?tracked.map(job=>`<li><button type="button" data-open-job="${job.id}">${escapeHtml(job.title)}</button><b>${escapeHtml(jobState(job.id).status||"Tracked")}</b></li>`).join(""):`<li class="empty-state">No tracked jobs yet.</li>`;
}

function renderInterviews(){
  const scheduled=Object.values(jobs).filter(job=>jobState(job.id).interviewDate&&jobState(job.id).interviewTime);
  interviewList.innerHTML=scheduled.length?scheduled.map(job=>{
    const current=jobState(job.id),date=new Date(`${current.interviewDate}T${current.interviewTime}`);
    const month=new Intl.DateTimeFormat(undefined,{month:"short"}).format(date).toUpperCase();
    const day=new Intl.DateTimeFormat(undefined,{day:"2-digit"}).format(date);
    const weekday=new Intl.DateTimeFormat(undefined,{weekday:"long"}).format(date);
    const time=new Intl.DateTimeFormat(undefined,{hour:"numeric",minute:"2-digit"}).format(date);
    return `<article><time datetime="${current.interviewDate}T${current.interviewTime}"><span>${month}</span><strong>${day}</strong></time><button type="button" data-open-job="${job.id}"><strong>${escapeHtml(job.title)}</strong><small>${escapeHtml(job.company)}</small></button><p><b>${weekday}</b><span>${time}</span></p></article>`;
  }).join(""):`<p class="empty-state">No interviews scheduled yet.</p>`;
}

function renderAll(){renderNextSteps();renderJobs();renderSaved();renderTracker();renderInterviews();if(activeJob)updateDialogActions()}

function updateDialogActions(){
  const current=jobState(activeJob);
  dialog.querySelector('[data-dialog-action="save"]').textContent=current.saved?"Remove Saved Job":"Save Job";
  dialog.querySelector('[data-dialog-action="track"]').textContent=current.tracked?"Stop Tracking":"Track";
  dialog.querySelector('[data-dialog-action="interview"]').textContent=current.interviewDate?"Change Interview":"Set Up Interview";
}

function openJob(id){
  const job=jobs[id];if(!job)return;
  activeJob=id;
  document.querySelector("#job-company").textContent=job.company;
  document.querySelector("#job-dialog-title").textContent=job.title;
  document.querySelector("#job-meta").textContent=`${job.location} · ${job.type}`;
  document.querySelector("#job-description").textContent=job.description;
  document.querySelector("#job-responsibilities").innerHTML=job.responsibilities.map(item=>`<li>${escapeHtml(item)}</li>`).join("");
  document.querySelector("#job-requirements").innerHTML=job.requirements.map(item=>`<li>${escapeHtml(item)}</li>`).join("");
  interviewForm.hidden=true;
  document.querySelector("#interview-date").value=jobState(id).interviewDate||"";
  document.querySelector("#interview-date").min=new Date().toISOString().slice(0,10);
  document.querySelector("#interview-time").value=jobState(id).interviewTime||"";
  document.querySelector("#resume-status").textContent=jobState(id).applicationMethod?`Application prepared with ${jobState(id).applicationMethod}.`:"";
  updateDialogActions();
  readResume(id).then(record=>{if(record)document.querySelector("#resume-status").textContent=`Résumé attached: ${record.resumeName}`}).catch(()=>{});
  dialog.showModal();
  dialog.querySelector(".dialog-close").focus();
}

function toggleState(id,action){
  const current=jobState(id),job=jobs[id];
  if(action==="save"){current.saved=!current.saved;if(!current.status)current.status=current.saved?"Saved":"";showToast(current.saved?`${job.title} saved.`:`${job.title} removed from Saved Jobs.`)}
  if(action==="track"){current.tracked=!current.tracked;if(current.tracked&&!current.status)current.status="Tracked";showToast(current.tracked?`${job.title} added to Jobs Tracker.`:`${job.title} removed from Jobs Tracker.`)}
  saveState();renderAll();
}

document.addEventListener("click",event=>{
  const nextStep=event.target.closest("[data-toggle-next-step]");if(nextStep){const id=nextStep.dataset.toggleNextStep;nextStepState[id]=!nextStepState[id];localStorage.setItem(NEXT_STEPS_KEY,JSON.stringify(nextStepState));renderNextSteps();showToast(nextStepState[id]?"Task marked done.":"Task reopened.");return}
  const open=event.target.closest("[data-open-job]");if(open){openJob(open.dataset.openJob);return}
  const action=event.target.closest("[data-job-action]");if(action){if(action.dataset.jobAction==="interview"){openJob(action.dataset.job);interviewForm.hidden=false;document.querySelector("#interview-date").focus()}else toggleState(action.dataset.job,action.dataset.jobAction)}
});

window.addEventListener("storage",event=>{if(event.key===NEXT_STEPS_KEY){nextStepState=readNextStepState();renderNextSteps()}});

dialog.querySelector(".dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
dialog.addEventListener("close",()=>{activeJob="";resumeInput.value=""});
dialog.addEventListener("click",event=>{
  const button=event.target.closest("[data-dialog-action]");if(!button||!activeJob)return;
  const action=button.dataset.dialogAction,current=jobState(activeJob),job=jobs[activeJob];
  if(action==="save"||action==="track"){toggleState(activeJob,action);return}
  if(action==="interview"){interviewForm.hidden=!interviewForm.hidden;if(!interviewForm.hidden)document.querySelector("#interview-date").focus();return}
  if(action==="apply-profile"){
    current.applied=true;current.tracked=true;current.status="Applied with Profile PDF";current.applicationMethod="Profile PDF";saveState();renderAll();document.querySelector("#resume-status").textContent="Application prepared with Profile PDF.";showToast(`Application prepared for ${job.title}.`);return;
  }
  if(action==="save-interview"){
    const date=document.querySelector("#interview-date").value,time=document.querySelector("#interview-time").value;
    if(!date||!time){showToast("Select both an interview date and time.");return}
    current.interviewDate=date;current.interviewTime=time;current.tracked=true;current.status="Interview scheduled";saveState();renderAll();interviewForm.hidden=true;showToast(`Interview scheduled for ${job.title}.`);
  }
});

resumeInput.addEventListener("change",()=>{
  const file=resumeInput.files?.[0];if(!file||!activeJob)return;
  if(file.type!=="application/pdf"){showToast("Upload a PDF résumé.");resumeInput.value="";return}
  if(file.size>10*1024*1024){showToast("The résumé PDF must be 10 MB or smaller.");resumeInput.value="";return}
  const id=activeJob,current=jobState(id);
  writeResume(id,file).then(()=>{current.applied=true;current.tracked=true;current.status="Applied with résumé PDF";current.applicationMethod="uploaded résumé PDF";saveState();renderAll();document.querySelector("#resume-status").textContent=`Résumé attached: ${file.name}`;showToast(`Résumé attached to ${jobs[id].title}.`);resumeInput.value=""}).catch(()=>showToast("The résumé PDF could not be stored."));
});

renderAll();
