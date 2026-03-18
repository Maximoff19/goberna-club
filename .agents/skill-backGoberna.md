# SKILL: Backend de Goberna Club

## Propósito

Esta skill define cómo Codex debe diseñar, implementar y evolucionar el backend de Goberna Club.

El backend NO debe tratarse como un CRUD genérico. Debe modelar reglas reales de negocio, estados editoriales, permisos, validación, moderación y trazabilidad.

Esta skill está orientada a una primera implementación seria del backend, priorizando velocidad de ejecución, mantenibilidad, claridad arquitectónica y escalabilidad progresiva.

---

## Restricción principal

### Pagos quedan fuera por ahora

Aunque el sistema debe estar preparado arquitectónicamente para integrar pagos en el futuro, Codex tiene prohibido implementar en esta etapa:

- pasarelas de pago
- checkout
- suscripciones activas
- webhooks de cobro
- facturación
- wallets
- pricing engines
- descuentos o cupones
- lógica financiera

Sí se permite únicamente:

- dejar interfaces, módulos vacíos o stubs bien documentados para una futura integración
- reservar nombres de dominio como `billing` o `subscriptions` si ayuda al diseño general
- documentar cómo se integraría más adelante sin construirlo

Codex NO debe crear endpoints funcionales de pago en esta fase.

---

## Stack obligatorio recomendado

Codex debe trabajar con esta base técnica salvo que el proyecto ya tenga otra decisión explícita tomada:

- Lenguaje: TypeScript
- Framework: NestJS
- Base de datos: MySQL 8+
- ORM: Prisma
- Cache/colas: Redis + BullMQ cuando sea necesario
- Storage: S3 o compatible S3
- Documentación: Swagger / OpenAPI
- Auth: JWT con refresh token seguro
- Validación: class-validator / class-transformer o equivalente compatible con NestJS
- Testing: unit tests + integration tests mínimos en módulos críticos
- Infra base: Docker

---

## Principios obligatorios de implementación

### 1. Modelar dominio, no pantallas

Codex debe pensar primero en entidades, reglas, permisos, estados y flujos.
No debe traducir directamente cada pantalla a una tabla o a un endpoint sin criterio de dominio.

### 2. Empezar como monolito modular

La arquitectura inicial debe ser un monolito modular, no microservicios.
Cada módulo debe representar una capacidad del negocio y estar desacoplado de forma razonable.

### 3. Seguridad y validación desde el inicio

No se permite “primero funciona, luego lo aseguramos”.
Todo endpoint debe tener:

- validación server-side
- control de acceso
- sanitización básica
- manejo de errores consistente
- protección de datos sensibles

### 4. Estado editorial como parte central

Los perfiles de consultor no son simples registros editables.
Deben tener flujo editorial y reglas según estado.

### 5. Auditoría mínima real

Las acciones sensibles deben poder rastrearse.
No hace falta observabilidad enterprise desde el día 1, pero sí trazabilidad suficiente.

### 6. Preparar escalabilidad sin sobrearquitectura

Diseñar para crecer, pero sin introducir complejidad innecesaria antes de tiempo.

---

## Objetivo de negocio del backend

Construir una plataforma real para:

- registro y autenticación de usuarios
- creación y gestión de perfiles de consultor
- revisión y publicación de perfiles
- descubrimiento público de consultores
- moderación y administración
- notificaciones y trazabilidad

El backend debe soportar una red profesional validada, no solo un directorio bonito.

---

# Arquitectura base obligatoria

## Módulos mínimos

Codex debe estructurar el backend al menos en los siguientes módulos:

1. `auth`
2. `users`
3. `profiles`
4. `profile-assets`
5. `consultants-public`
6. `reviews`
7. `admin`
8. `audit`
9. `notifications`
10. `common`
11. `health`

Opcionales preparados pero no implementados a fondo: 12. `search` 13. `analytics` 14. `billing` (stub, sin lógica funcional)

---

## Responsabilidad de cada módulo

### `auth`

Debe manejar:

- register
- login
- logout
- refresh token
- forgot password
- reset password
- verificación de identidad de sesión

### `users`

Debe manejar:

- lectura de perfil privado del usuario autenticado
- edición de datos básicos
- cambio de email
- cambio de contraseña
- cambio de foto si aplica a nivel cuenta
- desactivación de cuenta

### `profiles`

Debe manejar:

- creación de perfil borrador
- edición de perfil
- guardado de progreso
- envío a revisión
- publicación / despublicación
- archivado
- reglas de negocio por estado
- versionado o changelog relevante

### `profile-assets`

Debe manejar:

- avatar
- galería
- certificados
- respaldos
- validación MIME
- validación tamaño
- borrado y reemplazo
- storage abstracto con soporte para S3 o compatible

### `consultants-public`

Debe manejar:

- listado público
- detalle público por slug
- filtros
- ordenamiento
- paginación
- búsqueda textual inicial compatible con MySQL 8
- featured / popular si existe criterio definido

### `reviews`

Debe manejar:

- envío a revisión
- observaciones
- historial de revisión
- decisión editorial
- cambios requeridos

### `admin`

Debe manejar:

- listado interno de perfiles
- ver detalle interno
- aprobar / rechazar
- bloquear contenido o usuario si corresponde
- comentarios internos
- acciones de moderación

### `audit`

Debe manejar:

- registro de acciones sensibles
- actor
- recurso afectado
- acción
- timestamp
- metadata mínima

### `notifications`

Debe manejar:

- email de bienvenida
- perfil creado
- enviado a revisión
- aprobado
- rechazado
- cambios requeridos

### `common`

Debe incluir:

- DTOs compartidos si aplica
- enums
- helpers
- manejo de errores
- guards
- interceptors
- sanitizadores
- utilidades transversales

### `health`

Debe incluir:

- health check general
- estado de DB
- estado de storage si se requiere
- readiness/liveness simple

---

# Reglas de dominio obligatorias

## Roles del sistema

Codex debe implementar al menos:

- `ADMIN`
- `CONSULTANT`
- `VISITOR`

Notas:

- `VISITOR` normalmente es público no autenticado
- usuarios autenticados sin privilegios editoriales deben tratarse con permisos explícitos
- no usar lógica ambigua basada solo en flags sueltos

## Estados del perfil

Codex debe implementar este enum base:

- `DRAFT`
- `IN_REVIEW`
- `PUBLISHED`
- `REJECTED`
- `ARCHIVED`

## Transiciones válidas

Codex debe respetar como mínimo estas transiciones:

- `DRAFT -> IN_REVIEW`
- `IN_REVIEW -> PUBLISHED`
- `IN_REVIEW -> REJECTED`
- `REJECTED -> DRAFT`
- `PUBLISHED -> DRAFT` (si se despublica para editar, según decisión de negocio)
- `PUBLISHED -> ARCHIVED`
- `ARCHIVED -> DRAFT` o `ARCHIVED -> PUBLISHED` solo si negocio lo autoriza explícitamente

Codex no debe permitir cambios arbitrarios de estado sin validación.

## Reglas mínimas por estado

### DRAFT

- editable por consultor dueño del perfil
- no visible públicamente
- permite guardado parcial

### IN_REVIEW

- bloquea edición directa de campos sensibles o la restringe según política elegida
- no visible públicamente
- queda pendiente de revisión admin

### PUBLISHED

- visible públicamente
- cambios mayores deberían generar nueva revisión o volver a draft si así se define
- slug público debe ser estable o manejar redirecciones si cambia

### REJECTED

- no visible públicamente
- debe admitir observaciones de admin
- puede volver a borrador para corrección

### ARCHIVED

- no visible públicamente
- no aparece en exploración pública
- se mantiene para historial

---

# Modelo de datos inicial obligatorio

Codex debe diseñar un esquema relacional inicial con estas entidades principales.

## 1. User

Campos sugeridos:

- id
- email
- passwordHash
- role
- firstName
- lastName
- avatarUrl
- isActive
- lastLoginAt
- createdAt
- updatedAt
- deactivatedAt

## 2. ConsultantProfile

Campos sugeridos:

- id
- userId
- slug
- status
- professionalHeadline
- bio
- country
- city
- modalities
- yearsOfExperience
- publicEmail
- publicPhone
- websiteUrl
- linkedinUrl
- xUrl
- instagramUrl
- featuredFlag
- publishedAt
- createdAt
- updatedAt
- archivedAt
- submittedForReviewAt
- lastReviewedAt

## 3. ProfileExperience

- id
- profileId
- company
- roleTitle
- startDate
- endDate
- isCurrent
- description
- orderIndex

## 4. ProfileEducation

- id
- profileId
- institution
- degree
- fieldOfStudy
- startDate
- endDate
- description
- orderIndex

## 5. ProfileLanguage

- id
- profileId
- languageCode
- proficiencyLevel

## 6. ProfileSkill

- id
- profileId
- name
- category
- years

## 7. ProfileCertificate

- id
- profileId
- title
- issuer
- issueDate
- credentialUrl
- assetId opcional

## 8. ProfileAward

- id
- profileId
- title
- issuer
- year
- description

## 9. ProfileMediaAsset

- id
- profileId
- type (`AVATAR`, `GALLERY_IMAGE`, `CERTIFICATE_FILE`, `SUPPORTING_DOC`)
- storageKey
- mimeType
- sizeBytes
- originalFilename
- publicUrl o signedUrlStrategy
- createdAt
- deletedAt

## 10. ProfileReview

- id
- profileId
- reviewerUserId
- fromStatus
- toStatus
- decision
- comment
- createdAt

## 11. AdminComment

- id
- profileId
- adminUserId
- message
- isInternal
- createdAt

## 12. AuditLog

- id
- actorUserId opcional
- actorRole
- action
- resourceType
- resourceId
- metadataJson
- ip opcional
- userAgent opcional
- createdAt

## 13. PasswordResetToken

- id
- userId
- tokenHash
- expiresAt
- usedAt
- createdAt

## 14. RefreshSession

- id
- userId
- tokenHash
- expiresAt
- revokedAt
- createdAt
- userAgent opcional
- ip opcional

---

## Base de datos obligatoria

La base del proyecto debe implementarse sobre **MySQL 8+**.

Codex debe diseñar y probar todo el modelo relacional pensando específicamente en MySQL, no en PostgreSQL.

### Implicancias obligatorias

- usar tipos y defaults compatibles con MySQL 8+
- diseñar índices según capacidades reales de MySQL
- validar longitudes de columnas indexadas
- usar `utf8mb4` y collation consistente para soportar contenido internacional
- considerar diferencias de comportamiento en constraints, transacciones y búsquedas respecto a PostgreSQL
- no diseñar features que dependan de capacidades exclusivas de PostgreSQL

### Búsqueda textual en esta fase

La búsqueda inicial debe resolverse con una estrategia compatible con MySQL 8.
Puede incluir:

- filtros relacionales normales
- `LIKE` o búsqueda parcial controlada para MVP
- full-text search de MySQL solo si aplica bien al caso y queda bien documentado

Codex no debe asumir motores externos de búsqueda en la fase 1 salvo instrucción explícita.

# Reglas de modelado que Codex debe respetar

- usar IDs estables
- timestamps en todas las entidades principales
- soft delete solo donde aporte valor real
- no abusar de JSON como reemplazo de entidades relacionales
- no guardar archivos en DB
- no guardar contraseñas en texto plano
- no exponer campos internos en responses públicas
- slug único para perfiles públicos
- índices en campos de búsqueda y filtro frecuentes

---

# Endpoints mínimos obligatorios

Codex debe implementar o dejar listos estos endpoints mínimos.

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

## Usuario autenticado

- `GET /me`
- `PATCH /me`
- `PATCH /me/email`
- `PATCH /me/password`
- `DELETE /me`

## Profiles privadas

- `POST /profiles`
- `GET /profiles/:id`
- `PATCH /profiles/:id`
- `DELETE /profiles/:id`
- `POST /profiles/:id/submit-review`
- `POST /profiles/:id/publish`
- `POST /profiles/:id/unpublish`
- `POST /profiles/:id/archive`

## Uploads / assets

- `POST /profiles/:id/avatar`
- `POST /profiles/:id/gallery`
- `DELETE /profiles/:id/gallery/:assetId`
- `POST /profiles/:id/certificates`
- `DELETE /profiles/:id/assets/:assetId`

## Público

- `GET /consultants`
- `GET /consultants/:slug`

## Admin

- `GET /admin/profiles`
- `GET /admin/profiles/:id`
- `PATCH /admin/profiles/:id/status`
- `POST /admin/profiles/:id/comment`
- `PATCH /admin/users/:id/block`
- `PATCH /admin/users/:id/unblock`

## Health

- `GET /health`

---

# Contratos funcionales que Codex debe respetar

## `/consultants`

Debe soportar al menos:

- `page`
- `limit`
- `q`
- `country`
- `language`
- `specialty`
- `modality`
- `minExperience`
- `sort`
- `featured`

La respuesta debe incluir:

- items
- pagination metadata
- filtros aplicados si aporta valor

## `/consultants/:slug`

Debe devolver solo campos públicos y publicados.
Nunca debe filtrar por id interno ni exponer metadata privada.

## `/profiles/:id`

Debe verificar ownership o permiso admin.
No debe permitir acceso arbitrario a perfiles de terceros.

---

# Validación y sanitización obligatoria

Codex debe implementar validación server-side en todos los DTOs.

## Reglas mínimas

- emails válidos
- URLs válidas cuando aplique
- límites de longitud por campo
- trimming de strings
- sanitización básica HTML/texto
- listas con tamaños máximos razonables
- archivos con validación MIME y peso
- enums estrictos para estados, roles, niveles, tipos

## Campos públicos a sanitizar especialmente

- bio
- titular profesional
- experiencia
- educación
- links externos
- comentarios de revisión si se exponen al consultor

---

# Seguridad obligatoria

Codex debe incluir como mínimo:

## Auth y sesiones

- password hashing seguro
- JWT access token corto
- refresh token rotado o revocable
- invalidación de sesión al logout

## API

- rate limiting en auth y endpoints sensibles
- CORS definido explícitamente
- Helmet o headers de seguridad equivalentes
- control por roles y ownership
- no exponer stack traces al cliente
- manejo seguro de errores

## Uploads

- validar tipo y tamaño
- no confiar en filename del cliente
- generar nombre seguro en storage
- proteger documentos sensibles
- servir mediante signed URLs cuando aplique

## Auditoría

Registrar al menos:

- login exitoso
- login fallido si se decide
- cambio de password
- cambio de email
- submit review
- publish
- unpublish
- rechazo
- bloqueo admin
- desactivación de cuenta

---

# Observabilidad mínima obligatoria

Codex debe preparar:

- logs estructurados
- request id / correlation id si es razonable
- centralización de errores con filter global
- health checks
- métricas mínimas si el stack ya lo permite

No se requiere observabilidad enterprise completa en la fase 1, pero sí una base seria.

---

# Notificaciones

Codex debe implementar las notificaciones como módulo desacoplado.
No incrustar envíos de email directamente en controladores.

## Eventos mínimos a notificar

- bienvenida por registro
- perfil creado
- perfil enviado a revisión
- perfil aprobado
- perfil rechazado
- cambios requeridos

## Regla importante

Si un proveedor de email real aún no está integrado, usar adaptador abstracto o fake provider en desarrollo.

---

# Flujo editorial obligatorio

Codex debe implementar este flujo mínimo:

1. consultor crea perfil en `DRAFT`
2. consultor edita y guarda progreso
3. consultor envía a revisión
4. admin revisa
5. admin aprueba o rechaza
6. si aprueba, perfil puede quedar `PUBLISHED`
7. si rechaza, perfil queda `REJECTED` con observaciones
8. consultor corrige y vuelve a enviar
9. perfil puede archivarse si corresponde

No se debe publicar automáticamente un perfil incompleto sin reglas.

---

# Reglas de completitud sugeridas

Antes de permitir `submit-review`, Codex debe validar al menos:

- titular profesional presente
- bio mínima válida
- al menos una especialidad
- país definido
- al menos un idioma o contacto válido
- slug generado o generable

Estas reglas deben implementarse como servicios de dominio, no como lógica dispersa en controladores.

---

# Convenciones de implementación

## Código

- nombres claros
- servicios pequeños y cohesionados
- controladores delgados
- lógica de negocio en servicios
- repositorios o acceso a datos encapsulado
- DTOs separados de entidades
- no mezclar contratos públicos con modelos internos

## API

- responses consistentes
- códigos HTTP correctos
- mensajes de error claros pero seguros
- paginación estándar
- versionado preparado si la API crece

## Base de datos

- migraciones versionadas
- seeds mínimas de desarrollo
- usuario admin seed opcional en dev
- índices en slug, email, status, country y campos de filtro
- charset `utf8mb4`
- convención consistente de collation
- revisar tamaños de `VARCHAR` e índices compuestos para MySQL
- evitar depender de features exclusivas de PostgreSQL
- compatibilidad total con MySQL 8+ en tipos, índices, defaults y relaciones

---

# Fases obligatorias de trabajo para Codex

## Fase 1 — base operativa

Implementar primero:

- auth
- users
- profiles draft/edit
- uploads básicos
- consultants public listing
- búsqueda básica
- swagger
- health
- validación
- seguridad base

## Fase 2 — operación editorial

Implementar luego:

- reviews
- admin
- comments
- workflow editorial completo
- notificaciones
- auditoría admin más completa

## Fase 3 — endurecimiento y escalado

Implementar después:

- observabilidad mejorada
- métricas
- colas
- caché
- search avanzada
- analytics
- optimizaciones

## Prohibición de orden incorrecto

Codex no debe saltar a optimizaciones avanzadas, search compleja o features accesorios si aún no existe una base operativa segura y coherente.

---

# Qué está prohibido

Codex NO debe:

- implementar pagos ahora
- crear microservicios sin necesidad real
- meter lógica de negocio en controladores
- usar localStorage como persistencia del backend
- dejar endpoints sin auth/guards donde sí correspondan
- exponer datos privados en endpoints públicos
- permitir transiciones de estado arbitrarias
- depender de frontend para validar reglas críticas
- crear tablas genéricas ambiguas tipo `data`, `items`, `misc`
- mezclar assets privados y públicos sin estrategia
- construir un CRUD plano sin workflow editorial

---

# Qué sí debe hacer

Codex SÍ debe:

- representar el negocio real
- dejar el dominio claro en módulos y servicios
- documentar decisiones técnicas importantes
- crear una base que otro developer pueda continuar
- escribir seeds de desarrollo razonables
- dejar Swagger limpio
- incluir ejemplos de request/response cuando aporte valor
- preparar storage abstraído
- preparar notificaciones desacopladas
- preparar futuras extensiones sin implementarlas de más

---

# Estructura sugerida del proyecto

```text
src/
  app.module.ts
  main.ts
  common/
    decorators/
    dto/
    enums/
    errors/
    filters/
    guards/
    interceptors/
    pipes/
    sanitizers/
    utils/
  config/
  auth/
    controllers/
    services/
    dto/
    guards/
    strategies/
  users/
    controllers/
    services/
    dto/
  profiles/
    controllers/
    services/
    dto/
    domain/
  profile-assets/
    controllers/
    services/
    dto/
    storage/
  consultants-public/
    controllers/
    services/
    dto/
  reviews/
    controllers/
    services/
    dto/
  admin/
    controllers/
    services/
    dto/
  notifications/
    services/
    templates/
    providers/
  audit/
    services/
  health/
    controllers/
    services/
prisma/
  schema.prisma
  migrations/
  seed.ts
```

---

# Definition of Done de esta skill

La implementación guiada por esta skill se considera bien encaminada si:

- existe auth funcional y segura
- existe perfil draft editable persistido en DB
- existe flujo básico de revisión
- existe listado público usable
- existe upload serio de assets
- existe panel/admin API para moderación mínima
- existen logs y auditoría básica
- la API está documentada
- no hay pagos implementados aún
- el dominio está representado con claridad

---

# Instrucción final para Codex

Construye este backend como una plataforma de negocio real, no como un demo técnico ni como un CRUD genérico.

Cada decisión debe responder a estas preguntas:

- ¿quién puede hacer esta acción?
- ¿sobre qué recurso?
- ¿en qué estado?
- ¿qué debe quedar auditado?
- ¿qué puede verse públicamente?
- ¿qué debe validarse en servidor?
- ¿qué parte estamos dejando explícitamente para una fase posterior?

La prioridad es una base limpia, modular, segura y extensible.
Pagos quedan fuera hasta nueva instrucción.
