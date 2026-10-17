// API Client with JWT management, auto-refresh on 401, and unified error handling

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:8000/api/v1';

const ACCESS_TOKEN_KEY = 'pricepulse_access_token';
const REFRESH_TOKEN_KEY = 'pricepulse_refresh_token';

const memoryStorage = new Map();

export const tokenStorage = {
  getAccessToken: () => (typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : (memoryStorage.get(ACCESS_TOKEN_KEY) || null)),
  getRefreshToken: () => (typeof localStorage !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : (memoryStorage.get(REFRESH_TOKEN_KEY) || null)),
  setTokens: (accessToken, refreshToken) => {
    if (typeof localStorage !== 'undefined') {
      if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      if (accessToken) memoryStorage.set(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) memoryStorage.set(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clearTokens: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      memoryStorage.delete(ACCESS_TOKEN_KEY);
      memoryStorage.delete(REFRESH_TOKEN_KEY);
    }
  },
};

// Handle token refresh lock to avoid concurrent refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

/**
 * Perform an HTTP request with automatic bearer token attachment and refresh retry
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const accessToken = tokenStorage.getAccessToken();
  if (accessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // If 401 Unauthorized and not already refreshing or calling refresh/login
  if (
    response.status === 401 && 
    !endpoint.includes('/auth/login') && 
    !endpoint.includes('/auth/register') && 
    !endpoint.includes('/auth/refresh')
  ) {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const tokenData = await refreshRes.json();
            tokenStorage.setTokens(tokenData.access_token, tokenData.refresh_token);
            isRefreshing = false;
            onRefreshed(tokenData.access_token);
            
            // Retry original request
            headers['Authorization'] = `Bearer ${tokenData.access_token}`;
            return fetch(url, { ...config, headers });
          } else {
            // Refresh token invalid or expired
            tokenStorage.clearTokens();
            isRefreshing = false;
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('pricepulse:session_expired'));
            }
          }
        } catch {
          tokenStorage.clearTokens();
          isRefreshing = false;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('pricepulse:session_expired'));
          }
        }
      } else {
        // Wait for token refresh completion
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            headers['Authorization'] = `Bearer ${newToken}`;
            resolve(fetch(url, { ...config, headers }));
          });
        });
      }
    }
  }

  return response;
}

/**
 * Parse JSON safely and extract FastAPI error details
 */
export async function handleApiResponse(response) {
  // Guard: apiRequest can return undefined when a 401 refresh cycle fails
  // and the session_expired event is dispatched without returning a new Response.
  if (!response) {
    const err = new Error('Session expired. Please sign in again.');
    err.status = 401;
    throw err;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred.';
    if (typeof data === 'string') {
      errorMessage = data;
    } else if (data?.detail) {
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map(err => err.msg || JSON.stringify(err)).join(', ');
      } else {
        errorMessage = String(data.detail);
      }
    } else if (data?.message) {
      errorMessage = data.message;
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default {
  apiRequest,
  handleApiResponse,
  tokenStorage,
  API_BASE_URL,
};
