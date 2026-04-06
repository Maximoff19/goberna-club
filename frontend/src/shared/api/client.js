const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SESSION_STORAGE_KEY = 'goberna.api.session';

function readSession() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

async function rawRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || 'Request failed';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return payload;
}

async function refreshSession(session) {
  if (!session?.refreshToken) {
    throw new Error('Missing refresh token');
  }

  const payload = await rawRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  const nextSession = {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: payload.user,
  };
  writeSession(nextSession);
  return nextSession;
}

function normalizeAuthPayload(payload) {
  const session = {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: payload.user,
  };
  writeSession(session);
  return session;
}

export async function loginWithCredentials(credentials) {
  const payload = await rawRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return normalizeAuthPayload(payload);
}

export async function registerWithCredentials(credentials) {
  const payload = await rawRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return normalizeAuthPayload(payload);
}

export function getStoredSession() {
  return readSession();
}

export function hasStoredSession() {
  return Boolean(readSession()?.accessToken);
}

export async function requireSession() {
  const existing = readSession();
  if (!existing?.accessToken) {
    throw new Error('AUTH_REQUIRED');
  }
  return existing;
}

export async function apiRequest(path, options = {}) {
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

export async function uploadFile(path, file) {
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
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || 'Upload failed';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return payload;
}

export function resetApiSession() {
  clearSession();
}

export { API_BASE_URL };
