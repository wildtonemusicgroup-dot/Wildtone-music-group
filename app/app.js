/* ============================================================
   WILDTONE OPERATIONS SUITE — App Logic
   ============================================================ */

// ── State ──────────────────────────────────────────────────
const state = {
  currentModule: 'dashboard',
  timeStatus: 'idle', // idle | working | break
  clockInterval: null,
  workStart: null,
  breakStart: null,
  totalBreakMs: 0,
  breakInterval: null,   // interval for break stopwatch
  breakElapsedMs: 0,     // ms elapsed in current break
  chatHistory: [
    { role: 'ai', text: '¡Hola! Soy tu asistente de Wildtone. Puedo ayudarte con tareas, finanzas, horario y más. ¿En qué te ayudo hoy?' }
  ],
  notifications: []
};

// ── Persistence ─────────────────────────────────────────────
// Load notifications from Supabase (with localStorage fallback)
async function loadNotifications() {
  if (typeof dbGetNotifications === 'function') {
    try {
      const notifs = await dbGetNotifications();
      if (notifs.length) {
        state.notifications = notifs.map(n => ({
          id: n.id, text: n.text, time: n.time_label, unread: n.unread,
          link: n.link, ticketId: n.ticket_id, forDept: n.for_dept, forUser: n.for_user
        }));
        return;
      }
    } catch (e) { console.warn('Supabase notif load failed, using defaults', e); }
  }
  try {
    const savedNotifs = JSON.parse(localStorage.getItem('wildtone_notifications'));
    if (savedNotifs && Array.isArray(savedNotifs)) { state.notifications = savedNotifs; return; }
  } catch (e) { }
  state.notifications = [
    { id: 1, text: 'Carlos aprobó el gasto #FIN-042 por $1,200', time: 'hace 5 min', unread: true, link: 'finance' },
    { id: 2, text: 'Tarea "Diseño portada EP" vence mañana', time: 'hace 1h', unread: true, link: 'projects' },
    { id: 3, text: 'Ana solicitó corrección de horario del lunes', time: 'hace 2h', unread: true, link: 'time' },
    { id: 4, text: 'Nuevo deal creado: "Sync License - Netflix"', time: 'hace 3h', unread: false, link: 'crm' },
    { id: 5, text: 'Reporte mensual de febrero listo para exportar', time: 'ayer', unread: false, link: 'reports' },
  ];
}

function saveData() {
  // Also save to localStorage as fallback
  try {
    localStorage.setItem('wildtone_data', JSON.stringify(data));
    localStorage.setItem('wildtone_notifications', JSON.stringify(state.notifications));
  } catch (e) { }
}

function resetAllData() {
  localStorage.removeItem('wildtone_data');
  localStorage.removeItem('wildtone_notifications');
  localStorage.removeItem('wildtone_chat');
  showToast('🔄 Datos reseteados — recargando...');
  setTimeout(() => location.reload(), 800);
}

function getDefaultData() {
  return {
    tasks: [
      { id: 1, title: 'Diseño portada EP "Noche Urbana"', status: 'En progreso', priority: 'Alta', assigned: 'MJ', due: '2026-02-20', project: 'EP Noche Urbana', labels: ['Diseño'] },
      { id: 2, title: 'Contrato distribución digital Spotify', status: 'Pendiente', priority: 'Alta', assigned: 'MA', due: '2026-02-22', project: 'Legal', labels: ['Legal'] },
      { id: 3, title: 'Mezcla y master track 3', status: 'En progreso', priority: 'Media', assigned: 'DE', due: '2026-02-25', project: 'EP Noche Urbana', labels: ['Audio'] },
      { id: 4, title: 'Campaña Instagram Stories', status: 'Pendiente', priority: 'Media', assigned: 'MJ', due: '2026-03-01', project: 'Marketing', labels: ['Marketing'] },
      { id: 5, title: 'Reunión con sello Sony Music', status: 'Completada', priority: 'Alta', assigned: 'MA', due: '2026-02-15', project: 'CRM', labels: ['Reunión'] },
      { id: 6, title: 'Actualizar bio artistas web', status: 'Completada', priority: 'Baja', assigned: 'DE', due: '2026-02-14', project: 'Marketing', labels: ['Web'] },
      { id: 7, title: 'Presupuesto videoclip Q1', status: 'Revisión', priority: 'Alta', assigned: 'MJ', due: '2026-02-28', project: 'Producción', labels: ['Finanzas'] },
      { id: 8, title: 'Restablecer acceso cuenta Luna Roja', status: 'En progreso', priority: 'Alta', assigned: 'ST', due: '2026-02-19', project: 'Soporte Clientes', labels: ['Soporte', 'Acceso'] },
      { id: 9, title: 'Procesar adelanto regalías DJ Voltex', status: 'Pendiente', priority: 'Media', assigned: 'ST', due: '2026-02-21', project: 'Soporte Clientes', labels: ['Soporte', 'Finanzas'] },
      { id: 10, title: 'Investigar discrepancia streams Beats MX', status: 'Pendiente', priority: 'Alta', assigned: 'ST', due: '2026-02-20', project: 'Soporte Clientes', labels: ['Soporte', 'Reportes'] },
      { id: 11, title: 'Actualizar datos bancarios Sofía Montero', status: 'En progreso', priority: 'Media', assigned: 'ST', due: '2026-02-22', project: 'Soporte Clientes', labels: ['Soporte', 'Finanzas'] },
      { id: 12, title: 'Verificar alta artista Neon Dreams en catálogo', status: 'Completada', priority: 'Baja', assigned: 'ST', due: '2026-02-17', project: 'Soporte Clientes', labels: ['Soporte', 'Catálogo'] },
    ],
    projects: [
      { id: 1, name: 'EP Noche Urbana', status: 'active', owner: 'Melky Jaime', progress: 65, tasks: 8, due: '2026-03-15' },
      { id: 2, name: 'Campaña Marketing Q1', status: 'active', owner: 'Mariela', progress: 40, tasks: 12, due: '2026-03-31' },
      { id: 3, name: 'Renovación Contratos', status: 'active', owner: 'Deschamps', progress: 80, tasks: 5, due: '2026-02-28' },
      { id: 4, name: 'Videoclip "Fuego"', status: 'paused', owner: 'Melky Jaime', progress: 20, tasks: 15, due: '2026-04-30' },
      { id: 5, name: 'Soporte Clientes', status: 'active', owner: 'Starling', progress: 30, tasks: 5, due: '2026-02-28' },
    ],
    deals: [
      { id: 1, title: 'Sync License - Netflix', account: 'Netflix LATAM', value: 15000, currency: 'USD', stage: 'Propuesta', owner: 'MJ', status: 'open' },
      { id: 2, title: 'Distribución Digital 2026', account: 'DistroKid', value: 2400, currency: 'USD', stage: 'Negociación', owner: 'MA', status: 'open' },
      { id: 3, title: 'Booking Tour Colombia', account: 'Live Nation CO', value: 8000, currency: 'USD', stage: 'Contacto', owner: 'MJ', status: 'open' },
      { id: 4, title: 'Licencia Publicidad Movistar', account: 'Movistar', value: 5500, currency: 'USD', stage: 'Cerrado Ganado', owner: 'MA', status: 'won' },
      { id: 5, title: 'Colaboración Artista X', account: 'Universal Music', value: 3000, currency: 'USD', stage: 'Contacto', owner: 'DE', status: 'open' },
    ],
    expenses: [
      { id: 1, concept: 'Estudio de grabación - Feb', vendor: 'Studio 5', amount: 1200, currency: 'USD', date: '2026-02-10', status: 'Approved', category: 'Producción', project: 'EP Noche Urbana' },
      { id: 2, concept: 'Diseño gráfico portada', vendor: 'Freelancer MX', amount: 350, currency: 'USD', date: '2026-02-12', status: 'Submitted', category: 'Diseño', project: 'EP Noche Urbana' },
      { id: 3, concept: 'Publicidad Facebook Ads', vendor: 'Meta', amount: 500, currency: 'USD', date: '2026-02-14', status: 'Draft', category: 'Marketing', project: 'Campaña Q1' },
      { id: 4, concept: 'Honorarios abogado contrato', vendor: 'Estudio Legal CR', amount: 800, currency: 'USD', date: '2026-02-08', status: 'Paid', category: 'Legal', project: 'Renovación Contratos' },
      { id: 5, concept: 'Equipos audio monitor', vendor: 'Sweetwater', amount: 2200, currency: 'USD', date: '2026-02-05', status: 'Approved', category: 'Equipos', project: 'General' },
    ],
    timeEntries: [
      { id: 1, user: 'Melky Jaime', date: '2026-02-18', checkIn: '08:55', checkOut: '18:10', worked: '8h 45m', breaks: '30m', status: 'Open' },
      { id: 2, user: 'Mariela', date: '2026-02-18', checkIn: '09:02', checkOut: '17:58', worked: '8h 26m', breaks: '30m', status: 'Closed' },
      { id: 3, user: 'Deschamps', date: '2026-02-18', checkIn: '09:15', checkOut: null, worked: '—', breaks: '—', status: 'Open' },
      { id: 4, user: 'Melky Jaime', date: '2026-02-17', checkIn: '09:00', checkOut: '18:00', worked: '8h 30m', breaks: '30m', status: 'Approved' },
      { id: 5, user: 'Mariela', date: '2026-02-17', checkIn: '08:50', checkOut: '17:50', worked: '8h 30m', breaks: '30m', status: 'Approved' },
    ],
    tickets: [
      {
        id: 'TK-001', subject: 'No puedo acceder a mi cuenta de distribución', from: 'Artista Luna Roja', email: 'lunaroja@gmail.com', status: 'Abierto', priority: 'Alta', category: 'Acceso', date: '2026-02-19', lastReply: null, assignedTo: 'Soporte', assignedUser: 'Starling', messages: [
          { role: 'client', text: 'Hola, desde ayer no puedo acceder a mi panel de distribución. Me dice que las credenciales son inválidas pero no las he cambiado.', time: '2026-02-19 09:15' }
        ]
      },
      {
        id: 'TK-002', subject: 'Solicitud de adelanto de regalías Q1', from: 'Manager DJ Voltex', email: 'voltex.mgmt@gmail.com', status: 'En proceso', priority: 'Media', category: 'Finanzas', date: '2026-02-18', lastReply: '2026-02-19 10:30', assignedTo: 'Finanzas', assignedUser: 'Mariela', messages: [
          { role: 'client', text: 'Buenos días, quisiera solicitar un adelanto de regalías del Q1 2026 para DJ Voltex. ¿Cuál es el proceso?', time: '2026-02-18 14:20' },
          { role: 'agent', text: 'Hola, gracias por contactarnos. Para solicitar un adelanto necesitamos: 1) Carta firmada del artista, 2) Estado de cuenta actualizado. Te envío el formulario por correo.', time: '2026-02-19 10:30' }
        ]
      },
      {
        id: 'TK-003', subject: 'Error en el reporte de streams de Spotify', from: 'Productor Beats MX', email: 'beatsmx.prod@gmail.com', status: 'Abierto', priority: 'Alta', category: 'Reportes', date: '2026-02-19', lastReply: null, assignedTo: 'Soporte', assignedUser: 'Starling', messages: [
          { role: 'client', text: 'Los números de streams de mi último EP no coinciden entre el dashboard y el reporte CSV. Hay una diferencia de ~2,000 streams.', time: '2026-02-19 11:45' }
        ]
      },
      {
        id: 'TK-004', subject: 'Agregar nuevo artista al catálogo', from: 'Label SoundWave Records', email: 'admin@soundwaverecords.com', status: 'Resuelto', priority: 'Baja', category: 'Catálogo', date: '2026-02-16', lastReply: '2026-02-17 16:00', assignedTo: 'A&R', assignedUser: 'Deschamps', messages: [
          { role: 'client', text: 'Necesitamos agregar al artista "Neon Dreams" a nuestro catálogo. Adjunto los documentos requeridos.', time: '2026-02-16 09:00' },
          { role: 'agent', text: 'Documentos recibidos. El artista ha sido agregado exitosamente al catálogo. Ya puede subir contenido desde su panel.', time: '2026-02-17 16:00' }
        ]
      },
      {
        id: 'TK-005', subject: 'Cambio de datos bancarios para pagos', from: 'Artista Sofía Montero', email: 'sofia.montero.music@gmail.com', status: 'En espera', priority: 'Media', category: 'Finanzas', date: '2026-02-17', lastReply: '2026-02-18 09:00', assignedTo: 'Finanzas', assignedUser: 'Mariela', messages: [
          { role: 'client', text: 'Necesito actualizar mis datos bancarios para recibir los pagos de regalías. Cambié de banco.', time: '2026-02-17 15:30' },
          { role: 'agent', text: 'Para actualizar datos bancarios necesitamos una carta notariada y copia del nuevo estado de cuenta. ¿Puedes enviar esos documentos?', time: '2026-02-18 09:00' }
        ]
      }
    ]
  };
}

// Load data from Supabase (with localStorage fallback)
let data = getDefaultData();

async function loadDataFromSupabase() {
  if (typeof dbLoadAllData === 'function') {
    try {
      const loaded = await dbLoadAllData();
      if (loaded && loaded.tasks && loaded.tasks.length) {
        data = loaded;
        console.log('🟢 Data loaded from Supabase');
        return true;
      }
    } catch (e) { console.warn('Supabase load failed, using fallback', e); }
  }
  // Fallback to localStorage
  try {
    const saved = JSON.parse(localStorage.getItem('wildtone_data'));
    if (saved && saved.tasks) { data = saved; return true; }
  } catch (e) { }
  data = getDefaultData();
  return false;
}

// ── RBAC Configuration ──────────────────────────────────────
const ROLE_CONFIG = {
  super_admin: {
    label: 'Director',
    home: 'dashboard',
    modules: [
      { id: 'dashboard', icon: '⊞', label: 'Master Dashboard' },
      { id: 'projects', icon: '◈', label: 'Proyectos' },
      { id: 'crm', icon: '◉', label: 'CRM Pipeline' },
      { id: 'demos', icon: '🎵', label: 'Demos Box' },
      { id: 'support', icon: '✉', label: 'Soporte', badge: '5', badgeClass: 'warn' },
      { id: 'launches', icon: '🚀', label: 'Lanzamientos' },
      { id: 'finance', icon: '$', label: 'Finanzas', badge: '3', badgeClass: 'warn' },
      { id: 'royalties', icon: '♫', label: 'Royalties' },
      { id: 'reports', icon: '▤', label: 'Reportes' },
      { id: 'time', icon: '◷', label: 'Horario' },
      { id: 'chat', icon: '💬', label: 'Chat Interno' },
      { id: 'agent', icon: '✦', label: 'Agente AI', badge: 'AI', badgeClass: 'ai' },
    ],
    showSettings: true
  },
  project_director: {
    label: 'Director de Proyectos',
    home: 'dashboard',
    modules: [
      { id: 'dashboard', icon: '⊞', label: 'Mi Dashboard' },
      { id: 'projects', icon: '◈', label: 'Proyectos' },
      { id: 'crm', icon: '◉', label: 'CRM Pipeline' },
      { id: 'demos', icon: '🎵', label: 'Demos Box' },
      { id: 'support', icon: '✉', label: 'Soporte', badge: '5', badgeClass: 'warn' },
      { id: 'launches', icon: '🚀', label: 'Lanzamientos' },
      { id: 'time', icon: '◷', label: 'Horario' },
      { id: 'chat', icon: '💬', label: 'Chat Interno' },
      { id: 'agent', icon: '✦', label: 'Agente AI', badge: 'AI', badgeClass: 'ai' },
    ],
    showSettings: true
  },
  ar_sales: {
    label: 'A&R y Ventas',
    home: 'dashboard',
    modules: [
      { id: 'dashboard', icon: '⊞', label: 'Mi Dashboard' },
      { id: 'crm', icon: '◉', label: 'CRM Pipeline' },
      { id: 'demos', icon: '🎵', label: 'Demos Box' },
      { id: 'projects', icon: '◈', label: 'Proyectos' },
      { id: 'support', icon: '✉', label: 'Soporte', badge: '5', badgeClass: 'warn' },
      { id: 'time', icon: '◷', label: 'Horario' },
      { id: 'chat', icon: '💬', label: 'Chat Interno' },
      { id: 'agent', icon: '✦', label: 'Agente AI', badge: 'AI', badgeClass: 'ai' },
    ],
    showSettings: false
  },
  support_ops: {
    label: 'Soporte y Operaciones',
    home: 'dashboard',
    modules: [
      { id: 'dashboard', icon: '⊞', label: 'Mi Dashboard' },
      { id: 'support', icon: '✉', label: 'Tickets Soporte', badge: '5', badgeClass: 'warn' },
      { id: 'launches', icon: '🚀', label: 'Lanzamientos' },
      { id: 'projects', icon: '◈', label: 'Proyectos' },
      { id: 'time', icon: '◷', label: 'Horario' },
      { id: 'chat', icon: '💬', label: 'Chat Interno' },
      { id: 'agent', icon: '✦', label: 'Agente AI', badge: 'AI', badgeClass: 'ai' },
    ],
    showSettings: false
  },
  finance: {
    label: 'Finanzas',
    home: 'dashboard',
    modules: [
      { id: 'dashboard', icon: '⊞', label: 'Mi Dashboard' },
      { id: 'finance', icon: '$', label: 'Gastos', badge: '3', badgeClass: 'warn' },
      { id: 'royalties', icon: '♫', label: 'Royalties' },
      { id: 'reports', icon: '▤', label: 'Reportes' },
      { id: 'time', icon: '◷', label: 'Horario' },
      { id: 'chat', icon: '💬', label: 'Chat Interno' },
      { id: 'agent', icon: '✦', label: 'Agente AI', badge: 'AI', badgeClass: 'ai' },
    ],
    showSettings: false
  }
};

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('wildtone_user')) || { name: 'Melky Jaime', role: 'Super Admin', rbac: 'super_admin', initials: 'MJ' };
  } catch { return { name: 'Melky Jaime', role: 'Super Admin', rbac: 'super_admin', initials: 'MJ' }; }
}

function getRoleConfig() {
  const user = getCurrentUser();
  return ROLE_CONFIG[user.rbac] || ROLE_CONFIG.super_admin;
}

function isModuleAllowed(moduleId) {
  const cfg = getRoleConfig();
  if (moduleId === 'settings') return cfg.showSettings;
  return cfg.modules.some(m => m.id === moduleId);
}

function buildSidebar() {
  const cfg = getRoleConfig();
  const user = getCurrentUser();
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  nav.innerHTML = cfg.modules.map((m, i) => `
    <a class="nav-item${i === 0 ? ' active' : ''}" data-module="${m.id}" id="nav-${m.id}" onclick="navigate('${m.id}')">
      <span class="nav-icon">${m.icon}</span>
      <span class="nav-label">${m.label}</span>
      ${m.badge ? '<span class="nav-badge ' + (m.badgeClass || '') + '">' + m.badge + '</span>' : ''}
    </a>
  `).join('');
  // Settings link
  const settingsEl = document.getElementById('nav-settings');
  if (settingsEl) settingsEl.style.display = cfg.showSettings ? '' : 'none';
  // User profile
  const avatarEl = document.getElementById('userAvatar');
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  const topAvatar = document.getElementById('topbarAvatar');
  if (avatarEl) avatarEl.textContent = user.initials || 'U';
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role;
  if (topAvatar) topAvatar.textContent = user.initials || 'U';
}

// ── Router ──────────────────────────────────────────────────
function navigate(module) {
  // RBAC: check permission
  if (!isModuleAllowed(module)) {
    showToast('🚫 No tienes acceso a este módulo');
    return;
  }
  // Close mobile sidebar when navigating
  if (typeof window.closeMobileSidebar === 'function') window.closeMobileSidebar();
  document.querySelectorAll('.module-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById('module-' + module);
  const nav = document.getElementById('nav-' + module);
  if (view) view.classList.add('active');
  if (nav) nav.classList.add('active');

  const labels = {
    dashboard: 'Dashboard', projects: 'Proyectos',
    crm: 'CRM Pipeline', demos: 'Demos Box', finance: 'Finanzas',
    royalties: 'Royalties', time: 'Horario',
    reports: 'Reportes', support: 'Soporte', launches: 'Lanzamientos',
    agent: 'Agente AI', settings: 'Configuración', chat: 'Chat Interno'
  };
  document.getElementById('breadcrumb').textContent = labels[module] || module;
  state.currentModule = module;

  const renderers = {
    dashboard: renderDashboard, projects: renderProjects,
    crm: renderCRM, demos: renderDemos, finance: renderFinance,
    royalties: renderRoyalties, time: renderTime,
    reports: renderReports, support: renderSupport, launches: renderLaunches,
    agent: renderAgent, settings: renderSettings, chat: renderChat
  };
  if (renderers[module]) renderers[module]();
}

// ── Dashboard ───────────────────────────────────────────────
function renderDashboard() {
  const user = getCurrentUser();
  const firstName = user.name.split(' ')[0];
  const roleLabel = getRoleConfig().label;
  const el = document.getElementById('module-dashboard');
  el.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Buenos días, ${firstName} 👋</div>
        <div class="section-sub">${roleLabel} · ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
      <button class="btn btn-primary" onclick="navigate('agent')">✦ Abrir Agente AI</button>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card purple">
        <span class="kpi-icon">✓</span>
        <span class="kpi-value">12</span>
        <span class="kpi-label">Tareas activas</span>
        <div class="kpi-change up">↑ 3 nuevas esta semana</div>
      </div>
      <div class="kpi-card green">
        <span class="kpi-icon">◉</span>
        <span class="kpi-value">5</span>
        <span class="kpi-label">Deals abiertos</span>
        <div class="kpi-change up">↑ $33,900 en pipeline</div>
      </div>
      <div class="kpi-card yellow">
        <span class="kpi-icon">$</span>
        <span class="kpi-value">$5,050</span>
        <span class="kpi-label">Gastos este mes</span>
        <div class="kpi-change down">↓ 3 pendientes aprobación</div>
      </div>
      <div class="kpi-card blue">
        <span class="kpi-icon">◷</span>
        <span class="kpi-value">8h 45m</span>
        <span class="kpi-label">Horas hoy</span>
        <div class="kpi-change up">↑ En jornada activa</div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="section-header">
          <div class="section-title" style="font-size:15px">Mis tareas pendientes</div>
          <button class="btn btn-sm btn-secondary" onclick="navigate('projects')">Ver todas</button>
        </div>
        ${data.tasks.filter(t => t.status !== 'Completada').slice(0, 4).map(t => `
          <div class="activity-item">
            <div class="activity-avatar">${t.assigned}</div>
            <div class="activity-text" style="flex:1">
              <strong>${t.title}</strong><br>
              <span class="badge badge-${priorityColor(t.priority)}">${t.priority}</span>
              <span style="margin-left:6px;font-size:11px;color:var(--text-muted)">Vence ${t.due}</span>
            </div>
            <span class="badge badge-${statusColor(t.status)}">${t.status}</span>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="section-header">
          <div class="section-title" style="font-size:15px">Actividad reciente</div>
        </div>
        <div class="activity-feed">
          <div class="activity-item">
            <div class="activity-avatar" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">ST</div>
            <div class="activity-text"><strong>Starling</strong> respondió ticket TK-002 (DJ Voltex)</div>
            <div class="activity-time">30m</div>
          </div>
          <div class="activity-item">
            <div class="activity-avatar">MA</div>
            <div class="activity-text"><strong>Mariela</strong> aprobó el gasto "Estudio de grabación"</div>
            <div class="activity-time">1h</div>
          </div>
          <div class="activity-item">
            <div class="activity-avatar">DE</div>
            <div class="activity-text"><strong>Deschamps</strong> completó la tarea "Reunión Sony Music"</div>
            <div class="activity-time">2h</div>
          </div>
          <div class="activity-item">
            <div class="activity-avatar">MJ</div>
            <div class="activity-text"><strong>Melky</strong> creó el deal "Sync License - Netflix"</div>
            <div class="activity-time">3h</div>
          </div>
          <div class="activity-item">
            <div class="activity-avatar" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">ST</div>
            <div class="activity-text"><strong>Starling</strong> resolvió ticket TK-004 (SoundWave Records)</div>
            <div class="activity-time">3h</div>
          </div>
          <div class="activity-item">
            <div class="activity-avatar">MA</div>
            <div class="activity-text"><strong>Mariela</strong> hizo check-in a las 09:02</div>
            <div class="activity-time">4h</div>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top:20px" class="card">
      <div class="section-header">
        <div class="section-title" style="font-size:15px">Proyectos activos</div>
        <button class="btn btn-sm btn-secondary" onclick="navigate('projects')">Ver todos</button>
      </div>
      <div class="three-col">
        ${data.projects.filter(p => p.status === 'active').map(p => `
          <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-md);padding:16px">
            <div style="font-size:13px;font-weight:600;margin-bottom:8px">${p.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px">${p.tasks} tareas · Vence ${p.due}</div>
            <div class="progress-bar"><div class="progress-fill" style="width:${p.progress}%"></div></div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:6px">${p.progress}% completado</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── Projects & Tasks ─────────────────────────────────────────
function renderProjects() {
  const el = document.getElementById('module-projects');
  el.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Proyectos</div>
        <div class="section-sub">${data.projects.length} proyectos · ${data.tasks.length} tareas en total</div>
      </div>
      <button class="btn btn-primary" onclick="showNewProjectModal()">+ Nuevo proyecto</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      ${data.projects.map(p => {
    const projTasks = data.tasks.filter(t => t.project === p.name);
    const done = projTasks.filter(t => t.status === 'Completada').length;
    const inProg = projTasks.filter(t => t.status === 'En progreso').length;
    const pending = projTasks.filter(t => t.status === 'Pendiente').length;
    return `
        <div class="card" style="cursor:pointer;transition:border-color .2s,transform .2s" onmouseenter="this.style.borderColor='var(--brand)';this.style.transform='translateY(-2px)'" onmouseleave="this.style.borderColor='var(--border)';this.style.transform='translateY(0)'" onclick="viewProject(${p.id})">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-size:15px;font-weight:700">${p.name}</div>
            <span class="badge badge-${p.status === 'active' ? 'green' : p.status === 'paused' ? 'yellow' : 'gray'}">${p.status === 'active' ? 'Activo' : p.status === 'paused' ? 'Pausado' : 'Archivado'}</span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">
            👤 ${p.owner} &nbsp;·&nbsp; 📅 ${p.due}
          </div>
          <div style="display:flex;gap:8px;margin-bottom:12px">
            <span class="badge badge-green" style="font-size:10px">✓ ${done}</span>
            <span class="badge badge-blue" style="font-size:10px">▶ ${inProg}</span>
            <span class="badge badge-yellow" style="font-size:10px">◌ ${pending}</span>
            ${projTasks.length > 0 ? `<span style="font-size:11px;color:var(--text-muted);margin-left:auto">${projTasks.length} tareas</span>` : ''}
          </div>
          <div class="progress-bar" style="margin-bottom:6px"><div class="progress-fill" style="width:${p.progress}%"></div></div>
          <div style="font-size:12px;color:var(--text-muted)">${p.progress}% completado</div>
        </div>
      `;
  }).join('')}
    </div>
  `;
}

function showNewProjectModal() {
  const overlay = document.getElementById('quickAddModal');
  const content = overlay.querySelector('.modal');
  const user = getCurrentUser();
  content.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">+ Nuevo Proyecto</div>
      <div style="font-size:12px;color:var(--text-muted)">Crear un nuevo proyecto en el sistema</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Nombre del proyecto *</label>
        <input type="text" id="newProjName" placeholder="Ej: Álbum Frecuencia" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px;outline:none">
      </div>
      <div style="display:flex;gap:12px">
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Owner</label>
          <select id="newProjOwner" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px">
            <option value="Melky Jaime" ${user.name === 'Melky Jaime' ? 'selected' : ''}>Melky Jaime</option>
            <option value="Deschamps" ${user.name === 'Deschamps' ? 'selected' : ''}>Deschamps</option>
            <option value="Starling" ${user.name === 'Starling' ? 'selected' : ''}>Starling</option>
            <option value="Mariela" ${user.name === 'Mariela' ? 'selected' : ''}>Mariela</option>
            <option value="Carlos" ${user.name === 'Carlos' ? 'selected' : ''}>Carlos</option>
          </select>
        </div>
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Fecha límite</label>
          <input type="date" id="newProjDue" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px;outline:none">
        </div>
      </div>
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Estado</label>
        <select id="newProjStatus" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px">
          <option value="active" selected>Activo</option>
          <option value="paused">Pausado</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary" onclick="confirmNewProject()">Crear proyecto</button>
        <button class="btn btn-ghost" onclick="document.getElementById('quickAddModal').classList.remove('open')">Cancelar</button>
      </div>
    </div>
  `;
  overlay.classList.add('open');
  setTimeout(() => { const inp = document.getElementById('newProjName'); if (inp) inp.focus(); }, 100);
}

function confirmNewProject() {
  const name = document.getElementById('newProjName').value.trim();
  if (!name) {
    document.getElementById('newProjName').style.borderColor = 'var(--red)';
    return;
  }
  const owner = document.getElementById('newProjOwner').value;
  const due = document.getElementById('newProjDue').value || '2026-12-31';
  const status = document.getElementById('newProjStatus').value;
  data.projects.push({
    id: data.projects.length + 1,
    name, status, owner,
    progress: 0, tasks: 0, due
  });
  document.getElementById('quickAddModal').classList.remove('open');
  renderProjects();
  saveData();
  showToast('✅ Proyecto "' + name + '" creado');
}

function viewProject(projectId) {
  const p = data.projects.find(pr => pr.id === projectId);
  if (!p) return;
  const projTasks = data.tasks.filter(t => t.project === p.name);
  const done = projTasks.filter(t => t.status === 'Completada').length;
  const el = document.getElementById('module-projects');

  el.innerHTML = `
    <div style="margin-bottom:20px">
      <button class="btn btn-ghost" onclick="renderProjects()" style="margin-bottom:12px">← Volver a proyectos</button>
      <div class="section-header">
        <div>
          <div class="section-title">${p.name}</div>
          <div class="section-sub">👤 ${p.owner} · 📅 Vence ${p.due} · ${projTasks.length} tareas</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" onclick="addTaskToProject(${p.id})">+ Nueva tarea</button>
          <span class="badge badge-${p.status === 'active' ? 'green' : p.status === 'paused' ? 'yellow' : 'gray'}" style="font-size:13px;padding:6px 12px">${p.status === 'active' ? 'Activo' : p.status === 'paused' ? 'Pausado' : 'Archivado'}</span>
        </div>
      </div>
    </div>

    <div class="kpi-grid" style="margin-bottom:20px">
      <div class="kpi-card green">
        <span class="kpi-value">${done}</span>
        <span class="kpi-label">Completadas</span>
      </div>
      <div class="kpi-card blue">
        <span class="kpi-value">${projTasks.filter(t => t.status === 'En progreso').length}</span>
        <span class="kpi-label">En progreso</span>
      </div>
      <div class="kpi-card yellow">
        <span class="kpi-value">${projTasks.filter(t => t.status === 'Pendiente').length}</span>
        <span class="kpi-label">Pendientes</span>
      </div>
      <div class="kpi-card purple">
        <span class="kpi-value">${p.progress}%</span>
        <span class="kpi-label">Progreso</span>
      </div>
    </div>

    <div class="tabs" style="margin-bottom:16px">
      <button class="tab-btn active" onclick="setProjectTaskView('list',this,${p.id})">Lista</button>
      <button class="tab-btn" onclick="setProjectTaskView('kanban',this,${p.id})">Kanban</button>
    </div>

    <div id="projTaskListView">
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Tarea</th><th>Estado</th><th>Prioridad</th><th>Asignado</th><th>Vence</th><th>Etiquetas</th>
            </tr></thead>
            <tbody>
              ${projTasks.length > 0 ? projTasks.map(t => `
                <tr>
                  <td style="font-weight:500">${t.title}</td>
                  <td><span class="badge badge-${statusColor(t.status)}">${t.status}</span></td>
                  <td><span class="badge badge-${priorityColor(t.priority)}">${t.priority}</span></td>
                  <td><div class="kanban-card-avatar" style="width:28px;height:28px;font-size:10px">${t.assigned}</div></td>
                  <td style="color:var(--text-muted)">${t.due}</td>
                  <td>${t.labels.map(l => '<span class="tag">' + l + '</span>').join(' ')}</td>
                </tr>
              `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">No hay tareas en este proyecto</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="projTaskKanbanView" style="display:none">
      <div class="kanban-board">
        ${['Pendiente', 'En progreso', 'Revisión', 'Completada'].map(status => `
          <div class="kanban-col">
            <div class="kanban-col-header">
              <div class="kanban-col-title">
                <span style="width:8px;height:8px;border-radius:50%;background:${kanbanColor(status)};display:inline-block"></span>
                ${status}
              </div>
              <span class="kanban-col-count">${projTasks.filter(t => t.status === status).length}</span>
            </div>
            ${projTasks.filter(t => t.status === status).map(t => `
              <div class="kanban-card">
                <div class="kanban-card-title">${t.title}</div>
                <div style="margin-bottom:8px">${t.labels.map(l => '<span class="tag">' + l + '</span>').join(' ')}</div>
                <div class="kanban-card-meta">
                  <span class="kanban-card-due">📅 ${t.due}</span>
                  <div class="kanban-card-avatar">${t.assigned}</div>
                </div>
              </div>
            `).join('')}
            <button style="width:100%;padding:8px;background:transparent;border:1px dashed var(--border);border-radius:var(--r-sm);color:var(--text-muted);cursor:pointer;font-size:12px;margin-top:4px" onclick="addTaskToProject(${p.id})">+ Agregar</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function setProjectTaskView(view, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('projTaskListView').style.display = view === 'list' ? 'block' : 'none';
  document.getElementById('projTaskKanbanView').style.display = view === 'kanban' ? 'block' : 'none';
}

function addTaskToProject(projectId) {
  const p = data.projects.find(pr => pr.id === projectId);
  if (!p) return;
  const overlay = document.getElementById('quickAddModal');
  const content = overlay.querySelector('.modal');
  content.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">+ Nueva tarea</div>
      <div style="font-size:12px;color:var(--text-muted)">Proyecto: ${p.name}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Nombre de la tarea *</label>
        <input type="text" id="newTaskTitle" placeholder="Ej: Revisar contrato de distribución" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px;outline:none" autofocus>
      </div>
      <div style="display:flex;gap:12px">
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Prioridad</label>
          <select id="newTaskPriority" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px">
            <option value="Alta">Alta</option>
            <option value="Media" selected>Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Asignado</label>
          <select id="newTaskAssigned" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px">
            <option value="MJ">Melky Jaime (MJ)</option>
            <option value="MA">Mariela (MA)</option>
            <option value="DE">Deschamps (DE)</option>
            <option value="ST" selected>Starling (ST)</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary" onclick="confirmAddTask(${p.id})">Crear tarea</button>
        <button class="btn btn-ghost" onclick="document.getElementById('quickAddModal').classList.remove('open')">Cancelar</button>
      </div>
    </div>
  `;
  overlay.classList.add('open');
  setTimeout(() => { const inp = document.getElementById('newTaskTitle'); if (inp) inp.focus(); }, 100);
}

function confirmAddTask(projectId) {
  const p = data.projects.find(pr => pr.id === projectId);
  if (!p) return;
  const title = document.getElementById('newTaskTitle').value.trim();
  if (!title) { document.getElementById('newTaskTitle').style.borderColor = 'var(--red)'; return; }
  const priority = document.getElementById('newTaskPriority').value;
  const assigned = document.getElementById('newTaskAssigned').value;
  const newTask = {
    id: data.tasks.length + 1,
    title: title,
    status: 'Pendiente',
    priority: priority,
    assigned: assigned,
    due: '2026-03-01',
    project: p.name,
    labels: ['Nueva']
  };
  data.tasks.push(newTask);
  p.tasks++;
  document.getElementById('quickAddModal').classList.remove('open');
  viewProject(p.id);
  saveData();
  showToast('✅ Tarea "' + title + '" creada en ' + p.name);
}

function renderTaskRows(tasks) {
  return tasks.map(t => `
    <tr>
      <td>${t.title}</td>
      <td><span class="tag">${t.project}</span></td>
      <td><span class="badge badge-${statusColor(t.status)}">${t.status}</span></td>
      <td><span class="badge badge-${priorityColor(t.priority)}">${t.priority}</span></td>
      <td><div class="kanban-card-avatar" style="width:28px;height:28px;font-size:10px">${t.assigned}</div></td>
      <td style="color:var(--text-muted)">${t.due}</td>
    </tr>
  `).join('');
}

function statusColor(s) {
  return { 'Pendiente': 'yellow', 'En progreso': 'blue', 'Revisión': 'purple', 'Completada': 'green' }[s] || 'gray';
}

// ── CRM ──────────────────────────────────────────────────────
function renderCRM() {
  const el = document.getElementById('module-crm');
  const stages = ['Contacto', 'Propuesta', 'Negociación', 'Cerrado Ganado'];
  el.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">CRM — Pipeline</div>
        <div class="section-sub">$${data.deals.filter(d => d.status === 'open').reduce((s, d) => s + d.value, 0).toLocaleString()} en pipeline activo</div>
      </div>
      <button class="btn btn-primary" onclick="showNewDealModal()">+ Nuevo deal</button>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="setCRMView('pipeline',this)">Pipeline</button>
      <button class="tab-btn" onclick="setCRMView('list',this)">Lista</button>
    </div>

    <div id="crmPipeline">
      <div class="kanban-board">
        ${stages.map(stage => `
          <div class="kanban-col">
            <div class="kanban-col-header">
              <div class="kanban-col-title">${stage}</div>
              <span class="kanban-col-count">${data.deals.filter(d => d.stage === stage).length}</span>
            </div>
            ${data.deals.filter(d => d.stage === stage).map(d => `
              <div class="kanban-card">
                <div class="kanban-card-title">${d.title}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">${d.account}</div>
                <div class="kanban-card-meta">
                  <span style="font-size:13px;font-weight:700;color:var(--green)">$${d.value.toLocaleString()} ${d.currency}</span>
                  <div class="kanban-card-avatar">${d.owner}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>

    <div id="crmList" style="display:none">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Deal</th><th>Cuenta</th><th>Valor</th><th>Etapa</th><th>Owner</th><th>Estado</th></tr></thead>
          <tbody>
            ${data.deals.map(d => `
              <tr>
                <td>${d.title}</td>
                <td style="color:var(--text-secondary)">${d.account}</td>
                <td style="color:var(--green);font-weight:600">$${d.value.toLocaleString()} ${d.currency}</td>
                <td><span class="badge badge-blue">${d.stage}</span></td>
                <td><div class="kanban-card-avatar" style="width:28px;height:28px;font-size:10px">${d.owner}</div></td>
                <td><span class="badge badge-${d.status === 'won' ? 'green' : d.status === 'lost' ? 'red' : 'purple'}">${d.status === 'won' ? 'Ganado' : d.status === 'lost' ? 'Perdido' : 'Abierto'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function setCRMView(view, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('crmPipeline').style.display = view === 'pipeline' ? 'block' : 'none';
  document.getElementById('crmList').style.display = view === 'list' ? 'block' : 'none';
}

function showNewDealModal() {
  const overlay = document.getElementById('quickAddModal');
  const content = overlay.querySelector('.modal');
  const user = getCurrentUser();
  content.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">+ Nuevo Deal</div>
      <div style="font-size:12px;color:var(--text-muted)">Registrar un nuevo negocio en el pipeline</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Nombre del deal *</label>
        <input type="text" id="newDealTitle" placeholder="Ej: Sync License - Coca Cola" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px;outline:none">
      </div>
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Cuenta / Empresa *</label>
        <input type="text" id="newDealAccount" placeholder="Ej: Netflix LATAM" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px;outline:none">
      </div>
      <div style="display:flex;gap:12px">
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Valor (USD)</label>
          <input type="number" id="newDealValue" placeholder="5000" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px;outline:none">
        </div>
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Etapa</label>
          <select id="newDealStage" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px">
            <option value="Contacto">Contacto</option>
            <option value="Propuesta" selected>Propuesta</option>
            <option value="Negociación">Negociación</option>
            <option value="Cerrado Ganado">Cerrado Ganado</option>
          </select>
        </div>
      </div>
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Owner</label>
        <select id="newDealOwner" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px">
          <option value="MJ" ${user.initials === 'MJ' ? 'selected' : ''}>Melky Jaime (MJ)</option>
          <option value="DE" ${user.initials === 'DE' ? 'selected' : ''}>Deschamps (DE)</option>
          <option value="MA" ${user.initials === 'MA' ? 'selected' : ''}>Mariela (MA)</option>
          <option value="ST" ${user.initials === 'ST' ? 'selected' : ''}>Starling (ST)</option>
          <option value="CA" ${user.initials === 'CA' ? 'selected' : ''}>Carlos (CA)</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary" onclick="confirmNewDeal()">Crear deal</button>
        <button class="btn btn-ghost" onclick="document.getElementById('quickAddModal').classList.remove('open')">Cancelar</button>
      </div>
    </div>
  `;
  overlay.classList.add('open');
  setTimeout(() => { const inp = document.getElementById('newDealTitle'); if (inp) inp.focus(); }, 100);
}

function confirmNewDeal() {
  const title = document.getElementById('newDealTitle').value.trim();
  const account = document.getElementById('newDealAccount').value.trim();
  if (!title || !account) {
    if (!title) document.getElementById('newDealTitle').style.borderColor = 'var(--red)';
    if (!account) document.getElementById('newDealAccount').style.borderColor = 'var(--red)';
    return;
  }
  const value = parseInt(document.getElementById('newDealValue').value) || 0;
  const stage = document.getElementById('newDealStage').value;
  const owner = document.getElementById('newDealOwner').value;
  data.deals.push({
    id: data.deals.length + 1,
    title, account, value,
    currency: 'USD',
    stage, owner,
    status: stage === 'Cerrado Ganado' ? 'won' : 'open'
  });
  document.getElementById('quickAddModal').classList.remove('open');
  renderCRM();
  saveData();
  showToast('✅ Deal "' + title + '" creado — $' + value.toLocaleString());
}

// ── Finance ──────────────────────────────────────────────────
function renderFinance() {
  const el = document.getElementById('module-finance');
  const total = data.expenses.reduce((s, e) => s + e.amount, 0);
  const pending = data.expenses.filter(e => e.status === 'Submitted').length;
  el.innerHTML = `
    <div class="section-header">
      <div class="section-title">Finanzas Operativas</div>
      <button class="btn btn-primary" onclick="alert('Registrar gasto')">+ Registrar gasto</button>
    </div>

    <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="kpi-card yellow">
        <span class="kpi-icon">$</span>
        <span class="kpi-value">$${total.toLocaleString()}</span>
        <span class="kpi-label">Total gastos Feb</span>
      </div>
      <div class="kpi-card purple">
        <span class="kpi-icon">⏳</span>
        <span class="kpi-value">${pending}</span>
        <span class="kpi-label">Pendientes aprobación</span>
      </div>
      <div class="kpi-card green">
        <span class="kpi-icon">✓</span>
        <span class="kpi-value">${data.expenses.filter(e => e.status === 'Paid').length}</span>
        <span class="kpi-label">Pagados</span>
      </div>
      <div class="kpi-card blue">
        <span class="kpi-icon">📋</span>
        <span class="kpi-value">${data.expenses.filter(e => e.status === 'Draft').length}</span>
        <span class="kpi-label">Borradores</span>
      </div>
    </div>

    <div class="card">
      <div class="section-header">
        <div class="section-title" style="font-size:15px">Gastos</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm btn-secondary" onclick="exportExpenses('csv')">⬇ CSV</button>
          <button class="btn btn-sm btn-secondary" onclick="exportExpenses('excel')">⬇ Excel</button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Concepto</th><th>Proveedor</th><th>Categoría</th><th>Proyecto</th><th>Monto</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${data.expenses.map(e => `
              <tr>
                <td>${e.concept}</td>
                <td style="color:var(--text-secondary)">${e.vendor}</td>
                <td><span class="tag">${e.category}</span></td>
                <td style="color:var(--text-muted)">${e.project}</td>
                <td style="font-weight:600;color:var(--text-primary)">$${e.amount.toLocaleString()} ${e.currency}</td>
                <td style="color:var(--text-muted)">${e.date}</td>
                <td><span class="badge badge-${finStatusColor(e.status)}">${e.status}</span></td>
                <td>
                  ${e.status === 'Submitted' ? '<button class="btn btn-sm btn-primary" style="background:var(--green)" onclick="approveExpense(' + e.id + ')">✓ Aprobar</button>' : ''}
                  ${e.status === 'Draft' ? '<button class="btn btn-sm btn-primary" onclick="submitExpense(' + e.id + ')">Enviar</button>' : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function approveExpense(id) {
  const exp = data.expenses.find(e => e.id === id);
  if (exp) {
    exp.status = 'Paid';
    renderFinance();
    saveData();
    showToast('✅ Gasto "' + exp.concept + '" aprobado y pagado');
  }
}

function submitExpense(id) {
  const exp = data.expenses.find(e => e.id === id);
  if (exp) {
    exp.status = 'Submitted';
    renderFinance();
    saveData();
    showToast('📤 Gasto "' + exp.concept + '" enviado para aprobación');
  }
}

// ── Time Tracking ────────────────────────────────────────────
function renderTime() {
  const el = document.getElementById('module-time');
  const isWorking = state.timeStatus === 'working';
  const isBreak = state.timeStatus === 'break';

  el.innerHTML = `
    <div class="section-header">
      <div class="section-title">Control de Horario</div>
    </div>

    <div class="two-col">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="time-clock">
          <div class="clock-display" id="clockDisplay">--:--:--</div>
          <div class="clock-date">Martes, 18 de febrero 2026</div>
          <div class="clock-status ${isWorking ? 'working' : isBreak ? 'break' : 'idle'}" id="clockStatus">
            <span class="status-dot"></span>
            ${isWorking ? 'En jornada' : isBreak ? 'En pausa' : 'Sin jornada activa'}
          </div>
          <div class="clock-actions">
            ${state.timeStatus === 'idle' ? `
              <button class="btn btn-success" onclick="doCheckIn()">▶ Check-in</button>
            ` : isWorking ? `
              <button class="btn btn-secondary" onclick="doBreak()">⏸ Iniciar pausa</button>
              <button class="btn btn-danger" onclick="doCheckOut()">■ Check-out</button>
            ` : `
              <button class="btn btn-primary" onclick="endBreak()">▶ Terminar pausa</button>
            `}
          </div>
        </div>

        ${isBreak ? `
        <div class="card" style="border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.05)">
          <div style="text-align:center;padding:8px 0">
            <div style="font-size:11px;font-weight:600;color:var(--yellow);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">⏸ Cronómetro de pausa</div>
            <div id="breakTimerDisplay" style="font-size:48px;font-weight:800;color:var(--yellow);letter-spacing:-2px;font-variant-numeric:tabular-nums">00:00</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:6px">Tiempo en pausa actual</div>
          </div>
        </div>
        ` : ''}

        <div class="card">
          <div class="section-title" style="font-size:14px;margin-bottom:12px">Resumen hoy</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="text-align:center;padding:12px;background:var(--bg-surface);border-radius:var(--r-md)">
              <div style="font-size:${isWorking ? '20px' : '22px'};font-weight:800;color:var(--green)" id="workedDisplay">
                ${state.workStart ? fmtElapsed(new Date() - state.workStart - state.totalBreakMs) : '—'}
              </div>
              <div style="font-size:11px;color:var(--text-muted)">Tiempo trabajado</div>
            </div>
            <div style="text-align:center;padding:12px;background:var(--bg-surface);border-radius:var(--r-md)">
              <div style="font-size:22px;font-weight:800;color:var(--yellow)" id="totalBreakDisplay">
                ${fmtElapsed(state.totalBreakMs + (isBreak && state.breakStart ? new Date() - state.breakStart : 0))}
              </div>
              <div style="font-size:11px;color:var(--text-muted)">Total pausas</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-header">
          <div class="section-title" style="font-size:15px">Registros del equipo — Hoy</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-secondary" onclick="exportTimeEntries('csv')">⬇ CSV</button>
            <button class="btn btn-sm btn-secondary" onclick="exportTimeEntries('excel')">⬇ Excel</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Usuario</th><th>Entrada</th><th>Salida</th><th>Trabajado</th><th>Estado</th></tr></thead>
            <tbody>
              ${data.timeEntries.filter(t => t.date === '2026-02-18').map(t => `
                <tr>
                  <td>${t.user}</td>
                  <td style="color:var(--green)">${t.checkIn}</td>
                  <td style="color:${t.checkOut ? 'var(--text-secondary)' : 'var(--yellow)'}">${t.checkOut || 'Activo'}</td>
                  <td>${t.worked}</td>
                  <td><span class="badge badge-${t.status === 'Approved' ? 'green' : t.status === 'Open' ? 'blue' : 'gray'}">${t.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  startClock();
}

// Format milliseconds as Xh Ym or MM:SS
function fmtElapsed(ms) {
  if (!ms || ms < 0) return '—';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startClock() {
  if (state.clockInterval) clearInterval(state.clockInterval);
  state.clockInterval = setInterval(() => {
    const now = new Date();
    // Wall clock
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('clockDisplay');
    if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

    // Break stopwatch
    if (state.timeStatus === 'break' && state.breakStart) {
      const breakMs = now - state.breakStart;
      const bm = Math.floor(breakMs / 60000);
      const bs = Math.floor((breakMs % 60000) / 1000);
      const breakEl = document.getElementById('breakTimerDisplay');
      if (breakEl) breakEl.textContent = `${String(bm).padStart(2, '0')}:${String(bs).padStart(2, '0')}`;
      const totalBreakEl = document.getElementById('totalBreakDisplay');
      if (totalBreakEl) totalBreakEl.textContent = fmtElapsed(state.totalBreakMs + breakMs);
    }

    // Live worked time
    if (state.timeStatus === 'working' && state.workStart) {
      const workedMs = now - state.workStart - state.totalBreakMs;
      const workedEl = document.getElementById('workedDisplay');
      if (workedEl) workedEl.textContent = fmtElapsed(workedMs);
    }
  }, 1000);
}

function doCheckIn() {
  state.timeStatus = 'working';
  state.workStart = new Date();
  state.totalBreakMs = 0;
  state.breakElapsedMs = 0;
  renderTime();
  showToast('✅ Check-in registrado a las ' + new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }));
}

function doBreak() {
  state.timeStatus = 'break';
  state.breakStart = new Date();
  renderTime();
  showToast('⏸ Pausa iniciada — el cronómetro está corriendo');
}

function endBreak() {
  if (state.breakStart) {
    state.totalBreakMs += new Date() - state.breakStart;
    state.breakStart = null;
  }
  state.timeStatus = 'working';
  renderTime();
  showToast('▶ Pausa terminada, jornada reanudada');
}

function doCheckOut() {
  if (state.clockInterval) clearInterval(state.clockInterval);
  state.clockInterval = null;
  state.timeStatus = 'idle';
  state.workStart = null;
  state.totalBreakMs = 0;
  state.breakStart = null;
  renderTime();
  showToast('■ Check-out registrado. ¡Hasta mañana!');
}

// ── Support Tickets ────────────────────────────────────────
function ticketStatusColor(s) {
  return { 'Abierto': 'red', 'En proceso': 'blue', 'En espera': 'yellow', 'Resuelto': 'green' }[s] || 'gray';
}

function renderSupport() {
  const el = document.getElementById('module-support');
  const tickets = data.tickets;
  const open = tickets.filter(t => t.status === 'Abierto').length;
  const inProgress = tickets.filter(t => t.status === 'En proceso').length;
  const waiting = tickets.filter(t => t.status === 'En espera').length;
  const resolved = tickets.filter(t => t.status === 'Resuelto').length;

  el.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Soporte & Tickets</div>
        <div class="section-sub">Tickets de clientes y artistas desde la página web</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm btn-secondary" onclick="aiClassifyAllTickets()" title="La IA analiza el contenido y asigna automáticamente cada ticket al departamento correcto">🤖 AI Clasificar todos</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card purple">
        <span class="kpi-icon">✉</span>
        <span class="kpi-value">${tickets.length}</span>
        <span class="kpi-label">Total tickets</span>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--red)">
        <span class="kpi-icon">🟢</span>
        <span class="kpi-value">${open}</span>
        <span class="kpi-label">Abiertos</span>
        <div class="kpi-change down">↑ Requieren atención</div>
      </div>
      <div class="kpi-card blue">
        <span class="kpi-icon">⏳</span>
        <span class="kpi-value">${inProgress + waiting}</span>
        <span class="kpi-label">En proceso / espera</span>
      </div>
      <div class="kpi-card green">
        <span class="kpi-icon">✅</span>
        <span class="kpi-value">${resolved}</span>
        <span class="kpi-label">Resueltos</span>
      </div>
    </div>

    <div class="card">
      <div class="section-header">
        <div class="section-title" style="font-size:15px">🎫 Todos los tickets</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm btn-secondary" onclick="exportTickets('csv')">⬇ CSV</button>
          <button class="btn btn-sm btn-secondary" onclick="exportTickets('excel')">⬇ Excel</button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Asunto</th><th>De</th><th>Categoría</th><th>Asignado a</th><th>Prioridad</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr>
          </thead>
          <tbody>
            ${tickets.map(t => `
              <tr style="cursor:pointer" onclick="viewTicket('${t.id}')">
                <td style="font-weight:600;color:var(--brand-light)">${t.id}</td>
                <td>
                  <div style="font-weight:500;color:var(--text-primary)">${t.subject}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Último msg: ${t.lastReply || 'Sin respuesta'}</div>
                </td>
                <td>
                  <div style="color:var(--text-primary)">${t.from}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${t.email}</div>
                </td>
                <td><span class="badge badge-purple">${t.category}</span></td>
                <td onclick="event.stopPropagation()">
                  <div style="display:flex;flex-direction:column;gap:4px;min-width:120px">
                    <span class="badge badge-${deptColor(t.assignedTo)}" style="font-size:11px">${t.assignedTo || 'Sin asignar'}</span>
                    <span style="font-size:10px;color:var(--text-muted)">${t.assignedUser || ''}</span>
                    ${t.status !== 'Resuelto' ? '<button class="btn btn-sm btn-ghost" style="font-size:10px;padding:2px 6px" onclick="showAssignModal(\'' + t.id + '\')">✏ Reasignar</button>' : ''}
                  </div>
                </td>
                <td><span class="badge badge-${t.priority === 'Alta' ? 'red' : t.priority === 'Media' ? 'yellow' : 'gray'}">${t.priority}</span></td>
                <td><span class="badge badge-${ticketStatusColor(t.status)}">${t.status}</span></td>
                <td style="color:var(--text-muted);white-space:nowrap">${t.date}</td>
                <td>
                  ${t.status !== 'Resuelto' ? '<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();viewTicket(\'' + t.id + '\')">Ver</button>' : '<button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();viewTicket(\'' + t.id + '\')">Detalle</button>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── AI Ticket Classifier ──────────────────────────────────────
const AI_DEPT_RULES = {
  keywords: {
    'Finanzas': { dept: 'Finanzas', user: 'Mariela', words: ['regalía', 'royalty', 'pago', 'banco', 'bancario', 'factura', 'adelanto', 'cobro', 'dinero', 'transferencia', 'ingreso', 'presupuesto', 'gasto', 'financiero'] },
    'A&R': { dept: 'A&R', user: 'Deschamps', words: ['artista', 'catálogo', 'demo', 'contrato', 'sello', 'distribución', 'firma', 'talento', 'scouting', 'repertorio', 'nuevo artista', 'a&r'] },
    'Soporte': { dept: 'Soporte', user: 'Starling', words: ['acceso', 'contraseña', 'error', 'bug', 'problema', 'no puedo', 'falla', 'credencial', 'login', 'cuenta', 'técnico', 'soporte', 'ayuda'] },
    'Proyectos': { dept: 'Proyectos', user: 'Carlos', words: ['proyecto', 'lanzamiento', 'release', 'producción', 'master', 'videoclip', 'campaña', 'marketing', 'cronograma', 'deadline', 'plazo'] },
  },
  categoryMap: {
    'Acceso': { dept: 'Soporte', user: 'Starling' },
    'Finanzas': { dept: 'Finanzas', user: 'Mariela' },
    'Reportes': { dept: 'Soporte', user: 'Starling' },
    'Catálogo': { dept: 'A&R', user: 'Deschamps' },
    'Producción': { dept: 'Proyectos', user: 'Carlos' },
    'Distribución': { dept: 'Soporte', user: 'Starling' },
  }
};

function aiClassifyTicket(ticket) {
  // 1. Try category mapping first
  const catMatch = AI_DEPT_RULES.categoryMap[ticket.category];

  // 2. Analyze subject + messages for keyword matching
  const text = (ticket.subject + ' ' + ticket.messages.map(m => m.text).join(' ')).toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [, rule] of Object.entries(AI_DEPT_RULES.keywords)) {
    const score = rule.words.reduce((s, w) => s + (text.includes(w.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  // Use keyword match if strong enough (2+ words), otherwise fall back to category
  if (bestScore >= 2 && bestMatch) return { dept: bestMatch.dept, user: bestMatch.user, confidence: 'Alta', method: 'keywords' };
  if (catMatch) return { dept: catMatch.dept, user: catMatch.user, confidence: 'Media', method: 'categoría' };
  if (bestMatch) return { dept: bestMatch.dept, user: bestMatch.user, confidence: 'Baja', method: 'keywords' };

  return { dept: 'Soporte', user: 'Starling', confidence: 'Baja', method: 'default' };
}

function aiClassifyAllTickets() {
  let classified = 0;
  data.tickets.forEach(t => {
    const result = aiClassifyTicket(t);
    const oldDept = t.assignedTo;
    t.assignedTo = result.dept;
    t.assignedUser = result.user;
    classified++;
    // Add notification for target department user
    if (oldDept !== result.dept) {
      addDeptNotification(result.dept, result.user, t);
    }
  });
  renderSupport();
  saveData();
  showToast('🤖 IA clasificó ' + classified + ' tickets automáticamente');
}

function deptColor(dept) {
  return ({ 'Soporte': 'yellow', 'Finanzas': 'green', 'A&R': 'blue', 'Proyectos': 'purple' })[dept] || 'gray';
}

function showAssignModal(ticketId) {
  const ticket = data.tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  const overlay = document.getElementById('quickAddModal');
  const content = overlay.querySelector('.modal');
  const aiResult = aiClassifyTicket(ticket);
  content.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">Asignar Ticket ${ticket.id}</div>
      <div style="font-size:12px;color:var(--text-muted)">${ticket.subject}</div>
    </div>
    <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:600;color:var(--brand-light);margin-bottom:6px">🤖 Sugerencia IA (confianza: ${aiResult.confidence})</div>
      <div style="font-size:13px;color:var(--text-primary)">Departamento: <strong>${aiResult.dept}</strong> → ${aiResult.user}</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Método: análisis por ${aiResult.method}</div>
      <button class="btn btn-sm btn-primary" style="margin-top:8px" onclick="assignTicketFromAI('${ticket.id}','${aiResult.dept}','${aiResult.user}')">✓ Usar sugerencia IA</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">O asignar manualmente:</label>
        <select id="assignDept" onchange="updateAssignUser()" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px">
          <option value="Soporte" ${ticket.assignedTo === 'Soporte' ? 'selected' : ''}>🛡 Soporte (Starling)</option>
          <option value="Finanzas" ${ticket.assignedTo === 'Finanzas' ? 'selected' : ''}>💰 Finanzas (Mariela)</option>
          <option value="A&R" ${ticket.assignedTo === 'A&R' ? 'selected' : ''}>🎵 A&R (Deschamps)</option>
          <option value="Proyectos" ${ticket.assignedTo === 'Proyectos' ? 'selected' : ''}>📁 Proyectos (Carlos)</option>
        </select>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" onclick="assignTicketManual('${ticket.id}')">Asignar</button>
        <button class="btn btn-ghost" onclick="document.getElementById('quickAddModal').classList.remove('open')">Cancelar</button>
      </div>
    </div>
  `;
  overlay.classList.add('open');
}

const DEPT_USER_MAP = { 'Soporte': 'Starling', 'Finanzas': 'Mariela', 'A&R': 'Deschamps', 'Proyectos': 'Carlos' };

function assignTicketFromAI(ticketId, dept, user) {
  const ticket = data.tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  ticket.assignedTo = dept;
  ticket.assignedUser = user;
  addDeptNotification(dept, user, ticket);
  document.getElementById('quickAddModal').classList.remove('open');
  renderSupport();
  saveData();
  showToast('🤖 Ticket ' + ticketId + ' asignado a ' + dept + ' (' + user + ')');
}

function assignTicketManual(ticketId) {
  const ticket = data.tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  const dept = document.getElementById('assignDept').value;
  const user = DEPT_USER_MAP[dept] || 'Sin asignar';
  ticket.assignedTo = dept;
  ticket.assignedUser = user;
  addDeptNotification(dept, user, ticket);
  document.getElementById('quickAddModal').classList.remove('open');
  renderSupport();
  saveData();
  showToast('✅ Ticket ' + ticketId + ' asignado a ' + dept + ' (' + user + ')');
}

function addDeptNotification(dept, user, ticket) {
  const deptLink = { 'Soporte': 'support', 'Finanzas': 'finance', 'A&R': 'crm', 'Proyectos': 'projects' };
  const newNotif = {
    id: state.notifications.length + 1,
    text: '🎫 Ticket ' + ticket.id + ' asignado a ' + dept + ': "' + ticket.subject.substring(0, 40) + '..."',
    time: 'ahora',
    unread: true,
    link: deptLink[dept] || 'support',
    ticketId: ticket.id,
    forDept: dept,
    forUser: user
  };
  state.notifications.unshift(newNotif);
  const dot = document.querySelector('.notif-dot');
  if (dot) dot.style.display = '';
}

function viewTicket(id) {
  const ticket = data.tickets.find(t => t.id === id);
  if (!ticket) return;
  const overlay = document.getElementById('quickAddModal');
  const content = overlay.querySelector('.modal');
  const user = getCurrentUser();
  content.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div>
          <div style="font-size:12px;color:var(--brand-light);font-weight:600;margin-bottom:4px">${ticket.id} · ${ticket.category}</div>
          <div style="font-size:16px;font-weight:700">${ticket.subject}</div>
        </div>
        <span class="badge badge-${ticketStatusColor(ticket.status)}" style="font-size:12px;padding:4px 10px">${ticket.status}</span>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:12px;font-size:12px;color:var(--text-muted);flex-wrap:wrap">
        <div>👤 ${ticket.from}</div>
        <div>✉ ${ticket.email}</div>
        <div>📅 ${ticket.date}</div>
        <div>Prioridad: <span class="badge badge-${ticket.priority === 'Alta' ? 'red' : ticket.priority === 'Media' ? 'yellow' : 'gray'}" style="font-size:10px">${ticket.priority}</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:8px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm)">
        <span style="font-size:12px;color:var(--text-muted)">Asignado a:</span>
        <span class="badge badge-${deptColor(ticket.assignedTo)}" style="font-size:11px">${ticket.assignedTo || 'Sin asignar'}</span>
        <span style="font-size:12px;font-weight:600;color:var(--text-primary)">${ticket.assignedUser || ''}</span>
        ${ticket.assignedUser === user.name ? '<span class="badge badge-blue" style="font-size:10px">Eres tú</span>' : ''}
      </div>
      <div style="border-top:1px solid var(--border);padding-top:16px;display:flex;flex-direction:column;gap:12px;max-height:250px;overflow-y:auto">
        ${ticket.messages.map(m => `
          <div style="display:flex;gap:10px;align-items:flex-start">
            <div style="width:28px;height:28px;border-radius:50%;background:${m.role === 'client' ? 'var(--blue)' : 'var(--green)'};display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;color:white">${m.role === 'client' ? '👤' : '🛡'}</div>
            <div style="flex:1">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${m.role === 'client' ? ticket.from : 'Equipo Wildtone'} · ${m.time}</div>
              <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;font-size:13px;color:var(--text-secondary);line-height:1.5">${m.text}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
        ${ticket.status !== 'Resuelto' ? `
          <button class="btn btn-primary" style="background:var(--green)" onclick="resolveTicket('${ticket.id}')">✅ Hecho — Marcar resuelto</button>
          <button class="btn btn-secondary" onclick="replyTicket('${ticket.id}')">💬 Responder</button>
          <button class="btn btn-secondary" style="background:rgba(124,58,237,0.15);color:var(--brand-light);border-color:var(--brand)" onclick="aiTicketChat('${ticket.id}')">🤖 IA Responder</button>
        ` : `<button class="btn btn-ghost" onclick="reopenTicket('${ticket.id}')">🔄 Reabrir ticket</button>`}
        <button class="btn btn-ghost" style="margin-left:auto" onclick="document.getElementById('quickAddModal').classList.remove('open')">Cerrar</button>
      </div>
    `;
  overlay.classList.add('open');
}

// ── AI Ticket Chat ────────────────────────────────────────────
const AI_TICKET_RESPONSES = {
  'Acceso': [
    'Hemos verificado tu cuenta y parece que hubo un bloqueo temporal por seguridad. Ya restablecimos el acceso. Por favor intenta iniciar sesión nuevamente con tus credenciales habituales.',
    'Entendemos lo frustrante que puede ser no poder acceder a tu cuenta. Hemos enviado un enlace de restablecimiento de contraseña a tu correo electrónico registrado.',
    'Tu cuenta ha sido desbloqueada exitosamente. Si continúas teniendo problemas de acceso, te recomendamos limpiar la caché de tu navegador o intentar desde un navegador diferente.'
  ],
  'Finanzas': [
    'Hemos revisado tu solicitud financiera y la estamos procesando. El departamento de finanzas está verificando los datos. Te notificaremos cuando el proceso esté completado, usualmente en 2-3 días hábiles.',
    'Confirmamos la recepción de tu solicitud sobre pagos/regalías. Nuestro equipo de finanzas ha sido notificado y están revisando tu caso.',
    'Los datos bancarios han sido actualizados correctamente en nuestro sistema. El próximo pago de regalías se procesará con la nueva información bancaria.'
  ],
  'Reportes': [
    'Hemos identificado la discrepancia en tu reporte de streams. Nuestro equipo técnico está investigando la causa. Te proporcionaremos un reporte actualizado en las próximas 24-48 horas.',
    'Gracias por reportar esta inconsistencia. Estamos sincronizando los datos con las plataformas de streaming para asegurar la precisión.',
    'El reporte ha sido regenerado con los datos más recientes. Por favor descárgalo nuevamente desde tu panel de distribución.'
  ],
  'Catálogo': [
    'El artista ha sido agregado exitosamente al catálogo. Ya puede acceder a su panel y comenzar a subir contenido.',
    'Estamos procesando la solicitud de catálogo. Nuestro equipo de A&R revisará la documentación y completará el alta en las próximas 24 horas.',
    'La actualización del catálogo se ha completado. Los cambios pueden tardar hasta 48 horas en aparecer en todas las tiendas.'
  ],
  'default': [
    'Hemos recibido tu solicitud y nuestro equipo la está revisando. Te responderemos con una solución a la brevedad posible.',
    'Entendemos tu situación y estamos trabajando en resolverla. Un miembro de nuestro equipo se pondrá en contacto contigo pronto.',
    'Tu caso ha sido escalado al departamento correspondiente. Estamos comprometidos con resolver tu solicitud lo antes posible.'
  ]
};

function aiGenerateTicketResponse(ticket) {
  const category = ticket.category || 'default';
  const pool = AI_TICKET_RESPONSES[category] || AI_TICKET_RESPONSES['default'];
  const idx = (ticket._aiIdx || ticket.messages.length) % pool.length;
  const clientName = ticket.from.split(' ').pop();
  return 'Hola ' + clientName + ',\n\n' + pool[idx] + '\n\nSaludos,\nEquipo Wildtone 🎵';
}

function aiTicketChat(ticketId) {
  const ticket = data.tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  const overlay = document.getElementById('quickAddModal');
  const content = overlay.querySelector('.modal');
  const aiSuggestion = aiGenerateTicketResponse(ticket);
  const analysis = aiClassifyTicket(ticket);
  const lastClientMsg = ticket.messages.filter(m => m.role === 'client').pop();

  content.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">🤖 Asistente IA — Ticket ${ticket.id}</div>
      <div style="font-size:12px;color:var(--text-muted)">${ticket.subject}</div>
    </div>
    <div style="background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.1));border:1px solid rgba(124,58,237,0.3);border-radius:var(--r-sm);padding:14px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--brand-light);margin-bottom:8px">📊 Análisis del ticket</div>
      <div style="display:flex;gap:16px;font-size:12px;color:var(--text-secondary);flex-wrap:wrap">
        <span>📁 Categoría: <strong>${ticket.category}</strong></span>
        <span>🏢 Depto sugerido: <strong>${analysis.dept}</strong></span>
        <span>📈 Confianza: <strong>${analysis.confidence}</strong></span>
      </div>
      ${lastClientMsg ? '<div style="margin-top:8px;font-size:12px;color:var(--text-muted)">Último mensaje: <em>"' + lastClientMsg.text.substring(0, 80) + '..."</em></div>' : ''}
    </div>
    <div id="aiChatArea" style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;margin-bottom:12px">
      <div style="display:flex;gap:8px;align-items:flex-start">
        <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--brand),#06b6d4);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">🤖</div>
        <div style="flex:1;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;font-size:13px;color:var(--text-secondary);line-height:1.5">
          Analicé el ticket <strong>${ticket.id}</strong>. Basándome en la categoría <strong>${ticket.category}</strong>, te sugiero la respuesta de abajo. Puedes pedirme cambios: <em>"hazla más corta"</em>, <em>"agrega disculpa"</em>, <em>"más formal"</em>, <em>"en inglés"</em>.
        </div>
      </div>
    </div>
    <div>
      <label style="font-size:12px;font-weight:600;color:var(--brand-light);display:block;margin-bottom:4px">✨ Respuesta sugerida por IA:</label>
      <textarea id="aiSuggestedReply" rows="5" style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid rgba(124,58,237,0.3);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px;resize:vertical;outline:none;font-family:inherit;line-height:1.5">${aiSuggestion}</textarea>
    </div>
    <div style="margin-top:8px;display:flex;gap:8px">
      <input type="text" id="aiChatInput" placeholder="Pedile algo a la IA: 'hazla más corta', 'agrega disculpa'..." style="flex:1;padding:8px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:20px;color:var(--text-primary);font-size:12px;outline:none" onkeydown="if(event.key==='Enter')aiChatAsk('${ticketId}')">
      <button class="btn btn-sm btn-secondary" onclick="aiChatAsk('${ticketId}')">🤖 Pedir</button>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="sendAiReply('${ticket.id}')">📤 Enviar esta respuesta</button>
      <button class="btn btn-secondary" onclick="aiRegenerateResponse('${ticket.id}')">🔄 Otra sugerencia</button>
      <button class="btn btn-ghost" onclick="viewTicket('${ticket.id}')">← Volver al ticket</button>
    </div>
  `;
  overlay.classList.add('open');
}

function aiChatAsk(ticketId) {
  const input = document.getElementById('aiChatInput');
  const question = input.value.trim();
  if (!question) return;
  const ticket = data.tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  const area = document.getElementById('aiChatArea');
  const user = getCurrentUser();
  const textarea = document.getElementById('aiSuggestedReply');
  let currentText = textarea.value;

  area.innerHTML += '<div style="display:flex;gap:8px;align-items:flex-start;flex-direction:row-reverse"><div style="width:28px;height:28px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;color:white">' + user.initials + '</div><div style="background:var(--brand);border-radius:var(--r-sm);padding:10px 12px;font-size:13px;color:white;max-width:70%">' + question + '</div></div>';

  let aiReply = '';
  const q = question.toLowerCase();

  if (q.includes('corta') || q.includes('breve') || q.includes('resumir')) {
    const lines = currentText.split('\n').filter(l => l.trim());
    currentText = lines.slice(0, 3).join('\n');
    textarea.value = currentText;
    aiReply = 'Listo, acorté la respuesta. Ahora es más concisa. ✂️';
  } else if (q.includes('disculpa') || q.includes('perdón') || q.includes('lament')) {
    currentText = currentText.replace(/(Hola .+?,)/, '$1\n\nLamentamos mucho los inconvenientes causados.');
    textarea.value = currentText;
    aiReply = 'Agregué una disculpa al inicio de la respuesta. 🙏';
  } else if (q.includes('formal') || q.includes('profesional')) {
    currentText = currentText.replace('Hola', 'Estimado/a').replace('🎵', '').replace('Saludos', 'Atentamente');
    textarea.value = currentText;
    aiReply = 'Hice la respuesta más formal y profesional. 👔';
  } else if (q.includes('urgente') || q.includes('prioridad') || q.includes('rápido')) {
    currentText = currentText.replace(/\n\nSaludos/, '\n\nEstamos tratando esto como prioridad máxima y te mantendremos actualizado.\n\nSaludos');
    textarea.value = currentText;
    aiReply = 'Agregué un mensaje de urgencia y prioridad. ⚡';
  } else if (q.includes('otra') || q.includes('diferente') || q.includes('regenera')) {
    ticket._aiIdx = ((ticket._aiIdx || 0) + 1);
    textarea.value = aiGenerateTicketResponse(ticket);
    aiReply = 'Generé una respuesta completamente nueva. 🔄';
  } else if (q.includes('inglés') || q.includes('english')) {
    textarea.value = 'Hello,\n\nThank you for contacting Wildtone Support. We have received your request and our team is working on it. We will update you as soon as possible.\n\nBest regards,\nWildtone Team 🎵';
    aiReply = 'Traduje la respuesta al inglés. 🌐';
  } else {
    aiReply = 'Puedo ayudarte con: <strong>"hazla más corta"</strong>, <strong>"agrega disculpa"</strong>, <strong>"más formal"</strong>, <strong>"marca urgente"</strong>, <strong>"en inglés"</strong>, o <strong>"otra sugerencia"</strong>. ¿Qué prefieres?';
  }

  area.innerHTML += '<div style="display:flex;gap:8px;align-items:flex-start"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--brand),#06b6d4);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">🤖</div><div style="flex:1;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;font-size:13px;color:var(--text-secondary);line-height:1.5">' + aiReply + '</div></div>';
  area.scrollTop = area.scrollHeight;
  input.value = '';
}

function sendAiReply(ticketId) {
  const text = document.getElementById('aiSuggestedReply').value.trim();
  if (!text) return;
  const ticket = data.tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  const user = getCurrentUser();
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  ticket.messages.push({ role: 'agent', text: text, time: now, author: user.name + ' (via IA)' });
  ticket.lastReply = now;
  ticket.status = 'En proceso';
  viewTicket(ticketId);
  renderSupport();
  saveData();
  showToast('🤖 Respuesta IA enviada al ticket ' + ticketId);
}

function aiRegenerateResponse(ticketId) {
  const ticket = data.tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  ticket._aiIdx = ((ticket._aiIdx || 0) + 1);
  document.getElementById('aiSuggestedReply').value = aiGenerateTicketResponse(ticket);
  showToast('🔄 Nueva sugerencia generada');
}

function resolveTicket(id) {
  const ticket = data.tickets.find(t => t.id === id);
  const user = getCurrentUser();
  if (ticket) {
    ticket.status = 'Resuelto';
    ticket.lastReply = new Date().toISOString().slice(0, 16).replace('T', ' ');
    ticket.messages.push({ role: 'agent', text: 'Ticket marcado como resuelto por ' + user.name + '. Si necesitas más ayuda, no dudes en contactarnos.', time: ticket.lastReply });
    // Notify all — ticket resolved
    state.notifications.unshift({
      id: state.notifications.length + 1,
      text: '✅ ' + user.name + ' resolvió ticket ' + ticket.id + ': "' + ticket.subject.substring(0, 35) + '..."',
      time: 'ahora',
      unread: true,
      link: 'support',
      ticketId: ticket.id
    });
    const dot = document.querySelector('.notif-dot');
    if (dot) dot.style.display = '';
  }
  document.getElementById('quickAddModal').classList.remove('open');
  renderSupport();
  saveData();
  showToast('✅ Ticket ' + id + ' resuelto por ' + user.name);
}

function reopenTicket(id) {
  const ticket = data.tickets.find(t => t.id === id);
  if (ticket) ticket.status = 'Abierto';
  document.getElementById('quickAddModal').classList.remove('open');
  renderSupport();
  saveData();
  showToast(`🔄 Ticket ${id} reabierto`);
}

function replyTicket(id) {
  const ticket = data.tickets.find(t => t.id === id);
  if (!ticket) return;
  const overlay = document.getElementById('quickAddModal');
  const content = overlay.querySelector('.modal');
  const user = getCurrentUser();
  content.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">💬 Responder Ticket ${ticket.id}</div>
      <div style="font-size:12px;color:var(--text-muted)">${ticket.subject}</div>
    </div>
    <div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r-sm);padding:12px;margin-bottom:12px;background:var(--bg-surface)">
      ${ticket.messages.slice(-3).map(m => `
        <div style="margin-bottom:8px;font-size:12px">
          <span style="font-weight:600;color:${m.role === 'client' ? 'var(--blue)' : 'var(--green)'}">${m.role === 'client' ? ticket.from : 'Equipo Wildtone'}</span>
          <span style="color:var(--text-muted);margin-left:4px">${m.time}</span>
          <div style="color:var(--text-secondary);margin-top:2px">${m.text}</div>
        </div>
      `).join('')}
    </div>
    <div>
      <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px">Tu respuesta como ${user.name}:</label>
      <textarea id="replyText" rows="4" placeholder="Escribe tu respuesta al cliente..." style="width:100%;padding:10px 12px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:13px;resize:vertical;outline:none;font-family:inherit"></textarea>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-primary" onclick="sendReply('${ticket.id}')">📤 Enviar respuesta</button>
      <button class="btn btn-ghost" onclick="viewTicket('${ticket.id}')">Cancelar</button>
    </div>
  `;
  overlay.classList.add('open');
  setTimeout(() => { const ta = document.getElementById('replyText'); if (ta) ta.focus(); }, 100);
}

function sendReply(id) {
  const ticket = data.tickets.find(t => t.id === id);
  if (!ticket) return;
  const text = document.getElementById('replyText').value.trim();
  if (!text) {
    document.getElementById('replyText').style.borderColor = 'var(--red)';
    return;
  }
  const user = getCurrentUser();
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  ticket.messages.push({ role: 'agent', text: text, time: now, author: user.name });
  ticket.lastReply = now;
  ticket.status = 'En proceso';
  viewTicket(id);
  renderSupport();
  saveData();
  showToast('💬 Respuesta enviada al ticket ' + id);
}

function exportTickets(format) {
  const headers = ['ID', 'Asunto', 'De', 'Email', 'Categoría', 'Prioridad', 'Estado', 'Fecha', 'Última respuesta'];
  const rows = data.tickets.map(t => [
    t.id, t.subject, t.from, t.email, t.category, t.priority, t.status, t.date, t.lastReply || 'Sin respuesta'
  ]);
  if (format === 'excel') {
    downloadExcel('Wildtone_Tickets_Soporte.xls', 'Soporte', headers, rows);
  } else {
    downloadCSV('Wildtone_Tickets_Soporte.csv', headers, rows);
  }
}

// ── Reports ──────────────────────────────────────────────────
function renderReports() {
  const el = document.getElementById('module-reports');
  el.innerHTML = `
    <div class="section-header">
      <div class="section-title">Reportes</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
      ${[
      { icon: '◷', title: 'Reporte de Horario', desc: 'Horas por usuario, tardanzas, overtime, ausencias', color: 'blue', fn: 'exportTimeEntries' },
      { icon: '$', title: 'Reporte de Finanzas', desc: 'Gastos por categoría, proveedor, proyecto y periodo', color: 'yellow', fn: 'exportExpenses' },
      { icon: '✓', title: 'Reporte de Tareas', desc: 'Completadas, vencidas, productividad por equipo', color: 'purple', fn: 'exportTasks' },
      { icon: '◉', title: 'Reporte CRM', desc: 'Deals por etapa, conversión, forecast, actividad', color: 'green', fn: 'exportDeals' },
    ].map(r => `
        <div class="kpi-card ${r.color}" style="cursor:pointer">
          <span class="kpi-icon">${r.icon}</span>
          <div style="font-size:15px;font-weight:700;margin-bottom:6px">${r.title}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">${r.desc}</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();${r.fn}('csv')">⬇ CSV</button>
            <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();${r.fn}('excel')">⬇ Excel</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="card" style="margin-top:24px">
      <div class="section-title" style="font-size:15px;margin-bottom:16px">Resumen financiero — Febrero 2026</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${[
      { cat: 'Producción', amount: 1200, pct: 38 },
      { cat: 'Equipos', amount: 2200, pct: 70 },
      { cat: 'Marketing', amount: 500, pct: 16 },
      { cat: 'Legal', amount: 800, pct: 25 },
      { cat: 'Diseño', amount: 350, pct: 11 },
    ].map(c => `
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:13px">${c.cat}</span>
              <span style="font-size:13px;font-weight:600">$${c.amount.toLocaleString()}</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${c.pct}%"></div></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── AI Agent ─────────────────────────────────────────────────
function renderAgent() {
  const el = document.getElementById('module-agent');
  el.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">✦ Agente AI — Wildtone Assistant</div>
        <div class="section-sub">Consultas y acciones con confirmación obligatoria</div>
      </div>
      <span class="badge badge-green">● Activo</span>
    </div>

    <div class="card chat-container">
      <div class="chat-messages" id="chatMessages">
        ${state.chatHistory.map(m => renderChatMsg(m)).join('')}
      </div>
      <div class="chat-suggestions">
        ${['¿Qué tareas tengo hoy?', '¿Cuántas horas trabajé este mes?', 'Muéstrame pagos pendientes', 'Crea una tarea para mañana', 'Reporte de gastos por categoría'].map(s => `
          <button class="chat-suggestion" onclick="sendSuggestion('${s}')">${s}</button>
        `).join('')}
      </div>
      <div class="chat-input-area">
        <textarea class="chat-input" id="chatInput" placeholder="Escribe tu consulta o acción..." rows="1"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat()}"></textarea>
        <button class="chat-send-btn" onclick="sendChat()">➤</button>
      </div>
    </div>
  `;
  scrollChat();
}

function renderChatMsg(m) {
  return `
    <div class="chat-msg ${m.role}">
      <div class="chat-msg-avatar">${m.role === 'ai' ? '✦' : 'MJ'}</div>
      <div class="chat-bubble">${m.text}</div>
    </div>
  `;
}

function sendSuggestion(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input?.value.trim();
  if (!text) return;
  input.value = '';

  state.chatHistory.push({ role: 'user', text });
  const msgs = document.getElementById('chatMessages');
  if (msgs) msgs.innerHTML += renderChatMsg({ role: 'user', text });

  setTimeout(() => {
    const reply = getAIReply(text);
    state.chatHistory.push({ role: 'ai', text: reply });
    if (msgs) msgs.innerHTML += renderChatMsg({ role: 'ai', text: reply });
    scrollChat();
  }, 600);
  scrollChat();
}

function getAIReply(text) {
  const t = text.toLowerCase();
  if (t.includes('tarea') && t.includes('hoy')) return '📋 Tienes <strong>4 tareas activas</strong> para hoy:<br>1. Diseño portada EP "Noche Urbana" — Alta<br>2. Contrato distribución digital — Alta<br>3. Mezcla y master track 3 — Media<br>4. Campaña Instagram Stories — Media';
  if (t.includes('hora') || t.includes('trabajé')) return '⏱ Este mes has trabajado <strong>142 horas</strong> (promedio 8h 30m/día). Tu jornada de hoy lleva 8h 45m. Sin tardanzas registradas.';
  if (t.includes('pago') || t.includes('gasto')) return '💰 Tienes <strong>3 gastos pendientes de aprobación</strong>:<br>• Diseño gráfico portada — $350<br>• Facebook Ads — $500<br>• Equipos audio — $2,200<br><br>¿Quieres que los envíe a aprobación?';
  if (t.includes('crea') && t.includes('tarea')) return '✅ Entendido. ¿Confirmas crear la tarea con estos datos?<br><br><strong>Título:</strong> Nueva tarea<br><strong>Asignado:</strong> Tú<br><strong>Vence:</strong> Mañana<br><strong>Prioridad:</strong> Media<br><br><button class="btn btn-sm btn-primary" onclick="showToast(\'✅ Tarea creada\')">Confirmar</button> <button class="btn btn-sm btn-ghost" onclick="showToast(\'Cancelado\')">Cancelar</button>';
  if (t.includes('reporte') || t.includes('categoría')) return '📊 Reporte de gastos — Febrero 2026:<br>• Equipos: $2,200 (44%)<br>• Producción: $1,200 (24%)<br>• Legal: $800 (16%)<br>• Marketing: $500 (10%)<br>• Diseño: $350 (7%)<br><br><strong>Total: $5,050 USD</strong><br><br><button class="btn btn-sm btn-secondary" onclick="showToast(\'Exportando...\')">⬇ Exportar CSV</button>';
  return '🤔 Entendido. Estoy procesando tu solicitud. Recuerda que cualquier acción de escritura requiere tu confirmación antes de ejecutarse. ¿Puedes ser más específico sobre lo que necesitas?';
}

function scrollChat() {
  const msgs = document.getElementById('chatMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

// ── Settings ─────────────────────────────────────────────────
// ── Chat Interno ─────────────────────────────────────────────
let chatCurrentChannel = '#general';

const CHAT_CHANNELS = {
  '#general': { name: 'General', icon: '🏢', desc: 'Canal para todo el equipo' },
  '#soporte': { name: 'Soporte', icon: '🎫', desc: 'Canal del equipo de soporte' },
  '#finanzas': { name: 'Finanzas', icon: '💰', desc: 'Canal del equipo de finanzas' },
  '#ar-ventas': { name: 'A&R / Ventas', icon: '🎵', desc: 'Canal de A&R y ventas' },
  '#proyectos': { name: 'Proyectos', icon: '📋', desc: 'Canal de gestión de proyectos' },
  '#produccion': { name: 'Producción', icon: '🎧', desc: 'Canal de producción musical' }
};

async function getChatData() {
  const chatData = { channels: {}, dms: {} };
  for (const [key, info] of Object.entries(CHAT_CHANNELS)) {
    chatData.channels[key] = { ...info, messages: [] };
  }
  try {
    const { data: msgs, error } = await _sb.from('chat_messages').select('*').order('created_at');
    if (error) throw error;
    for (const m of (msgs || [])) {
      const msg = { user: m.sender_name, initials: m.sender_initials, text: m.text, time: m.created_at ? new Date(m.created_at).toISOString().slice(0, 16).replace('T', ' ') : '' };
      if (m.dm_key) {
        if (!chatData.dms[m.dm_key]) chatData.dms[m.dm_key] = [];
        chatData.dms[m.dm_key].push(msg);
      } else if (m.channel && chatData.channels[m.channel]) {
        chatData.channels[m.channel].messages.push(msg);
      }
    }
  } catch (e) { console.warn('Chat load failed:', e); }
  return chatData;
}

function saveChatData(chatData) { /* Supabase is source of truth */ }

async function renderChat() {
  const el = document.getElementById('module-chat');
  const user = getCurrentUser();
  const chatData = await getChatData();
  const allUsers = [
    { name: 'Melky Jaime', initials: 'MJ', dept: 'Dirección', color: '#7c3aed' },
    { name: 'Deschamps', initials: 'DE', dept: 'A&R', color: '#3b82f6' },
    { name: 'Emy', initials: 'EM', dept: 'Soporte', color: '#22c55e' },
  ].filter(u => u.name !== user.name);

  const isChannel = chatCurrentChannel.startsWith('#');
  let currentMessages = [];
  let headerTitle = '';
  let headerSub = '';
  let headerIcon = '';

  if (isChannel) {
    const ch = chatData.channels[chatCurrentChannel];
    if (ch) {
      currentMessages = ch.messages || [];
      headerTitle = chatCurrentChannel;
      headerSub = ch.desc;
      headerIcon = ch.icon;
    }
  } else {
    // DM
    const dmKey = [user.name, chatCurrentChannel].sort().join('::');
    currentMessages = (chatData.dms[dmKey] || []);
    headerTitle = chatCurrentChannel;
    headerSub = 'Mensaje directo';
    headerIcon = '👤';
  }

  el.innerHTML = `
    <div style="display:flex;height:calc(100vh - 80px);overflow:hidden">
      <!-- Sidebar -->
      <div style="width:240px;min-width:240px;border-right:1px solid var(--border);overflow-y:auto;padding:16px 0;background:var(--bg-card)">
        <div style="padding:0 16px 12px;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Canales</div>
        ${Object.entries(chatData.channels).map(([key, ch]) => `
          <div onclick="chatCurrentChannel='${key}';renderChat()" style="padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:13px;color:${chatCurrentChannel === key ? 'white' : 'var(--text-secondary)'};background:${chatCurrentChannel === key ? 'var(--brand)' : 'transparent'};border-radius:0;transition:background 0.15s">
            <span>${ch.icon}</span>
            <span style="font-weight:${chatCurrentChannel === key ? '600' : '400'}">${key}</span>
            ${ch.messages.length > 0 ? '<span style="margin-left:auto;font-size:10px;opacity:0.6">' + ch.messages.length + '</span>' : ''}
          </div>
        `).join('')}
        <div style="padding:16px 16px 12px;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid var(--border);margin-top:8px">Mensajes Directos</div>
        ${allUsers.map(u => {
    const dmKey = [user.name, u.name].sort().join('::');
    const dmCount = (chatData.dms[dmKey] || []).length;
    return `
            <div onclick="chatCurrentChannel='${u.name}';renderChat()" style="padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:13px;color:${chatCurrentChannel === u.name ? 'white' : 'var(--text-secondary)'};background:${chatCurrentChannel === u.name ? 'var(--brand)' : 'transparent'};transition:background 0.15s">
              <div style="width:24px;height:24px;border-radius:50%;background:${u.color};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:white;flex-shrink:0">${u.initials}</div>
              <span>${u.name}</span>
              <span style="font-size:10px;color:var(--text-muted);margin-left:auto">${u.dept}</span>
            </div>
          `;
  }).join('')}
      </div>
      <!-- Main chat -->
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <!-- Header -->
        <div style="padding:12px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--bg-card)">
          <span style="font-size:18px">${headerIcon}</span>
          <div>
            <div style="font-size:14px;font-weight:700">${headerTitle}</div>
            <div style="font-size:11px;color:var(--text-muted)">${headerSub}</div>
          </div>
          <div style="margin-left:auto;font-size:12px;color:var(--text-muted)">${currentMessages.length} mensajes</div>
        </div>
        <!-- Messages -->
        <div id="chatMessages" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px">
          ${currentMessages.length === 0 ? '<div style="text-align:center;color:var(--text-muted);padding:40px;font-size:13px">No hay mensajes todavía. ¡Sé el primero en escribir! 💬</div>' : ''}
          ${currentMessages.map(m => {
    const isMe = m.user === user.name;
    const avatarColor = allUsers.find(u => u.name === m.user)?.color || '#7c3aed';
    return `
              <div style="display:flex;gap:10px;align-items:flex-start;${isMe ? 'flex-direction:row-reverse' : ''}">
                <div style="width:32px;height:32px;border-radius:50%;background:${isMe ? 'var(--brand)' : avatarColor};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0">${m.initials}</div>
                <div style="max-width:65%">
                  <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;${isMe ? 'text-align:right' : ''}">${m.user} · ${m.time}</div>
                  <div style="background:${isMe ? 'var(--brand)' : 'var(--bg-surface)'};border:1px solid ${isMe ? 'var(--brand)' : 'var(--border)'};border-radius:12px;${isMe ? 'border-top-right-radius:4px' : 'border-top-left-radius:4px'};padding:10px 14px;font-size:13px;color:${isMe ? 'white' : 'var(--text-secondary)'};line-height:1.5">${m.text}</div>
                </div>
              </div>
            `;
  }).join('')}
        </div>
        <!-- Input -->
        <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:10px;align-items:flex-end;background:var(--bg-card)">
          <textarea id="chatInput" rows="1" placeholder="Escribe un mensaje..." style="flex:1;padding:10px 14px;background:var(--bg-surface);border:1px solid var(--border);border-radius:20px;color:var(--text-primary);font-size:13px;resize:none;outline:none;font-family:inherit;max-height:100px" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChatMessage()}"></textarea>
          <button onclick="sendChatMessage()" style="width:36px;height:36px;border-radius:50%;background:var(--brand);border:none;color:white;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.2s" onmouseenter="this.style.background='#6d28d9'" onmouseleave="this.style.background='var(--brand)'">↗</button>
        </div>
      </div>
    </div>
  `;
  // Scroll to bottom
  const msgContainer = document.getElementById('chatMessages');
  if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  const user = getCurrentUser();
  const msgData = { sender_name: user.name, sender_initials: user.initials, text: text };
  let channelLabel = '';

  if (chatCurrentChannel.startsWith('#')) {
    msgData.channel = chatCurrentChannel;
    channelLabel = chatCurrentChannel;
  } else {
    const dmKey = [user.name, chatCurrentChannel].sort().join('::');
    msgData.channel = 'dm';
    msgData.dm_key = dmKey;
    channelLabel = 'DM → ' + chatCurrentChannel;
  }

  console.log('📤 Sending chat msg:', JSON.stringify(msgData));
  try {
    const { data, error } = await _sb.from('chat_messages').insert(msgData).select();
    console.log('📤 Insert result:', { data, error });
    if (error) {
      console.error('Chat insert error detail:', error.code, error.message, error.details, error.hint);
      showToast('❌ Error: ' + (error.message || 'desconocido'));
      return;
    }

    // Create notification for team
    await _sb.from('notifications').insert({
      text: '💬 ' + user.name + ' en ' + channelLabel + ': "' + text.substring(0, 40) + (text.length > 40 ? '...' : '') + '"',
      time_label: 'ahora', unread: true, link: 'chat'
    });

    showToast('💬 Mensaje enviado');
  } catch (e) {
    console.error('Chat send exception:', e);
    showToast('❌ Error: ' + e.message);
  }
  renderChat();
}

function renderSettings() {
  const el = document.getElementById('module-settings');
  el.innerHTML = `
    <div class="section-title" style="margin-bottom:24px">Configuración y Administración</div>
    <div class="two-col">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="section-title" style="font-size:14px;margin-bottom:16px">👥 Usuarios</div>
          ${[
      { name: 'Melky Jaime', email: 'melky@wildtone.com', role: 'Super Admin', active: true },
      { name: 'Mariela', email: 'mariela@wildtone.com', role: 'Finance Manager', active: true },
      { name: 'Deschamps', email: 'deschamps@wildtone.com', role: 'Operations Manager', active: true },
    ].map(u => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
              <div class="user-avatar">${u.name.split(' ').map(n => n[0]).join('')}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600">${u.name}</div>
                <div style="font-size:11px;color:var(--text-muted)">${u.email}</div>
              </div>
              <span class="badge badge-purple">${u.role}</span>
              <span class="badge badge-${u.active ? 'green' : 'gray'}">${u.active ? 'Activo' : 'Inactivo'}</span>
            </div>
          `).join('')}
          <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="alert('Invitar usuario')">+ Invitar usuario</button>
        </div>

        <div class="card">
          <div class="section-title" style="font-size:14px;margin-bottom:16px">⚙ Reglas de jornada</div>
          ${[
      { label: 'Jornada estándar', value: '8h 30m' },
      { label: 'Tolerancia tardanza', value: '10 min' },
      { label: 'Pausa mínima requerida', value: '30 min' },
      { label: 'Overtime después de', value: '9h' },
      { label: 'Zona horaria', value: 'America/Caracas' },
    ].map(r => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
              <span style="color:var(--text-secondary)">${r.label}</span>
              <span style="font-weight:600">${r.value}</span>
            </div>
          `).join('')}
          <button class="btn btn-secondary btn-sm" style="margin-top:12px">Editar reglas</button>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card">
          <div class="section-title" style="font-size:14px;margin-bottom:16px">✦ Configuración Agente AI</div>
          ${[
      { label: 'Acciones habilitadas', val: true },
      { label: 'Confirmación obligatoria', val: true },
      { label: 'Knowledge Base', val: true },
      { label: 'Logs de conversaciones', val: true },
    ].map(s => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:13px;color:var(--text-secondary)">${s.label}</span>
              <div style="width:36px;height:20px;background:${s.val ? 'var(--brand)' : 'var(--bg-surface)'};border-radius:99px;cursor:pointer;position:relative;border:1px solid var(--border)">
                <div style="width:14px;height:14px;background:white;border-radius:50%;position:absolute;top:2px;${s.val ? 'right:2px' : 'left:2px'};transition:all 0.2s"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="card">
          <div class="section-title" style="font-size:14px;margin-bottom:16px">📂 Categorías de gastos</div>
          ${['Producción', 'Marketing', 'Legal', 'Diseño', 'Equipos', 'Viajes', 'Servicios'].map(c => `
            <span class="tag" style="margin:3px;display:inline-flex">${c}</span>
          `).join('')}
          <br><button class="btn btn-secondary btn-sm" style="margin-top:12px">+ Agregar categoría</button>
        </div>
      </div>
    </div>
  `;
}

// ── Helpers ──────────────────────────────────────────────────
function statusColor(s) {
  return { 'Pendiente': 'yellow', 'En progreso': 'blue', 'Revisión': 'purple', 'Completada': 'green' }[s] || 'gray';
}

function priorityColor(p) {
  return { 'Alta': 'red', 'Media': 'yellow', 'Baja': 'gray' }[p] || 'gray';
}

function kanbanColor(s) {
  return { 'Pendiente': '#f59e0b', 'En progreso': '#3b82f6', 'Revisión': '#8b5cf6', 'Completada': '#10b981' }[s] || '#475569';
}

function finStatusColor(s) {
  return { 'Draft': 'gray', 'Submitted': 'yellow', 'Approved': 'blue', 'Paid': 'green', 'Rejected': 'red' }[s] || 'gray';
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:12px 18px;font-size:13px;color:var(--text-primary);z-index:999;box-shadow:var(--shadow-card);animation:fadeIn 0.25s ease;max-width:320px`;
  t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Export Utilities ─────────────────────────────────────────
function downloadCSV(filename, headers, rows) {
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  // Try standard download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
  // Also open preview in new tab
  openReportPreview(filename, headers, rows, 'csv', csvContent, blobUrl);
}

function downloadExcel(filename, sheetName, headers, rows) {
  const tableRows = rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('');
  const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:spreadsheet" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><style>td{mso-number-format:"\\@";font-family:Arial;font-size:12px;padding:4px 8px}th{background:#8b5cf6;color:white;font-family:Arial;font-size:12px;font-weight:bold;padding:6px 8px;text-align:left}tr:nth-child(even){background:#f5f5f5}</style></head>
    <body><table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;border:1px solid #ddd">
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table></body></html>`;
  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
  // Also open preview in new tab
  openReportPreview(filename, headers, rows, 'excel', excelHtml, blobUrl);
}

function openReportPreview(filename, headers, rows, format, rawContent, blobUrl) {
  const w = window.open('', '_blank');
  if (!w) { showToast('⚠️ Permite pop-ups para ver el reporte'); return; }
  const tableRows = rows.map((r, i) => {
    const isLast = i === rows.length - 1 && String(r[0]) === '';
    return `<tr style="${isLast ? 'font-weight:bold;background:#f0e6ff' : ''}">` +
      r.map(c => `<td>${c}</td>`).join('') + '</tr>';
  }).join('');
  w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
    <title>${filename} — Wildtone</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f4f4f8;padding:24px;color:#1e293b}
      .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px}
      .title{font-size:20px;font-weight:700;color:#1e293b}
      .subtitle{font-size:13px;color:#64748b;margin-top:2px}
      .logo-bar{display:flex;align-items:center;gap:10px}
      .logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#8b5cf6,#ec4899);border-radius:8px;display:flex;align-items:center;justify-content:center}
      .logo-icon svg{width:20px;height:20px}
      .actions{display:flex;gap:8px}
      .btn{padding:8px 16px;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s}
      .btn-primary{background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:white;box-shadow:0 2px 8px rgba(139,92,246,.3)}
      .btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(139,92,246,.4)}
      .btn-secondary{background:white;color:#475569;border:1px solid #e2e8f0}
      .btn-secondary:hover{background:#f8fafc;border-color:#cbd5e1}
      .card{background:white;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)}
      table{width:100%;border-collapse:collapse}
      th{background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;padding:10px 14px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap}
      td{padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155}
      tr:hover td{background:#faf5ff}
      .meta{font-size:12px;color:#94a3b8;margin-top:16px;text-align:right}
      @media print{.actions,.meta{display:none}.header{margin-bottom:12px}body{padding:8px}table{font-size:11px}}
    </style>
  </head><body>
    <div class="header">
      <div class="logo-bar">
        <div class="logo-icon"><svg viewBox="0 0 40 40" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><line x1="8" y1="32" x2="16" y2="4"/><line x1="14" y1="32" x2="22" y2="4"/><line x1="20" y1="32" x2="28" y2="4"/><line x1="12" y1="36" x2="20" y2="18"/><line x1="18" y1="36" x2="26" y2="18"/></svg></div>
        <div>
          <div class="title">${filename.replace(/_/g, ' ').replace('.csv', '').replace('.xls', '')}</div>
          <div class="subtitle">Wildtone Music Group · Generado ${new Date().toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })} a las ${new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-secondary" onclick="window.print()">🖨 Imprimir</button>
        <a class="btn btn-primary" href="${blobUrl}" download="${filename}">⬇ Guardar ${format === 'excel' ? '.xls' : '.csv'}</a>
      </div>
    </div>
    <div class="card">
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
    <div class="meta">${rows.length} registros · ${format.toUpperCase()} · Wildtone Operations Suite</div>
  </body></html>`);
  w.document.close();
  showToast(`📊 Reporte abierto en nueva pestaña`);
}

function exportExpenses(format) {
  const headers = ['Concepto', 'Proveedor', 'Categoría', 'Proyecto', 'Monto (USD)', 'Fecha', 'Estado'];
  const rows = data.expenses.map(e => [
    e.concept, e.vendor, e.category, e.project, e.amount, e.date, e.status
  ]);
  // Add totals row
  const total = data.expenses.reduce((s, e) => s + e.amount, 0);
  rows.push(['', '', '', 'TOTAL', total, '', '']);
  if (format === 'excel') {
    downloadExcel('Wildtone_Gastos_Feb2026.xls', 'Gastos', headers, rows);
  } else {
    downloadCSV('Wildtone_Gastos_Feb2026.csv', headers, rows);
  }
}

function exportTimeEntries(format) {
  const headers = ['Usuario', 'Fecha', 'Entrada', 'Salida', 'Horas Trabajadas', 'Pausas', 'Estado'];
  const rows = data.timeEntries.map(t => [
    t.user, t.date, t.checkIn, t.checkOut || 'Activo', t.worked, t.breaks, t.status
  ]);
  if (format === 'excel') {
    downloadExcel('Wildtone_Horario_Feb2026.xls', 'Horario', headers, rows);
  } else {
    downloadCSV('Wildtone_Horario_Feb2026.csv', headers, rows);
  }
}

function exportTasks(format) {
  const headers = ['Tarea', 'Proyecto', 'Estado', 'Prioridad', 'Asignado', 'Fecha Vencimiento', 'Etiquetas'];
  const rows = data.tasks.map(t => [
    t.title, t.project, t.status, t.priority, t.assigned, t.due, t.labels.join('; ')
  ]);
  if (format === 'excel') {
    downloadExcel('Wildtone_Tareas_Feb2026.xls', 'Tareas', headers, rows);
  } else {
    downloadCSV('Wildtone_Tareas_Feb2026.csv', headers, rows);
  }
}

function exportDeals(format) {
  const headers = ['Deal', 'Cuenta', 'Valor (USD)', 'Etapa', 'Owner', 'Estado'];
  const rows = data.deals.map(d => [
    d.title, d.account, d.value, d.stage, d.owner, d.status === 'won' ? 'Ganado' : d.status === 'lost' ? 'Perdido' : 'Abierto'
  ]);
  const totalVal = data.deals.reduce((s, d) => s + d.value, 0);
  rows.push(['', 'TOTAL PIPELINE', totalVal, '', '', '']);
  if (format === 'excel') {
    downloadExcel('Wildtone_CRM_Pipeline.xls', 'CRM', headers, rows);
  } else {
    downloadCSV('Wildtone_CRM_Pipeline.csv', headers, rows);
  }
}

// ── Event Listeners ──────────────────────────────────────────
document.querySelectorAll('.nav-item[data-module]').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.module));
});

document.getElementById('quickAddBtn').addEventListener('click', () => {
  document.getElementById('quickAddModal').classList.add('open');
});

document.getElementById('closeQuickAdd').addEventListener('click', () => {
  document.getElementById('quickAddModal').classList.remove('open');
});

document.getElementById('quickAddModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

document.querySelectorAll('.quick-action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    document.getElementById('quickAddModal').classList.remove('open');
    if (action === 'agent') navigate('agent');
    else if (action === 'task') navigate('tasks');
    else if (action === 'expense') navigate('finance');
    else if (action === 'checkin') navigate('time');
    else if (action === 'deal') navigate('crm');
    else if (action === 'report') navigate('reports');
  });
});

document.getElementById('notifBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  const panel = document.getElementById('notifPanel');
  panel.classList.toggle('open');
  renderNotifications();
});

document.addEventListener('click', (e) => {
  const panel = document.getElementById('notifPanel');
  if (!panel.contains(e.target) && e.target.id !== 'notifBtn') {
    panel.classList.remove('open');
  }
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

function renderNotifications() {
  const list = document.getElementById('notifList');
  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" style="cursor:pointer" onclick="goToNotification(${n.id}, '${n.link || ''}')">
      ${n.unread ? '<div class="notif-dot-item"></div>' : '<div style="width:8px"></div>'}
      <div style="flex:1">
        <div class="notif-text">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
      <div style="color:var(--text-muted);font-size:14px">→</div>
    </div>
  `).join('');
}

function goToNotification(notifId, link) {
  const notif = state.notifications.find(n => n.id === notifId);
  if (notif) notif.unread = false;
  const hasUnread = state.notifications.some(n => n.unread);
  const dot = document.querySelector('.notif-dot');
  if (dot) dot.style.display = hasUnread ? '' : 'none';
  document.getElementById('notifPanel').classList.remove('open');
  // If it's a ticket notification, open the ticket detail directly
  if (notif && notif.ticketId) {
    if (isModuleAllowed('support')) {
      navigate('support');
    }
    setTimeout(() => viewTicket(notif.ticketId), 100);
    return;
  }
  if (link && isModuleAllowed(link)) {
    navigate(link);
  } else if (link) {
    showToast('🚫 No tienes acceso a este módulo');
  }
}

// ── Notifications ────────────────────────────────────────────
function markAllRead() {
  state.notifications.forEach(n => n.unread = false);
  renderNotifications();
  const dot = document.querySelector('.notif-dot');
  if (dot) dot.style.display = 'none';
  showToast('✅ Todas las notificaciones marcadas como leídas');
}

// ── Auth ─────────────────────────────────────────────────────
function doLogout() {
  if (state.clockInterval) clearInterval(state.clockInterval);
  localStorage.removeItem('wildtone_user');
  showToast('👋 Cerrando sesión...');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 900);
}

// ── New Modules ─────────────────────────────────────────────
function renderDemos() {
  const el = document.getElementById('module-demos');
  const demos = [
    { id: 'DM-001', artist: 'Neon Dreams', genre: 'Synth Pop', submitted: '2026-02-18', status: 'Nuevo', rating: 0, notes: '' },
    { id: 'DM-002', artist: 'Luna Roja', genre: 'Reggaetón', submitted: '2026-02-16', status: 'En revisión', rating: 4, notes: 'Interesante propuesta melódica' },
    { id: 'DM-003', artist: 'DJ Voltex', genre: 'EDM / House', submitted: '2026-02-15', status: 'Aprobado', rating: 5, notes: 'Firmar contrato inmediatamente' },
    { id: 'DM-004', artist: 'Sof\u00eda Montero', genre: 'Balada Urbana', submitted: '2026-02-14', status: 'Rechazado', rating: 2, notes: 'No encaja con catálogo actual' },
    { id: 'DM-005', artist: 'Beats MX Collective', genre: 'Hip-Hop', submitted: '2026-02-19', status: 'Nuevo', rating: 0, notes: '' },
  ];
  const statusBadge = s => ({ 'Nuevo': 'blue', 'En revisión': 'yellow', 'Aprobado': 'green', 'Rechazado': 'red' }[s] || 'gray');
  el.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">🎵 Demos Box</div>
        <div class="section-sub">${demos.length} demos recibidos · ${demos.filter(d => d.status === 'Nuevo').length} sin revisar</div>
      </div>
    </div>
    <div class="kpi-grid" style="margin-bottom:20px">
      <div class="kpi-card blue"><span class="kpi-value">${demos.filter(d => d.status === 'Nuevo').length}</span><span class="kpi-label">Nuevos</span></div>
      <div class="kpi-card yellow"><span class="kpi-value">${demos.filter(d => d.status === 'En revisión').length}</span><span class="kpi-label">En revisión</span></div>
      <div class="kpi-card green"><span class="kpi-value">${demos.filter(d => d.status === 'Aprobado').length}</span><span class="kpi-label">Aprobados</span></div>
      <div class="kpi-card red"><span class="kpi-value">${demos.filter(d => d.status === 'Rechazado').length}</span><span class="kpi-label">Rechazados</span></div>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Artista</th><th>Género</th><th>Fecha</th><th>Estado</th><th>Rating</th><th>Notas</th></tr></thead>
          <tbody>
            ${demos.map(d => `<tr>
              <td style="font-weight:600">${d.id}</td>
              <td>${d.artist}</td>
              <td><span class="tag">${d.genre}</span></td>
              <td style="color:var(--text-muted)">${d.submitted}</td>
              <td><span class="badge badge-${statusBadge(d.status)}">${d.status}</span></td>
              <td>${d.rating > 0 ? '⭐'.repeat(d.rating) : '<span style="color:var(--text-muted)">—</span>'}</td>
              <td style="max-width:200px;color:var(--text-muted);font-size:12px">${d.notes || '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderLaunches() {
  const el = document.getElementById('module-launches');
  const launches = [
    { id: 'LZ-001', title: 'EP "Noche Urbana"', artist: 'Melky', platform: 'Todas', date: '2026-03-15', status: 'Pre-release', progress: 60 },
    { id: 'LZ-002', title: 'Single "Fuego"', artist: 'Luna Roja', platform: 'Spotify, Apple', date: '2026-02-28', status: 'Master listo', progress: 85 },
    { id: 'LZ-003', title: 'Álbum "Frecuencia"', artist: 'DJ Voltex', platform: 'Todas', date: '2026-04-20', status: 'En producción', progress: 35 },
    { id: 'LZ-004', title: 'Single "Amanecer"', artist: 'Sofía Montero', platform: 'YouTube, Spotify', date: '2026-03-01', status: 'Distribuido', progress: 100 },
  ];
  const statusColor = s => ({ 'Pre-release': 'yellow', 'Master listo': 'blue', 'En producción': 'purple', 'Distribuido': 'green' }[s] || 'gray');
  el.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">🚀 Gestor de Lanzamientos</div>
        <div class="section-sub">${launches.length} lanzamientos en pipeline</div>
      </div>
    </div>
    <div class="kpi-grid" style="margin-bottom:20px">
      <div class="kpi-card green"><span class="kpi-value">${launches.filter(l => l.status === 'Distribuido').length}</span><span class="kpi-label">Distribuidos</span></div>
      <div class="kpi-card blue"><span class="kpi-value">${launches.filter(l => l.status === 'Master listo').length}</span><span class="kpi-label">Master listo</span></div>
      <div class="kpi-card yellow"><span class="kpi-value">${launches.filter(l => l.status === 'Pre-release').length}</span><span class="kpi-label">Pre-release</span></div>
      <div class="kpi-card purple"><span class="kpi-value">${launches.filter(l => l.status === 'En producción').length}</span><span class="kpi-label">Producción</span></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      ${launches.map(l => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:11px;color:var(--text-muted)">${l.id}</span>
            <span class="badge badge-${statusColor(l.status)}">${l.status}</span>
          </div>
          <div style="font-size:15px;font-weight:700;margin-bottom:4px">${l.title}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">🎤 ${l.artist} · 📡 ${l.platform} · 📅 ${l.date}</div>
          <div class="progress-bar" style="margin-bottom:4px"><div class="progress-fill" style="width:${l.progress}%"></div></div>
          <div style="font-size:11px;color:var(--text-muted)">${l.progress}% completado</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRoyalties() {
  const el = document.getElementById('module-royalties');
  const royalties = [
    { artist: 'Melky Jaime', track: 'Noche Urbana', streams: 1250000, rate: 0.004, period: 'Ene 2026', status: 'Pagado' },
    { artist: 'Luna Roja', track: 'Fuego Lento', streams: 890000, rate: 0.0038, period: 'Ene 2026', status: 'Pagado' },
    { artist: 'DJ Voltex', track: 'Bass Drop', streams: 2100000, rate: 0.0042, period: 'Ene 2026', status: 'Pendiente' },
    { artist: 'Sofía Montero', track: 'Amanecer', streams: 450000, rate: 0.0035, period: 'Ene 2026', status: 'Pendiente' },
    { artist: 'Neon Dreams', track: 'Electric Sky', streams: 320000, rate: 0.004, period: 'Ene 2026', status: 'Pendiente' },
  ];
  const totalRoyalties = royalties.reduce((s, r) => s + (r.streams * r.rate), 0);
  const paid = royalties.filter(r => r.status === 'Pagado').reduce((s, r) => s + (r.streams * r.rate), 0);
  el.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">♫ Royalties</div>
        <div class="section-sub">Periodo: Enero 2026 · ${royalties.length} artistas</div>
      </div>
    </div>
    <div class="kpi-grid" style="margin-bottom:20px">
      <div class="kpi-card purple"><span class="kpi-value">$${totalRoyalties.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span><span class="kpi-label">Total Regalías</span></div>
      <div class="kpi-card green"><span class="kpi-value">$${paid.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span><span class="kpi-label">Pagado</span></div>
      <div class="kpi-card yellow"><span class="kpi-value">$${(totalRoyalties - paid).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span><span class="kpi-label">Pendiente</span></div>
      <div class="kpi-card blue"><span class="kpi-value">${(royalties.reduce((s, r) => s + r.streams, 0) / 1000000).toFixed(1)}M</span><span class="kpi-label">Streams totales</span></div>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Artista</th><th>Track</th><th>Streams</th><th>Rate</th><th>Regalía</th><th>Periodo</th><th>Estado</th></tr></thead>
          <tbody>
            ${royalties.map(r => `<tr>
              <td style="font-weight:600">${r.artist}</td>
              <td>${r.track}</td>
              <td>${(r.streams / 1000).toFixed(0)}K</td>
              <td style="color:var(--text-muted)">$${r.rate}</td>
              <td style="font-weight:700;color:var(--green)">$${(r.streams * r.rate).toFixed(2)}</td>
              <td style="color:var(--text-muted)">${r.period}</td>
              <td><span class="badge badge-${r.status === 'Pagado' ? 'green' : 'yellow'}">${r.status}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Init ─────────────────────────────────────────────────────
async function initApp() {
  await loadDataFromSupabase();
  await loadNotifications();
  buildSidebar();
  navigate('dashboard');
  console.log('🟢 Wildtone Operations Suite initialized');
}
initApp();
