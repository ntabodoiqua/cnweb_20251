import { useState, useEffect, useCallback } from "react";
import {
  DollarOutlined,
  CreditCardOutlined,
  WalletOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import styles from "./AdminPaymentsPage.module.css";
import {
  Input,
  Select,
  DatePicker,
  InputNumber,
  Modal,
  Descriptions,
  Spin,
  Empty,
  message,
  Pagination,
} from "antd";
import dayjs from "dayjs";
import { getAdminTransactionHistoryApi } from "../../util/api";

const { RangePicker } = DatePicker;

/**
 * AdminPaymentsPage - Trang quản lý thanh toán
 */
const AdminPaymentsPage = () => {
  // State cho danh sách giao dịch
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 0,
    pageSize: 10,
    total: 0,
  });

  // State cho filters
  const [filters, setFilters] = useState({
    appUser: "",
    status: "",
    startDate: "",
    endDate: "",
    minAmount: null,
    maxAmount: null,
    bankCode: "",
    searchKeyword: "",
    sortBy: "createdAt",
    sortDirection: "DESC",
  });

  // State cho modal chi tiết
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State thống kê
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    expired: 0,
  });

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminTransactionHistoryApi({
        ...filters,
        page: pagination.current,
        size: pagination.pageSize,
      });

      // Response trả về trực tiếp data (không có wrapper .data)
      if (response?.code === 200) {
        const result = response.result;
        setTransactions(result.transactions || []);
        setPagination((prev) => ({
          ...prev,
          total: result.totalElements || 0,
        }));

        // Tính thống kê
        const txns = result.transactions || [];
        const totalAmount = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
        const successCount = txns.filter((t) => t.status === "SUCCESS").length;
        const pendingCount = txns.filter((t) => t.status === "PENDING").length;
        const failedCount = txns.filter((t) => t.status === "FAILED").length;
        const expiredCount = txns.filter((t) => t.status === "EXPIRED").length;

        setStats({
          total: totalAmount,
          success: successCount,
          pending: pendingCount,
          failed: failedCount,
          expired: expiredCount,
        });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 0 }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0].format("YYYY-MM-DDTHH:mm:ss"),
        endDate: dates[1].format("YYYY-MM-DDTHH:mm:ss"),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
    }
    setPagination((prev) => ({ ...prev, current: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({
      appUser: "",
      status: "",
      startDate: "",
      endDate: "",
      minAmount: null,
      maxAmount: null,
      bankCode: "",
      searchKeyword: "",
      sortBy: "createdAt",
      sortDirection: "DESC",
    });
    setPagination((prev) => ({ ...prev, current: 0 }));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page - 1,
      pageSize: pageSize,
    }));
  };

  // View transaction detail
  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "SUCCESS":
        return "statusCompleted";
      case "PENDING":
        return "statusPending";
      case "FAILED":
        return "statusFailed";
      case "EXPIRED":
        return "statusExpired";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "SUCCESS":
        return "Thành công";
      case "PENDING":
        return "Chờ xử lý";
      case "FAILED":
        return "Thất bại";
      case "EXPIRED":
        return "Hết hạn";
      default:
        return status;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD/MM/YYYY HH:mm:ss");
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return amount.toLocaleString("vi-VN");
  };

  return (
    <div className={styles.adminPayments}>
      {/* Stats */}
      <div
        className="admin-stats-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Tổng doanh thu</span>
            <div className="admin-stat-icon">
              <DollarOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">₫{formatCurrency(stats.total)}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Thành công</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              }}
            >
              <CreditCardOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.success}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Chờ xử lý</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
              }}
            >
              <WalletOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.pending}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Thất bại</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
              }}
            >
              <DollarOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.failed}</h2>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Hết hạn</span>
            <div
              className="admin-stat-icon"
              style={{
                background: "linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)",
              }}
            >
              <WalletOutlined />
            </div>
          </div>
          <h2 className="admin-stat-value">{stats.expired}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.adminSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.filtersRow}>
            <Input
              placeholder="Tìm kiếm theo username..."
              prefix={<SearchOutlined />}
              value={filters.appUser}
              onChange={(e) => handleFilterChange("appUser", e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Input
              placeholder="Từ khóa tìm kiếm..."
              prefix={<SearchOutlined />}
              value={filters.searchKeyword}
              onChange={(e) => handleFilterChange("searchKeyword", e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Trạng thái"
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange("status", value)}
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value="SUCCESS">Thành công</Select.Option>
              <Select.Option value="PENDING">Chờ xử lý</Select.Option>
              <Select.Option value="FAILED">Thất bại</Select.Option>
              <Select.Option value="EXPIRED">Hết hạn</Select.Option>
            </Select>
            <RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder={["Từ ngày", "Đến ngày"]}
              onChange={handleDateRangeChange}
              value={
                filters.startDate && filters.endDate
                  ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                  : null
              }
            />
          </div>
          <div className={styles.filtersRow}>
            <InputNumber
              placeholder="Số tiền tối thiểu"
              value={filters.minAmount}
              onChange={(value) => handleFilterChange("minAmount", value)}
              style={{ width: 150 }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
            <InputNumber
              placeholder="Số tiền tối đa"
              value={filters.maxAmount}
              onChange={(value) => handleFilterChange("maxAmount", value)}
              style={{ width: 150 }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
            <Select
              placeholder="Sắp xếp theo"
              value={filters.sortBy}
              onChange={(value) => handleFilterChange("sortBy", value)}
              style={{ width: 150 }}
            >
              <Select.Option value="createdAt">Ngày tạo</Select.Option>
              <Select.Option value="amount">Số tiền</Select.Option>
              <Select.Option value="paidAt">Ngày thanh toán</Select.Option>
            </Select>
            <Select
              value={filters.sortDirection}
              onChange={(value) => handleFilterChange("sortDirection", value)}
              style={{ width: 120 }}
            >
              <Select.Option value="DESC">Giảm dần</Select.Option>
              <Select.Option value="ASC">Tăng dần</Select.Option>
            </Select>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleResetFilters}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <ReloadOutlined /> Reset
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={fetchTransactions}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FilterOutlined /> Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className={styles.adminSection}>
        <h2 className={styles.adminSectionTitle}>
          Danh sách giao dịch ({pagination.total})
        </h2>
        <Spin spinning={loading}>
          {transactions.length > 0 ? (
            <>
              <div className={styles.adminTableContainer}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã giao dịch</th>
                      <th>ZaloPay Trans ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                      <th>Thời gian tạo</th>
                      <th className={styles.stickyCol}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <strong>{transaction.appTransId}</strong>
                        </td>
                        <td>{transaction.zpTransId || "-"}</td>
                        <td>{transaction.appUser}</td>
                        <td>{transaction.email || "-"}</td>
                        <td>
                          <strong style={{ color: "#ee4d2d" }}>
                            ₫{formatCurrency(transaction.amount)}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${styles[getStatusBadgeClass(
                              transaction.status
                            )]}`}
                          >
                            {getStatusText(transaction.status)}
                          </span>
                        </td>
                        <td>{formatDateTime(transaction.createdAt)}</td>
                        <td className={styles.stickyCol}>
                          <button
                            className={`${styles.adminActionBtn} ${styles.view}`}
                            title="Chi tiết"
                            onClick={() => handleViewDetail(transaction)}
                          >
                            <EyeOutlined />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 16, textAlign: "right" }}>
                <Pagination
                  current={pagination.current + 1}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showTotal={(total) => `Tổng ${total} giao dịch`}
                />
              </div>
            </>
          ) : (
            <Empty description="Không có giao dịch nào" />
          )}
        </Spin>
      </div>

      {/* Transaction Detail Modal */}
      <Modal
        title="Chi tiết giao dịch"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTransaction && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Mã giao dịch" span={2}>
              <strong>{selectedTransaction.appTransId}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="ZaloPay Trans ID" span={2}>
              {selectedTransaction.zpTransId || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              {selectedTransaction.appUser}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedTransaction.email || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tiêu đề" span={2}>
              {selectedTransaction.title || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {selectedTransaction.description || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <strong style={{ color: "#ee4d2d", fontSize: 16 }}>
                ₫{formatCurrency(selectedTransaction.amount)}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              ₫{formatCurrency(selectedTransaction.discountAmount || 0)}
            </Descriptions.Item>
            <Descriptions.Item label="Phí người dùng">
              {selectedTransaction.userFeeAmount != null
                ? `₫${formatCurrency(selectedTransaction.userFeeAmount)}`
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Bank Code">
              {selectedTransaction.bankCode || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <span
                className={`${styles.statusBadge} ${styles[getStatusBadgeClass(
                  selectedTransaction.status
                )]}`}
              >
                {getStatusText(selectedTransaction.status)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Return Code">
              {selectedTransaction.returnCode}
            </Descriptions.Item>
            <Descriptions.Item label="Return Message" span={2}>
              {selectedTransaction.returnMessage || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDateTime(selectedTransaction.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {formatDateTime(selectedTransaction.updatedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thanh toán" span={2}>
              {formatDateTime(selectedTransaction.paidAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminPaymentsPage;
