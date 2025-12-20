import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Empty,
  Pagination,
  Button,
  message,
  Tag,
  Typography,
  Spin,
  Space,
  Avatar,
} from "antd";
import {
  ShopOutlined,
  HeartFilled,
  StarOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { getFollowingStoresApi, unfollowStoreApi } from "../../util/api";
import ChatButton from "../../components/chat/ChatButton";
import styles from "./FollowingStoresPage.module.css";

const { Title, Text, Paragraph } = Typography;

const FollowingStoresPage = () => {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [unfollowingStoreId, setUnfollowingStoreId] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  // Fetch following stores on mount and when pagination changes
  useEffect(() => {
    fetchFollowingStores();
  }, [pagination.current, pagination.pageSize]);

  const fetchFollowingStores = async () => {
    setLoading(true);
    try {
      const response = await getFollowingStoresApi(
        pagination.current - 1,
        pagination.pageSize
      );

      if (response.code === 1000) {
        const result = response.result;
        setStores(result.content || []);
        setPagination((prev) => ({
          ...prev,
          total: result.totalElements || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching following stores:", error);
      message.error("Không thể tải danh sách cửa hàng đang theo dõi");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (storeId, storeName, e) => {
    e.stopPropagation();
    setUnfollowingStoreId(storeId);
    try {
      const response = await unfollowStoreApi(storeId);
      if (response.code === 1000) {
        message.success(`Đã hủy theo dõi ${storeName}`);
        // Remove store from list
        setStores((prev) => prev.filter((store) => store.storeId !== storeId));
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));
      }
    } catch (error) {
      console.error("Error unfollowing store:", error);
      message.error("Không thể hủy theo dõi cửa hàng");
    } finally {
      setUnfollowingStoreId(null);
    }
  };

  const handleStoreClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const renderStoreCard = (store) => {
    return (
      <Card
        key={store.id}
        hoverable
        className={styles.storeCard}
        onClick={() => handleStoreClick(store.storeId)}
      >
        <div className={styles.storeHeader}>
          {store.logoUrl ? (
            <Avatar
              src={store.logoUrl}
              size={64}
              className={styles.storeLogo}
            />
          ) : (
            <Avatar
              icon={<ShopOutlined />}
              size={64}
              className={styles.storeLogoPlaceholder}
            />
          )}
          <div className={styles.storeInfo}>
            <Title level={5} className={styles.storeName}>
              {store.storeName}
            </Title>
            <Paragraph
              ellipsis={{ rows: 2 }}
              className={styles.storeDescription}
            >
              {store.storeDescription || "Chưa có mô tả"}
            </Paragraph>
          </div>
        </div>

        <div className={styles.storeStats}>
          <Space wrap size="small">
            {store.totalProducts > 0 && (
              <Tag icon={<TagsOutlined />} color="blue">
                {store.totalProducts} sản phẩm
              </Tag>
            )}
            {store.totalSold > 0 && (
              <Tag icon={<ShoppingCartOutlined />} color="orange">
                Đã bán {store.totalSold}
              </Tag>
            )}
            {store.averageRating > 0 && (
              <Tag icon={<StarOutlined />} color="gold">
                {store.averageRating.toFixed(1)}
              </Tag>
            )}
            {store.followerCount > 0 && (
              <Tag icon={<TeamOutlined />} color="purple">
                {store.followerCount} người theo dõi
              </Tag>
            )}
          </Space>
        </div>

        <div className={styles.followedAt}>
          <ClockCircleOutlined />
          <Text type="secondary">
            Theo dõi từ: {formatDate(store.followedAt)}
          </Text>
        </div>

        <div className={styles.storeActions}>
          <ChatButton
            shopId={store.storeId}
            shopName={store.storeName}
            type="default"
            size="small"
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            danger
            icon={<HeartFilled />}
            onClick={(e) => handleUnfollow(store.storeId, store.storeName, e)}
            loading={unfollowingStoreId === store.storeId}
            size="small"
          >
            Hủy theo dõi
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Cửa hàng đang theo dõi - HUSTBuy</title>
        <meta
          name="description"
          content="Danh sách các cửa hàng bạn đang theo dõi trên HUSTBuy"
        />
      </Helmet>

      <div className={styles.page}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.pageHeader}>
            <button className={styles.backButton} onClick={() => navigate("/")}>
              <ArrowLeftOutlined />
              <span>Quay lại</span>
            </button>
            <div className={styles.headerContent}>
              <HeartFilled className={styles.headerIcon} />
              <div>
                <h1 className={styles.pageTitle}>Cửa hàng đang theo dõi</h1>
                <p className={styles.pageSubtitle}>
                  Bạn đang theo dõi {pagination.total} cửa hàng
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" tip="Đang tải danh sách cửa hàng..." />
            </div>
          ) : stores.length > 0 ? (
            <>
              <Row gutter={[24, 24]} className={styles.storesGrid}>
                {stores.map((store) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={store.id}>
                    {renderStoreCard(store)}
                  </Col>
                ))}
              </Row>

              {pagination.total > pagination.pageSize && (
                <div className={styles.pagination}>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handlePageChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `Tổng ${total} cửa hàng`}
                    pageSizeOptions={["12", "24", "48"]}
                  />
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyContainer}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    Bạn chưa theo dõi cửa hàng nào.
                    <br />
                    <Text type="secondary">
                      Hãy khám phá và theo dõi các cửa hàng yêu thích!
                    </Text>
                  </span>
                }
              >
                <Button type="primary" onClick={() => navigate("/")}>
                  Khám phá ngay
                </Button>
              </Empty>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FollowingStoresPage;
