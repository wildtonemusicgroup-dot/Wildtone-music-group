# WILDTONE MUSIC GROUP
## Documento de Buenas Prácticas (Operación + Desarrollo + Seguridad)
**Producto:** Wildtone Operations Suite (Web App)  
**Versión:** 1.0  
**Fecha:** 18-Feb-2026  
**Stack:** Supabase (Auth/Postgres/Storage/RLS) + Web moderna (Next.js recomendado)

---

## 1) Propósito del documento
Definir **buenas prácticas** para asegurar que la plataforma:
- sea **segura** (roles/permisos + RLS + auditoría),
- sea **confiable** (reglas de negocio consistentes),
- sea **escalable** (estructura clara),
- y sea **usable** (operación real de equipos y control).

Este documento aplica a:
- Equipo de desarrollo
- Administradores (Wildtone)
- Supervisores y finanzas
- Todos los usuarios internos (empleados)

---

## 2) Buenas prácticas de gobierno y operación (empresa)

### 2.1 Roles claros y mínimo privilegio
- Otorgar solo los permisos necesarios (“Least Privilege”).
- Separar roles críticos: **Finanzas** y **Admin** no deben mezclarse sin necesidad.
- Evitar “roles universales”; si alguien necesita acceso puntual, darlo por tiempo limitado.

**Regla recomendada:**  
- Staff: solo lo propio (mis tareas/mi tiempo/mis gastos si aplica)  
- Supervisor: ve y aprueba equipo  
- Finanzas: ve todo finanzas, aprueba, exporta  
- Admin: configura y audita

### 2.2 Procesos estandarizados (SOP)
Crear SOP (procedimientos) para:
- Registrar gastos y adjuntar evidencia.
- Solicitar correcciones de tiempo.
- Cambiar estado de pagos (Submitted → Approved → Paid).
- Crear y asignar tareas y deadlines.
- Flujo mínimo de CRM (lead → deal → actividades → cierre).

### 2.3 Cultura de “todo queda registrado”
- Toda decisión debe quedar en la plataforma: comentarios en tareas, notas en CRM, razón de rechazo en finanzas/tiempo.
- Evitar aprobaciones por WhatsApp o verbal sin registro.
- Usar siempre el campo “motivo” (reason) cuando se rechaza o se corrige.

### 2.4 Cierres por período (locks)
- Horario: cerrar (lock) semanal o quincenal para evitar cambios tardíos.
- Finanzas: cierre mensual para gastos/pagos.
- Desbloqueos: solo Admin y con razón obligatoria + auditoría.

---

## 3) Buenas prácticas de seguridad (Supabase + App)

### 3.1 RLS como regla, no como opción
- Toda tabla con datos sensibles debe tener:
  - `org_id`
  - RLS habilitado
  - Policies específicas por operación (SELECT/INSERT/UPDATE/DELETE)

**Nunca** confiar en filtros del frontend para seguridad.

### 3.2 Evitar lógica crítica en frontend
Cambios sensibles deben ejecutarse en **RPC / Edge Functions**:
- aprobar/rechazar gasto/pago
- marcar como pagado
- check-in/out
- cerrar jornada y recalcular minutos
- lock/unlock periodos
- cambios de rol/permisos

### 3.3 Auditoría obligatoria en acciones críticas
Registrar en logs:
- quién hizo el cambio
- qué cambió (antes/después)
- cuándo
- por qué (reason si aplica)
- módulo (finance/time/admin)

### 3.4 Política de adjuntos (evidencia)
- Gastos y pagos: evidencia obligatoria según categoría (configurable).
- No permitir “Paid” sin evidencia si la regla lo exige.
- Limitar tipos de archivo permitidos (pdf/jpg/png).
- Escaneo/validación básica (tamaño, mime).

### 3.5 Manejo de secretos y llaves
- Nunca exponer service-role key en frontend.
- Variables de entorno en servidor.
- Rotación de llaves si hay incidente.

---

## 4) Buenas prácticas de diseño de base de datos

### 4.1 Normalización con sentido
- Evitar duplicar datos de contacto: usar `crm_accounts` y `crm_contacts`.
- Relacionar finanzas con CRM/proyectos cuando aplique (para reportes).

### 4.2 Soft delete (archivado)
- Preferir `is_archived = true` en lugar de borrar.
- Mantener integridad referencial y auditoría.

### 4.3 Estados bien definidos (state machines)
Definir estados permitidos y transiciones, por módulo:

**Finanzas**
- Draft → Submitted → Approved → Paid
- Draft → Submitted → Rejected
- Approved → Rejected (solo Admin, con razón y log)

**Horario**
- Entry Open → Closed
- Corrección Pending → Approved/Rejected
- Periodo Open → Locked

**CRM**
- Deal Open → Won/Lost
- Etapas con campos obligatorios

**Tareas**
- Todo/Doing/Review/Done (ejemplo)
- Archivar solo cuando Done o cancelada

### 4.4 Índices y performance
- Index en:
  - `org_id`
  - `assigned_to`, `due_date`, `status` (tasks)
  - `stage_id`, `owner_id` (deals)
  - `expense_date`, `status`, `category_id` (expenses)
  - `user_id`, `entry_date` (time_entries)

---

## 5) Buenas prácticas de UI/UX (experiencia real de equipo)

### 5.1 “Mobile-first” donde duele (Horario)
- Botones grandes: Check-in, Pausa, Check-out.
- Mostrar estado actual: “en jornada”, “en pausa”, tiempo acumulado hoy.

### 5.2 Formularios con validación y guardado seguro
- Validación en front + validación server (RPC).
- Autoguardado (fase 2) en descripciones largas.
- Confirmación antes de acciones irreversibles.

### 5.3 Visibilidad y trazabilidad
Cada entidad debe tener:
- “Historial / actividad”
- “Quién creó / quién editó”
- “Última actualización”
- “Adjuntos”

### 5.4 Tablas útiles
- Filtros, búsqueda, export
- Columnas configurables
- Estados con badges claros

---

## 6) Buenas prácticas de finanzas (operación)

### 6.1 Política de categorías y centros de costo
- Categorías claras y estables (no crear 50 variantes).
- Centros de costo: Publishing, Label, Marketing, Legal, Admin, IT, etc.
- Usar proyectos como “dimensión” adicional cuando aplique.

### 6.2 Flujo de aprobación por umbrales (recomendado)
Ejemplo:
- < $200: 1 aprobación (Supervisor)
- $200–$1,000: Supervisor + Finanzas
- > $1,000: Finanzas + Admin

### 6.3 Evidencia obligatoria y consistencia
- Todo gasto/pago debe tener comprobante.
- El concepto debe ser claro: “Spotify Campaign Feb 2026”, no “pago”.

### 6.4 Prohibición de editar después de Paid
- Si se necesita corrección: crear ajuste o nota de corrección con auditoría.

---

## 7) Buenas prácticas de horario (asistencia)

### 7.1 Reglas de jornada claras
- Definir:
  - horas estándar
  - tolerancia de tardanza
  - pausas mínimas/máximas
  - overtime
- Aplicar de forma consistente.

### 7.2 Correcciones con evidencia (si aplica)
- Corrección debe incluir:
  - qué se corrige
  - por qué
  - evidencia (opcional según política)

### 7.3 Locks por periodo
- Cerrar semana/mes para evitar “re-escritura” histórica.
- Unlock solo Admin con razón.

---

## 8) Buenas prácticas de CRM

### 8.1 Pipeline con definición real
- Cada etapa debe decir:
  - qué significa
  - qué campo exige (monto, fecha cierre, contacto, próxima actividad)

### 8.2 “Next step” obligatorio
- Todo deal abierto debe tener una próxima acción (actividad) con fecha.

### 8.3 Contactos limpios
- Evitar duplicados.
- Estándares: nombre completo, email, teléfono, rol.

---

## 9) Buenas prácticas para Tareas/Proyectos

### 9.1 Estandarizar prioridades y estados
- Prioridad: Low/Medium/High/Urgent
- Estados fijos (evitar inventar nuevos sin aprobación)

### 9.2 Definición de “Done”
- Una tarea está “Done” solo si:
  - entregable completado
  - link o evidencia adjunta si aplica
  - checklist final ok

### 9.3 Reglas de asignación
- Toda tarea crítica debe tener:
  - asignado
  - fecha límite
  - descripción clara

---

## 10) Buenas prácticas del Agente AI (Employee Assistant)

### 10.1 Principios
- El agente **no manda**, **asiste**.
- Default: **solo lectura**.
- Acciones: solo con **confirmación** y **permisos**.

### 10.2 Seguridad obligatoria
- Nunca bypass de RLS.
- Enmascarar datos no autorizados.
- Registrar logs de conversación + acciones.

### 10.3 Respuestas útiles
- Responder con:
  - resumen
  - lista de resultados
  - botones (“abrir tarea”, “crear reporte”)

### 10.4 Reglas anti-alucinación
- Si no está seguro, el agente debe decir:
  - “No tengo ese dato en la plataforma”
  - “Necesito que lo registres o confirmes”

---

## 11) Buenas prácticas de desarrollo (equipo técnico)

### 11.1 Versionado y ambientes
- Ambientes: `dev`, `staging`, `prod`
- Migraciones versionadas (SQL)
- Semillas (seed) para catálogos (categorías, etapas CRM)

### 11.2 Testing mínimo
- Pruebas E2E de flujos críticos:
  - aprobar gasto → paid
  - check-in → pausa → check-out
  - corrección → aprobación
  - creación y cierre de tareas
  - movimiento de deal con campos obligatorios

### 11.3 Observabilidad
- Logging de edge functions
- Error tracking (Sentry)
- Métricas básicas (latencia, errores por endpoint)

### 11.4 Estándares de código
- Tipado estricto
- Validaciones con schemas (Zod)
- Reutilización de componentes y patrones

---

## 12) Checklist de auditoría mensual (recomendado)
- % gastos con evidencia
- pagos “Paid” sin adjunto (debe ser 0)
- jornadas sin check-out (debe ser 0 o justificadas)
- correcciones aprobadas sin motivo (debe ser 0)
- deals abiertos sin próxima actividad (debe ser mínimo)
- tareas vencidas por equipo

---

## 13) Reglas rápidas (para pegar en el onboarding del equipo)
1) Si no está en la plataforma, **no existe**.
2) No se aprueban gastos sin evidencia.
3) No se editan pagos/gastos después de **Paid**.
4) Check-in/out diario obligatorio o justificable.
5) Correcciones de tiempo siempre con motivo.
6) Todo deal debe tener “próximo paso”.
7) Tareas críticas: asignado + fecha + detalle.

---
