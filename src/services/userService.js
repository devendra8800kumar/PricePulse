import { apiRequest, handleApiResponse } from './apiClient.js';

/**
 * User service communicating with /api/v1/users routes
 */
export const userService = {
  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const response = await apiRequest('/users/me', {
      method: 'GET',
    });
    return handleApiResponse(response);
  },

  /**
   * Update current user profile and notification preferences
   * @param {Object} updates
   * @param {string} [updates.email]
   * @param {string} [updates.locale]
   * @param {Object} [updates.notification_prefs] e.g. { email: boolean, push: boolean, webhook: boolean }
   */
  async updateMe(updates) {
    const response = await apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return handleApiResponse(response);
  },

  /**
   * Delete current user account and revoke session
   */
  async deleteMe() {
    const response = await apiRequest('/users/me', {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },

  /**
   * Get personalized price tracking stats (tracked count, alerts fired, subscriptions, savings)
   */
  async getStats() {
    const response = await apiRequest('/users/me/stats', {
      method: 'GET',
    });
    return handleApiResponse(response);
  },
};

export default userService;
