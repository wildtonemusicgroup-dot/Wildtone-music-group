/* ============================================================
   WILDTONE — Supabase Client Helper
   ============================================================ */

const SUPABASE_URL = 'https://spqhvzgfziilfoiekrkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcWh2emdmemlpbGZvaWVrcmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzgzMTYsImV4cCI6MjA4NzQ1NDMxNn0.HNW3kzM9po7beqZY6pL7wWDDM3qkhZZsOblwTfx_Jdc';

var _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Users ───────────────────────────────────
async function dbGetUsers() {
    const { data, error } = await _sb.from('users').select('*').order('created_at');
    if (error) console.error('dbGetUsers:', error);
    return data || [];
}

async function dbGetUserByEmail(email) {
    const { data, error } = await _sb.from('users').select('*').eq('email', email).single();
    if (error && error.code !== 'PGRST116') console.error('dbGetUserByEmail:', error);
    return data;
}

// ── Projects ────────────────────────────────
async function dbGetProjects() {
    const { data, error } = await _sb.from('projects').select('*').order('id');
    if (error) console.error('dbGetProjects:', error);
    return data || [];
}

async function dbInsertProject(project) {
    const { data, error } = await _sb.from('projects').insert(project).select().single();
    if (error) console.error('dbInsertProject:', error);
    return data;
}

async function dbUpdateProject(id, updates) {
    const { error } = await _sb.from('projects').update(updates).eq('id', id);
    if (error) console.error('dbUpdateProject:', error);
}

// ── Tasks ───────────────────────────────────
async function dbGetTasks() {
    const { data, error } = await _sb.from('tasks').select('*').order('id');
    if (error) console.error('dbGetTasks:', error);
    return data || [];
}

async function dbInsertTask(task) {
    const { data, error } = await _sb.from('tasks').insert(task).select().single();
    if (error) console.error('dbInsertTask:', error);
    return data;
}

async function dbUpdateTask(id, updates) {
    const { error } = await _sb.from('tasks').update(updates).eq('id', id);
    if (error) console.error('dbUpdateTask:', error);
}

// ── Deals ───────────────────────────────────
async function dbGetDeals() {
    const { data, error } = await _sb.from('deals').select('*').order('id');
    if (error) console.error('dbGetDeals:', error);
    return data || [];
}

async function dbInsertDeal(deal) {
    const { data, error } = await _sb.from('deals').insert(deal).select().single();
    if (error) console.error('dbInsertDeal:', error);
    return data;
}

// ── Expenses ────────────────────────────────
async function dbGetExpenses() {
    const { data, error } = await _sb.from('expenses').select('*').order('id');
    if (error) console.error('dbGetExpenses:', error);
    return data || [];
}

async function dbUpdateExpense(id, updates) {
    const { error } = await _sb.from('expenses').update(updates).eq('id', id);
    if (error) console.error('dbUpdateExpense:', error);
}

// ── Tickets ─────────────────────────────────
async function dbGetTickets() {
    const { data, error } = await _sb.from('tickets').select('*').order('created_at', { ascending: false });
    if (error) console.error('dbGetTickets:', error);
    return data || [];
}

async function dbGetTicketWithMessages(ticketId) {
    const { data: ticket, error: tErr } = await _sb.from('tickets').select('*').eq('id', ticketId).single();
    if (tErr) { console.error('dbGetTicket:', tErr); return null; }
    const { data: msgs, error: mErr } = await _sb.from('ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at');
    if (mErr) console.error('dbGetTicketMsgs:', mErr);
    ticket.messages = (msgs || []).map(m => ({ role: m.role, text: m.text, time: m.msg_time, author: m.author }));
    return ticket;
}

async function dbInsertTicket(ticket) {
    const { data, error } = await _sb.from('tickets').insert(ticket).select().single();
    if (error) console.error('dbInsertTicket:', error);
    return data;
}

async function dbUpdateTicket(ticketId, updates) {
    const { error } = await _sb.from('tickets').update(updates).eq('id', ticketId);
    if (error) console.error('dbUpdateTicket:', error);
}

async function dbInsertTicketMessage(msg) {
    const { data, error } = await _sb.from('ticket_messages').insert(msg).select().single();
    if (error) console.error('dbInsertTicketMsg:', error);
    return data;
}

// ── Notifications ───────────────────────────
async function dbGetNotifications() {
    const { data, error } = await _sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) console.error('dbGetNotifications:', error);
    return data || [];
}

async function dbInsertNotification(notif) {
    const { data, error } = await _sb.from('notifications').insert(notif).select().single();
    if (error) console.error('dbInsertNotif:', error);
    return data;
}

async function dbUpdateNotification(id, updates) {
    const { error } = await _sb.from('notifications').update(updates).eq('id', id);
    if (error) console.error('dbUpdateNotif:', error);
}

async function dbMarkAllNotificationsRead() {
    const { error } = await _sb.from('notifications').update({ unread: false }).eq('unread', true);
    if (error) console.error('dbMarkAllRead:', error);
}

// ── Chat ────────────────────────────────────
async function dbGetChatMessages(channel) {
    const { data, error } = await _sb.from('chat_messages').select('*').eq('channel', channel).order('created_at');
    if (error) console.error('dbGetChat:', error);
    return data || [];
}

async function dbGetDMMessages(dmKey) {
    const { data, error } = await _sb.from('chat_messages').select('*').eq('dm_key', dmKey).order('created_at');
    if (error) console.error('dbGetDM:', error);
    return data || [];
}

async function dbInsertChatMessage(msg) {
    const { data, error } = await _sb.from('chat_messages').insert(msg).select().single();
    if (error) console.error('dbInsertChat:', error);
    return data;
}

// ── Time Entries ────────────────────────────
async function dbGetTimeEntries() {
    const { data, error } = await _sb.from('time_entries').select('*').order('entry_date', { ascending: false });
    if (error) console.error('dbGetTime:', error);
    return data || [];
}

// ── Full data load (backwards-compatible with app.js) ────
async function dbLoadAllData() {
    const [tasks, projects, deals, expenses, timeEntries, tickets] = await Promise.all([
        dbGetTasks(), dbGetProjects(), dbGetDeals(), dbGetExpenses(), dbGetTimeEntries(), dbGetTickets()
    ]);

    // Load messages for each ticket
    for (const t of tickets) {
        const { data: msgs } = await _sb.from('ticket_messages').select('*').eq('ticket_id', t.id).order('created_at');
        t.messages = (msgs || []).map(m => ({ role: m.role, text: m.text, time: m.msg_time, author: m.author }));
        // Map DB columns to JS property names expected by the app
        t.from = t.from_name;
        t.date = t.ticket_date;
        t.lastReply = t.last_reply;
        t.assignedTo = t.assigned_dept;
        t.assignedUser = t.assigned_user;
    }

    return {
        tasks: tasks.map(t => ({
            id: t.id, title: t.title, status: t.status, priority: t.priority,
            assigned: t.assigned_to, due: t.due_date, project: t.project, labels: t.labels || []
        })),
        projects: projects.map(p => ({
            id: p.id, name: p.name, status: p.status, owner: p.owner,
            progress: p.progress, tasks: p.tasks_count, due: p.due_date
        })),
        deals: deals.map(d => ({
            id: d.id, title: d.title, account: d.account, value: Number(d.value),
            currency: d.currency, stage: d.stage, owner: d.owner, status: d.status
        })),
        expenses: expenses.map(e => ({
            id: e.id, concept: e.concept, vendor: e.vendor, amount: Number(e.amount),
            currency: e.currency, date: e.expense_date, status: e.status,
            category: e.category, project: e.project
        })),
        timeEntries: timeEntries.map(t => ({
            id: t.id, user: t.user_name, date: t.entry_date, checkIn: t.check_in,
            checkOut: t.check_out, worked: t.worked, breaks: t.breaks, status: t.status
        })),
        tickets: tickets
    };
}

console.log('🟢 Supabase client initialized — ' + SUPABASE_URL);
