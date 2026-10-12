import { apiRequest, handleApiResponse } from './apiClient.js';

/**
 * Health check service communicating with /health
 */
export const healthService = {
  /**
   * Check backend and service health status
   */
  async checkHealth() {
    const response = await apiRequest('/health', {
      method: 'GET',
    });
    return handleApiResponse(response);
  },
};

export default healthService;
