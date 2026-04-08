const API_BASE_URL: string = import.meta.env.VITE_API_URL || '/api';
const SESSION_STORAGE_KEY = 'goberna.api.session' as const;

// --- Interfaces ---

interface SessionUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface Session {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

interface ErrorPayload {
  error?: { message?: string | string[] };
  message?: string | string[];
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  auth?: boolean;
  body?: unknown;
  headers?: Record<string, string>;
}

// --- Session storage helpers ---

function readSession(): Session | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session): void {
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearSession(): void {
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

// --- Core request helpers ---

async function rawRequest(path: string, options: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload: unknown = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorPayload = payload as ErrorPayload | null;
    const message = errorPayload?.error?.message || errorPayload?.message || 'Request failed';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return payload;
}

// --- Auth helpers ---

async function refreshSession(session: Session): Promise<Session> {
  if (!session?.refreshToken) {
    throw new Error('Missing refresh token');
  }

  const payload = (await rawRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })) as AuthPayload;

  const nextSession: Session = {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: payload.user,
  };
  writeSession(nextSession);
  return nextSession;
}

function normalizeAuthPayload(payload: AuthPayload): Session {
  const session: Session = {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: payload.user,
  };
  writeSession(session);
  return session;
}

// --- Exported auth functions ---

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export async function loginWithCredentials(credentials: LoginCredentials): Promise<Session> {
  const payload = (await rawRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })) as AuthPayload;
  return normalizeAuthPayload(payload);
}

export async function registerWithCredentials(credentials: RegisterCredentials): Promise<Session> {
  const payload = (await rawRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })) as AuthPayload;
  return normalizeAuthPayload(payload);
}

export function getStoredSession(): Session | null {
  return readSession();
}

export function hasStoredSession(): boolean {
  return Boolean(readSession()?.accessToken);
}

export async function requireSession(): Promise<Session> {
  const existing = readSession();
  if (!existing?.accessToken) {
    throw new Error('AUTH_REQUIRED');
  }
  return existing;
}

// --- API request ---

export async function apiRequest(path: string, options: ApiRequestOptions = {}): Promise<unknown> {
  const { auth = false, body, headers, ...rest } = options;
  let session = auth ? await requireSession() : null;

  try {
    return await rawRequest(path, {
      ...rest,
      headers: {
        ...(headers || {}),
        ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (!auth || !session?.refreshToken) {
      throw error;
    }

    session = await refreshSession(session);
    return rawRequest(path, {
      ...rest,
      headers: {
        ...(headers || {}),
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  }
}

// --- File upload ---

export async function uploadFile(path: string, file: File): Promise<unknown> {
  const session = await requireSession();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: formData,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload: unknown = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorPayload = payload as ErrorPayload | null;
    const message = errorPayload?.error?.message || errorPayload?.message || 'Upload failed';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return payload;
}

// --- Session management ---

export function resetApiSession(): void {
  clearSession();
}

export { API_BASE_URL };
export type { Session, SessionUser, AuthPayload, ApiRequestOptions, LoginCredentials, RegisterCredentials };
