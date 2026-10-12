import { apiRequest, handleApiResponse } from './apiClient.js';

/**
 * Alert service communicating with /api/v1/alerts routes
 */
export const alertService = {
  /**
   * List triggered price alerts for the user
   * @param {Object} [params]
   * @param {boolean} [params.unread=false] Filter for unread alerts only
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   */
  async getAlerts({ unread = false, page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (unread) params.append('unread', 'true');
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const qs = params.toString();
    const endpoint = `/alerts${qs ? `?${qs}` : ''}`;
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },

  /**
   * Get single alert details
   * @param {string} id
   */
  async getAlertById(id) {
    const response = await apiRequest(`/alerts/${id}`, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },

  /**
   * Mark a single alert as read
   * @param {string} id
   */
  async markAsRead(id) {
    const response = await apiRequest(`/alerts/${id}/read`, {
      method: 'PATCH',
    });
    return handleApiResponse(response);
  },

  /**
   * Mark all triggered alerts as read
   */
  async markAllAsRead() {
    const response = await apiRequest('/alerts/mark-all-read', {
      method: 'POST',
    });
    return handleApiResponse(response);
  },
};

export default alertService;
