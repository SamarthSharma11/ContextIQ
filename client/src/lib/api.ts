const getApiBase = (): string => {
  const env = (import.meta as any).env;
  if (env && env.VITE_API_URL) {
    const raw = String(env.VITE_API_URL).replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }

  // When deployed on Vercel or any non-localhost domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://contextiq-server-production.up.railway.app/api';
  }

  // Local development fallback
  return '/api';
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

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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
    // Network / CORS / unreachable error
    throw new ApiError(
      err.message || 'Unable to connect to the backend server. Please verify your internet connection or server status.',
      0
    );
  }
}
