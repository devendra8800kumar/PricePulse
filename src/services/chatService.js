import { apiRequest, handleApiResponse } from './apiClient.js';

/**
 * Chat service communicating with /api/v1/chat (Grounded RAG Chatbot over user's watchlist)
 */
export const chatService = {
  /**
   * Send a query to the AI Recommender RAG chat engine
   * @param {Object} params
   * @param {string} params.message Question or instruction
   * @param {string|null} [params.conversation_id] Optional ID to resume existing conversation
   */
  async sendMessage({ message, conversation_id = null }) {
    const payload = { message };
    if (conversation_id) payload.conversation_id = conversation_id;

    const response = await apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return handleApiResponse(response);
  },

  /**
   * Retrieve conversation history by conversation ID
   * @param {string} conversationId
   */
  async getHistory(conversationId) {
    if (!conversationId) return null;
    const response = await apiRequest(`/chat/history?conversation_id=${encodeURIComponent(conversationId)}`, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },
};

export default chatService;
