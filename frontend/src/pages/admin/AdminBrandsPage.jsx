import { useState, useEffect } from "react";
import { notification } from "antd";
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
  UploadOutlined,
} from "@ant-design/icons";
import {
  getBrandsAdminApi,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
  uploadBrandLogoApi,
  toggleBrandStatusApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminBrandsPage.module.css";

/**
 * AdminBrandsPage - Trang quản lý thương hiệu
 * Hiển thị danh sách thương hiệu và các thao tác quản lý
 */
const AdminBrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    name: "",
    isActive: "",
    page: 0,
    size: 10,
    sort: "createdAt,desc",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showBrandDetail, setShowBrandDetail] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  // Fetch brands from API
  useEffect(() => {
    fetchBrands();
  }, [filters.page, filters.size, filters.sort]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params = { ...filters };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await getBrandsAdminApi(params);

      if (response && response.code === 1000) {
        setBrands(response.result.content || []);
        setTotalElements(response.result.totalElements || 0);
        setTotalPages(response.result.totalPages || 0);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách thương hiệu",
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
    fetchBrands();
  };

  const handleResetFilters = () => {
    setFilters({
      name: "",
      isActive: "",
      page: 0,
      size: 10,
      sort: "createdAt,desc",
    });
    setTimeout(() => fetchBrands(), 0);
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

  const handleViewBrand = (brand) => {
    setSelectedBrand(brand);
    setShowBrandDetail(true);
  };

  const handleAddBrand = () => {
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
    setSelectedBrand(null);
    setShowBrandForm(true);
  };

  const handleEditBrand = (brand) => {
    setFormData({
      name: brand.name,
      description: brand.description || "",
      isActive: brand.isActive,
    });
    setSelectedBrand(brand);
    setShowBrandForm(true);
  };

  const handleDeleteBrand = async (brandId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;

    try {
      await deleteBrandApi(brandId);
      notification.success({
        message: "Thành công",
        description: "Xóa thương hiệu thành công!",
        placement: "topRight",
        duration: 3,
      });
      fetchBrands();
    } catch (error) {
      console.error("Error deleting brand:", error);
      notification.error({
        message: "Lỗi xóa thương hiệu",
        description:
          error.response?.data?.message || "Không thể xóa thương hiệu",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleToggleStatus = async (brandId) => {
    try {
      await toggleBrandStatusApi(brandId);
      notification.success({
        message: "Thành công",
        description: "Cập nhật trạng thái thành công!",
        placement: "topRight",
        duration: 3,
      });
      fetchBrands();
    } catch (error) {
      console.error("Error toggling brand status:", error);
      notification.error({
        message: "Lỗi cập nhật trạng thái",
        description:
          error.response?.data?.message || "Không thể cập nhật trạng thái",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const handleUploadLogo = async (brandId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        await uploadBrandLogoApi(brandId, file);
        notification.success({
          message: "Thành công",
          description: "Tải logo thành công!",
          placement: "topRight",
          duration: 3,
        });
        fetchBrands();
      } catch (error) {
        console.error("Error uploading logo:", error);
        notification.error({
          message: "Lỗi tải logo",
          description: error.response?.data?.message || "Không thể tải logo",
          placement: "topRight",
          duration: 3,
        });
      }
    };
    input.click();
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    try {
      // Cả create và update đều chỉ gửi name và description
      const brandData = {
        name: formData.name,
        description: formData.description,
      };

      if (selectedBrand) {
        // Update existing brand
        await updateBrandApi(selectedBrand.id, brandData);
        notification.success({
          message: "Thành công",
          description: "Cập nhật thương hiệu thành công!",
          placement: "topRight",
          duration: 3,
        });
      } else {
        // Create new brand
        await createBrandApi(brandData);
        notification.success({
          message: "Thành công",
          description: "Tạo thương hiệu thành công!",
          placement: "topRight",
          duration: 3,
        });
      }

      setShowBrandForm(false);
      fetchBrands();
    } catch (error) {
      console.error("Error submitting brand:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi lưu thương hiệu";
      notification.error({
        message: "Lỗi",
        description: errorMessage,
        placement: "topRight",
        duration: 3,
      });
    }
  };

  return (
    <div className={styles.adminBrands}>
      {/* Filter Section */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <div className={styles.adminSearchBox}>
            <SearchOutlined className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên thương hiệu..."
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              className={styles.adminSearchInput}
            />
          </div>
          <div className={styles.toolbarActions}>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleAddBrand}
            >
              <PlusOutlined />
              Thêm thương hiệu
            </button>
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

      {/* Brands Table */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          Danh sách thương hiệu ({totalElements})
        </h2>
        <div className={styles.adminTableContainer}>
          {loading ? (
            <LoadingSpinner
              tip="Đang tải danh sách thương hiệu..."
              fullScreen={false}
            />
          ) : (
            <table className={`admin-table ${styles.adminTable}`}>
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Tên thương hiệu</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Cập nhật</th>
                  <th className={styles.stickyColumn}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <tr key={brand.id}>
                      <td>
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className={styles.brandLogo}
                          />
                        ) : (
                          <div className={styles.brandLogoPlaceholder}>
                            No Logo
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{brand.name}</strong>
                      </td>
                      <td>
                        <div className={styles.description}>
                          {brand.description || "Không có mô tả"}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            brand.isActive
                              ? styles.statusActive
                              : styles.statusInactive
                          }`}
                          title={
                            brand.isActive ? "Hoạt động" : "Ngừng hoạt động"
                          }
                        >
                          {brand.isActive ? (
                            <CheckCircleOutlined />
                          ) : (
                            <CloseCircleOutlined />
                          )}
                        </span>
                      </td>
                      <td>{formatDate(brand.createdAt)}</td>
                      <td>{formatDate(brand.updatedAt)}</td>
                      <td className={styles.stickyColumn}>
                        <div className={styles.adminActionButtons}>
                          <button
                            className={`${styles.adminActionBtn} ${styles.view}`}
                            title="Xem chi tiết"
                            onClick={() => handleViewBrand(brand)}
                          >
                            <EyeOutlined />
                          </button>
                          <button
                            className={`${styles.adminActionBtn} ${styles.upload}`}
                            title="Tải logo"
                            onClick={() => handleUploadLogo(brand.id)}
                          >
                            <UploadOutlined />
                          </button>
                          <button
                            className={`${styles.adminActionBtn} ${styles.edit}`}
                            title="Chỉnh sửa"
                            onClick={() => handleEditBrand(brand)}
                          >
                            <EditOutlined />
                          </button>
                          <button
                            className={`${styles.adminActionBtn} ${styles.lock}`}
                            title={
                              brand.isActive ? "Ngừng hoạt động" : "Kích hoạt"
                            }
                            onClick={() => handleToggleStatus(brand.id)}
                          >
                            {brand.isActive ? (
                              <CloseCircleOutlined />
                            ) : (
                              <CheckCircleOutlined />
                            )}
                          </button>
                          <button
                            className={`${styles.adminActionBtn} ${styles.delete}`}
                            title="Xóa"
                            onClick={() => handleDeleteBrand(brand.id)}
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className={styles.adminEmptyState}>
                        <p>Không tìm thấy thương hiệu nào</p>
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

      {/* Brand Detail Modal */}
      {showBrandDetail && selectedBrand && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowBrandDetail(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Chi tiết thương hiệu</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowBrandDetail(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.brandDetail}>
                {selectedBrand.logoUrl && (
                  <div className={styles.brandDetailLogo}>
                    <img src={selectedBrand.logoUrl} alt={selectedBrand.name} />
                  </div>
                )}
                <div className={styles.brandDetailInfo}>
                  <div className={styles.infoRow}>
                    <label>Tên thương hiệu:</label>
                    <span>{selectedBrand.name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Mô tả:</label>
                    <span>{selectedBrand.description || "Không có mô tả"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Trạng thái:</label>
                    <span>
                      {selectedBrand.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedBrand.createdAt)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Cập nhật lần cuối:</label>
                    <span>{formatDate(selectedBrand.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brand Form Modal */}
      {showBrandForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowBrandForm(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                {selectedBrand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowBrandForm(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleSubmitForm} className={styles.brandForm}>
                <div className={styles.formGroup}>
                  <label>Tên thương hiệu *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập tên thương hiệu"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Nhập mô tả thương hiệu"
                    rows="4"
                  />
                </div>

                {/* Thông báo về trạng thái */}
                <div className={styles.formNote}>
                  <small style={{ color: "#999" }}>
                    {selectedBrand
                      ? "* Sử dụng nút toggle trong bảng để thay đổi trạng thái hoạt động"
                      : "* Thương hiệu mới sẽ tự động được kích hoạt"}
                  </small>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setShowBrandForm(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    {selectedBrand ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrandsPage;
