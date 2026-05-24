import { getAccessToken, getRefreshToken, saveAuth, clearAuth, isTokenExpired } from './auth';
import type {
  Deal, DealStatus, Condition, Document, Activity, SettlementValidation,
  SettlementExecution, Notification, PaginatedResponse, AuthResponse, User,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message);
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) { clearAuth(); return null; }
    const data = await res.json();
    const stored = JSON.parse(localStorage.getItem('psos_user') || '{}');
    saveAuth({ ...data, refreshToken, user: stored });
    return data.accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  let token = getAccessToken();

  if (token && isTokenExpired(token)) {
    token = await refreshAccessToken();
    if (!token) {
      clearAuth();
      throw new ApiError(401, 'Session expired');
    }
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return request<T>(path, options, false);
    clearAuth();
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message || 'Request failed', body.details);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: Record<string, any>) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<User>('/auth/me'),
};

// ─── Deals ────────────────────────────────────────────────────────────────────

export const deals = {
  list: (params?: { status?: DealStatus; search?: string; page?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<PaginatedResponse<Deal>>(`/deals${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<Deal>(`/deals/${id}`),
  create: (data: Record<string, any>) =>
    request<Deal>('/deals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, any>) =>
    request<Deal>(`/deals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: DealStatus, reason?: string) =>
    request<Deal>(`/deals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),
  addParty: (id: string, userId: string, partyRole: string) =>
    request(`/deals/${id}/parties`, {
      method: 'POST',
      body: JSON.stringify({ userId, partyRole }),
    }),
};

// ─── Conditions ──────────────────────────────────────────────────────────────

export const conditions = {
  list: (dealId: string) => request<Condition[]>(`/deals/${dealId}/conditions`),
  create: (dealId: string, data: Record<string, any>) =>
    request<Condition>(`/deals/${dealId}/conditions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (dealId: string, conditionId: string, data: Record<string, any>) =>
    request<Condition>(`/deals/${dealId}/conditions/${conditionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  evaluate: (dealId: string) =>
    request<SettlementValidation>(`/deals/${dealId}/conditions/evaluate`, { method: 'POST' }),
};

// ─── Documents ───────────────────────────────────────────────────────────────

export const documents = {
  list: (dealId: string) => request<Document[]>(`/deals/${dealId}/documents`),
  upload: (dealId: string, formData: FormData) =>
    request<Document>(`/deals/${dealId}/documents`, { method: 'POST', body: formData }),
  verify: (dealId: string, docId: string) =>
    request<Document>(`/deals/${dealId}/documents/${docId}/verify`, { method: 'PATCH' }),
  delete: (dealId: string, docId: string) =>
    request(`/deals/${dealId}/documents/${docId}`, { method: 'DELETE' }),
};

// ─── Activities ──────────────────────────────────────────────────────────────

export const activities = {
  list: (dealId: string, limit = 30) =>
    request<Activity[]>(`/deals/${dealId}/activities?limit=${limit}`),
  comment: (dealId: string, message: string) =>
    request<Activity>(`/deals/${dealId}/activities`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

// ─── Settlement ──────────────────────────────────────────────────────────────

export const settlement = {
  validate: (dealId: string) =>
    request<SettlementValidation>(`/deals/${dealId}/settlement/validate`, { method: 'POST' }),
  approve: (dealId: string, notes?: string) =>
    request(`/deals/${dealId}/settlement/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  execute: (dealId: string, pexaWorkspaceId?: string) =>
    request(`/deals/${dealId}/settlement/execute`, {
      method: 'POST',
      body: JSON.stringify({ pexaWorkspaceId }),
    }),
  getExecution: (dealId: string) =>
    request<SettlementExecution>(`/deals/${dealId}/settlement`),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const notifications = {
  list: () => request<{ data: Notification[]; unreadCount: number }>('/notifications'),
  markRead: (id: string) =>
    request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = {
  list: (role?: string) =>
    request<User[]>(`/users${role ? `?role=${role}` : ''}`),
  updateProfile: (data: Record<string, any>) =>
    request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

export { ApiError };
