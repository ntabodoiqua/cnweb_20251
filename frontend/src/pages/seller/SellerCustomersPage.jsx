import { useEffect, useState } from "react";
import {
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  LoadingOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Table, Avatar, Empty, Spin, message, Tag } from "antd";
import { getMyStoresApi, getStoreFollowersApi } from "../../util/api";
import styles from "./seller-customers.module.css";

/**
 * SellerCustomersPage - Trang quản lý khách hàng của người bán
 */
const SellerCustomersPage = () => {
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [storeId, setStoreId] = useState(null);

  // Fetch store ID của seller
  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const response = await getMyStoresApi(0, 1);
        console.log("[SellerCustomersPage] getMyStoresApi response:", response);
        console.log("[SellerCustomersPage] response.code:", response?.code);
        console.log("[SellerCustomersPage] response.result:", response?.result);

        if (response?.code === 1000 && response?.result?.content?.length > 0) {
          const myStore = response.result.content[0];
          console.log("[SellerCustomersPage] Found store:", myStore);
          setStoreId(myStore.id);
        } else {
          console.log(
            "[SellerCustomersPage] No store found or invalid response"
          );
          message.error("Không tìm thấy cửa hàng của bạn");
        }
      } catch (error) {
        console.error("[SellerCustomersPage] Error fetching store:", error);
        console.error("[SellerCustomersPage] Error response:", error.response);
        message.error("Không thể tải thông tin cửa hàng");
      }
    };

    fetchStoreId();
  }, []);

  // Fetch followers khi có storeId
  useEffect(() => {
    if (storeId) {
      fetchFollowers(pagination.current - 1, pagination.pageSize);
    }
  }, [storeId]);

  const fetchFollowers = async (page = 0, size = 20) => {
    if (!storeId) return;

    setLoading(true);
    try {
      console.log(
        "[SellerCustomersPage] Fetching followers for storeId:",
        storeId
      );
      const response = await getStoreFollowersApi(storeId, page, size);
      console.log(
        "[SellerCustomersPage] getStoreFollowersApi response:",
        response
      );
      console.log("[SellerCustomersPage] response.code:", response?.code);
      console.log("[SellerCustomersPage] response.result:", response?.result);

      if (response?.code === 1000) {
        const result = response.result;
        console.log("[SellerCustomersPage] Followers data:", result);
        setFollowers(result.content);
        setPagination({
          current: result.number + 1,
          pageSize: result.size,
          total: result.totalElements,
        });
      } else {
        console.log("[SellerCustomersPage] Invalid response or non-1000 code");
      }
    } catch (error) {
      console.error("[SellerCustomersPage] Error fetching followers:", error);
      console.error("[SellerCustomersPage] Error response:", error.response);
      message.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchFollowers(newPagination.current - 1, newPagination.pageSize);
  };

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "userName",
      key: "userName",
      render: (text, record) => (
        <div className={styles.customerInfo}>
          <Avatar
            size={48}
            src={record.avatarUrl}
            icon={<UserOutlined />}
            className={styles.avatar}
          />
          <div className={styles.customerDetails}>
            <div className={styles.customerName}>{text || record.userId}</div>
            {record.email && (
              <div className={styles.customerEmail}>
                <MailOutlined /> {record.email}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Ngày theo dõi",
      dataIndex: "followedAt",
      key: "followedAt",
      render: (date) => (
        <div className={styles.dateInfo}>
          <CalendarOutlined />
          <span>{new Date(date).toLocaleDateString("vi-VN")}</span>
        </div>
      ),
      sorter: (a, b) => new Date(a.followedAt) - new Date(b.followedAt),
    },
  ];

  if (!storeId) {
    return (
      <div className={styles.loadingContainer}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Đang tải thông tin cửa hàng..."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <TeamOutlined className={styles.headerIcon} />
          <div>
            <h2 className={styles.title}>Khách hàng theo dõi</h2>
            <p className={styles.subtitle}>
              Danh sách khách hàng đang theo dõi cửa hàng của bạn
            </p>
          </div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statsNumber}>{pagination.total}</div>
          <div className={styles.statsLabel}>Tổng số khách hàng</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={followers}
          rowKey="userId"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có khách hàng nào theo dõi cửa hàng"
              />
            ),
          }}
          className={styles.table}
        />
      </div>
    </div>
  );
};

export default SellerCustomersPage;
