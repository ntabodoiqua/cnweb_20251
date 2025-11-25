import { useState, useEffect } from "react";
import {
  HistoryOutlined,
  FilterOutlined,
  SearchOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "../../util/axios.customize";
import styles from "../Profile.module.css";

const ProfileHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 20,
  });

  // Filters state
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    bankCode: "",
    searchKeyword: "",
    sortBy: "createdAt",
    sortDirection: "DESC",
  });

  useEffect(() => {
    fetchTransactionHistory();
  }, [filters, pagination.currentPage]);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        size: pagination.pageSize,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      };

      // Add filters only if they have values
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;
      if (filters.bankCode) params.bankCode = filters.bankCode;
      if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

      const response = await axios.get(
        "/api/payment/v1/transactions/my-history",
        {
          params,
          headers: {
            "Accept-Language": "vi",
          },
        }
      );

      if (response.code === 200 && response.result) {
        setTransactions(response.result.transactions);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.result.totalPages,
          totalElements: response.result.totalElements,
          currentPage: response.result.currentPage,
        }));
      } else {
        setError(response.message || "Không thể tải lịch sử giao dịch");
      }
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setError("Đã xảy ra lỗi khi tải lịch sử giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      bankCode: "",
      searchKeyword: "",
      sortBy: "createdAt",
      sortDirection: "DESC",
    });
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUCCESS: {
        color: "#52c41a",
        text: "Thành công",
        icon: <CheckCircleOutlined />,
      },
      PENDING: {
        color: "#faad14",
        text: "Đang xử lý",
        icon: <HistoryOutlined />,
      },
      FAILED: {
        color: "#ff4d4f",
        text: "Thất bại",
        icon: <CloseCircleOutlined />,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 12px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
          color: config.color,
          background: `${config.color}15`,
        }}
      >
        {config.icon}
        {config.text}
      </span>
    );
  };

  const calculateTotalAmount = () => {
    return transactions
      .filter((tx) => tx.status === "SUCCESS")
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  if (loading && transactions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <ReloadOutlined spin style={{ fontSize: "32px", color: "#ee4d2d" }} />
        <p style={{ marginTop: "16px" }}>Đang tải lịch sử giao dịch...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Summary */}
      <div className={styles.statsGrid} style={{ marginBottom: "24px" }}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Tổng giao dịch</span>
            <div className={styles.statIcon}>
              <HistoryOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{pagination.totalElements}</p>
          <p className={styles.statLabel}>giao dịch</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Tổng chi tiêu</span>
            <div className={styles.statIcon}>
              <DollarOutlined />
            </div>
          </div>
          <p className={styles.statValue}>
            {(calculateTotalAmount() / 1000000).toFixed(2)}M
          </p>
          <p className={styles.statLabel}>VNĐ</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Trang hiện tại</span>
            <div className={styles.statIcon}>
              <FilterOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{pagination.currentPage + 1}</p>
          <p className={styles.statLabel}>/ {pagination.totalPages} trang</p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "24px",
          border: "2px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FilterOutlined style={{ color: "#ee4d2d" }} />
            Bộ lọc giao dịch
          </h3>
          <button
            onClick={handleResetFilters}
            style={{
              padding: "8px 16px",
              background: "#fff",
              color: "#ee4d2d",
              border: "1px solid #ee4d2d",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <ReloadOutlined /> Đặt lại
          </button>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <SearchOutlined />
              Tìm kiếm
            </label>
            <input
              type="text"
              value={filters.searchKeyword}
              onChange={(e) =>
                handleFilterChange("searchKeyword", e.target.value)
              }
              className={styles.formInput}
              placeholder="Tìm theo mã GD, mô tả..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className={styles.formSelect}
            >
              <option value="">Tất cả</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <CalendarOutlined />
              Từ ngày
            </label>
            <input
              type="datetime-local"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <CalendarOutlined />
              Đến ngày
            </label>
            <input
              type="datetime-local"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className={styles.formInput}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <DollarOutlined />
              Số tiền tối thiểu (VNĐ)
            </label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange("minAmount", e.target.value)}
              className={styles.formInput}
              placeholder="0"
              min="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <DollarOutlined />
              Số tiền tối đa (VNĐ)
            </label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
              className={styles.formInput}
              placeholder="10000000"
              min="0"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Sắp xếp theo</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className={styles.formSelect}
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="amount">Số tiền</option>
              <option value="status">Trạng thái</option>
              <option value="paidAt">Ngày thanh toán</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Hướng sắp xếp</label>
            <select
              value={filters.sortDirection}
              onChange={(e) =>
                handleFilterChange("sortDirection", e.target.value)
              }
              className={styles.formSelect}
            >
              <option value="DESC">Giảm dần</option>
              <option value="ASC">Tăng dần</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: "white",
            borderRadius: "12px",
            border: "2px solid #ff4d4f",
          }}
        >
          <CloseCircleOutlined style={{ fontSize: "48px", color: "#ff4d4f" }} />
          <p style={{ marginTop: "16px", color: "#ff4d4f", fontSize: "16px" }}>
            {error}
          </p>
          <button
            onClick={fetchTransactionHistory}
            style={{
              marginTop: "16px",
              padding: "10px 24px",
              background: "#ee4d2d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <ReloadOutlined /> Thử lại
          </button>
        </div>
      )}

      {/* Transactions List */}
      {!error && transactions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px",
            border: "2px solid #f0f0f0",
          }}
        >
          <HistoryOutlined style={{ fontSize: "64px", color: "#d9d9d9" }} />
          <h3 style={{ marginTop: "16px", color: "#666" }}>
            Không có giao dịch nào
          </h3>
          <p style={{ color: "#999" }}>Chưa có giao dịch nào được thực hiện.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              style={{
                background: "white",
                border: "2px solid #f0f0f0",
                borderRadius: "12px",
                padding: "20px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ee4d2d";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(238, 77, 45, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f0f0f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Transaction Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#333",
                      margin: "0 0 8px",
                    }}
                  >
                    {transaction.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      margin: "0 0 8px",
                    }}
                  >
                    {transaction.description}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color:
                        transaction.status === "SUCCESS"
                          ? "#52c41a"
                          : "#ff4d4f",
                      marginBottom: "8px",
                    }}
                  >
                    {formatCurrency(transaction.amount)}
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>

              {/* Transaction Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  padding: "16px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <strong style={{ color: "#666" }}>Mã giao dịch:</strong>
                  <br />
                  <span style={{ color: "#333", fontWeight: 500 }}>
                    {transaction.appTransId}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#666" }}>Mã ZaloPay:</strong>
                  <br />
                  <span style={{ color: "#333", fontWeight: 500 }}>
                    {transaction.zpTransId || "N/A"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#666" }}>Email:</strong>
                  <br />
                  <span style={{ color: "#333", fontWeight: 500 }}>
                    {transaction.email}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#666" }}>Ngân hàng:</strong>
                  <br />
                  <span style={{ color: "#333", fontWeight: 500 }}>
                    {transaction.bankCode || "N/A"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#666" }}>Ngày tạo:</strong>
                  <br />
                  <span style={{ color: "#333", fontWeight: 500 }}>
                    {formatDate(transaction.createdAt)}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#666" }}>Ngày thanh toán:</strong>
                  <br />
                  <span style={{ color: "#333", fontWeight: 500 }}>
                    {transaction.paidAt
                      ? formatDate(transaction.paidAt)
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#666" }}>Phí:</strong>
                  <br />
                  <span style={{ color: "#333", fontWeight: 500 }}>
                    {formatCurrency(transaction.userFeeAmount)}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#666" }}>Giảm giá:</strong>
                  <br />
                  <span style={{ color: "#333", fontWeight: 500 }}>
                    {formatCurrency(transaction.discountAmount)}
                  </span>
                </div>
              </div>

              {/* Return Message */}
              {transaction.returnMessage && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    background:
                      transaction.status === "SUCCESS"
                        ? "rgba(82, 196, 26, 0.1)"
                        : "rgba(255, 77, 79, 0.1)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                >
                  <strong style={{ color: "#666" }}>Thông báo: </strong>
                  <span
                    style={{
                      color:
                        transaction.status === "SUCCESS"
                          ? "#52c41a"
                          : "#ff4d4f",
                      fontWeight: 500,
                    }}
                  >
                    {transaction.returnMessage}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!error && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "32px",
            padding: "20px",
            background: "white",
            borderRadius: "12px",
            border: "2px solid #f0f0f0",
          }}
        >
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 0}
            style={{
              padding: "8px 16px",
              background: pagination.currentPage === 0 ? "#f0f0f0" : "#ee4d2d",
              color: pagination.currentPage === 0 ? "#999" : "white",
              border: "none",
              borderRadius: "6px",
              cursor: pagination.currentPage === 0 ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            ← Trước
          </button>

          <span
            style={{ padding: "0 16px", fontSize: "14px", fontWeight: 500 }}
          >
            Trang {pagination.currentPage + 1} / {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages - 1}
            style={{
              padding: "8px 16px",
              background:
                pagination.currentPage >= pagination.totalPages - 1
                  ? "#f0f0f0"
                  : "#ee4d2d",
              color:
                pagination.currentPage >= pagination.totalPages - 1
                  ? "#999"
                  : "white",
              border: "none",
              borderRadius: "6px",
              cursor:
                pagination.currentPage >= pagination.totalPages - 1
                  ? "not-allowed"
                  : "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileHistoryPage;
