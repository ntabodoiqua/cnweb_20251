import { useState, useEffect } from "react";
import { notification, Modal } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {
  getStoresAdminApi,
  toggleStoreStatusApi,
  getProvincesApi,
  getWardInfoApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminStoresPage.module.css";

/**
 * AdminStoresPage - Trang quản lý cửa hàng
 * Hiển thị danh sách cửa hàng và các thao tác quản lý
 */
const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [provinces, setProvinces] = useState({});
  const [wards, setWards] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    storeName: "",
    userName: "",
    isActive: "",
    page: 0,
    size: 10,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showStoreDetail, setShowStoreDetail] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch stores from API
  useEffect(() => {
    fetchStores();
  }, [filters.page, filters.size]);

  const fetchProvinces = async () => {
    try {
      const response = await getProvincesApi();
      if (response && response.code === 1000) {
        const provincesMap = {};
        response.result.forEach((province) => {
          provincesMap[province.id] = province.name;
        });
        setProvinces(provincesMap);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchWardInfo = async (wardId) => {
    if (wards[wardId]) return wards[wardId];

    try {
      const response = await getWardInfoApi(wardId);
      if (response && response.code === 1000) {
        setWards((prev) => ({
          ...prev,
          [wardId]: response.result.name,
        }));
        return response.result.name;
      }
    } catch (error) {
      console.error("Error fetching ward info:", error);
    }
    return null;
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = { ...filters };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await getStoresAdminApi(params);

      if (response && response.code === 1000) {
        const storesData = response.result.content || [];
        setStores(storesData);
        setTotalElements(response.result.totalElements || 0);
        setTotalPages(response.result.totalPages || 0);

        // Fetch ward info for all stores
        storesData.forEach((store) => {
          if (store.wardId && !wards[store.wardId]) {
            fetchWardInfo(store.wardId);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách cửa hàng",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0,
    }));
  };

  const handleSearch = () => {
    fetchStores();
  };

  const handleResetFilters = () => {
    setFilters({
      storeName: "",
      userName: "",
      isActive: "",
      page: 0,
      size: 10,
    });
    setTimeout(() => fetchStores(), 0);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewStore = async (store) => {
    // Fetch ward info if not already loaded
    if (store.wardId && !wards[store.wardId]) {
      await fetchWardInfo(store.wardId);
    }
    setSelectedStore(store);
    setShowStoreDetail(true);
  };

  const getLocationDisplay = (provinceId, wardId) => {
    const parts = [];
    if (wards[wardId]) {
      parts.push(wards[wardId]);
    }
    if (provinces[provinceId]) {
      parts.push(provinces[provinceId]);
    }
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  const handleToggleStatus = async (storeId) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc chắn muốn thay đổi trạng thái cửa hàng này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await toggleStoreStatusApi(storeId);
          notification.success({
            message: "Thành công",
            description: "Cập nhật trạng thái thành công!",
            placement: "topRight",
            duration: 3,
          });
          fetchStores();
        } catch (error) {
          console.error("Error toggling store status:", error);
          notification.error({
            message: "Lỗi cập nhật trạng thái",
            description:
              error.response?.data?.message || "Không thể cập nhật trạng thái",
            placement: "topRight",
            duration: 3,
          });
        }
      },
    });
  };

  return (
    <div className={styles.adminStores}>
      {/* Filter Section */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <div className={styles.adminSearchBox}>
            <SearchOutlined className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên cửa hàng..."
              value={filters.storeName}
              onChange={(e) => handleFilterChange("storeName", e.target.value)}
              className={styles.adminSearchInput}
            />
          </div>
          <div className={styles.toolbarActions}>
            <button
              className={`admin-btn ${
                showFilters ? "admin-btn-primary" : "admin-btn-secondary"
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterOutlined />
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleResetFilters}
            >
              <ReloadOutlined />
              Đặt lại
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSearch}
            >
              <SearchOutlined />
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.adminFilters}>
            <div className={styles.filterGrid}>
              <div className={styles.filterItem}>
                <label>Tên tài khoản</label>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo username..."
                  value={filters.userName}
                  onChange={(e) =>
                    handleFilterChange("userName", e.target.value)
                  }
                />
              </div>
              <div className={styles.filterItem}>
                <label>Trạng thái</label>
                <select
                  value={filters.isActive}
                  onChange={(e) =>
                    handleFilterChange("isActive", e.target.value)
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Ngừng hoạt động</option>
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Số kết quả/trang</label>
                <select
                  value={filters.size}
                  onChange={(e) =>
                    handleFilterChange("size", parseInt(e.target.value))
                  }
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stores Table */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          <ShopOutlined /> Danh sách cửa hàng ({totalElements})
        </h2>
        <div className={styles.adminTableContainer}>
          {loading ? (
            <LoadingSpinner
              tip="Đang tải danh sách cửa hàng..."
              fullScreen={false}
            />
          ) : (
            <table className={`admin-table ${styles.adminTable}`}>
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Tên cửa hàng</th>
                  <th>Tài khoản</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th className={styles.stickyColumn}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {stores.length > 0 ? (
                  stores.map((store) => (
                    <tr key={store.id}>
                      <td>
                        {store.logoUrl ? (
                          <img
                            src={store.logoUrl}
                            alt={store.storeName}
                            className={styles.storeLogo}
                          />
                        ) : (
                          <div className={styles.storeLogoPlaceholder}>
                            <ShopOutlined />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className={styles.storeName}>
                          <strong>{store.storeName}</strong>
                          <small className={styles.storeDescription}>
                            {store.storeDescription}
                          </small>
                        </div>
                      </td>
                      <td>{store.userName}</td>
                      <td>{store.contactEmail}</td>
                      <td>{store.contactPhone}</td>
                      <td>
                        <div className={styles.address}>
                          {store.shopAddress}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            store.isActive
                              ? styles.statusActive
                              : styles.statusInactive
                          }`}
                          title={
                            store.isActive ? "Hoạt động" : "Ngừng hoạt động"
                          }
                        >
                          {store.isActive ? (
                            <CheckCircleOutlined />
                          ) : (
                            <CloseCircleOutlined />
                          )}
                        </span>
                      </td>
                      <td>{formatDate(store.createdAt)}</td>
                      <td className={styles.stickyColumn}>
                        <div className={styles.adminActionButtons}>
                          <button
                            className={`${styles.adminActionBtn} ${styles.view}`}
                            title="Xem chi tiết"
                            onClick={() => handleViewStore(store)}
                          >
                            <EyeOutlined />
                          </button>
                          <button
                            className={`${styles.adminActionBtn} ${styles.lock}`}
                            title={
                              store.isActive ? "Ngừng hoạt động" : "Kích hoạt"
                            }
                            onClick={() => handleToggleStatus(store.id)}
                          >
                            {store.isActive ? (
                              <CloseCircleOutlined />
                            ) : (
                              <CheckCircleOutlined />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className={styles.adminEmptyState}>
                        <ShopOutlined
                          style={{ fontSize: "48px", color: "#ccc" }}
                        />
                        <p>Không tìm thấy cửa hàng nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className={styles.adminPagination}>
            <button
              className="admin-btn admin-btn-secondary"
              disabled={filters.page === 0}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              ← Trước
            </button>
            <span className={styles.paginationInfo}>
              Trang {filters.page + 1} / {totalPages}
            </span>
            <button
              className="admin-btn admin-btn-secondary"
              disabled={filters.page >= totalPages - 1}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              Sau →
            </button>

            <div className={styles.pageSizeSelector}>
              <label>Hiển thị:</label>
              <select
                value={filters.size}
                onChange={(e) =>
                  handleFilterChange("size", parseInt(e.target.value))
                }
                className={styles.pageSizeSelect}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>kết quả/trang</span>
            </div>
          </div>
        )}
      </div>

      {/* Store Detail Modal */}
      {showStoreDetail && selectedStore && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowStoreDetail(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                <ShopOutlined /> Chi tiết cửa hàng
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowStoreDetail(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.storeDetail}>
                <div className={styles.storeDetailHeader}>
                  {selectedStore.logoUrl && (
                    <div className={styles.storeDetailLogo}>
                      <img
                        src={selectedStore.logoUrl}
                        alt={selectedStore.storeName}
                      />
                    </div>
                  )}
                  {selectedStore.bannerUrl && (
                    <div className={styles.storeDetailBanner}>
                      <img src={selectedStore.bannerUrl} alt="Store Banner" />
                    </div>
                  )}
                </div>

                <div className={styles.storeDetailInfo}>
                  <h4>Thông tin cơ bản</h4>
                  <div className={styles.infoRow}>
                    <label>Tên cửa hàng:</label>
                    <span>{selectedStore.storeName}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Mô tả:</label>
                    <span>
                      {selectedStore.storeDescription || "Không có mô tả"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Tài khoản:</label>
                    <span>{selectedStore.userName}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>ID Seller Profile:</label>
                    <span className={styles.idText}>
                      {selectedStore.sellerProfileId}
                    </span>
                  </div>

                  <h4>Thông tin liên hệ</h4>
                  <div className={styles.infoRow}>
                    <label>Email:</label>
                    <span>{selectedStore.contactEmail}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Số điện thoại:</label>
                    <span>{selectedStore.contactPhone}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Địa chỉ:</label>
                    <span>{selectedStore.shopAddress}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Phường/Xã:</label>
                    <span>
                      {wards[selectedStore.wardId] ||
                        `ID: ${selectedStore.wardId}`}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Tỉnh/Thành phố:</label>
                    <span>
                      {provinces[selectedStore.provinceId] ||
                        `ID: ${selectedStore.provinceId}`}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Địa chỉ đầy đủ:</label>
                    <span>
                      {selectedStore.shopAddress}
                      {getLocationDisplay(
                        selectedStore.provinceId,
                        selectedStore.wardId
                      ) !== "N/A"
                        ? `, ${getLocationDisplay(
                            selectedStore.provinceId,
                            selectedStore.wardId
                          )}`
                        : ""}
                    </span>
                  </div>

                  <h4>Hình ảnh</h4>
                  <div className={styles.infoRow}>
                    <label>Logo:</label>
                    <span>{selectedStore.logoName || "Chưa có logo"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Banner:</label>
                    <span>{selectedStore.bannerName || "Chưa có banner"}</span>
                  </div>

                  <h4>Trạng thái & Thời gian</h4>
                  <div className={styles.infoRow}>
                    <label>Trạng thái:</label>
                    <span
                      className={
                        selectedStore.isActive
                          ? styles.textSuccess
                          : styles.textDanger
                      }
                    >
                      {selectedStore.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedStore.createdAt)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Cập nhật lần cuối:</label>
                    <span>{formatDate(selectedStore.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowStoreDetail(false)}
              >
                Đóng
              </button>
              <button
                className={`admin-btn ${
                  selectedStore.isActive
                    ? "admin-btn-danger"
                    : "admin-btn-success"
                }`}
                onClick={() => {
                  handleToggleStatus(selectedStore.id);
                  setShowStoreDetail(false);
                }}
              >
                {selectedStore.isActive ? "Ngừng hoạt động" : "Kích hoạt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoresPage;
