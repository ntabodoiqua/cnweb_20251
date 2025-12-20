import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { notification as antdNotification } from "antd";
import { BellOutlined } from "@ant-design/icons";
import {
  getRecentNotificationsApi,
  getUnreadNotificationCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from "../util/api";

const NotificationContext = createContext(null);

// WebSocket URL - điều chỉnh theo môi trường
// Nếu VITE_WS_URL không được định nghĩa, sử dụng host hiện tại với ws/wss protocol
const getWsBaseUrl = () => {
  const wsUrl = import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  if (wsUrl) {
    // Nếu đã có protocol (ws:// hoặc wss://), dùng trực tiếp
    if (wsUrl.startsWith("ws://") || wsUrl.startsWith("wss://")) {
      return wsUrl;
    }
    // Nếu chưa có protocol, thêm vào dựa trên protocol hiện tại
    return `${protocol}//${wsUrl}`;
  }

  // Fallback: sử dụng host hiện tại
  return `${protocol}//${window.location.host}`;
};

const WS_BASE_URL = getWsBaseUrl();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3; // Giảm số lần retry
  const wsConnectionFailed = useRef(false); // Flag để ngăn spam log

  // Kết nối WebSocket
  const connectWebSocket = useCallback((userId) => {
    if (!userId) {
      console.log("No userId provided, skipping WebSocket connection");
      return;
    }

    // Nếu đã thất bại quá nhiều lần, không thử nữa trong session này
    if (wsConnectionFailed.current) {
      return;
    }

    // Đóng connection cũ nếu có
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const wsUrl = `${WS_BASE_URL}/ws/notifications?userId=${encodeURIComponent(
        userId
      )}`;
      console.log("Connecting to WebSocket:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Gửi ping mỗi 30 giây để giữ connection
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "PING" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("WebSocket message received:", message);

          switch (message.type) {
            case "NOTIFICATION":
              handleNewNotification(message.payload);
              break;
            case "UNREAD_COUNT":
              setUnreadCount(message.payload);
              break;
            case "CONNECTED":
              console.log("WebSocket connection confirmed");
              break;
            case "PONG":
              // Ping-pong heartbeat
              break;
            default:
              console.log("Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setIsConnected(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Reconnect nếu không phải close chủ ý và chưa vượt quá số lần thử
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(userId);
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          // Đánh dấu đã thất bại, không thử lại nữa
          wsConnectionFailed.current = true;
          console.log(
            "WebSocket connection failed after max attempts. Will use polling instead."
          );
        }
      };

      ws.onerror = () => {
        // Chỉ log lần đầu, không spam console
        if (reconnectAttempts.current === 0) {
          console.warn(
            "WebSocket connection error. Notification updates may be delayed."
          );
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, []);

  // Ngắt kết nối WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    // Reset các flag khi disconnect
    reconnectAttempts.current = 0;
    wsConnectionFailed.current = false;
    setIsConnected(false);
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Xử lý thông báo mới
  const handleNewNotification = useCallback((notification) => {
    // Thêm vào đầu danh sách
    setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Giữ tối đa 50 thông báo

    // Tăng số lượng chưa đọc
    setUnreadCount((prev) => prev + 1);

    // Hiển thị toast notification
    antdNotification.info({
      message: notification.title,
      description: notification.message,
      icon: <BellOutlined style={{ color: "#ee4d2d" }} />,
      placement: "topRight",
      duration: 4,
      onClick: () => {
        if (notification.link) {
          window.location.href = notification.link;
        }
      },
    });
  }, []);

  // Fetch notifications từ API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setNotifications([]);
        return;
      }

      const response = await getRecentNotificationsApi();
      if (response?.result) {
        setNotifications(response.result);
      }
    } catch (error) {
      // Ignore 401 errors silently - user is not authenticated
      if (error?.response?.status === 401) {
        setNotifications([]);
        return;
      }
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch số lượng chưa đọc
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await getUnreadNotificationCountApi();
      if (response?.result) {
        setUnreadCount(response.result.count);
      }
    } catch (error) {
      // Ignore 401 errors silently - user is not authenticated
      if (error?.response?.status === 401) {
        setUnreadCount(0);
        return;
      }
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  // Đánh dấu đã đọc một thông báo
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await markNotificationAsReadApi(notificationId);
      if (response?.result?.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await markAllNotificationsAsReadApi();
      if (response?.result) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    connectWebSocket,
    disconnectWebSocket,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationContext;
