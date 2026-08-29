(function(){
  "use strict";
  const sections={
    summary:[
      {name:"Remote Virtual Assistant | Operations & Client Support",description:"Bilingual virtual-assistance and operations professional with international experience supporting customers, teams, records, schedules, technical cases, and logistics activity. Combines clear English/Spanish communication with disciplined follow-through, process improvement, and practical problem-solving across the US, Canada, UK, and Latin America.",proficiency:"Expert",evidence:"Work experience",url:""},
      {name:"Selected Business Impact",description:"Maintained 95% average CSAT while delivering bilingual technical support across four international markets.\nImproved sales productivity approximately 16% by coaching and uptraining a 15-person team.\nIncreased terminal profit and delivery performance by 10% through stronger inventory, billing, training, and scheduling controls.\nImproved delivery accuracy 20% by simplifying dispatch labeling and reducing freight-routing discrepancies.",proficiency:"Senior",evidence:"Work experience",url:""}
    ],
    skills:[
      {name:"Remote Client & Technical Support",description:"Diagnosed service issues, documented cases, guided customers through resolutions, managed follow-up, and coordinated escalations in English and Spanish across RingCentral, Hewlett Packard, and Bosch.",proficiency:"Expert",evidence:"Work experience",url:""},
      {name:"Operations, Logistics & Administration",description:"Coordinated schedules, freight and export records, storage, inventory, routing, labeling, invoicing, billing, driver communication, and customer follow-up across Target Logistics, Metro T & C, and Clark Worldwide.",proficiency:"Senior",evidence:"Work experience",url:""},
      {name:"Leadership, Sales & Customer Experience",description:"Coached sales associates, monitored performance, resolved account and billing concerns, and earned Northeast recognition for highest ARPU across Orbistel and Verizon Wireless.",proficiency:"Senior",evidence:"Work experience",url:""},
      {name:"Technology",description:"Microsoft 365, Salesforce, ChatGPT, Microsoft Copilot, Gemini, and NotebookLM.",proficiency:"Advanced",evidence:"Work experience",url:""},
      {name:"Languages",description:"Spanish - Native / bilingual. English - C2, EF SET certified.",proficiency:"Expert",evidence:"Assessment verified",url:""}
    ],
    experience:[
      {name:"IT Technical Support | RingCentral | 2016-2018",description:"Remote client and technical support, service-issue diagnosis, case documentation, customer guidance, follow-up, and escalations in English and Spanish.",proficiency:"Senior",evidence:"Work experience",url:""},
      {name:"Bilingual Technical Consultant | Hewlett Packard | 2015",description:"Bilingual client and technical support with structured troubleshooting, documentation, resolution guidance, and professional follow-up.",proficiency:"Senior",evidence:"Work experience",url:""},
      {name:"IT Technical Support | Bosch Communication Center | 2013-2015",description:"Technical-case support across international markets, including issue diagnosis, documentation, resolution guidance, and escalation coordination.",proficiency:"Senior",evidence:"Work experience",url:""},
      {name:"Sales Supervisor | Orbistel Call Center | 2007-2008",description:"Coached sales associates, monitored performance, strengthened team productivity, and supported customer experience and account resolution.",proficiency:"Senior",evidence:"Work experience",url:""},
      {name:"Terminal Supervisor | Target Logistics | 2006-2007",description:"Managed terminal operations, inventory, billing, training, scheduling controls, delivery performance, and customer follow-up.",proficiency:"Senior",evidence:"Work experience",url:""},
      {name:"Customer Experience Representative | Verizon Wireless | 2003-2005",description:"Resolved customer account and billing concerns, supported sales and service needs, and earned Northeast recognition for highest ARPU.",proficiency:"Senior",evidence:"Work experience",url:""},
      {name:"Dispatch Supervisor | Metro T & C Trucking | 1999-2001",description:"Coordinated dispatch, driver communication, freight routing, labeling, scheduling, delivery accuracy, and customer follow-up.",proficiency:"Senior",evidence:"Work experience",url:""},
      {name:"Export Administrator | Clark Worldwide Transportation | 1997-1999",description:"Coordinated export and freight records, storage, routing, invoicing, billing, scheduling, and customer follow-up.",proficiency:"Senior",evidence:"Work experience",url:""}
    ],
    education:[
      {name:"Prompt-engineering coursework",description:"Continuing professional development in practical prompt design and effective use of generative AI tools.",proficiency:"Advanced",evidence:"Course",url:""},
      {name:"Medical Assistant credential",description:"Professional credential supporting structured documentation, client communication, confidentiality, and service coordination.",proficiency:"Not specified",evidence:"Professional certification",url:""}
    ],
    projects:[
      {name:"AI-enabled website and chatbot project",description:"Applied generative AI, structured information design, and digital-service concepts to an AI-enabled website and chatbot project.",proficiency:"Advanced",evidence:"Verified portfolio",url:""}
    ]
  };
  async function seed(openDatabase){
    const db=await openDatabase();
    const existing=await new Promise((resolve,reject)=>{const request=db.transaction("sections","readonly").objectStore("sections").getAll();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
    const existingSections=new Set(existing.map(record=>record.section));
    const missing=Object.entries(sections).filter(([section])=>!existingSections.has(section));
    const needsIdentity=!existingSections.has("profile-identity");
    if(!missing.length&&!needsIdentity)return false;
    const updatedAt=new Date().toISOString();
    await new Promise((resolve,reject)=>{const transaction=db.transaction("sections","readwrite"),store=transaction.objectStore("sections");missing.forEach(([section,entries])=>store.put({section,entries,status:"saved",updatedAt}));if(needsIdentity)store.put({section:"profile-identity",name:"Gabo",headline:"Remote Virtual Assistant | Operations & Client Support",location:"Guayaquil, Ecuador",updatedAt});transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error)});
    return true;
  }
  window.GaboResumePreview={sections,seed};
})();
