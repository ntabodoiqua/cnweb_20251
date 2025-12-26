import { useState, useEffect } from "react";
import { notification, Modal } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilterOutlined,
  EyeOutlined,
  GiftOutlined,
  PercentageOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import {
  getAllCouponsApi,
  createCouponApi,
  deleteCouponApi,
} from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminCouponsPage.module.css";

/**
 * AdminCouponsPage - Trang quản lý mã giảm giá
 * Hiển thị danh sách coupon và các thao tác quản lý
 */
const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    discountType: "",
    isActive: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponDetail, setShowCouponDetail] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderAmount: "0",
    maxUsageTotal: "",
    maxUsagePerUser: "1",
    storeId: "",
    isStoreSpecific: false,
    validFrom: "",
    validTo: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch coupons from API
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCouponsApi();

      if (response && response.code === 200) {
        setCoupons(response.result || []);
      } else if (response && response.result) {
        setCoupons(response.result || []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách mã giảm giá",
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
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      discountType: "",
      isActive: "",
    });
  };

  // Filter coupons locally
  const filteredCoupons = coupons.filter((coupon) => {
    const matchSearch =
      !filters.search ||
      coupon.code.toLowerCase().includes(filters.search.toLowerCase()) ||
      coupon.name.toLowerCase().includes(filters.search.toLowerCase());

    const matchDiscountType =
      !filters.discountType || coupon.discountType === filters.discountType;

    const matchIsActive =
      filters.isActive === "" ||
      coupon.isActive === (filters.isActive === "true");

    return matchSearch && matchDiscountType && matchIsActive;
  });

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

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDiscountValue = (coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}%`;
    }
    return formatCurrency(coupon.discountValue);
  };

  const getDiscountTypeLabel = (type) => {
    switch (type) {
      case "PERCENTAGE":
        return "Phần trăm";
      case "FIXED_AMOUNT":
        return "Cố định";
      default:
        return type;
    }
  };

  const getDiscountTypeIcon = (type) => {
    switch (type) {
      case "PERCENTAGE":
        return <PercentageOutlined />;
      case "FIXED_AMOUNT":
        return <DollarOutlined />;
      default:
        return <GiftOutlined />;
    }
  };

  const isCouponValid = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validTo = new Date(coupon.validTo);
    return (
      coupon.isActive &&
      now >= validFrom &&
      now <= validTo &&
      (coupon.maxUsageTotal === null || coupon.usedCount < coupon.maxUsageTotal)
    );
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validTo = new Date(coupon.validTo);

    if (!coupon.isActive) {
      return { label: "Vô hiệu", className: styles.statusInactive };
    }
    if (now < validFrom) {
      return { label: "Chưa bắt đầu", className: styles.statusPending };
    }
    if (now > validTo) {
      return { label: "Hết hạn", className: styles.statusExpired };
    }
    if (
      coupon.maxUsageTotal !== null &&
      coupon.usedCount >= coupon.maxUsageTotal
    ) {
      return { label: "Hết lượt", className: styles.statusExhausted };
    }
    return { label: "Hoạt động", className: styles.statusActive };
  };

  const handleViewCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setShowCouponDetail(true);
  };

  const handleAddCoupon = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      maxDiscountAmount: "",
      minOrderAmount: "0",
      maxUsageTotal: "",
      maxUsagePerUser: "1",
      storeId: "",
      isStoreSpecific: false,
      validFrom: "",
      validTo: "",
    });
    setSelectedCoupon(null);
    setShowCouponForm(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa mã giảm giá này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteCouponApi(couponId);
          notification.success({
            message: "Thành công",
            description: "Xóa mã giảm giá thành công!",
            placement: "topRight",
            duration: 3,
          });
          fetchCoupons();
        } catch (error) {
          console.error("Error deleting coupon:", error);
          notification.error({
            message: "Lỗi xóa mã giảm giá",
            description:
              error.response?.data?.message || "Không thể xóa mã giảm giá",
            placement: "topRight",
            duration: 3,
          });
        }
      },
    });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    notification.success({
      message: "Đã sao chép",
      description: `Mã "${code}" đã được sao chép vào clipboard`,
      placement: "topRight",
      duration: 2,
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.code || !formData.name) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    if (!formData.validFrom || !formData.validTo) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn thời gian hiệu lực",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      notification.error({
        message: "Lỗi",
        description: "Thời gian bắt đầu phải trước thời gian kết thúc",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    setSubmitting(true);
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : null,
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        maxUsageTotal: formData.maxUsageTotal
          ? parseInt(formData.maxUsageTotal)
          : null,
        maxUsagePerUser: parseInt(formData.maxUsagePerUser) || 1,
        storeId: formData.isStoreSpecific ? formData.storeId : null,
        isStoreSpecific: formData.isStoreSpecific,
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
      };

      await createCouponApi(couponData);
      notification.success({
        message: "Thành công",
        description: "Tạo mã giảm giá thành công!",
        placement: "topRight",
        duration: 3,
      });

      setShowCouponForm(false);
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi tạo mã giảm giá";
      notification.error({
        message: "Lỗi",
        description: errorMessage,
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.adminCoupons}>
      {/* Filter Section */}
      <div className={styles.adminSection}>
        <div className={styles.adminToolbar}>
          <div className={styles.adminSearchBox}>
            <SearchOutlined className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hoặc tên..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
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
              <FilterOutlined /> Lọc
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleResetFilters}
            >
              <ReloadOutlined /> Đặt lại
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleAddCoupon}
            >
              <PlusOutlined /> Thêm mã giảm giá
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.adminFilters}>
            <div className={styles.filterGrid}>
              <div className={styles.filterItem}>
                <label>Loại giảm giá</label>
                <select
                  value={filters.discountType}
                  onChange={(e) =>
                    handleFilterChange("discountType", e.target.value)
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="PERCENTAGE">Phần trăm (%)</option>
                  <option value="FIXED_AMOUNT">Số tiền cố định</option>
                </select>
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
                  <option value="false">Vô hiệu</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <GiftOutlined />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{coupons.length}</span>
              <span className={styles.statLabel}>Tổng mã giảm giá</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.active}`}>
              <CheckCircleOutlined />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {coupons.filter((c) => isCouponValid(c)).length}
              </span>
              <span className={styles.statLabel}>Đang hoạt động</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.percentage}`}>
              <PercentageOutlined />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {coupons.filter((c) => c.discountType === "PERCENTAGE").length}
              </span>
              <span className={styles.statLabel}>Giảm %</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.fixed}`}>
              <DollarOutlined />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {
                  coupons.filter((c) => c.discountType === "FIXED_AMOUNT")
                    .length
                }
              </span>
              <span className={styles.statLabel}>Giảm cố định</span>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className={styles.adminTableContainer}>
          {loading ? (
            <div className={styles.loadingWrapper}>
              <LoadingSpinner tip="Đang tải..." />
            </div>
          ) : (
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Sử dụng</th>
                  <th>Hiệu lực</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <tr key={coupon.id}>
                        <td>
                          <div className={styles.couponCode}>
                            <code>{coupon.code}</code>
                            <button
                              className={styles.copyBtn}
                              onClick={() => handleCopyCode(coupon.code)}
                              title="Sao chép mã"
                            >
                              <CopyOutlined />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className={styles.couponName}>{coupon.name}</div>
                        </td>
                        <td>
                          <span className={styles.discountType}>
                            {getDiscountTypeIcon(coupon.discountType)}
                            {getDiscountTypeLabel(coupon.discountType)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.discountValue}>
                            {formatDiscountValue(coupon)}
                          </span>
                          {coupon.discountType === "PERCENTAGE" &&
                            coupon.maxDiscountAmount && (
                              <div className={styles.maxDiscount}>
                                Tối đa:{" "}
                                {formatCurrency(coupon.maxDiscountAmount)}
                              </div>
                            )}
                        </td>
                        <td>{formatCurrency(coupon.minOrderAmount)}</td>
                        <td>
                          <span className={styles.usageCount}>
                            {coupon.usedCount || 0}
                            {coupon.maxUsageTotal &&
                              ` / ${coupon.maxUsageTotal}`}
                          </span>
                        </td>
                        <td>
                          <div className={styles.validityDates}>
                            <div>
                              <CalendarOutlined />{" "}
                              {formatDate(coupon.validFrom)}
                            </div>
                            <div>→ {formatDate(coupon.validTo)}</div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.status} ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className={styles.adminActions}>
                            <button
                              className={`${styles.adminActionBtn} ${styles.view}`}
                              title="Xem chi tiết"
                              onClick={() => handleViewCoupon(coupon)}
                            >
                              <EyeOutlined />
                            </button>
                            <button
                              className={`${styles.adminActionBtn} ${styles.delete}`}
                              title="Xóa"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                            >
                              <DeleteOutlined />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      <div className={styles.adminEmptyState}>
                        <GiftOutlined
                          style={{ fontSize: "48px", color: "#ccc" }}
                        />
                        <p>Không tìm thấy mã giảm giá nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Coupon Detail Modal */}
      {showCouponDetail && selectedCoupon && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCouponDetail(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                <GiftOutlined /> Chi tiết mã giảm giá
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowCouponDetail(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.couponDetail}>
                <div className={styles.couponDetailHeader}>
                  <div className={styles.couponCodeLarge}>
                    <code>{selectedCoupon.code}</code>
                    <button
                      className={styles.copyBtnLarge}
                      onClick={() => handleCopyCode(selectedCoupon.code)}
                    >
                      <CopyOutlined /> Sao chép
                    </button>
                  </div>
                  <span
                    className={`${styles.status} ${
                      getCouponStatus(selectedCoupon).className
                    }`}
                  >
                    {getCouponStatus(selectedCoupon).label}
                  </span>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.infoRow}>
                    <label>Tên mã giảm giá:</label>
                    <span>{selectedCoupon.name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Mô tả:</label>
                    <span>
                      {selectedCoupon.description || "Không có mô tả"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Loại giảm giá:</label>
                    <span>
                      {getDiscountTypeIcon(selectedCoupon.discountType)}{" "}
                      {getDiscountTypeLabel(selectedCoupon.discountType)}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Giá trị giảm:</label>
                    <span className={styles.highlightValue}>
                      {formatDiscountValue(selectedCoupon)}
                    </span>
                  </div>
                  {selectedCoupon.discountType === "PERCENTAGE" &&
                    selectedCoupon.maxDiscountAmount && (
                      <div className={styles.infoRow}>
                        <label>Giảm tối đa:</label>
                        <span>
                          {formatCurrency(selectedCoupon.maxDiscountAmount)}
                        </span>
                      </div>
                    )}
                  <div className={styles.infoRow}>
                    <label>Đơn hàng tối thiểu:</label>
                    <span>{formatCurrency(selectedCoupon.minOrderAmount)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Số lần sử dụng:</label>
                    <span>
                      {selectedCoupon.usedCount || 0}
                      {selectedCoupon.maxUsageTotal
                        ? ` / ${selectedCoupon.maxUsageTotal}`
                        : " (Không giới hạn)"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Giới hạn mỗi user:</label>
                    <span>{selectedCoupon.maxUsagePerUser} lần</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Phạm vi áp dụng:</label>
                    <span>
                      {selectedCoupon.isStoreSpecific
                        ? `Cửa hàng: ${selectedCoupon.storeId}`
                        : "Toàn sàn"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Thời gian bắt đầu:</label>
                    <span>{formatDate(selectedCoupon.validFrom)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Thời gian kết thúc:</label>
                    <span>{formatDate(selectedCoupon.validTo)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedCoupon.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Form Modal */}
      {showCouponForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCouponForm(false)}
        >
          <div
            className={`${styles.modalContent} ${styles.modalLarge}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                <PlusOutlined /> Thêm mã giảm giá mới
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowCouponForm(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleSubmitForm} className={styles.couponForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>
                      Mã giảm giá <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="VD: SUMMER2025"
                      pattern="^[A-Z0-9_-]+$"
                      title="Chỉ chấp nhận chữ in hoa, số, dấu gạch ngang và gạch dưới"
                    />
                    <small>Chỉ bao gồm chữ in hoa, số, _ và -</small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Tên mã giảm giá <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="VD: Giảm giá mùa hè 2025"
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Mô tả chi tiết về mã giảm giá..."
                      rows="2"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Loại giảm giá <span className={styles.required}>*</span>
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value,
                        })
                      }
                    >
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số tiền cố định (₫)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Giá trị giảm <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step={
                        formData.discountType === "PERCENTAGE" ? "1" : "1000"
                      }
                      max={
                        formData.discountType === "PERCENTAGE"
                          ? "100"
                          : undefined
                      }
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: e.target.value,
                        })
                      }
                      placeholder={
                        formData.discountType === "PERCENTAGE"
                          ? "VD: 10 (%)"
                          : "VD: 50000 (₫)"
                      }
                    />
                  </div>

                  {formData.discountType === "PERCENTAGE" && (
                    <div className={styles.formGroup}>
                      <label>Giảm tối đa (₫)</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.maxDiscountAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxDiscountAmount: e.target.value,
                          })
                        }
                        placeholder="VD: 100000"
                      />
                      <small>Để trống nếu không giới hạn</small>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label>Đơn hàng tối thiểu (₫)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: e.target.value,
                        })
                      }
                      placeholder="VD: 100000"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tổng số lần sử dụng</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxUsageTotal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxUsageTotal: e.target.value,
                        })
                      }
                      placeholder="Không giới hạn"
                    />
                    <small>Để trống nếu không giới hạn</small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Số lần/user</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxUsagePerUser}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxUsagePerUser: e.target.value,
                        })
                      }
                      placeholder="1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Bắt đầu <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Kết thúc <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.validTo}
                      onChange={(e) =>
                        setFormData({ ...formData, validTo: e.target.value })
                      }
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isStoreSpecific}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isStoreSpecific: e.target.checked,
                          })
                        }
                      />
                      Áp dụng cho cửa hàng cụ thể
                    </label>
                  </div>

                  {formData.isStoreSpecific && (
                    <div className={styles.formGroup}>
                      <label>Store ID</label>
                      <input
                        type="text"
                        value={formData.storeId}
                        onChange={(e) =>
                          setFormData({ ...formData, storeId: e.target.value })
                        }
                        placeholder="Nhập Store ID"
                      />
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setShowCouponForm(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Đang tạo..." : "Tạo mã giảm giá"}
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

export default AdminCouponsPage;
