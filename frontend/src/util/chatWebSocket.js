/**
 * Chat WebSocket Service
 * Sử dụng STOMP over SockJS để kết nối với Message Service
 */

// WebSocket connection states
export const ConnectionState = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  RECONNECTING: "RECONNECTING",
  ERROR: "ERROR",
};

// Message content types
export const ContentType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  PRODUCT: "PRODUCT",
  ORDER: "ORDER",
  FILE: "FILE",
  STICKER: "STICKER",
};

// Message status
export const MessageStatus = {
  SENDING: "SENDING",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  FAILED: "FAILED",
};

class ChatWebSocketService {
  constructor() {
    this.stompClient = null;
    this.socket = null;
    this.connectionState = ConnectionState.DISCONNECTED;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.pingInterval = null;
    this.subscriptions = {};
    this.messageHandlers = [];
    this.typingHandlers = [];
    this.readReceiptHandlers = [];
    this.connectionHandlers = [];
    this.token = null;
  }

  /**
   * Lấy WebSocket base URL
   */
  getWsBaseUrl() {
    // Kiểm tra VITE_WS_URL (cho WebSocket thuần)
    const wsUrl = import.meta.env.VITE_WS_URL;

    if (wsUrl) {
      // Nếu đã có protocol ws:// hoặc wss://, dùng trực tiếp cho SockJS (cần http/https)
      if (wsUrl.startsWith("ws://")) {
        return wsUrl.replace("ws://", "http://");
      }
      if (wsUrl.startsWith("wss://")) {
        return wsUrl.replace("wss://", "https://");
      }
      // Nếu không có protocol, thêm http/https dựa trên protocol hiện tại
      const protocol =
        window.location.protocol === "https:" ? "https:" : "http:";
      return `${protocol}//${wsUrl}`;
    }

    // Fallback: sử dụng VITE_BACKEND_URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl) {
      return backendUrl;
    }

    // Cuối cùng: sử dụng host hiện tại
    return `${window.location.protocol}//${window.location.host}`;
  }

  /**
   * Kết nối WebSocket
   * @param {string} token - JWT token
   */
  async connect(token) {
    if (this.connectionState === ConnectionState.CONNECTED) {
      console.log("WebSocket already connected");
      return;
    }

    this.token = token;
    this.connectionState = ConnectionState.CONNECTING;
    this.notifyConnectionHandlers(ConnectionState.CONNECTING);

    try {
      // Dynamic import SockJS và STOMP
      const SockJS = (await import("sockjs-client")).default;
      const { Client } = await import("@stomp/stompjs");

      const wsUrl = `${this.getWsBaseUrl()}/ws/chat`;
      console.log("Connecting to WebSocket:", wsUrl);

      // Tạo SockJS socket
      this.socket = new SockJS(wsUrl);

      // Tạo STOMP client
      this.stompClient = new Client({
        webSocketFactory: () => this.socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          if (import.meta.env.DEV) {
            console.log("[STOMP Debug]", str);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Xử lý kết nối thành công
      this.stompClient.onConnect = (frame) => {
        console.log("STOMP Connected:", frame);
        this.connectionState = ConnectionState.CONNECTED;
        this.reconnectAttempts = 0;
        this.notifyConnectionHandlers(ConnectionState.CONNECTED);
        this.subscribeToChannels();
        this.startPingInterval();
      };

      // Xử lý lỗi
      this.stompClient.onStompError = (frame) => {
        console.error("STOMP Error:", frame);
        this.connectionState = ConnectionState.ERROR;
        this.notifyConnectionHandlers(ConnectionState.ERROR);
      };

      // Xử lý ngắt kết nối
      this.stompClient.onDisconnect = () => {
        console.log("STOMP Disconnected");
        this.connectionState = ConnectionState.DISCONNECTED;
        this.notifyConnectionHandlers(ConnectionState.DISCONNECTED);
        this.stopPingInterval();
        this.handleReconnect();
      };

      // Xử lý lỗi WebSocket
      this.stompClient.onWebSocketClose = (event) => {
        console.log("WebSocket closed:", event);
        if (this.connectionState === ConnectionState.CONNECTED) {
          this.connectionState = ConnectionState.DISCONNECTED;
          this.notifyConnectionHandlers(ConnectionState.DISCONNECTED);
          this.handleReconnect();
        }
      };

      // Kích hoạt kết nối
      this.stompClient.activate();
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.connectionState = ConnectionState.ERROR;
      this.notifyConnectionHandlers(ConnectionState.ERROR);
      this.handleReconnect();
    }
  }

  /**
   * Subscribe vào các channels
   */
  subscribeToChannels() {
    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }

    // Subscribe để nhận tin nhắn mới
    this.subscriptions.messages = this.stompClient.subscribe(
      "/user/queue/messages",
      (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("Received message:", data);
          this.notifyMessageHandlers(data);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      }
    );

    // Subscribe để nhận typing indicator
    this.subscriptions.typing = this.stompClient.subscribe(
      "/user/queue/typing",
      (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("Received typing:", data);
          this.notifyTypingHandlers(data);
        } catch (error) {
          console.error("Error parsing typing:", error);
        }
      }
    );

    // Subscribe để nhận read receipts
    this.subscriptions.readReceipts = this.stompClient.subscribe(
      "/user/queue/read-receipts",
      (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("Received read receipt:", data);
          this.notifyReadReceiptHandlers(data);
        } catch (error) {
          console.error("Error parsing read receipt:", error);
        }
      }
    );

    console.log("Subscribed to all chat channels");
  }

  /**
   * Gửi tin nhắn qua WebSocket
   * @param {Object} messageData - Dữ liệu tin nhắn
   */
  sendMessage(messageData) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error("Not connected to WebSocket");
      return false;
    }

    try {
      this.stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(messageData),
      });
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  /**
   * Gửi typing indicator
   * @param {string} conversationId - ID conversation
   * @param {boolean} isTyping - Đang gõ hay không
   */
  sendTyping(conversationId, isTyping) {
    if (!this.stompClient || !this.stompClient.connected) {
      return false;
    }

    try {
      this.stompClient.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({
          conversationId,
          typing: isTyping,
        }),
      });
      return true;
    } catch (error) {
      console.error("Error sending typing:", error);
      return false;
    }
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   * @param {string} conversationId - ID conversation
   * @param {string[]} messageIds - Danh sách ID tin nhắn (null = tất cả)
   */
  markAsRead(conversationId, messageIds = null) {
    if (!this.stompClient || !this.stompClient.connected) {
      return false;
    }

    try {
      this.stompClient.publish({
        destination: "/app/chat.read",
        body: JSON.stringify({
          conversationId,
          messageIds,
        }),
      });
      return true;
    } catch (error) {
      console.error("Error marking as read:", error);
      return false;
    }
  }

  /**
   * Ngắt kết nối
   */
  disconnect() {
    this.stopReconnect();
    this.stopPingInterval();

    // Unsubscribe tất cả channels
    Object.values(this.subscriptions).forEach((sub) => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    });
    this.subscriptions = {};

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.connectionState = ConnectionState.DISCONNECTED;
    this.notifyConnectionHandlers(ConnectionState.DISCONNECTED);
    this.token = null;
  }

  /**
   * Xử lý reconnect
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached");
      return;
    }

    if (!this.token) {
      console.log("No token for reconnection");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.connectionState = ConnectionState.RECONNECTING;
    this.notifyConnectionHandlers(ConnectionState.RECONNECTING);

    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.token);
    }, delay);
  }

  /**
   * Dừng reconnect
   */
  stopReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Bắt đầu ping interval
   */
  startPingInterval() {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.stompClient && this.stompClient.connected) {
        // STOMP client tự động gửi heartbeat
      }
    }, 30000);
  }

  /**
   * Dừng ping interval
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Handler registration methods

  /**
   * Đăng ký handler cho message events
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Đăng ký handler cho typing events
   */
  onTyping(handler) {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Đăng ký handler cho read receipt events
   */
  onReadReceipt(handler) {
    this.readReceiptHandlers.push(handler);
    return () => {
      this.readReceiptHandlers = this.readReceiptHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  /**
   * Đăng ký handler cho connection state changes
   */
  onConnectionChange(handler) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  // Notification methods

  notifyMessageHandlers(data) {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error("Error in message handler:", error);
      }
    });
  }

  notifyTypingHandlers(data) {
    this.typingHandlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error("Error in typing handler:", error);
      }
    });
  }

  notifyReadReceiptHandlers(data) {
    this.readReceiptHandlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error("Error in read receipt handler:", error);
      }
    });
  }

  notifyConnectionHandlers(state) {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(state);
      } catch (error) {
        console.error("Error in connection handler:", error);
      }
    });
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected() {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  /**
   * Lấy trạng thái kết nối hiện tại
   */
  getConnectionState() {
    return this.connectionState;
  }
}

// Singleton instance
const chatWebSocketService = new ChatWebSocketService();

export default chatWebSocketService;
