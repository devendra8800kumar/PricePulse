import { apiRequest, handleApiResponse, tokenStorage } from './apiClient.js';

/**
 * Authentication service communicating with /api/v1/auth routes
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.password (min 8 chars)
   * @param {string} [params.locale='en-US']
   */
  async register({ email, password, locale = 'en-US' }) {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, locale }),
    });
    const data = await handleApiResponse(response);
    if (data?.access_token) {
      tokenStorage.setTokens(data.access_token, data.refresh_token);
    }
    return data;
  },

  /**
   * Authenticate user with email and password
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.password
   */
  async login({ email, password }) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await handleApiResponse(response);
    if (data?.access_token) {
      tokenStorage.setTokens(data.access_token, data.refresh_token);
    }
    return data;
  },

  /**
   * Rotate access token using refresh token
   * @param {string} refreshToken
   */
  async refresh(refreshToken) {
    const token = refreshToken || tokenStorage.getRefreshToken();
    if (!token) throw new Error('No refresh token available');
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: token }),
    });
    const data = await handleApiResponse(response);
    if (data?.access_token) {
      tokenStorage.setTokens(data.access_token, data.refresh_token);
    }
    return data;
  },

  /**
   * Revoke current token via Redis blacklist and clear local storage
   */
  async logout() {
    try {
      const response = await apiRequest('/auth/logout', {
        method: 'POST',
      });
      await handleApiResponse(response);
    } catch (err) {
      console.warn('Backend logout warning:', err);
    } finally {
      tokenStorage.clearTokens();
    }
    return true;
  },

  /**
   * Password reset trigger
   * @param {string} email
   */
  async forgotPassword(email) {
    const response = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return handleApiResponse(response);
  },

  /**
   * Password reset execution
   * @param {Object} params
   * @param {string} params.token
   * @param {string} params.new_password (min 8 chars)
   */
  async resetPassword({ token, new_password }) {
    const response = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    });
    return handleApiResponse(response);
  },
};

export default authService;
