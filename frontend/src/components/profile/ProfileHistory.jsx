import { useState } from "react";
import {
  HistoryOutlined,
  ShoppingOutlined,
  FilterOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import styles from "../../pages/Profile.module.css";

const ProfileHistory = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Filter transactions
  const filterTransactions = () => {
    let filtered = transactions;

    if (filterType !== "all") {
      filtered = filtered.filter((tx) => tx.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTransactions = filterTransactions();

  // Calculate total amounts
  const getTotalAmount = (type) => {
    return transactions
      .filter((tx) => tx.type === type)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    return type === "payment" ? (
      <ArrowDownOutlined style={{ color: "#ff4d4f" }} />
    ) : (
      <ArrowUpOutlined style={{ color: "#52c41a" }} />
    );
  };

  const getTransactionColor = (type) => {
    return type === "payment" ? "#ff4d4f" : "#52c41a";
  };

  if (transactions.length === 0) {
    return (
      <>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Tổng chi tiêu</span>
              <div className={styles.statIcon}>
                <ArrowDownOutlined />
              </div>
            </div>
            <p className={styles.statValue}>0đ</p>
            <p className={styles.statLabel}>tất cả giao dịch</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Tổng hoàn tiền</span>
              <div className={styles.statIcon}>
                <ArrowUpOutlined />
              </div>
            </div>
            <p className={styles.statValue}>0đ</p>
            <p className={styles.statLabel}>tất cả giao dịch</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Số giao dịch</span>
              <div className={styles.statIcon}>
                <HistoryOutlined />
              </div>
            </div>
            <p className={styles.statValue}>0</p>
            <p className={styles.statLabel}>giao dịch</p>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Ví của tôi</span>
              <div className={styles.statIcon}>
                <WalletOutlined />
              </div>
            </div>
            <p className={styles.statValue}>0đ</p>
            <p className={styles.statLabel}>số dư hiện tại</p>
          </div>
        </div>

        <div className={styles.emptyState}>
          <HistoryOutlined />
          <h3>Lịch sử giao dịch</h3>
          <p>Chưa có giao dịch nào được thực hiện.</p>
        </div>
      </>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Tổng chi tiêu</span>
            <div className={styles.statIcon}>
              <ArrowDownOutlined />
            </div>
          </div>
          <p className={styles.statValue}>
            {(getTotalAmount("payment") / 1000000).toFixed(1)}M
          </p>
          <p className={styles.statLabel}>VNĐ</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Tổng hoàn tiền</span>
            <div className={styles.statIcon}>
              <ArrowUpOutlined />
            </div>
          </div>
          <p className={styles.statValue}>
            {(getTotalAmount("refund") / 1000000).toFixed(1)}M
          </p>
          <p className={styles.statLabel}>VNĐ</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Số giao dịch</span>
            <div className={styles.statIcon}>
              <HistoryOutlined />
            </div>
          </div>
          <p className={styles.statValue}>{transactions.length}</p>
          <p className={styles.statLabel}>giao dịch</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Ví của tôi</span>
            <div className={styles.statIcon}>
              <WalletOutlined />
            </div>
          </div>
          <p className={styles.statValue}>
            {(
              (getTotalAmount("refund") - getTotalAmount("payment")) /
              1000000
            ).toFixed(1)}
            M
          </p>
          <p className={styles.statLabel}>VNĐ</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ marginTop: "32px", marginBottom: "24px" }}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <SearchOutlined />
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.formInput}
              placeholder="Tìm theo mã giao dịch hoặc mô tả..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FilterOutlined />
              Loại giao dịch
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.formSelect}
            >
              <option value="all">Tất cả</option>
              <option value="payment">Thanh toán</option>
              <option value="refund">Hoàn tiền</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className={styles.emptyState}>
          <FilterOutlined />
          <h3>Không tìm thấy giao dịch</h3>
          <p>Không có giao dịch nào phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              style={{
                background: "white",
                border: "2px solid #f0f0f0",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
              {/* Transaction Info */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background:
                      transaction.type === "payment"
                        ? "rgba(255, 77, 79, 0.1)"
                        : "rgba(82, 196, 26, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  {getTransactionIcon(transaction.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#333",
                      margin: "0 0 6px",
                    }}
                  >
                    {transaction.description}
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "13px",
                      color: "#888",
                    }}
                  >
                    <span>Mã GD: {transaction.id}</span>
                    <span>•</span>
                    <span>
                      {new Date(transaction.date).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Amount */}
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: getTransactionColor(transaction.type),
                    marginBottom: "4px",
                  }}
                >
                  {transaction.type === "payment" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: getTransactionColor(transaction.type),
                    background:
                      transaction.type === "payment"
                        ? "rgba(255, 77, 79, 0.1)"
                        : "rgba(82, 196, 26, 0.1)",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    display: "inline-block",
                  }}
                >
                  {transaction.type === "payment" ? "Thanh toán" : "Hoàn tiền"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ProfileHistory.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["payment", "refund"]).isRequired,
      amount: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ProfileHistory;
