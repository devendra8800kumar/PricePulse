import { apiRequest, handleApiResponse } from './apiClient.js';

/**
 * Recommendation service communicating with /api/v1/recommendations
 */
export const recommendationService = {
  /**
   * Evaluate and retrieve latest recommendation for a product
   * @param {string} productId
   */
  async getRecommendation(productId) {
    const response = await apiRequest(`/recommendations/${productId}`, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },
};

export default recommendationService;
