// Production Railway Backend Endpoint with guaranteed https:// protocol
const DEFAULT_PRODUCTION_API_URL = 'https://contextiq-server-production.up.railway.app/api';

const getApiBase = (): string => {
  // Check if running on localhost for dev proxy
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/api';
    }
  }

  // Check explicit env override if provided (e.g. from Vercel env vars)
  const env = (import.meta as any).env;
  if (env && env.VITE_API_URL) {
    let raw = String(env.VITE_API_URL).trim().replace(/\/+$/, '');
    // Ensure protocol is always present
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      raw = `https://${raw}`;
    }
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }

  return DEFAULT_PRODUCTION_API_URL;
};

const API_BASE = getApiBase();

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('contextiq_token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (window.location.pathname.startsWith('/app')) {
        localStorage.removeItem('contextiq_token');
        window.location.href = '/login';
      }
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json().catch(() => ({})) : {};

    if (!response.ok) {
      const errorMsg =
        data.error ||
        (response.status === 404
          ? 'Backend endpoint not found. Please check server status.'
          : response.status === 405
          ? 'Method not allowed. Please refresh your browser.'
          : response.status === 500
          ? 'Server error occurred during request.'
          : `Request failed with status ${response.status}`);
      throw new ApiError(errorMsg, response.status);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Unable to connect to backend server. Please check your internet connection.',
      0
    );
  }
}
