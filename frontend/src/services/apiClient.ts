import type { ApiError } from '../types';

let inMemoryToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
  if (token) {
    sessionStorage.setItem('hbs_access_token', token);
  } else {
    sessionStorage.removeItem('hbs_access_token');
  }
};

export const getAuthToken = (): string | null => {
  if (!inMemoryToken) {
    inMemoryToken = sessionStorage.getItem('hbs_access_token');
  }
  return inMemoryToken;
};

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setAuthToken(null);
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
  }

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        timestamp: new Date().toISOString(),
        status: response.status,
        code: 'HTTP_ERROR',
        message: response.statusText || 'An unexpected server error occurred',
        path: endpoint,
      };
    }
    throw errorData;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
