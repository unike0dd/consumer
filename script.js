const dashboard={
  audience:"Workspace",
  greeting:"Hello, Gabriel.",
  progress:[["Profile completeness",85],["Application follow-up",72],["Career checklist",68]]
};

document.title="Gabo Services | Workspace";
document.body.className="theme-consumer";
document.querySelector("#app").innerHTML=`
<main class="shell sidebar-closed">
  <div class="sidebar-backdrop" data-sidebar-close hidden></div>
  <aside class="side" id="consumer-sidebar" aria-hidden="true">
    <a class="brand" href="#top">Gabo Services</a>
    <nav class="primary-nav" aria-label="Consumer navigation">
      <a class="nav" href="profile/"><span class="nav-mark" aria-hidden="true"></span>My Profile</a>
      <a class="nav" href="task/"><span class="nav-mark" aria-hidden="true"></span>Task</a>
      <div class="nav-group">
        <a class="nav" href="documents/"><span class="nav-mark" aria-hidden="true"></span>Documents</a>
      </div>
      <div class="nav-group">
        <a class="nav" href="settings/"><span class="nav-mark" aria-hidden="true"></span>Settings</a>
      </div>
    </nav>
    <footer class="side-bottom" aria-label="Account actions"><a class="logout-link" href="https://unike0dd.github.io/duplicate-hrservices/auth.html?dashboard=consumer&amp;mode=signin">Log out</a></footer>
  </aside>
  <section class="work" id="top">
    <header class="top">
      <b>Gabo Services</b>
      <button class="sidebar-toggle" id="sidebar-toggle" type="button" aria-controls="consumer-sidebar" aria-expanded="false" aria-label="Open navigation menu"><span class="sidebar-glyph" aria-hidden="true"></span></button>
      <div class="search" role="search"><button class="search-toggle" type="button" aria-label="Open dashboard search" aria-controls="dashboard-search" aria-expanded="false"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg></button><input id="dashboard-search" aria-label="Search dashboard" placeholder="Search this dashboard"></div>
      <a class="profile-link" href="profile/" aria-label="Open your profile"><span class="profile-avatar" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 20c.7-4.1 3.2-6.2 7.5-6.2s6.8 2.1 7.5 6.2"/></svg></span><span class="profile-text">Profile</span></a>
    </header>
    <div class="content">
      <section class="welcome">
        <div><div class="welcome-meta"><p class="eyebrow">${dashboard.audience}</p><time id="workspace-clock" aria-label="Current date and time"></time></div><h1>${dashboard.greeting}</h1></div>
        <nav class="quick-actions" aria-label="Quick actions"><span>Quick actions</span><div><a href="documents/">Upload résumé</a><a href="documents/">Documents</a><a href="task/#jobs">Jobs</a></div></nav>
      </section>
      <div class="grid">
        <div class="main-stack">
          <section class="panel"><div class="heading"><div><p class="eyebrow">At a glance</p><h2>Career progress</h2></div></div><div class="progress">${dashboard.progress.map(p=>`<div><p><span>${p[0]}</span><b>${p[1]}%</b></p><div><i style="width:${p[1]}%"></i></div></div>`).join("")}</div></section>
        </div>
        <aside class="right">
          <section class="panel task-center"><div class="heading"><div><p class="eyebrow">Task center</p><h2>Next steps</h2></div></div><nav class="task-center-links" aria-label="Task center options">
            <a href="task/#next-steps"><span><strong>Create a Task</strong></span><b>View tasks</b></a>
            <a href="task/#next-steps"><span><strong>Your opportunities</strong></span><b>View Applications</b></a>
            <a href="task/#next-steps"><span><strong>Saved Jobs</strong></span><b>View Jobs</b></a>
            <a href="task/#next-steps"><span><strong>Jobs Tracker</strong></span><b>View Trackers</b></a>
          </nav></section>
        </aside>
      </div>
    </div>
  </section>
</main>`;

const shell=document.querySelector(".shell"),sidebar=document.querySelector("#consumer-sidebar"),sidebarToggle=document.querySelector("#sidebar-toggle"),sidebarBackdrop=document.querySelector("[data-sidebar-close]");
const setSidebarOpen=open=>{shell.classList.toggle("sidebar-open",open);shell.classList.toggle("sidebar-closed",!open);sidebarToggle.setAttribute("aria-expanded",String(open));sidebarToggle.setAttribute("aria-label",open?"Close navigation menu":"Open navigation menu");sidebar.setAttribute("aria-hidden",String(!open));sidebar.inert=!open;sidebarBackdrop.hidden=!open;document.body.classList.toggle("sidebar-visible",open)};
sidebarToggle.addEventListener("click",()=>setSidebarOpen(!shell.classList.contains("sidebar-open")));
sidebarBackdrop.addEventListener("click",()=>setSidebarOpen(false));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&shell.classList.contains("sidebar-open")){setSidebarOpen(false);sidebarToggle.focus()}});
setSidebarOpen(false);

const clock=document.querySelector("#workspace-clock");
const updateClock=()=>{const now=new Date();clock.dateTime=now.toISOString();clock.textContent=new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(now)};
updateClock();
setInterval(updateClock,60000);

const search=document.querySelector(".search"),searchToggle=document.querySelector(".search-toggle"),input=document.querySelector(".search input"),taskCenterLinks=[...document.querySelectorAll(".task-center-links a")];
const adjustableScreen=window.matchMedia("(max-width: 1023px)");
function setSearchOpen(open){
  search.classList.toggle("search-open",open);
  searchToggle.setAttribute("aria-expanded",String(open));
  searchToggle.setAttribute("aria-label",open?"Close dashboard search":"Open dashboard search");
  if(open)input.focus();
}
searchToggle.addEventListener("click",()=>{if(adjustableScreen.matches)setSearchOpen(!search.classList.contains("search-open"));else input.focus()});
document.addEventListener("click",event=>{if(adjustableScreen.matches&&!search.contains(event.target)&&search.classList.contains("search-open"))setSearchOpen(false)});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&search.classList.contains("search-open")){setSearchOpen(false);searchToggle.focus()}});
adjustableScreen.addEventListener?.("change",event=>{if(!event.matches)setSearchOpen(false)});
input.addEventListener("input",()=>{const query=input.value.trim().toLowerCase();taskCenterLinks.forEach(link=>{link.hidden=!link.textContent.toLowerCase().includes(query)})});
