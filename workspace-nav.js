(() => {
  'use strict';
  const source = document.currentScript;
  const home = new URL('./', source.src);
  const isHome = location.pathname === home.pathname || location.pathname === `${home.pathname}index.html`;
  const sections = [
    { id: 'talent-acquisition', label: 'Talent Acquisition', tabs: [
      ['documents', 'Documents', 'Documents Received', 'Review the documents received for recruitment and onboarding.'],
      ['approvals', 'Approvals', 'Approvals', 'Review decisions awaiting approval.'],
      ['recruiting', 'Recruiting', 'Recruiting', 'Organize recruiting activity and candidate progress.'],
      ['onboarding', 'Onboarding', 'Onboarding', 'Follow onboarding tasks and new-hire documentation.'],
      ['employees', 'Employees', 'Employees', 'Review employees who have completed the hiring process.']
    ] },
    { id: 'people-directory', label: 'People Directory', tabs: [
      ['candidates', 'Candidates', 'Candidates', 'Find candidate profiles and contact information.'],
      ['employees', 'Employees', 'Employees', 'Find employee profiles and team information.'],
      ['clients', 'Clients', 'Clients', 'Find client contacts and company information.'],
      ['contractors', 'Contractors', 'Contractors', 'Find contractor profiles and contact information.'],
      ['vendors', 'Vendors', 'Vendors', 'Find vendor contacts and company information.']
    ] },
    { id: 'clients', label: 'Clients', tabs: [
      ['contact', 'Contact', 'Contact', 'Review client contacts and communication details.'],
      ['documentation', 'Documentation', 'Documentation', 'Organize documents associated with each client.'],
      ['contract', 'Contract', 'Contract', 'Review client agreements and contract details.'],
      ['billing', 'Billing', 'Billing', 'Review client billing details.'],
      ['invoicing', 'Invoicing', 'Invoicing', 'Review invoices associated with each client.']
    ] }
  ];
  const es = {
    'Overview': 'Resumen', 'Talent Acquisition': 'Adquisición de talento', 'People Directory': 'Directorio de personas',
    'Documents': 'Documentos', 'Documents Received': 'Documentos recibidos', 'Approvals': 'Aprobaciones',
    'Recruiting': 'Reclutamiento', 'Onboarding': 'Incorporación', 'Employees': 'Empleados', 'Candidates': 'Candidatos',
    'Clients': 'Clientes', 'Contractors': 'Contratistas', 'Vendors': 'Proveedores', 'Contact': 'Contacto',
    'Documentation': 'Documentación', 'Contract': 'Contrato', 'Billing': 'Facturación', 'Invoicing': 'Emisión de facturas',
    'Navigation': 'Navegación', 'Open navigation menu': 'Abrir menú de navegación', 'Close navigation menu': 'Cerrar menú de navegación',
    'More': 'Más', 'My Profile': 'Mi perfil', 'Tasks': 'Tareas', 'Settings': 'Configuración', 'Log out': 'Cerrar sesión',
    'No records to display.': 'No hay registros para mostrar.',
    'Review the documents received for recruitment and onboarding.': 'Revise los documentos recibidos para el reclutamiento y la incorporación.',
    'Review decisions awaiting approval.': 'Revise las decisiones pendientes de aprobación.',
    'Organize recruiting activity and candidate progress.': 'Organice las actividades de reclutamiento y el progreso de los candidatos.',
    'Follow onboarding tasks and new-hire documentation.': 'Dé seguimiento a las tareas de incorporación y los documentos de nuevos empleados.',
    'Review employees who have completed the hiring process.': 'Revise los empleados que han completado el proceso de contratación.',
    'Find candidate profiles and contact information.': 'Consulte los perfiles y los datos de contacto de los candidatos.',
    'Find employee profiles and team information.': 'Consulte los perfiles de los empleados y la información de los equipos.',
    'Find client contacts and company information.': 'Consulte los contactos de los clientes y la información de sus empresas.',
    'Find contractor profiles and contact information.': 'Consulte los perfiles y los datos de contacto de los contratistas.',
    'Find vendor contacts and company information.': 'Consulte los contactos de los proveedores y la información de sus empresas.',
    'Review client contacts and communication details.': 'Revise los contactos de los clientes y sus datos de comunicación.',
    'Organize documents associated with each client.': 'Organice los documentos asociados a cada cliente.',
    'Review client agreements and contract details.': 'Revise los acuerdos y los detalles de los contratos de los clientes.',
    'Review client billing details.': 'Revise los datos de facturación de los clientes.',
    'Review invoices associated with each client.': 'Revise las facturas asociadas a cada cliente.'
  };
  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 900px)');
  const text = key => root.lang.startsWith('es') ? es[key] || key : key;
  const label = key => `<span data-wn-label="${key}">${text(key)}</span>`;
  const originalRoot = document.querySelector('main');
  if (!originalRoot || document.getElementById('workspace-navigation')) return;
  const originalSidebar = document.querySelector('.sidebar, #consumer-sidebar');
  const oldNav = originalSidebar?.querySelector('nav');
  const oldFooter = originalSidebar?.querySelector('.side-bottom');
  const oldToggle = document.querySelector('#menuToggle, #sidebar-toggle');
  if (oldToggle?.getAttribute('aria-expanded') === 'true') oldToggle.click();
  const content = originalRoot.querySelector('.workspace > .content, .work > .content');
  const parent = content?.parentElement || originalRoot;
  const originalPanels = content ? [content] : [...originalRoot.children].filter(node => !['HEADER', 'SCRIPT', 'STYLE'].includes(node.tagName));
  const priorHidden = new Map(originalPanels.map(node => [node, node.hidden]));
  originalPanels.forEach(node => { node.dataset.wnOriginalPanel = ''; });
  originalRoot.classList.add('wn-original-root');
  originalSidebar?.classList.add('wn-retired-sidebar');
  oldToggle?.classList.add('wn-retired-toggle');
  document.body.classList.add('wn-enabled');

  const toggle = document.createElement('button');
  toggle.className = 'wn-hamburger';
  toggle.type = 'button';
  toggle.id = 'workspace-menu-toggle';
  toggle.dataset.uiControl = '';
  toggle.setAttribute('aria-controls', 'workspace-navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
  const backdrop = document.createElement('div');
  backdrop.className = 'wn-backdrop';
  backdrop.hidden = true;
  const drawer = document.createElement('aside');
  drawer.id = 'workspace-navigation';
  drawer.className = 'wn-drawer';
  drawer.dataset.uiControl = '';
  drawer.innerHTML = `<header class="wn-drawer-head"><strong>Gabo Services</strong><button class="wn-close" type="button"><span aria-hidden="true">×</span></button></header>
    <nav class="wn-navigation"><button class="wn-section wn-overview" type="button" data-wn-section="overview">${label('Overview')}</button>
    ${sections.map(section => `<div class="wn-group"><button class="wn-section" type="button" data-wn-section="${section.id}" aria-expanded="false" aria-controls="wn-sub-${section.id}">${label(section.label)}<span class="wn-chevron" aria-hidden="true"></span></button><div class="wn-submenu" id="wn-sub-${section.id}" hidden>${section.tabs.map(tab => `<button class="wn-subitem" type="button" data-wn-section="${section.id}" data-wn-tab="${tab[0]}">${label(tab[2])}</button>`).join('')}</div></div>`).join('')}</nav>
    <details class="wn-more"><summary>${label('More')}</summary><div class="wn-legacy"></div></details>`;
  const legacy = drawer.querySelector('.wn-legacy');
  if (oldNav) legacy.append(oldNav);
  if (oldFooter) legacy.append(oldFooter);
  if (!oldNav && home.pathname.includes('/consumer/')) {
    [['profile/', 'My Profile'], ['task/', 'Tasks'], ['documents/', 'Documents'], ['settings/', 'Settings']].forEach(([path, name]) => {
      const a = document.createElement('a'); a.href = new URL(path, home); a.innerHTML = label(name); legacy.append(a);
    });
  }
  drawer.querySelector('.wn-more').hidden = !legacy.children.length;
  const surface = document.createElement('section');
  surface.className = 'wn-surface';
  surface.dataset.uiControl = '';
  surface.hidden = true;
  surface.innerHTML = `<header class="wn-heading"><h1 id="wn-heading"></h1></header><div class="wn-tablist" role="tablist"></div><div class="wn-panels"></div>`;
  if (content) content.before(surface); else parent.prepend(surface);
  document.body.append(backdrop, drawer, toggle);
  let activeSection = 'overview';
  let activeTab = '';
  const lastTab = new Map();
  let open = false;
  const closeButton = drawer.querySelector('.wn-close');
  const inertBefore = new Map();
  const setOpen = (next, restoreFocus = false) => {
    open = next;
    document.body.classList.toggle('wn-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', text(open ? 'Close navigation menu' : 'Open navigation menu'));
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    backdrop.hidden = !(open && mobile.matches);
    document.body.classList.toggle('wn-modal-open', open && mobile.matches);
    if (open && mobile.matches) {
      drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true');
      [...document.body.children].filter(node => ![drawer, toggle, backdrop].includes(node) && !['SCRIPT', 'STYLE'].includes(node.tagName)).forEach(node => {
        if (!inertBefore.has(node)) inertBefore.set(node, node.inert);
        node.inert = true;
      });
    } else {
      drawer.removeAttribute('role'); drawer.removeAttribute('aria-modal');
      inertBefore.forEach((value, node) => { node.inert = value; }); inertBefore.clear();
    }
    if (open) closeButton.focus({ preventScroll: true });
    else if (restoreFocus) toggle.focus({ preventScroll: true });
  };
  const localize = () => {
    [drawer, surface].forEach(scope => scope.querySelectorAll('[data-wn-label]').forEach(node => { node.textContent = text(node.dataset.wnLabel); }));
    toggle.setAttribute('aria-label', text(open ? 'Close navigation menu' : 'Open navigation menu'));
    closeButton.setAttribute('aria-label', text('Close navigation menu'));
    drawer.setAttribute('aria-label', text('Navigation'));
    const section = sections.find(s => s.id === activeSection);
    if (section) {
      surface.querySelector('#wn-heading').textContent = text(section.label);
      surface.querySelector('[role="tablist"]').setAttribute('aria-label', text(section.label));
    }
  };
  function showOriginal() {
    surface.hidden = true;
    originalPanels.forEach(node => { node.hidden = priorHidden.get(node); });
    document.body.classList.remove('wn-screen-active');
  }
  function select(sectionId, tabId, { route = true, focus = false } = {}) {
    const section = sections.find(s => s.id === sectionId);
    const tab = section && (section.tabs.find(t => t[0] === tabId) || section.tabs.find(t => t[0] === lastTab.get(sectionId)) || section.tabs[0]);
    activeSection = section?.id || 'overview'; activeTab = tab?.[0] || '';
    if (section) lastTab.set(section.id, activeTab);
    drawer.querySelectorAll('[data-wn-section]').forEach(button => {
      const selected = button.dataset.wnSection === activeSection;
      const current = selected && (!button.dataset.wnTab || button.dataset.wnTab === activeTab);
      button.classList.toggle('wn-active', current);
      if (current) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      if (button.hasAttribute('aria-expanded')) {
        button.setAttribute('aria-expanded', String(selected));
        document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
      }
    });
    if (!section) {
      showOriginal();
      if (route) {
        if (!isHome) { location.href = new URL('#workspace/overview', home); return; }
        oldNav?.querySelector('[data-screen="overview"]')?.click();
      }
    } else {
      originalPanels.forEach(node => { node.hidden = true; });
      surface.hidden = false;
      document.body.classList.add('wn-screen-active');
      surface.querySelector('.wn-tablist').innerHTML = section.tabs.map(item => `<button id="wn-tab-${section.id}-${item[0]}" class="wn-tab" type="button" role="tab" aria-selected="${item[0] === activeTab}" aria-controls="wn-panel-${section.id}-${item[0]}" tabindex="${item[0] === activeTab ? 0 : -1}" data-wn-tab="${item[0]}">${label(item[1])}</button>`).join('');
      surface.querySelector('.wn-panels').innerHTML = section.tabs.map(item => `<section id="wn-panel-${section.id}-${item[0]}" class="wn-panel" role="tabpanel" tabindex="0" aria-labelledby="wn-tab-${section.id}-${item[0]}" ${item[0] === activeTab ? '' : 'hidden'}><header><h2>${label(item[2])}</h2><p>${label(item[3])}</p></header><div class="wn-empty"><svg aria-hidden="true" viewBox="0 0 48 48"><rect x="10" y="7" width="28" height="34" rx="4"/><path d="M17 17h14M17 24h14M17 31h8"/></svg><p>${label('No records to display.')}</p></div></section>`).join('');
    }
    if (route) {
      const hash = section ? `#workspace/${section.id}/${activeTab}` : '#workspace/overview';
      if (location.hash !== hash) history.pushState(null, '', hash);
    }
    localize();
    if (focus && section) surface.querySelector('[role="tab"][aria-selected="true"]').focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => setOpen(!open));
  closeButton.addEventListener('click', () => setOpen(false, true));
  backdrop.addEventListener('click', () => setOpen(false, true));
  drawer.querySelector('.wn-navigation').addEventListener('click', event => {
    const button = event.target.closest('[data-wn-section]');
    if (!button) return;
    select(button.dataset.wnSection, button.dataset.wnTab);
    if (mobile.matches) { setOpen(false); surface.querySelector('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true }); }
  });
  legacy.addEventListener('click', event => {
    if (!event.target.closest('button,a')) return;
    showOriginal();
    activeSection = 'overview';
    drawer.querySelectorAll('.wn-active').forEach(button => { button.classList.remove('wn-active'); button.removeAttribute('aria-current'); });
    if (location.hash.startsWith('#workspace/')) history.replaceState(null, '', location.pathname + location.search);
    if (mobile.matches) setOpen(false);
  }, true);
  surface.querySelector('.wn-tablist').addEventListener('click', event => {
    const button = event.target.closest('[role="tab"]');
    if (button) select(activeSection, button.dataset.wnTab, { focus: true });
  });
  surface.querySelector('.wn-tablist').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...surface.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    select(activeSection, tabs[next].dataset.wnTab, { focus: true });
  });
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
    if (event.key === 'Tab' && mobile.matches) {
      const controls = [...drawer.querySelectorAll('button,a,summary')].filter(node => node.getClientRects().length && !node.disabled);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  const readRoute = () => {
    const [, section, tab] = location.hash.match(/^#workspace\/([^/]+)(?:\/([^/]+))?$/) || [];
    select(section || 'overview', tab, { route: false });
  };
  addEventListener('popstate', readRoute);
  addEventListener('hashchange', readRoute);
  mobile.addEventListener('change', () => setOpen(open));
  let lastLanguage = root.lang;
  new MutationObserver(() => { if (root.lang !== lastLanguage) { lastLanguage = root.lang; localize(); } }).observe(root, { attributes: true, attributeFilter: ['lang'] });
  readRoute(); setOpen(false); localize();
})();
