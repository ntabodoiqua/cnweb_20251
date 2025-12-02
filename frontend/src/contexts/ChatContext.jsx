import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { notification as antdNotification } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import chatWebSocketService, {
  ConnectionState,
  ContentType,
  MessageStatus,
} from "../util/chatWebSocket";
import {
  createConversationApi,
  getConversationsApi,
  getConversationDetailApi,
  sendMessageApi,
  getMessagesApi,
  markMessagesAsReadApi,
} from "../util/chatApi";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  // State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [userPresence, setUserPresence] = useState({}); // Track online/offline status
  const [connectionState, setConnectionState] = useState(
    ConnectionState.DISCONNECTED
  );
  const [isLoading, setIsLoading] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(true);

  // Refs
  const currentUserId = useRef(null);
  const typingTimeouts = useRef({});

  // ============================================
  // WebSocket Connection
  // ============================================

  /**
   * Kết nối WebSocket
   */
  const connectChat = useCallback((userId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("No token available for chat connection");
      return;
    }

    currentUserId.current = userId;
    chatWebSocketService.connect(token);
  }, []);

  /**
   * Ngắt kết nối WebSocket
   */
  const disconnectChat = useCallback(() => {
    chatWebSocketService.disconnect();
    currentUserId.current = null;
    setConversations([]);
    setMessages({});
    setActiveConversation(null);
    setTypingUsers({});
    setUnreadTotal(0);
  }, []);

  // ============================================
  // Conversation Management
  // ============================================

  /**
   * Lấy danh sách conversations
   */
  const fetchConversations = useCallback(async (page = 0, size = 20) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await getConversationsApi(page, size);
      if (response?.code === 200 || response?.result) {
        const result = response.result;
        const convList = result.content || result || [];
        setConversations(convList);

        // Tính tổng unread
        const totalUnread = convList.reduce((total, conv) => {
          const userId = currentUserId.current;
          const unreadCount = conv.unreadCount?.[userId] || 0;
          return total + unreadCount;
        }, 0);
        setUnreadTotal(totalUnread);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Tạo hoặc lấy conversation với shop
   */
  const createOrGetConversation = useCallback(
    async (shopId, initialMessage = null) => {
      try {
        setIsLoading(true);
        const response = await createConversationApi(shopId, initialMessage);

        if (response?.code === 200 || response?.result) {
          const conversation = response.result;

          // Thêm vào danh sách nếu chưa có
          setConversations((prev) => {
            const exists = prev.find((c) => c.id === conversation.id);
            if (exists) {
              return prev.map((c) =>
                c.id === conversation.id ? conversation : c
              );
            }
            return [conversation, ...prev];
          });

          return conversation;
        }
        return null;
      } catch (error) {
        console.error("Failed to create conversation:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Chọn conversation để chat
   */
  const selectConversation = useCallback(
    async (conversationId) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);

        // Fetch messages nếu chưa có
        if (!messages[conversationId]) {
          await fetchMessages(conversationId);
        }

        // Đánh dấu đã đọc
        const userId = currentUserId.current;
        if (conversation.unreadCount?.[userId] > 0) {
          markAsRead(conversationId);
        }
      }
    },
    [conversations, messages]
  );

  // ============================================
  // Message Management
  // ============================================

  /**
   * Lấy tin nhắn trong conversation
   */
  const fetchMessages = useCallback(
    async (conversationId, page = 0, size = 50) => {
      try {
        const response = await getMessagesApi(conversationId, page, size);

        if (response?.code === 200 || response?.result) {
          const result = response.result;
          const messageList = result.content || result || [];

          setMessages((prev) => ({
            ...prev,
            [conversationId]: messageList.reverse(), // Đảo ngược để tin cũ ở đầu
          }));
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    },
    []
  );

  /**
   * Gửi tin nhắn text
   */
  const sendTextMessage = useCallback(
    async (conversationId, text, replyToMessageId = null) => {
      const messageData = {
        conversationId,
        contentType: ContentType.TEXT,
        text,
        replyToMessageId,
      };

      // Thử gửi qua WebSocket trước
      if (chatWebSocketService.isConnected()) {
        const sent = chatWebSocketService.sendMessage(messageData);
        if (sent) {
          return true;
        }
      }

      // Fallback sang REST API
      try {
        const response = await sendMessageApi(messageData);
        if (response?.code === 200 || response?.result) {
          const message = response.result;
          addMessageToConversation(conversationId, message);
          return true;
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
      return false;
    },
    []
  );

  /**
   * Gửi tin nhắn hình ảnh
   */
  const sendImageMessage = useCallback(
    async (conversationId, imageData, caption = null) => {
      const messageData = {
        conversationId,
        contentType: ContentType.IMAGE,
        image: {
          ...imageData,
          caption,
        },
      };

      if (chatWebSocketService.isConnected()) {
        const sent = chatWebSocketService.sendMessage(messageData);
        if (sent) return true;
      }

      try {
        const response = await sendMessageApi(messageData);
        if (response?.code === 200 || response?.result) {
          addMessageToConversation(conversationId, response.result);
          return true;
        }
      } catch (error) {
        console.error("Failed to send image message:", error);
      }
      return false;
    },
    []
  );

  /**
   * Gửi tin nhắn sản phẩm
   */
  const sendProductMessage = useCallback(
    async (conversationId, productId, note = null) => {
      const messageData = {
        conversationId,
        contentType: ContentType.PRODUCT,
        product: {
          productId,
          note,
        },
      };

      if (chatWebSocketService.isConnected()) {
        const sent = chatWebSocketService.sendMessage(messageData);
        if (sent) return true;
      }

      try {
        const response = await sendMessageApi(messageData);
        if (response?.code === 200 || response?.result) {
          addMessageToConversation(conversationId, response.result);
          return true;
        }
      } catch (error) {
        console.error("Failed to send product message:", error);
      }
      return false;
    },
    []
  );

  /**
   * Gửi tin nhắn đơn hàng
   */
  const sendOrderMessage = useCallback(
    async (conversationId, orderId, note = null) => {
      const messageData = {
        conversationId,
        contentType: ContentType.ORDER,
        order: {
          orderId,
          note,
        },
      };

      if (chatWebSocketService.isConnected()) {
        const sent = chatWebSocketService.sendMessage(messageData);
        if (sent) return true;
      }

      try {
        const response = await sendMessageApi(messageData);
        if (response?.code === 200 || response?.result) {
          addMessageToConversation(conversationId, response.result);
          return true;
        }
      } catch (error) {
        console.error("Failed to send order message:", error);
      }
      return false;
    },
    []
  );

  /**
   * Thêm tin nhắn vào conversation
   */
  const addMessageToConversation = useCallback((conversationId, message) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message],
    }));

    // Cập nhật lastMessage trong conversation
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: {
              messageId: message.id,
              senderId: message.senderId,
              senderName: message.senderName,
              preview:
                message.contents?.[0]?.text ||
                getMessagePreview(
                  message.type || message.contents?.[0]?.contentType
                ),
              type: message.type || message.contents?.[0]?.contentType,
              sentAt: message.sentAt,
            },
            updatedAt: message.sentAt,
          };
        }
        return conv;
      })
    );
  }, []);

  /**
   * Lấy preview cho tin nhắn không phải text
   */
  const getMessagePreview = (type) => {
    switch (type) {
      case ContentType.IMAGE:
        return "[Hình ảnh]";
      case ContentType.PRODUCT:
        return "[Sản phẩm]";
      case ContentType.ORDER:
        return "[Đơn hàng]";
      case ContentType.FILE:
        return "[Tệp đính kèm]";
      case ContentType.STICKER:
        return "[Sticker]";
      default:
        return "[Tin nhắn]";
    }
  };

  // ============================================
  // Typing Indicator
  // ============================================

  /**
   * Gửi typing indicator
   */
  const sendTyping = useCallback((conversationId, isTyping) => {
    chatWebSocketService.sendTyping(conversationId, isTyping);
  }, []);

  // ============================================
  // Read Receipts
  // ============================================

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  const markAsRead = useCallback(async (conversationId, messageIds = null) => {
    // Gửi qua WebSocket nếu connected
    if (chatWebSocketService.isConnected()) {
      chatWebSocketService.markAsRead(conversationId, messageIds);
    } else {
      // Fallback sang REST API
      try {
        await markMessagesAsReadApi(conversationId, messageIds);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Cập nhật unreadCount local
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const userId = currentUserId.current;
          return {
            ...conv,
            unreadCount: {
              ...conv.unreadCount,
              [userId]: 0,
            },
          };
        }
        return conv;
      })
    );

    // Cập nhật tổng unread
    updateTotalUnread();
  }, []);

  /**
   * Cập nhật tổng số tin nhắn chưa đọc
   */
  const updateTotalUnread = useCallback(() => {
    const userId = currentUserId.current;
    const total = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount?.[userId] || 0);
    }, 0);
    setUnreadTotal(total);
  }, [conversations]);

  // ============================================
  // Chat UI State
  // ============================================

  /**
   * Mở chat với shop cụ thể
   */
  const openChatWithShop = useCallback(
    async (shopId, shopName = null) => {
      try {
        const conversation = await createOrGetConversation(shopId);
        if (conversation) {
          setActiveConversation(conversation);
          setIsChatOpen(true);
          setIsChatMinimized(false);

          // Fetch messages
          if (!messages[conversation.id]) {
            await fetchMessages(conversation.id);
          }
        }
      } catch (error) {
        console.error("Failed to open chat with shop:", error);
        antdNotification.error({
          message: "Lỗi",
          description: "Không thể mở cuộc trò chuyện với shop",
        });
      }
    },
    [createOrGetConversation, fetchMessages, messages]
  );

  /**
   * Toggle chat widget
   */
  const toggleChat = useCallback(() => {
    setIsChatMinimized((prev) => !prev);
    if (isChatMinimized) {
      setIsChatOpen(true);
    }
  }, [isChatMinimized]);

  /**
   * Đóng chat widget
   */
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    setIsChatMinimized(true);
    setActiveConversation(null);
  }, []);

  // ============================================
  // WebSocket Event Handlers
  // ============================================

  useEffect(() => {
    // Đăng ký handler cho connection state
    const unsubConnection = chatWebSocketService.onConnectionChange((state) => {
      console.log("Chat connection state:", state);
      setConnectionState(state);
    });

    // Đăng ký handler cho messages
    const unsubMessage = chatWebSocketService.onMessage((message) => {
      console.log("Received WebSocket message:", message);

      // Thêm tin nhắn vào conversation
      if (message.conversationId) {
        addMessageToConversation(message.conversationId, message);

        // Hiển thị notification nếu không phải tin nhắn của mình
        const userId = currentUserId.current;
        if (message.senderId !== userId) {
          // Cập nhật unread count nếu không phải conversation đang mở
          if (activeConversation?.id !== message.conversationId) {
            setConversations((prev) =>
              prev.map((conv) => {
                if (conv.id === message.conversationId) {
                  return {
                    ...conv,
                    unreadCount: {
                      ...conv.unreadCount,
                      [userId]: (conv.unreadCount?.[userId] || 0) + 1,
                    },
                  };
                }
                return conv;
              })
            );

            // Hiển thị notification
            antdNotification.info({
              message: message.senderName || "Tin nhắn mới",
              description:
                message.contents?.[0]?.text ||
                getMessagePreview(
                  message.type || message.contents?.[0]?.contentType
                ),
              icon: <MessageOutlined style={{ color: "#ee4d2d" }} />,
              placement: "bottomRight",
              duration: 4,
              onClick: () => {
                selectConversation(message.conversationId);
                setIsChatOpen(true);
                setIsChatMinimized(false);
              },
            });
          } else {
            // Đánh dấu đã đọc nếu đang mở conversation này
            markAsRead(message.conversationId, [message.id]);
          }
        }
      }
    });

    // Đăng ký handler cho typing
    const unsubTyping = chatWebSocketService.onTyping((data) => {
      const { conversationId, userId, typing } = data;

      if (typing) {
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), userId],
        }));

        // Clear typing sau 3 giây
        if (typingTimeouts.current[`${conversationId}_${userId}`]) {
          clearTimeout(typingTimeouts.current[`${conversationId}_${userId}`]);
        }
        typingTimeouts.current[`${conversationId}_${userId}`] = setTimeout(
          () => {
            setTypingUsers((prev) => ({
              ...prev,
              [conversationId]: (prev[conversationId] || []).filter(
                (id) => id !== userId
              ),
            }));
          },
          3000
        );
      } else {
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).filter(
            (id) => id !== userId
          ),
        }));
      }
    });

    // Đăng ký handler cho read receipts
    const unsubReadReceipt = chatWebSocketService.onReadReceipt((data) => {
      const { conversationId, userId, messageIds, readAt } = data;

      // Cập nhật trạng thái đã đọc của tin nhắn
      setMessages((prev) => {
        const conversationMessages = prev[conversationId];
        if (!conversationMessages) return prev;

        return {
          ...prev,
          [conversationId]: conversationMessages.map((msg) => {
            if (messageIds?.includes(msg.id) || messageIds === null) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), userId],
                readAt: readAt || new Date().toISOString(),
                status: MessageStatus.READ,
              };
            }
            return msg;
          }),
        };
      });
    });

    // Đăng ký handler cho presence updates (online/offline)
    const unsubPresence = chatWebSocketService.onPresence((data) => {
      const { userId, status, timestamp } = data;
      console.log("Presence update:", userId, status);

      setUserPresence((prev) => ({
        ...prev,
        [userId]: {
          status: status,
          lastSeen: timestamp,
        },
      }));
    });

    // Cleanup
    return () => {
      unsubConnection();
      unsubMessage();
      unsubTyping();
      unsubReadReceipt();
      unsubPresence();

      // Clear typing timeouts
      Object.values(typingTimeouts.current).forEach(clearTimeout);
    };
  }, [
    activeConversation,
    addMessageToConversation,
    getMessagePreview,
    markAsRead,
    selectConversation,
  ]);

  // Cập nhật total unread khi conversations thay đổi
  useEffect(() => {
    updateTotalUnread();
  }, [conversations, updateTotalUnread]);

  // ============================================
  // Context Value
  // ============================================

  const value = {
    // State
    conversations,
    activeConversation,
    messages,
    typingUsers,
    userPresence,
    connectionState,
    isLoading,
    unreadTotal,
    isChatOpen,
    isChatMinimized,

    // Connection
    connectChat,
    disconnectChat,

    // Conversations
    fetchConversations,
    createOrGetConversation,
    selectConversation,
    setActiveConversation,

    // Messages
    fetchMessages,
    sendTextMessage,
    sendImageMessage,
    sendProductMessage,
    sendOrderMessage,

    // Typing
    sendTyping,

    // Read receipts
    markAsRead,

    // UI State
    openChatWithShop,
    toggleChat,
    closeChat,
    setIsChatOpen,
    setIsChatMinimized,

    // Utils
    isConnected: () => connectionState === ConnectionState.CONNECTED,
    getCurrentUserId: () => currentUserId.current,
    isUserOnline: (userId) => userPresence[userId]?.status === "ONLINE",
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export default ChatContext;
