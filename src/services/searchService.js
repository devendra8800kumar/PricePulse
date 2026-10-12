import { apiRequest, handleApiResponse } from './apiClient.js';

/**
 * Search service communicating with /api/v1/search (Meilisearch typo-tolerant search)
 */
export const searchService = {
  /**
   * Search tracked products with typo tolerance
   * @param {Object} params
   * @param {string} params.q Query string (min length 1)
   * @param {string} [params.platform] Optional platform filter (amazon, flipkart)
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   */
  async search({ q, platform = null, page = 1, limit = 20 }) {
    if (!q || !q.trim()) {
      return { query: '', results: [], total: 0, page: 1, limit };
    }

    const params = new URLSearchParams();
    params.append('q', q.trim());
    if (platform && platform !== 'all') params.append('platform', platform);
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const response = await apiRequest(`/search?${params.toString()}`, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },
};

export default searchService;
