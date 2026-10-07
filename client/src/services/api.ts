/**
 * Capa de transporte HTTP centralizada para Consultorio Urbano.
 * Maneja inyección de Bearer tokens, rotación automática de JWT (401 refresh),
 * y subida binaria directa a Cloudflare R2 con monitoreo de progreso.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ACCESS_TOKEN_KEY = 'cu_access_token';
const REFRESH_TOKEN_KEY = 'cu_refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.clearTokens();
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clearTokens();
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.session?.accessToken || data.accessToken;
    const newRefreshToken = data.session?.refreshToken || data.refreshToken;

    if (newAccessToken) {
      tokenStorage.setTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    }

    tokenStorage.clearTokens();
    return null;
  } catch (err) {
    console.error('Error refreshing token:', err);
    tokenStorage.clearTokens();
    return null;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function customFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = tokenStorage.getAccessToken();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...customConfig,
    headers: requestHeaders,
  });

  // Manejo de expiración de token (401)
  if (response.status === 401 && tokenStorage.getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        requestHeaders['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...customConfig,
          headers: requestHeaders,
        });
      }
    } else {
      // Encolar solicitudes que lleguen mientras se refresca el token
      const retryOriginalRequest = new Promise<Response>((resolve) => {
        addRefreshSubscriber((newToken) => {
          requestHeaders['Authorization'] = `Bearer ${newToken}`;
          resolve(fetch(url, { ...customConfig, headers: requestHeaders }));
        });
      });
      response = await retryOriginalRequest;
    }
  }

  if (!response.ok) {
    let errorDetail = 'Error en la petición al servidor';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  // Respuesta 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return customFetch<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return customFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return customFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return customFetch<T>(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Sube un archivo binario directamente al Object Storage (Cloudflare R2)
   * utilizando una URL firmada previamente (Presigned PUT URL).
   * Monitorea el progreso de subida del 0 al 100%.
   */
  uploadDirectToR2(
    uploadUrl: string,
    file: File,
    onProgress?: (progressPercent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          reject(
            new Error(`Error al subir archivo a R2: ${xhr.status} ${xhr.statusText}`)
          );
        }
      };

      xhr.onerror = () => {
        reject(new Error('Fallo de red durante la subida directa a Cloudflare R2.'));
      };

      xhr.send(file);
    });
  },
};
