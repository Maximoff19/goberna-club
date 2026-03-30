export function buildSwaggerDocument() {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Goberna Club API',
      version: '1.0.0',
      description: 'Backend editorial para consultores politicos',
    },
    servers: [{ url: 'http://localhost:4000/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Validation failed' },
            path: { type: 'string', example: '/api/auth/register' },
            details: { nullable: true },
          },
        },
        AuthUser: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cmmw-user-id' },
            email: { type: 'string', format: 'email', example: 'consultant@goberna.club' },
            role: { type: 'string', enum: ['ADMIN', 'CONSULTANT', 'VISITOR'], example: 'CONSULTANT' },
            firstName: { type: 'string', example: 'Consultor' },
            lastName: { type: 'string', example: 'Demo' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/AuthUser' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string', example: 'Juan' },
            lastName: { type: 'string', example: 'Beltran' },
            email: { type: 'string', format: 'email', example: 'juan@goberna.club' },
            password: { type: 'string', minLength: 8, example: 'ChangeMe123!' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'consultant@goberna.club' },
            password: { type: 'string', minLength: 8, example: 'ChangeMe123!' },
          },
        },
        RefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'consultant@goberna.club' },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string', example: 'reset-token-from-provider' },
            newPassword: { type: 'string', minLength: 8, example: 'ChangeMe123!' },
          },
        },
        UpdateMeRequest: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'Juan Pablo' },
            lastName: { type: 'string', example: 'Beltran' },
            avatarUrl: { type: 'string', example: 'https://cdn.goberna.club/avatar.webp' },
          },
        },
        ChangeEmailRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'nuevo@goberna.club' },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', example: 'ChangeMe123!' },
            newPassword: { type: 'string', example: 'ChangeMe456!' },
          },
        },
        ProfileLanguageInput: {
          type: 'object',
          required: ['languageCode', 'proficiencyLevel'],
          properties: {
            languageCode: { type: 'string', example: 'espanol' },
            proficiencyLevel: { type: 'string', example: 'professional' },
          },
        },
        ProfileSkillInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'War Room' },
            category: { type: 'string', example: 'Estrategia' },
            years: { type: 'integer', example: 8 },
          },
        },
        ProfileExperienceInput: {
          type: 'object',
          required: ['company', 'roleTitle'],
          properties: {
            company: { type: 'string', example: 'Grupo Goberna' },
            roleTitle: { type: 'string', example: 'Director de Estrategia' },
            startDate: { type: 'string', example: '2020-01-01' },
            endDate: { type: 'string', example: '2022-12-01' },
            isCurrent: { type: 'boolean', example: false },
            description: { type: 'string', example: 'Liderando estrategia politica regional.' },
          },
        },
        ProfileEducationInput: {
          type: 'object',
          required: ['institution'],
          properties: {
            institution: { type: 'string', example: 'Goberna' },
            degree: { type: 'string', example: 'Maestria' },
            fieldOfStudy: { type: 'string', example: 'Estrategia Politica' },
            startDate: { type: 'string', example: '2018-01-01' },
            endDate: { type: 'string', example: '2019-12-01' },
          },
        },
        CreateProfileRequest: {
          type: 'object',
          properties: {
            professionalHeadline: { type: 'string', example: 'Consultor politico senior' },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            professionalHeadline: { type: 'string', example: 'Consultor politico senior' },
            bio: { type: 'string', example: 'Especialista en estrategia, narrativa y operaciones politicas.' },
            country: { type: 'string', example: 'Peru' },
            city: { type: 'string', example: 'Lima' },
            modalities: { type: 'array', items: { type: 'string' }, example: ['Consultoria', 'Freelance'] },
            yearsOfExperience: { type: 'integer', example: 8 },
            publicEmail: { type: 'string', format: 'email', example: 'consultant@goberna.club' },
            publicPhone: { type: 'string', example: '+51999999999' },
            websiteUrl: { type: 'string', example: 'https://goberna.club' },
            linkedinUrl: { type: 'string', example: 'https://linkedin.com/in/demo' },
            xUrl: { type: 'string', example: 'https://x.com/demo' },
            instagramUrl: { type: 'string', example: 'https://instagram.com/demo' },
            languages: { type: 'array', items: { $ref: '#/components/schemas/ProfileLanguageInput' } },
            skills: { type: 'array', items: { $ref: '#/components/schemas/ProfileSkillInput' } },
            experiences: { type: 'array', items: { $ref: '#/components/schemas/ProfileExperienceInput' } },
            educations: { type: 'array', items: { $ref: '#/components/schemas/ProfileEducationInput' } },
          },
        },
        ProfileResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cmmw-profile-id' },
            slug: { type: 'string', example: 'consultor-demo' },
            status: { type: 'string', enum: ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED'] },
            professionalHeadline: { type: 'string', example: 'Consultor politico senior' },
            bio: { type: 'string', example: 'Bio del consultor' },
            country: { type: 'string', example: 'Peru' },
            publicEmail: { type: 'string', example: 'consultant@goberna.club' },
            owner: { $ref: '#/components/schemas/AuthUser' },
            languages: { type: 'array', items: { $ref: '#/components/schemas/ProfileLanguageInput' } },
            skills: { type: 'array', items: { $ref: '#/components/schemas/ProfileSkillInput' } },
            experiences: { type: 'array', items: { $ref: '#/components/schemas/ProfileExperienceInput' } },
            educations: { type: 'array', items: { $ref: '#/components/schemas/ProfileEducationInput' } },
          },
        },
        AdminStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED'], example: 'PUBLISHED' },
            comment: { type: 'string', example: 'Perfil aprobado y listo para publicacion.' },
          },
        },
        AdminCommentRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', example: 'Corregir bio y links antes de reenviar.' },
            isInternal: { type: 'boolean', example: true },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            database: { type: 'string', example: 'up' },
            timestamp: { type: 'string', example: '2026-03-18T23:00:00.000Z' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/auth/register': {
        post: {
          summary: 'Registro de usuario',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
          responses: {
            201: { description: 'Usuario registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Error de validacion', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login de usuario',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: { 200: { description: 'Login exitoso', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } } },
        },
      },
      '/auth/logout': { post: { summary: 'Logout de sesion', responses: { 200: { description: 'Sesion cerrada' } } } },
      '/auth/refresh': {
        post: {
          summary: 'Refresh token',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } } },
          responses: { 200: { description: 'Token refrescado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } } },
        },
      },
      '/auth/forgot-password': {
        post: {
          summary: 'Solicitar reset de password',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } } },
          responses: { 200: { description: 'Solicitud aceptada' } },
        },
      },
      '/auth/reset-password': {
        post: {
          summary: 'Confirmar reset de password',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } } },
          responses: { 200: { description: 'Password actualizada' } },
        },
      },
      '/me': {
        get: { summary: 'Usuario autenticado', responses: { 200: { description: 'Perfil privado del usuario' } } },
        patch: {
          summary: 'Actualizar usuario autenticado',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateMeRequest' } } } },
          responses: { 200: { description: 'Usuario actualizado' } },
        },
        delete: { summary: 'Desactivar cuenta', responses: { 200: { description: 'Cuenta desactivada' } } },
      },
      '/me/email': {
        patch: {
          summary: 'Cambiar email',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangeEmailRequest' } } } },
          responses: { 200: { description: 'Email actualizado' } },
        },
      },
      '/me/password': {
        patch: {
          summary: 'Cambiar password',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } } },
          responses: { 200: { description: 'Password actualizada' } },
        },
      },
      '/profiles': {
        get: { summary: 'Listar perfiles propios', responses: { 200: { description: 'Listado privado de perfiles' } } },
        post: {
          summary: 'Crear perfil borrador',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProfileRequest' } } } },
          responses: { 201: { description: 'Perfil creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfileResponse' } } } } },
        },
      },
      '/profiles/{id}': {
        get: {
          summary: 'Detalle privado de perfil',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Perfil privado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfileResponse' } } } } },
        },
        patch: {
          summary: 'Actualizar perfil',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } } },
          responses: { 200: { description: 'Perfil actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfileResponse' } } } } },
        },
        delete: {
          summary: 'Archivar perfil',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Perfil archivado' } },
        },
      },
      '/profiles/{id}/submit-review': { post: { summary: 'Enviar perfil a revision', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Perfil enviado a revision' } } } },
      '/profiles/{id}/publish': { post: { summary: 'Publicar perfil', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Perfil publicado' } } } },
      '/profiles/{id}/unpublish': { post: { summary: 'Despublicar perfil', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Perfil vuelto a draft' } } } },
      '/profiles/{id}/archive': { post: { summary: 'Archivar perfil', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Perfil archivado' } } } },
      '/consultants': {
        get: {
          summary: 'Exploracion publica de consultores',
          security: [],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
            { name: 'q', in: 'query', schema: { type: 'string' } },
            { name: 'country', in: 'query', schema: { type: 'string' } },
            { name: 'language', in: 'query', schema: { type: 'string' } },
            { name: 'specialty', in: 'query', schema: { type: 'string' } },
            { name: 'modality', in: 'query', schema: { type: 'string' } },
            { name: 'minExperience', in: 'query', schema: { type: 'integer' } },
            { name: 'sort', in: 'query', schema: { type: 'string' } },
            { name: 'featured', in: 'query', schema: { type: 'string', example: 'true' } },
          ],
          responses: { 200: { description: 'Listado publico de consultores' } },
        },
      },
      '/consultants/{slug}': {
        get: {
          summary: 'Detalle publico por slug',
          security: [],
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Detalle publico del consultor' } },
        },
      },
      '/admin/profiles': { get: { summary: 'Listado admin de perfiles', responses: { 200: { description: 'Listado interno de perfiles' } } } },
      '/admin/profiles/{id}': {
        get: {
          summary: 'Detalle admin de perfil',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Detalle interno de perfil' } },
        },
      },
      '/admin/profiles/{id}/status': {
        patch: {
          summary: 'Cambiar estado editorial',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminStatusRequest' } } } },
          responses: { 200: { description: 'Estado actualizado' } },
        },
      },
      '/admin/profiles/{id}/comment': {
        post: {
          summary: 'Agregar comentario admin',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminCommentRequest' } } } },
          responses: { 201: { description: 'Comentario creado' } },
        },
      },
      '/health': {
        get: {
          summary: 'Health check',
          security: [],
          responses: { 200: { description: 'Estado de salud', content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } } } },
        },
      },
    },
  };
}
