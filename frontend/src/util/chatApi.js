import axios from "./axios.customize";

// ============================================
// Chat API Functions
// ============================================

// Conversation APIs

/**
 * Tạo hoặc lấy conversation với shop
 * @param {string} shopId - ID của shop
 * @param {string} initialMessage - Tin nhắn khởi tạo (optional)
 */
export const createConversationApi = (shopId, initialMessage = null) => {
  const URL_API = "/api/chat/conversations";
  const requestBody = { shopId };
  if (initialMessage) {
    requestBody.initialMessage = initialMessage;
  }
  return axios.post(URL_API, requestBody, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

/**
 * Lấy danh sách conversations
 * @param {number} page - Trang (0-indexed)
 * @param {number} size - Số lượng mỗi trang
 */
export const getConversationsApi = (page = 0, size = 20) => {
  const URL_API = "/api/chat/conversations";
  return axios.get(URL_API, {
    params: { page, size },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

/**
 * Lấy chi tiết conversation
 * @param {string} conversationId - ID của conversation
 */
export const getConversationDetailApi = (conversationId) => {
  const URL_API = `/api/chat/conversations/${conversationId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Message APIs

/**
 * Gửi tin nhắn qua REST API
 * @param {Object} messageData - Dữ liệu tin nhắn
 */
export const sendMessageApi = (messageData) => {
  const URL_API = "/api/chat/messages";
  return axios.post(URL_API, messageData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

/**
 * Lấy tin nhắn trong conversation
 * @param {string} conversationId - ID của conversation
 * @param {number} page - Trang (0-indexed)
 * @param {number} size - Số lượng mỗi trang
 */
export const getMessagesApi = (conversationId, page = 0, size = 50) => {
  const URL_API = `/api/chat/conversations/${conversationId}/messages`;
  return axios.get(URL_API, {
    params: { page, size },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

/**
 * Đánh dấu tin nhắn đã đọc qua REST API
 * @param {string} conversationId - ID của conversation
 * @param {string[]} messageIds - Danh sách ID tin nhắn (null = tất cả)
 */
export const markMessagesAsReadApi = (conversationId, messageIds = null) => {
  const URL_API = "/api/chat/messages/read";
  return axios.post(
    URL_API,
    {
      conversationId,
      messageIds,
    },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

/**
 * Xóa tin nhắn
 * @param {string} messageId - ID của tin nhắn
 */
export const deleteMessageApi = (messageId) => {
  const URL_API = `/api/chat/messages/${messageId}`;
  return axios.delete(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Export all functions
export default {
  createConversationApi,
  getConversationsApi,
  getConversationDetailApi,
  sendMessageApi,
  getMessagesApi,
  markMessagesAsReadApi,
  deleteMessageApi,
};
