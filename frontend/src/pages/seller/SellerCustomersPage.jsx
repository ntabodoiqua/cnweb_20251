import { useEffect, useState, useCallback } from "react";
import {
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShopOutlined,
  HeartOutlined,
  FilterOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Avatar, Empty, Tag, notification, DatePicker } from "antd";
import { getMyStoresApi, getStoreFollowersApi } from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import useDebounce from "../../hooks/useDebounce";
import styles from "./SellerCustomersPage.module.css";

const { RangePicker } = DatePicker;

/**
 * SellerCustomersPage - Trang quản lý khách hàng của người bán
 */
const SellerCustomersPage = () => {
  const [loading, setLoading] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch stores
  const fetchStores = useCallback(async () => {
    try {
      setLoadingStores(true);
      const response = await getMyStoresApi(0, 100);

      if (response?.code === 1000) {
        const { content } = response.result;
        const activeStores = content?.filter((store) => store.isActive) || [];
        setStores(activeStores);

        // Auto-select first active store
        if (activeStores.length > 0) {
          setSelectedStoreId(activeStores[0].id);
        }
      } else {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách cửa hàng",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách cửa hàng",
        placement: "topRight",
      });
    } finally {
      setLoadingStores(false);
    }
  }, []);

  // Fetch followers
  const fetchFollowers = useCallback(
    async (page = 0, size = 20) => {
      if (!selectedStoreId) return;

      setLoading(true);
      try {
        const response = await getStoreFollowersApi(
          selectedStoreId,
          page,
          size
        );

        if (response?.code === 1000) {
          const result = response.result;
          let followerList = result.content || [];

          // Filter by search term (client-side)
          if (debouncedSearchTerm) {
            const search = debouncedSearchTerm.toLowerCase();
            followerList = followerList.filter(
              (f) =>
                f.userName?.toLowerCase().includes(search) ||
                f.userId?.toLowerCase().includes(search) ||
                f.email?.toLowerCase().includes(search)
            );
          }

          // Filter by date range (client-side)
          if (filters.startDate) {
            const startDate = filters.startDate.startOf("day").toDate();
            followerList = followerList.filter(
              (f) => new Date(f.followedAt) >= startDate
            );
          }
          if (filters.endDate) {
            const endDate = filters.endDate.endOf("day").toDate();
            followerList = followerList.filter(
              (f) => new Date(f.followedAt) <= endDate
            );
          }

          setFollowers(followerList);
          setPagination({
            current: result.number + 1,
            pageSize: result.size,
            total: result.totalElements,
          });
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách khách hàng",
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedStoreId, debouncedSearchTerm, filters]
  );

  // Fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Fetch followers when store changes
  useEffect(() => {
    if (selectedStoreId) {
      fetchFollowers(0, pagination.pageSize);
    }
  }, [selectedStoreId, debouncedSearchTerm, filters]);

  const handlePageChange = (page) => {
    fetchFollowers(page - 1, pagination.pageSize);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({ startDate: null, endDate: null });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading stores
  if (loadingStores) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner text="Đang tải danh sách cửa hàng..." />
      </div>
    );
  }

  // No stores
  if (!loadingStores && stores.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ShopOutlined style={{ fontSize: 64, color: "#ccc" }} />
        <h3>Bạn chưa có cửa hàng nào</h3>
        <p>Vui lòng tạo cửa hàng trước khi xem khách hàng.</p>
      </div>
    );
  }

  return (
    <div className={styles.sellerCustomers}>
      {/* Store Selector - Show if user has multiple stores */}
      {stores.length > 1 && (
        <div className={styles.storeSelector}>
          <label className={styles.storeSelectorLabel}>
            <ShopOutlined /> Chọn cửa hàng:
          </label>
          <select
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className={styles.storeSelect}
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.storeName || store.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TeamOutlined />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statCount}>{pagination.total}</div>
            <div className={styles.statLabel}>Tổng khách hàng</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <HeartOutlined />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statCount}>{followers.length}</div>
            <div className={styles.statLabel}>Đang hiển thị</div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className={styles.headerActions}>
        <div className={styles.searchBox}>
          <SearchOutlined className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, user ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <FilterOutlined /> Bộ lọc{" "}
            {showFilters ? <UpOutlined /> : <DownOutlined />}
          </button>
          <button
            onClick={handleResetFilters}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <ReloadOutlined /> Đặt lại
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>
                <CalendarOutlined /> Ngày theo dõi
              </label>
              <RangePicker
                value={[filters.startDate, filters.endDate]}
                onChange={(dates) =>
                  setFilters({
                    ...filters,
                    startDate: dates?.[0] || null,
                    endDate: dates?.[1] || null,
                  })
                }
                style={{ width: "100%" }}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Customer Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingTable}>
            <LoadingSpinner text="Đang tải danh sách khách hàng..." />
          </div>
        ) : followers.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchTerm || filters.startDate || filters.endDate
                ? "Không tìm thấy khách hàng phù hợp"
                : "Chưa có khách hàng nào theo dõi cửa hàng"
            }
          />
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Ngày theo dõi</th>
                </tr>
              </thead>
              <tbody>
                {followers.map((follower) => (
                  <tr key={follower.userId}>
                    <td>
                      <div className={styles.customerInfo}>
                        <Avatar
                          size={44}
                          src={follower.avatarUrl}
                          icon={<UserOutlined />}
                          className={styles.avatar}
                        />
                        <div className={styles.customerDetails}>
                          <span className={styles.customerName}>
                            {follower.userName || `User ${follower.userId}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Tag color="blue">{follower.userId}</Tag>
                    </td>
                    <td>
                      {follower.email ? (
                        <span className={styles.emailText}>
                          <MailOutlined /> {follower.email}
                        </span>
                      ) : (
                        <span className={styles.noData}>-</span>
                      )}
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        <CalendarOutlined /> {formatDate(follower.followedAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.total > pagination.pageSize && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationBtn}
                  disabled={pagination.current === 1}
                  onClick={() => handlePageChange(pagination.current - 1)}
                >
                  Trước
                </button>
                <span className={styles.paginationInfo}>
                  Trang {pagination.current} /{" "}
                  {Math.ceil(pagination.total / pagination.pageSize)}
                </span>
                <button
                  className={styles.paginationBtn}
                  disabled={
                    pagination.current >=
                    Math.ceil(pagination.total / pagination.pageSize)
                  }
                  onClick={() => handlePageChange(pagination.current + 1)}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerCustomersPage;
