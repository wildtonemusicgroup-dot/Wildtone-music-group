# WILDTONE MUSIC GROUP
## Especificación y Requerimientos (SRS / PRD Técnico) — EXTENDIDO
**Producto:** Wildtone Operations Suite (Web App)  
**Versión:** 3.0 (Blueprint / Full Spec)  
**Fecha:** 18-Feb-2026  
**Stack obligatorio:** Supabase (Auth + Postgres + Storage + RLS)  
**Frontend recomendado:** Next.js (React) + UI kit moderno (ej. shadcn/ui)  

---

## 0. Resumen ejecutivo
Wildtone requiere una plataforma web unificada para **operaciones internas** que resuelva:

1) **Gestión de tareas y proyectos** (operación diaria, publishing, marketing, legal, etc.).  
2) **CRM** (clientes, aliados, proveedores, artistas/partners, seguimiento comercial).  
3) **Control financiero operativo** (registro y reporte de pagos y gastos con aprobaciones y evidencia).  
4) **Control de horario / asistencia / productividad** (entradas, salidas, pausas, tiempo trabajado, aprobación y reportes).  
5) **Agente AI interno** para soporte a empleados y automatización controlada.

El sistema debe ser **moderno, rápido, auditable y seguro**, con **roles/permisos** y **Row Level Security (RLS)** usando Supabase.

---

## 1. Objetivos y resultados esperados

### 1.1 Objetivos del negocio
- Centralizar la operación (antes en Excel/WhatsApp/Notas/Docs).
- Reducir pérdida de información y duplicidad de datos.
- Aumentar control (finanzas, tiempo, tareas) con auditoría.
- Mejorar productividad y visibilidad por equipo/proyecto.

### 1.2 Objetivos del producto (medibles)
- Reducir 50% el tiempo de seguimiento de tareas.
- 100% de gastos y pagos con evidencia y responsable.
- 100% de jornadas con entrada/salida o justificación.
- Reportes mensuales por equipo sin manipulación manual.

### 1.3 Principios de diseño
- **Mobile-first** para fichaje y registro rápido.
- **Acción en 2 clics**: Check-in/out, Pausa, Registrar gasto, Crear tarea.
- **Auditoría obligatoria** en acciones críticas (finanzas/horario/permisos).
- **Configurabilidad** sin tocar código (categorías, etapas CRM, reglas de jornada).

---

## 2. Alcance del sistema

### 2.1 Incluido (core)
- Autenticación + usuarios (invitaciones).
- Roles, permisos por módulo (RBAC) + RLS en Supabase.
- Tareas/Proyectos (Kanban, lista, calendario, adjuntos, comentarios, actividad).
- CRM (pipeline, cuentas, contactos, deals, actividades, reportes).
- Finanzas operativas (gastos/pagos, categorías, adjuntos, aprobaciones, reportes).
- Control horario (entrada/salida/pausas, correcciones, locks, reportes).
- Notificaciones in-app + email (configurable).
- Reportes + exportaciones (CSV/Excel; PDF opcional fase 2).
- Panel ejecutivo (dashboard KPI).
- Logs de auditoría.
- Agente AI interno (chat + acciones controladas).

### 2.2 Excluido (por ahora)
- ERP contable completo (asientos, impuestos, conciliación bancaria automática).
- Nómina completa (payroll).
- App móvil nativa (opcional PWA en fase 3).

---

## 3. Actores, roles y permisos

### 3.1 Roles propuestos (configurables)
- **Owner/Admin (Super Admin)**: acceso total, configuración, permisos.
- **Operations Manager**: tareas/proyectos/horario equipos.
- **Finance Manager**: pagos/gastos, aprobaciones y reportes.
- **Team Lead/Supervisor**: aprueba tiempos, productividad y tareas del equipo.
- **Staff/Contributor**: tareas, tiempo, gastos (si habilitado).
- **CRM/Sales**: leads/deals/actividades.
- **Read-only/Auditor**: solo lectura de reportes.

### 3.2 Permisos (RBAC) — ejemplo
Cada módulo: `view`, `create`, `edit`, `delete`, `approve`, `export`, `manage_settings`.

- **Tasks:** `tasks.view_*`, `tasks.create`, `tasks.edit`, `tasks.delete`, `tasks.assign`
- **CRM:** `crm.view_*`, `crm.create`, `crm.edit`, `crm.delete`, `crm.manage_pipeline`, `crm.export`
- **Finance:** `finance.view_*`, `finance.create`, `finance.edit`, `finance.approve`, `finance.mark_paid`, `finance.export`
- **Time:** `time.view_*`, `time.checkin`, `time.checkout`, `time.request_correction`, `time.approve_correction`, `time.lock_period`
- **Admin:** `admin.manage_users`, `admin.manage_roles`, `admin.audit_view`

### 3.3 Reglas globales de acceso
- Ningún usuario ve datos fuera de su **organización**.
- Team Lead ve su **equipo** (salvo permiso `view_all`).
- Finanzas y Horario: **bloqueos post-aprobación** (solo Admin desbloquea, con auditoría).

---

## 4. Requerimientos funcionales (FR) detallados

### 4A. Autenticación y gestión de usuarios (Supabase Auth)
- **FR-AUTH-01:** Invitaciones por Admin (email, rol, equipo).
- **FR-AUTH-02:** Login email+password.
- **FR-AUTH-03:** Recuperación de contraseña.
- **FR-AUTH-04:** Gestión de sesión (refresh/logout).
- **FR-AUTH-05:** Perfil editable (nombre, foto, teléfono) según permisos.
- **FR-AUTH-06:** Desactivar usuario sin borrar histórico.
- **FR-AUTH-07:** Auditoría de cambios de rol/permisos.

### 4B. Dashboard
- **FR-DASH-01:** KPIs por rol: tareas, CRM, finanzas, horario.
- **FR-DASH-02:** Quick actions (+tarea, +gasto, check-in/out, agente).
- **FR-DASH-03:** Feed de actividad por módulo.

### 4C. Tareas y Proyectos
**Entidades:** proyectos, tareas, checklist, comentarios, adjuntos, etiquetas, actividad.

- **FR-TASK-01:** Crear/editar tarea (titulo, desc, estado, prioridad, asignado, due date, labels, adjuntos, checklist).
- **FR-TASK-02:** Vistas: lista, kanban, calendario, “Mi trabajo”.
- **FR-TASK-03:** Acciones: cambiar estado, reasignar, duplicar, archivar.
- **FR-TASK-04:** Filtros avanzados.
- **FR-TASK-05:** Automatizaciones (fase 2): recordatorios, SLA.
- **FR-TASK-06:** Auditoría de cambios (actividad).

### 4D. CRM
**Entidades:** accounts, contacts, leads, deals, activities, stages, attachments.

- **FR-CRM-01:** Pipeline configurable (etapas, probabilidad, campos obligatorios).
- **FR-CRM-02:** Gestión de leads y deals (owner, source, interés, prioridad).
- **FR-CRM-03:** Perfil 360 de cuenta (timeline, documentos, tareas, deals).
- **FR-CRM-04:** Actividades con recordatorios y resultados.
- **FR-CRM-05:** Reportes CRM (conversión, forecast, actividad).
- **FR-CRM-06:** Export CSV/Excel (import fase 2).

### 4E. Finanzas operativas (Pagos y Gastos)
**Entidades:** gastos, pagos, categorías, vendors, adjuntos, aprobaciones, auditoría.

- **FR-FIN-01:** Registrar gasto (monto, moneda, fecha, categoría, proveedor, método, centro costo, proyecto, adjuntos).
- **FR-FIN-02:** Registrar pago programado (beneficiario, vencimiento, evidencia).
- **FR-FIN-03:** Flujo: Draft → Submitted → Approved → Paid / Rejected.
- **FR-FIN-04:** Umbrales y reglas (doble aprobación, adjunto obligatorio, etc.).
- **FR-FIN-05:** Reportes (por categoría, periodo, centro costo, proveedor, proyecto).
- **FR-FIN-06:** Export CSV/Excel.
- **FR-FIN-07:** Auditoría (cambios críticos).

### 4F. Control horario (Asistencia)
**Entidades:** time entries, breaks, corrections, rules, locks, auditoría.

- **FR-TIME-01:** Check-in (entrada).
- **FR-TIME-02:** Check-out (salida).
- **FR-TIME-03:** Pausas (start/end) múltiples.
- **FR-TIME-04:** Cálculo: `worked = (out - in) - pausas`.
- **FR-TIME-05:** Prevención: no 2 jornadas abiertas, no check-out con pausa activa.
- **FR-TIME-06:** Correcciones: solicitud + aprobación supervisor.
- **FR-TIME-07:** Aprobación semanal/mensual + lock de periodo.
- **FR-TIME-08:** Reportes (usuario/equipo, tardanzas, ausencias, overtime).
- **FR-TIME-09:** Export CSV/Excel.
- **FR-TIME-10:** Reglas configurables (jornada, tolerancia, pausas, overtime).

### 4G. Notificaciones
- **FR-NOTIF-01:** Centro de notificaciones in-app.
- **FR-NOTIF-02:** Email opcional por eventos (asignación, vencimientos, aprobaciones, check-out faltante).
- **FR-NOTIF-03:** Preferencias por usuario.

---

## 5. Requerimientos no funcionales (NFR)

### 5.1 UI/UX
- Estética corporate moderna, consistente.
- Mobile-first para horario.
- Accesibilidad base (contraste, teclado).

### 5.2 Rendimiento
- Carga inicial < 3s (promedio).
- Paginación server-side, índices DB.
- Queries optimizadas.

### 5.3 Seguridad
- RLS obligatorio en tablas con `org_id`.
- Separación de permisos.
- Transiciones críticas con RPC/Edge Functions.
- Auditoría persistente.

### 5.4 Resiliencia
- Backups y retención.
- Error tracking (Sentry recomendado).

---

## 6. Arquitectura técnica

### 6.1 Frontend recomendado
- Next.js + React
- UI kit: shadcn/ui (o similar)
- Data fetching: TanStack Query
- Forms: React Hook Form + Zod

### 6.2 Backend Supabase
- Postgres DB
- Auth
- Storage (adjuntos)
- RLS policies
- Edge Functions / RPC para lógica crítica

### 6.3 Storage (archivos)
Buckets sugeridos:
- `task_attachments`
- `finance_receipts`
- `payment_proofs`
- `crm_documents`

---

## 7. ESPECIFICACIÓN COMPLETA DE PANTALLAS (Screen Spec)

### 7.1 Login / Reset
- Login: email, password, reset
- Reset: email → link → nueva contraseña

### 7.2 Navegación
Sidebar:
- Dashboard, Tareas, Proyectos, CRM, Finanzas, Horario, Reportes, Agente, Configuración, Admin

Topbar:
- Notificaciones, Perfil, (búsqueda global fase 2)

### 7.3 Dashboard
- KPIs (cards) por rol
- Quick actions (botones)
- Feed de actividad

### 7.4 Tareas
- Lista con filtros y acciones
- Kanban drag & drop
- Detalle con tabs: detalles, checklist, comentarios, adjuntos, actividad

### 7.5 Proyectos
- Lista con progreso
- Detalle con tareas y (opcional) finanzas relacionadas

### 7.6 CRM
- Pipeline deals (kanban)
- Accounts list
- Perfil 360
- Deal detalle + actividades

### 7.7 Finanzas
- Gastos lista + detalle + aprobaciones
- Pagos lista + detalle
- Bandeja de aprobaciones

### 7.8 Horario
- Fichaje rápido (mobile)
- Mis registros (calendario/tabla)
- Solicitud de corrección
- Aprobación supervisor + lock periodo
- Reportes exportables

### 7.9 Reportes
- Hub por módulos con filtros y export

### 7.10 Agente AI
- Chat UI + sugerencias rápidas
- Tarjetas de resultados y botones
- Confirmación obligatoria para acciones
- Historial y logs (Admin)

### 7.11 Configuración y Admin
- Categorías, pipeline, reglas jornada, tipos pausas, centros costo
- Usuarios, roles, permisos, auditoría, settings del agente

---

## 8. DICCIONARIO DE DATOS (Data Dictionary)

> Convención: todas las tablas incluyen:
`id uuid PK`, `org_id uuid`, `created_at timestamptz`, `created_by uuid`, `updated_at timestamptz`, `updated_by uuid`, `is_archived boolean` (si aplica).

### 8.1 Organización / Usuarios
#### organizations
- id (uuid)
- name (text, required)
- created_at (timestamptz)

#### profiles
- id (uuid, = auth.users.id)
- org_id (uuid, required)
- full_name (text, required)
- email (text, required)
- is_active (boolean, default true)
- created_at (timestamptz)

#### teams
- id, org_id, name(required), lead_user_id (opt)

#### team_members
- id, org_id, team_id (required), user_id (required), joined_at (default now)

### 8.2 Tareas / Proyectos
#### projects
- id, org_id
- name (required)
- status (active/paused/done/archived)
- owner_id (required)
- start_date (date, opt)
- end_date (date, opt)
- client_account_id (uuid, opt)
- created_at

#### tasks
- id, org_id
- project_id (uuid, opt)
- title (text, required)
- description (text, opt)
- status (text, required)
- priority (text, required)
- assigned_to (uuid, opt)
- due_date (date, opt)
- labels (jsonb, opt)
- estimate_minutes (int, opt)
- completed_at (timestamptz, opt)
- is_archived (boolean default false)

#### task_comments
- id, org_id, task_id, body, created_by, created_at

#### task_attachments
- id, org_id, task_id, file_url, file_name, mime_type, size_bytes, uploaded_by, uploaded_at

#### task_activity_log
- id, org_id, task_id, action, field, old_value(jsonb), new_value(jsonb), changed_by, changed_at

### 8.3 CRM
#### crm_accounts
- id, org_id
- type (client/vendor/partner/artist/other)
- name (required)
- industry (opt)
- country (opt)
- owner_id (opt)
- tags (jsonb, opt)
- notes (opt)

#### crm_contacts
- id, org_id, account_id
- full_name (required), email/phone/position (opt), notes (opt)

#### crm_pipeline_stages
- id, org_id
- name (required)
- stage_order (int)
- probability (0-100)
- required_fields (jsonb, opt)

#### crm_deals
- id, org_id
- account_id (opt)
- contact_id (opt)
- stage_id (required)
- title (required)
- value (numeric, opt)
- currency (text, required)
- probability (int, opt)
- expected_close_date (date, opt)
- owner_id (required)
- status (open/won/lost)

#### crm_activities
- id, org_id
- type (call/email/meeting/note/task)
- deal_id/account_id (opt)
- due_at (opt), done_at (opt)
- notes (opt)

### 8.4 Finanzas
#### finance_categories
- id, org_id, name(required), parent_id(opt), active(boolean default true)

#### finance_vendors
- id, org_id, name(required), account_id(opt), notes(opt)

#### finance_expenses
- id, org_id
- vendor_id(opt)
- category_id(required)
- amount(required)
- currency(required)
- expense_date(required)
- status(Draft/Submitted/Approved/Paid/Rejected)
- cost_center(required)
- project_id(opt)
- notes(opt)
- approved_by/approved_at(opt)
- paid_at(opt)

#### finance_payments
- id, org_id
- beneficiary(required)
- concept(required)
- amount(required)
- currency(required)
- due_date(required)
- status(Pending/Approved/Paid/Rejected)
- related_expense_id(opt)
- notes(opt)

#### finance_attachments
- id, org_id, entity_type(expense/payment), entity_id, file_url, file_name, uploaded_by, uploaded_at

#### finance_approvals
- id, org_id, entity_type, entity_id, step, status, reviewed_by, reviewed_at, reason(required if rejected)

#### finance_audit_log
- id, org_id, entity_type, entity_id, field, old_value, new_value, changed_by, changed_at

### 8.5 Control horario
#### time_rules
- id, org_id
- standard_minutes (int)
- late_grace_minutes (int)
- break_required_minutes (int)
- overtime_after_minutes (int)
- workdays (jsonb)
- timezone (text)

#### time_entries
- id, org_id
- user_id (required)
- entry_date (required)
- check_in_at (required)
- check_out_at (opt)
- status (Open/Closed)
- worked_minutes (int, opt)
- break_minutes (int, opt)
- approval_status (Pending/Approved/Rejected)
- approved_by/approved_at (opt)

#### time_breaks
- id, org_id, time_entry_id
- break_type, start_at, end_at(opt), minutes(opt)

#### time_corrections
- id, org_id, time_entry_id
- requested_by
- requested_changes(jsonb, required)
- reason(required)
- status(Pending/Approved/Rejected)
- reviewed_by/reviewed_at(opt)

#### time_period_locks
- id, org_id, period_start, period_end, locked_by, locked_at

#### time_audit_log
- id, org_id, entity_type, entity_id, field, old_value, new_value, changed_by, changed_at

### 8.6 Notificaciones
#### notifications
- id, org_id, user_id, type, payload(jsonb), created_at, read_at(opt)

#### notification_preferences
- id, org_id, user_id, email_enabled, inapp_enabled, rules(jsonb)

---

## 9. RPC / Edge Functions (Lógica server-side obligatoria)

### 9.1 Finanzas
- `submit_expense(expense_id)`
- `approve_expense(expense_id, decision, reason?)`
- `mark_expense_paid(expense_id, proof_file_url)`
- `unlock_expense(expense_id, reason)` (solo Admin)
- `approve_payment(payment_id, decision, reason?)`
- `mark_payment_paid(payment_id, proof_file_url)`

### 9.2 Horario
- `time_check_in()`
- `time_start_break(time_entry_id, break_type)`
- `time_end_break(time_entry_id)`
- `time_check_out(time_entry_id)`
- `request_time_correction(time_entry_id, requested_changes, reason)`
- `review_time_correction(correction_id, decision, reason?)`
- `lock_time_period(period_start, period_end)`
- `unlock_time_period(lock_id, reason)` (solo Admin)

### 9.3 Tareas
- `change_task_status(task_id, new_status)`
- `assign_task(task_id, user_id)`

### 9.4 CRM
- `move_deal_stage(deal_id, stage_id)`

---

## 10. AGENTE AI INTERNO (Employee Assistant)

### 10.1 Objetivo
Asistente interno para responder preguntas y ayudar a ejecutar acciones permitidas:
- “¿Qué tareas tengo hoy?”
- “¿Cuántas horas trabajé este mes?”
- “Muéstrame pagos pendientes”
- “Crea una tarea para mañana…”
- “Genera un reporte de gastos por categoría”

### 10.2 Capacidades
**A) Consultas (Read)**
- tareas/proyectos, CRM, finanzas, horario, KB interna.

**B) Acciones (Write) — SOLO con confirmación**
- crear tareas/actividades, registrar gasto en Draft, iniciar fichaje, exportar reportes, etc.

### 10.3 Restricciones de seguridad (obligatorias)
1) Respeta RLS y permisos (nunca bypass).
2) Default read-only; acciones habilitadas por Admin.
3) Confirmación obligatoria antes de ejecutar.
4) Logs de conversaciones y acciones.
5) Enmascarar datos no autorizados (finanzas).

### 10.4 Tablas del agente
#### ai_conversations
- id, org_id, user_id, title(opt), created_at

#### ai_messages
- id, org_id, conversation_id, role(user/assistant/system), content, created_at

#### ai_actions
- id, org_id, conversation_id, requested_by
- action_type, action_payload(jsonb)
- status(proposed/confirmed/executed/failed/cancelled)
- executed_at(opt), result(jsonb opt)

#### ai_settings
- id, org_id
- actions_enabled(boolean)
- allowed_actions(jsonb)
- retention_days(int)
- kb_enabled(boolean)
- kb_source(text)

### 10.5 Knowledge Base (opcional recomendado)
#### kb_articles
- id, org_id
- title, content
- tags(jsonb)
- visibility(all/finance_only/hr_only)
- updated_at

### 10.6 Criterios de aceptación del agente
- Responde consultas comunes sin exponer datos no autorizados.
- Acciones requieren confirmación.
- Acciones quedan registradas en `ai_actions`.
- Respeta RLS/roles siempre.

---

## 11. RLS (Supabase) — reglas mínimas
- Todas las tablas con `org_id`.
- `SELECT`: permitido si `record.org_id = user.org_id` y rol lo permite.
- `INSERT`: `org_id` debe coincidir con user.
- `UPDATE`: bloqueado si registro está `Approved/Paid/Locked` (salvo Admin).
- `DELETE`: preferible soft delete (`is_archived=true`) con auditoría.

---

## 12. Reportes y exportaciones

### 12.1 Horario
- horas por usuario/equipo/periodo
- tardanzas, ausencias, overtime
- pausas promedio
- export CSV/Excel

### 12.2 Finanzas
- gastos por categoría/periodo/centro costo/proveedor/proyecto
- pagos pendientes vs pagados
- export CSV/Excel

### 12.3 Tareas
- completadas por usuario
- vencidas por proyecto
- productividad por equipo

### 12.4 CRM
- deals por etapa
- conversión por etapa
- forecast
- actividad por owner

---

## 13. Auditoría (obligatoria)
- Logs en finanzas, horario, roles/permisos y acciones del agente.
- No se borran logs (solo lectura por Admin/Auditor).
- Cada log incluye: quién, cuándo, campo, antes/después, módulo.

---

## 14. QA / Testing (mínimo)
- E2E: login, tareas, finanzas (approve->paid), horario (checkin->break->checkout), corrección y aprobación.
- Casos borde: check-in duplicado, check-out con pausa activa, editar aprobado, lock periodo.

---

## 15. Roadmap recomendado
### Fase 1 (MVP)
- Auth + roles + RLS
- Tareas/proyectos
- Horario
- Finanzas base
- Dashboard

### Fase 2
- CRM completo + automatizaciones
- Reportes avanzados + locks mensuales
- Auditoría extendida + PDF opcional

### Fase 3
- Integraciones (calendar/email/slack/whatsapp)
- Presupuestos por proyecto/categoría
- PWA para fichaje

---

## 16. Definition of Done
- Responsive (desktop/mobile).
- RLS activo en tablas críticas.
- Permisos por rol funcionando.
- Auditoría en acciones críticas.
- Exportaciones funcionales.
- Agente operativo con confirmación + logs.

---
