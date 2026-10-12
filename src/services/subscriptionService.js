import { apiRequest, handleApiResponse } from './apiClient.js';

/**
 * Subscription service communicating with /api/v1/subscriptions routes
 */
export const subscriptionService = {
  /**
   * List subscriptions for the authenticated shopper
   * @param {Object} [params]
   * @param {boolean|null} [params.is_active] Filter by active status
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   */
  async getSubscriptions({ is_active = null, page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (is_active !== null && is_active !== undefined) params.append('is_active', String(is_active));
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const qs = params.toString();
    const endpoint = `/subscriptions${qs ? `?${qs}` : ''}`;
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },

  /**
   * Retrieve a single subscription by ID
   * @param {string} id
   */
  async getSubscriptionById(id) {
    const response = await apiRequest(`/subscriptions/${id}`, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },

  /**
   * Update subscription target price or active toggle status
   * @param {string} id
   * @param {Object} updates
   * @param {number|null} [updates.target_price]
   * @param {boolean|null} [updates.is_active]
   */
  async updateSubscription(id, updates) {
    const response = await apiRequest(`/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return handleApiResponse(response);
  },

  /**
   * Delete subscription and unsubscribe from tracking notifications
   * @param {string} id
   */
  async deleteSubscription(id) {
    const response = await apiRequest(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },
};

export default subscriptionService;
