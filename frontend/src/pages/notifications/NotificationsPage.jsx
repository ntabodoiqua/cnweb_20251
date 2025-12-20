import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Avatar,
  Typography,
  Empty,
  Spin,
  Button,
  Pagination,
  Tag,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShopOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  GiftOutlined,
  UserOutlined,
  LockOutlined,
  StarOutlined,
  TagOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { getNotificationsApi } from "../../util/api";
import styles from "./NotificationsPage.module.css";

const { Title, Text } = Typography;

// Map notification type to icon
const getNotificationIcon = (type) => {
  const iconMap = {
    ORDER_PLACED: <ShoppingCartOutlined />,
    ORDER_CONFIRMED: <CheckOutlined />,
    ORDER_SHIPPED: <ShoppingCartOutlined />,
    ORDER_DELIVERED: <GiftOutlined />,
    ORDER_CANCELLED: <WarningOutlined />,
    PAYMENT_SUCCESS: <DollarOutlined style={{ color: "#52c41a" }} />,
    PAYMENT_FAILED: <WarningOutlined style={{ color: "#ff4d4f" }} />,
    REFUND_SUCCESS: <DollarOutlined style={{ color: "#52c41a" }} />,
    REFUND_FAILED: <WarningOutlined style={{ color: "#ff4d4f" }} />,
    ACCOUNT_VERIFIED: <CheckOutlined style={{ color: "#52c41a" }} />,
    PASSWORD_CHANGED: <LockOutlined />,
    PROFILE_UPDATED: <UserOutlined />,
    SELLER_APPROVED: <ShopOutlined style={{ color: "#52c41a" }} />,
    SELLER_REJECTED: <ShopOutlined style={{ color: "#ff4d4f" }} />,
    STORE_CREATED: <ShopOutlined style={{ color: "#52c41a" }} />,
    NEW_ORDER: <ShoppingCartOutlined style={{ color: "#ee4d2d" }} />,
    PRODUCT_OUT_OF_STOCK: <WarningOutlined style={{ color: "#ff4d4f" }} />,
    PRODUCT_LOW_STOCK: <WarningOutlined style={{ color: "#faad14" }} />,
    NEW_REVIEW: <StarOutlined style={{ color: "#faad14" }} />,
    PROMOTION: <TagOutlined style={{ color: "#ee4d2d" }} />,
    COUPON_RECEIVED: <GiftOutlined style={{ color: "#ee4d2d" }} />,
    SYSTEM: <InfoCircleOutlined />,
    INFO: <InfoCircleOutlined />,
  };
  return iconMap[type] || <BellOutlined />;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { markAsRead, markAllAsRead, unreadCount } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  const fetchNotifications = async (pageNum) => {
    try {
      setLoading(true);
      const response = await getNotificationsApi(pageNum, pageSize);
      if (response?.result) {
        setNotifications(response.result.content || []);
        setTotal(response.result.totalElements || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Card className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <BellOutlined className={styles.headerIcon} />
              <Title level={3} className={styles.title}>
                Thông báo
              </Title>
              {unreadCount > 0 && <Tag color="red">{unreadCount} chưa đọc</Tag>}
            </div>
            {unreadCount > 0 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
            </div>
          ) : notifications.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Bạn chưa có thông báo nào"
            />
          ) : (
            <>
              <List
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item
                    className={`${styles.notificationItem} ${
                      !item.isRead ? styles.unread : ""
                    }`}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          className={styles.avatar}
                          icon={getNotificationIcon(item.type)}
                          src={item.imageUrl}
                          size={48}
                        />
                      }
                      title={
                        <div className={styles.itemTitle}>
                          <Text strong={!item.isRead}>{item.title}</Text>
                          {!item.isRead && (
                            <span className={styles.unreadDot} />
                          )}
                        </div>
                      }
                      description={
                        <div className={styles.itemContent}>
                          <Text className={styles.message}>{item.message}</Text>
                          <Text className={styles.time}>
                            {formatDate(item.createdAt)}
                          </Text>
                        </div>
                      }
                    />
                    {item.typeDisplayName && (
                      <Tag className={styles.typeTag}>
                        {item.typeDisplayName}
                      </Tag>
                    )}
                  </List.Item>
                )}
              />

              <div className={styles.pagination}>
                <Pagination
                  current={page + 1}
                  total={total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} thông báo`
                  }
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
