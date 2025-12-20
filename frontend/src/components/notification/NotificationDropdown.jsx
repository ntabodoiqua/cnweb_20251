import React, { useEffect, useState } from "react";
import { Dropdown, Empty, Spin, Button, List, Avatar, Typography } from "antd";
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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import styles from "./NotificationDropdown.module.css";

const { Text } = Typography;

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

// Format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN");
};

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  const [open, setOpen] = useState(false);

  // Fetch notifications khi mở dropdown - chỉ gọi nếu đã đăng nhập
  useEffect(() => {
    if (open) {
      const token = localStorage.getItem("access_token");
      if (token) {
        fetchNotifications();
      }
    }
  }, [open, fetchNotifications]);

  // Fetch unread count khi component mount - chỉ gọi nếu đã đăng nhập
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  // Xử lý click vào notification
  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate đến link nếu có
    if (notification.link) {
      setOpen(false);
      navigate(notification.link);
    }
  };

  // Render notification item
  const renderNotificationItem = (item) => (
    <List.Item
      className={`${styles.notificationItem} ${
        !item.isRead ? styles.unread : ""
      }`}
      onClick={() => handleNotificationClick(item)}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            className={styles.notificationAvatar}
            icon={getNotificationIcon(item.type)}
            src={item.imageUrl}
          />
        }
        title={
          <div className={styles.notificationTitle}>
            <Text strong={!item.isRead}>{item.title}</Text>
            {!item.isRead && <span className={styles.unreadDot} />}
          </div>
        }
        description={
          <div className={styles.notificationContent}>
            <Text className={styles.notificationMessage} ellipsis={{ rows: 2 }}>
              {item.message}
            </Text>
            <Text className={styles.notificationTime}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  // Dropdown content
  const dropdownContent = (
    <div className={styles.notificationDropdown}>
      {/* Header */}
      <div className={styles.dropdownHeader}>
        <span className={styles.headerTitle}>Thông báo</span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              markAllAsRead();
            }}
            className={styles.markAllReadBtn}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Content */}
      <div className={styles.dropdownContent}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spin size="default" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo"
            className={styles.emptyState}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={renderNotificationItem}
            className={styles.notificationList}
          />
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className={styles.dropdownFooter}>
          <Button
            type="link"
            block
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
          >
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => dropdownContent}
      placement="bottomRight"
      overlayClassName={styles.dropdownOverlay}
    >
      <div className={styles.notificationIcon}>
        <BellOutlined className={styles.bellIcon} />
        {unreadCount > 0 && (
          <span className={styles.notificationBadge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
    </Dropdown>
  );
};

export default NotificationDropdown;
