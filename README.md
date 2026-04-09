# Goberna Club

Monorepo con:

- **frontend** en React 19 + Vite
- **backend** en Express + TypeScript + Prisma
- **base de datos** MySQL

La app resuelve 3 cosas principales:

1. marketing público de Goberna Club
2. exploración pública de consultores
3. autenticación y gestión de perfiles profesionales de consultores

---

## 1. Stack técnico

### Frontend

- React 19
- Vite 8
- TypeScript
- CSS modular por dominio
- `fetch` nativo para integración con API
- librerías visuales: `motion`, `gsap`, `react-icons`, `lucide-react`, `tsparticles`

### Backend

- Express 4
- TypeScript
- Prisma ORM
- MySQL
- Zod para validación
- JWT access/refresh tokens
- Multer + Sharp para uploads y normalización de imágenes
- Swagger UI en `/api/docs`

---

## 2. Estructura del repo

```text
goberna-club/
├── frontend/
│   ├── src/
│   │   ├── domains/
│   │   │   ├── marketing/home/
│   │   │   └── consultants/
│   │   ├── shared/api/
│   │   ├── shared/ui/
│   │   └── components/
│   └── package.json
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── modules/
│   │   ├── middleware/
│   │   ├── bootstrap/
│   │   ├── lib/
│   │   └── scripts/
│   └── package.json
└── package.json
```

---

## 3. Arquitectura funcional

### Frontend

El frontend no usa React Router. Usa **routing por hash**:

- `#` → home
- `#perfil/<slug>` → perfil público
- `#mi-perfil/<id>` → perfil privado editable
- `#explorar-consultores` → exploración pública
- `#acceso-consultor` → login
- `#formulario-perfil` → onboarding / creación de perfil

`src/App.tsx` actúa como orquestador de vistas y carga lazy los bloques principales.

### Backend

La API está organizada por módulos de dominio:

- `auth`
- `users`
- `profiles`
- `profile-assets`
- `consultants-public`
- `catalogs`
- `reviews`
- `admin`
- `clients`
- `integrations`
- `health`
- `billing` (placeholder, no implementado)

`src/app.ts` monta todos los routers bajo `/api`.

---

## 4. Flujo principal del producto

### 4.1 Home pública

La home carga secciones de marketing y además consume:

- listado público de consultores destacados
- formulario de lead/contacto
- links de pago externos para planes

### 4.2 Login de consultor

La pantalla `ConsultantAuthPage` consume login JWT.

Después del login:

- si el usuario es admin → va a `#explorar-consultores`
- si el usuario ya tiene perfil → va a `#mi-perfil/<id>`
- si no tiene perfil → va a `#formulario-perfil`

### 4.3 Creación de perfil

`ProfileCreatePage`:

- carga catálogos (`countries`, `specialties`, `skills`)
- arma payload para backend
- crea primero el perfil base
- luego actualiza el perfil completo
- opcionalmente sube avatar
- además consulta certificados externos por email y los agrega al perfil

### 4.4 Perfil privado / editable

`ProfilePage`:

- puede cargar perfil propio por ID
- puede cargar perfil público por slug
- habilita edición inline si el usuario es dueño o admin
- persiste cambios por secciones
- permite subir avatar
- permite borrar el perfil permanentemente

### 4.5 Exploración pública

`ConsultantsExplorePage` consume:

- `/api/consultants`
- `/api/catalogs/consultant-profile`

y soporta:

- búsqueda
- filtros por especialidad, idioma, país y skills
- paginación

---

## 5. Base de datos

La base está definida en `backend/prisma/schema.prisma`.

### 5.1 Motor

- **MySQL**
- conexión por `DATABASE_URL`

### 5.2 Entidades principales

#### `users`

Usuario autenticable del sistema.

Campos clave:

- `email` único
- `passwordHash`
- `role`: `ADMIN | CONSULTANT | VISITOR`
- `plan`
- `firstName`, `lastName`
- `avatarUrl`
- `isActive`

Relaciones:

- 1:N con `consultant_profiles`
- 1:N con `refresh_sessions`
- 1:N con `password_reset_tokens`
- 1:N con `audit_logs`
- 1:N con `admin_comments`

#### `refresh_sessions`

Persistencia de refresh token hasheado.

Campos clave:

- `userId`
- `tokenHash`
- `expiresAt`
- `revokedAt`

#### `password_reset_tokens`

Tokens de reset de contraseña.

Campos clave:

- `userId`
- `tokenHash`
- `expiresAt`
- `usedAt`

#### `countries`

Catálogo maestro de países.

Campos clave:

- `code`
- `name`
- `slug`
- `isActive`

#### `specialties`

Catálogo maestro de especialidades.

#### `skills`

Catálogo maestro de habilidades.

#### `consultant_profiles`

Entidad central del producto.

Campos clave:

- `userId`
- `slug` único
- `status`: `DRAFT | IN_REVIEW | PUBLISHED | REJECTED | ARCHIVED`
- `professionalHeadline`
- `specialtyId`
- `bio`
- `countryId`
- `country`, `city`
- `modalities`
- `yearsOfExperience`
- `publicEmail`, `publicPhone`
- `websiteUrl`, `facebookUrl`, `linkedinUrl`, `xUrl`, `instagramUrl`
- `featuredFlag`
- `publishedAt`, `submittedForReviewAt`, `lastReviewedAt`, `archivedAt`

Relaciones:

- pertenece a `users`
- referencia `specialties` y `countries`
- 1:N con experiencias, educación, idiomas, skills, certificados, premios, assets, reviews y comentarios admin

#### `profile_experiences`

Experiencia laboral del consultor.

#### `profile_educations`

Formación académica.

#### `profile_languages`

Idiomas y nivel de dominio.

#### `profile_skills`

Skills concretos asociados al perfil.

Puede apuntar al catálogo `skills` y además guardar nombre denormalizado.

#### `profile_certificates`

Certificados del consultor.

Puede enlazarse a `profile_media_assets` mediante `assetId`.

#### `profile_awards`

Reconocimientos / medallas.

#### `profile_media_assets`

Assets físicos del perfil.

Tipos usados por el dominio:

- `AVATAR`
- `GALLERY_IMAGE`
- `CERTIFICATE_FILE`
- `SUPPORTING_DOC`

Campos clave:

- `storageKey`
- `mimeType`
- `sizeBytes`
- `originalFilename`
- `publicUrl`
- `deletedAt`

#### `profile_reviews`

Historial editorial del perfil.

Campos clave:

- `fromStatus`
- `toStatus`
- `decision`
- `comment`

#### `admin_comments`

Comentarios administrativos sobre perfiles.

#### `clients`

Leads capturados desde formularios públicos.

Campos clave:

- `fullName`
- `email`
- `phone`
- `country`
- `message`

#### `audit_logs`

Auditoría de acciones de negocio.

Campos clave:

- `actorUserId`
- `actorRole`
- `action`
- `resourceType`
- `resourceId`
- `metadataJson`

### 5.3 Relación conceptual rápida

```mermaid
erDiagram
  User ||--o{ RefreshSession : has
  User ||--o{ PasswordResetToken : has
  User ||--o{ ConsultantProfile : owns
  User ||--o{ AuditLog : acts
  User ||--o{ AdminComment : writes

  Country ||--o{ ConsultantProfile : classifies
  Specialty ||--o{ ConsultantProfile : classifies
  Skill ||--o{ ProfileSkill : catalogs

  ConsultantProfile ||--o{ ProfileExperience : has
  ConsultantProfile ||--o{ ProfileEducation : has
  ConsultantProfile ||--o{ ProfileLanguage : has
  ConsultantProfile ||--o{ ProfileSkill : has
  ConsultantProfile ||--o{ ProfileCertificate : has
  ConsultantProfile ||--o{ ProfileAward : has
  ConsultantProfile ||--o{ ProfileMediaAsset : has
  ConsultantProfile ||--o{ ProfileReview : has
  ConsultantProfile ||--o{ AdminComment : has

  ProfileMediaAsset ||--o| ProfileCertificate : previews
```

---

## 6. Endpoints internos del backend

Base local por defecto: `http://localhost:4000/api`

También hay Swagger en:

- `GET /api/docs`

### 6.1 Auth

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| POST | `/auth/register` | No | registra consultor y devuelve JWT |
| POST | `/auth/login` | No | login con email/password |
| POST | `/auth/logout` | Sí | revoca sesiones activas |
| POST | `/auth/refresh` | No | rota refresh token |
| POST | `/auth/forgot-password` | No | genera token de reset |
| POST | `/auth/reset-password` | No | aplica nueva contraseña |

### 6.2 Usuario autenticado

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| GET | `/me` | Sí | datos del usuario actual |
| PATCH | `/me` | Sí | actualiza perfil básico del usuario |
| PATCH | `/me/email` | Sí | cambia email |
| PATCH | `/me/password` | Sí | cambia contraseña |
| DELETE | `/me` | Sí | desactiva usuario |

### 6.3 Perfiles privados

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| GET | `/profiles` | Sí | lista perfiles del usuario |
| POST | `/profiles` | Sí | crea perfil base |
| GET | `/profiles/:id` | Sí | obtiene perfil privado |
| PATCH | `/profiles/:id` | Sí | actualiza perfil completo |
| DELETE | `/profiles/:id` | Sí | archiva perfil |
| DELETE | `/profiles/:id/permanent` | Sí | borra perfil permanentemente |
| POST | `/profiles/:id/submit-review` | Sí | envía a revisión |
| POST | `/profiles/:id/publish` | Sí | publica perfil |
| POST | `/profiles/:id/unpublish` | Sí | despublica perfil |
| POST | `/profiles/:id/archive` | Sí | archiva perfil |

### 6.4 Assets de perfil

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| POST | `/profiles/:id/avatar` | Sí | sube avatar, convierte a webp |
| POST | `/profiles/:id/gallery` | Sí | sube imagen de galería |
| POST | `/profiles/:id/certificates` | Sí | placeholder, responde 501 |
| DELETE | `/profiles/:id/gallery/:assetId` | Sí | elimina asset de galería |
| DELETE | `/profiles/:id/assets/:assetId` | Sí | elimina asset genérico |

Restricciones actuales:

- solo imágenes
- máximo 10 MB
- procesamiento con `sharp`

### 6.5 Exploración pública

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| GET | `/consultants` | No | listado paginado y filtrable |
| GET | `/consultants/:slug` | No | perfil público publicado |

Query params soportados en `/consultants`:

- `page`
- `limit` (máximo 25)
- `q`
- `countries`
- `languages`
- `specialties`
- `skills`
- `modality`
- `minExperience`
- `sort`
- `featured`

### 6.6 Catálogos

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| GET | `/catalogs/consultant-profile` | No | devuelve países, especialidades y skills |

### 6.7 Reviews

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| GET | `/profiles/:profileId/reviews` | Sí | lista revisiones del perfil, owner o admin |

### 6.8 Admin

Requiere JWT + rol `ADMIN`.

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| GET | `/admin/profiles` | Sí | lista perfiles para moderación |
| GET | `/admin/profiles/:id` | Sí | detalle de perfil |
| PATCH | `/admin/profiles/:id/status` | Sí | cambia estado editorial |
| POST | `/admin/profiles/:id/comment` | Sí | agrega comentario admin |
| POST | `/admin/users` | Sí | crea usuario desde admin |
| PATCH | `/admin/users/:id/block` | Sí | bloquea usuario |
| PATCH | `/admin/users/:id/unblock` | Sí | desbloquea usuario |

### 6.9 Leads / clientes

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| POST | `/clients` | No | registra lead público |

### 6.10 Integraciones externas

Protección por header `x-api-key`.

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| POST | `/integrations/users` | API Key | crea usuario para integraciones externas |

### 6.11 Salud y módulos placeholder

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| GET | `/health` | No | healthcheck con verificación DB |
| GET | `/billing` | No | placeholder; pagos fuera de scope |

---

## 7. Endpoints internos consumidos por el frontend

Esto es lo importante de verdad: no todos los endpoints del backend están usados por la UI actual.

### 7.1 Consumidos directamente por `frontend/src/shared/api/gobernaApi.ts`

| Método | Ruta | Uso en frontend |
|---|---|---|
| POST | `/auth/login` | login de consultor |
| POST | `/auth/register` | helper disponible, no vi pantalla pública que lo use hoy |
| POST | `/auth/refresh` | renovación automática de sesión |
| PATCH | `/me` | actualizar nombre/avatar del usuario |
| GET | `/profiles` | listar perfiles propios |
| GET | `/profiles/:id` | cargar perfil privado |
| POST | `/profiles` | crear perfil base |
| PATCH | `/profiles/:id` | persistir edición de perfil |
| DELETE | `/profiles/:id/permanent` | borrado permanente desde vista de perfil |
| POST | `/profiles/:id/avatar` | subir avatar |
| POST | `/profiles/:id/gallery` | subir galería |
| DELETE | `/profiles/:id/assets/:assetId` | borrar asset |
| GET | `/consultants` | cards públicas, búsqueda y explore |
| GET | `/consultants/:slug` | perfil público |
| GET | `/catalogs/consultant-profile` | combos/filtros de catálogos |
| POST | `/clients` | formulario de lead/referido |

### 7.2 Componentes/páginas que usan esos endpoints

| Pantalla / componente | Endpoints principales |
|---|---|
| `ConsultantAuthPage` | `/auth/login`, `/profiles` |
| `ProfileCreatePage` | `/catalogs/consultant-profile`, `/me`, `/profiles`, `/profiles/:id`, `/profiles/:id/avatar` |
| `ProfilePage` | `/profiles`, `/profiles/:id`, `/consultants/:slug`, `/catalogs/consultant-profile`, `/profiles/:id/avatar`, `/profiles/:id/permanent` |
| `ConsultantsExplorePage` | `/consultants`, `/catalogs/consultant-profile` |
| `PopularProfiles` | `/consultants` |
| `ReferralForm` | `/clients` |

### 7.3 Endpoints backend existentes pero NO consumidos por la UI actual

- `/auth/logout`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/me/email`
- `/me/password`
- `/me` DELETE
- `/profiles/:id/submit-review`
- `/profiles/:id/publish`
- `/profiles/:id/unpublish`
- `/profiles/:id/archive`
- `/profiles/:profileId/reviews`
- `/admin/*`
- `/integrations/users`
- `/health`
- `/billing`

Eso no significa que sobren. Significa que el backend ya tiene superficie preparada que el frontend todavía no explota.

---

## 8. Integraciones externas

### 8.1 Consumidas desde el frontend

#### API externa de certificados

Archivo:

- `frontend/src/shared/api/gobernaApi.ts`

Endpoint:

- `https://certificaciones.goberna.us/cursos/api/certificados/?email=<email>&activo=1&limit=100`

Uso:

- durante `createProfile()`
- busca certificados por email del usuario autenticado
- transforma esos certificados y los adjunta al perfil local

#### Links de checkout / pago

Archivo:

- `frontend/src/domains/marketing/home/pricing/PricingSection.tsx`

Destino:

- `https://grupogoberna.com/checkout/?add-to-cart=...`

Uso:

- los CTA de pricing abren checkout externo en nueva pestaña
- no pasan por el backend actual

#### Banderas por CDN

Archivo:

- `frontend/src/domains/consultants/profile/ProfileAvatar.tsx`

Destino:

- `https://flagcdn.com/w40/<country>.png`

Uso:

- mostrar bandera del país en perfil

### 8.2 Consumidas desde scripts/backend

#### API de Campus Goberna para certificados

Archivo:

- `backend/src/scripts/sync-campus-certificates.ts`

Uso:

- sincroniza certificados desde Campus Goberna
- intenta descargar PDF
- genera preview `.webp`
- persiste `ProfileCertificate` + `ProfileMediaAsset`

#### Assets públicos generados por el backend

Rutas públicas:

- `/generated/profile-assets/...`
- `/generated/certificates/...`

Uso:

- avatares
- galería
- previews de certificados

---

## 9. Seguridad y comportamiento técnico

### Auth

- JWT access token en header `Authorization: Bearer ...`
- refresh token rotado y persistido como hash en DB
- sesión del frontend guardada en `sessionStorage`

### CORS

Orígenes permitidos relevantes en `backend/src/app.ts`:

- `FRONTEND_URL`
- `http://localhost:3000`
- `http://localhost:3002`
- `https://grupogoberna.com`
- `https://www.grupogoberna.com`

### Uploads

- máximo 10 MB
- solo imágenes
- conversión a `webp`
- guardado en carpeta `generated/`

### Auditoría

Las acciones de negocio importantes se persisten en `audit_logs`.

### Notificaciones

Hoy no hay proveedor real conectado.

`emitNotification()` solo hace `console.log`. O sea: está el contrato, no la integración final.

---

## 10. Variables de entorno

### Backend obligatorias

Definidas en `backend/src/config/env.ts`:

```env
NODE_ENV=development
PORT=4000
APP_NAME=Goberna Club API
APP_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=mysql://user:password@localhost:3306/goberna_club
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
DEMO_CONSULTANT_EMAIL=consultor@example.com
DEMO_CONSULTANT_PASSWORD=ChangeMe123!
DEMO_ADMIN_EMAIL=admin@example.com
DEMO_ADMIN_PASSWORD=ChangeMe123!
INTEGRATION_API_KEY=dev-local-key
```

### Frontend

Solo se detectó una env var:

```env
VITE_API_URL=http://localhost:4000/api
```

Si no existe, el frontend usa `'/api'`.

---

## 11. Puesta en marcha local

### Instalar dependencias

```bash
npm install
```

### Levantar frontend

```bash
npm run dev:frontend
```

### Levantar backend

```bash
npm run dev:backend
```

### Scripts útiles del backend

```bash
npm run prisma:generate
npm run test:backend
npm run prisma:migrate:dev
```

Scripts específicos del workspace backend:

```bash
npm run start:dev --workspace backend
npm run prisma:seed --workspace backend
npm run catalogs:normalize --workspace backend
npm run certificates:sync --workspace backend
npm run gallery:restore --workspace backend
```

### Comportamiento bootstrap del backend

Cuando arranca:

1. crea la base si no existe
2. si hay migraciones, ejecuta `prisma migrate deploy`
3. si no hay migraciones y no está en producción, hace `prisma db push --accept-data-loss`
4. si no está en producción, siembra catálogos y usuarios demo

Esto está en `backend/src/bootstrap/prepare-database.ts`.

---

## 12. Seed y datos demo

En desarrollo se crean automáticamente:

- un admin demo
- un consultor demo
- un perfil publicado `consultor-demo`
- idiomas y skills base
- registro de auditoría de bootstrap

Archivo:

- `backend/src/bootstrap/seed.ts`

---

## 13. Observaciones arquitectónicas importantes

### Lo que está piola

- separación clara frontend/backend
- backend modular por dominio
- Prisma bien usado como capa de persistencia
- catálogos normalizados y reutilizados
- Swagger disponible
- uploads con pipeline de normalización

### Deudas o puntos a tener presentes

- el frontend usa **hash routing**, no routing real del servidor
- hay bastante estado con `any` en formularios complejos del frontend
- billing está mockeado / fuera de scope
- notificaciones todavía no salen a un proveedor real
- hay endpoints backend ya listos que la UI todavía no consume
- la obtención de certificados externos ocurre desde frontend y también existe lógica de sync en backend: eso merece consolidación futura para evitar duplicidad

---

## 14. Archivos clave para entender el sistema rápido

### Frontend

- `frontend/src/App.tsx` — composición de pantallas y routing por hash
- `frontend/src/shared/api/client.ts` — cliente HTTP base, auth y refresh
- `frontend/src/shared/api/gobernaApi.ts` — fachada de integración frontend↔backend y certificados externos
- `frontend/src/domains/consultants/onboarding/ProfileCreatePage.tsx` — creación de perfil
- `frontend/src/domains/consultants/profile/ProfilePage.tsx` — perfil público/privado editable
- `frontend/src/domains/consultants/explore/ConsultantsExplorePage.tsx` — búsqueda y filtros

### Backend

- `backend/src/app.ts` — composición de middlewares y routers
- `backend/prisma/schema.prisma` — modelo completo de datos
- `backend/src/modules/profiles/profiles.service.ts` — corazón del dominio de perfiles
- `backend/src/modules/consultants-public/consultants-public.service.ts` — búsqueda pública
- `backend/src/modules/catalogs/catalogs.service.ts` — catálogos y resolución inteligente
- `backend/src/modules/profile-assets/profile-assets.service.ts` — uploads y assets públicos
- `backend/src/modules/auth/auth.service.ts` — login, refresh, reset, sesiones
- `backend/src/bootstrap/prepare-database.ts` — bootstrap DB

---

## 15. Resumen ejecutivo

Si querés la versión corta, es esta:

- **frontend**: marketing + exploración + edición de perfil, todo en React con hash routing
- **backend**: API Express modular con JWT, Prisma y MySQL
- **DB**: modelo centrado en `User` + `ConsultantProfile` + subentidades de perfil
- **interno consumido**: auth, catálogos, perfiles, assets, consultants, clients
- **externo consumido**: certificados Goberna, checkout de planes, flag CDN

Sin humo: el sistema ya está bastante armado, pero todavía tiene superficie preparada que el frontend no usa y algunas integraciones están a medio cocinar.
