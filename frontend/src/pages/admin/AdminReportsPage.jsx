import { useState, useEffect } from "react";
import { notification } from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { getUserStatisticsApi } from "../../util/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import styles from "./AdminReportsPage.module.css";

/**
 * AdminReportsPage - Trang báo cáo và thống kê
 */
const AdminReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await getUserStatisticsApi();
      if (response && response.code === 1000) {
        setStatistics(response.result);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải thống kê người dùng",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "#722ed1", // Tím cho Quản trị viên
      SELLER: "#ee4d2d", // Cam-đỏ cho Người bán (màu chủ đạo)
      USER: "#52c41a", // Xanh lá cho Người dùng
    };
    return colors[role] || "#999";
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: "Quản trị viên",
      SELLER: "Người bán",
      USER: "Người dùng",
    };
    return labels[role] || role;
  };

  if (loading) {
    return <LoadingSpinner tip="Đang tải thống kê..." fullScreen={false} />;
  }

  if (!statistics) {
    return (
      <div className={styles.adminReports}>
        <div className={styles.emptyState}>
          <BarChartOutlined style={{ fontSize: "64px", color: "#ddd" }} />
          <p>Không có dữ liệu thống kê</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const roleData = Object.entries(statistics.usersByRole || {}).map(
    ([role, count]) => ({
      role,
      count,
      color: getRoleColor(role),
      label: getRoleLabel(role),
    })
  );

  const monthData = Object.entries(statistics.usersByMonth || {}).map(
    ([month, count]) => ({
      month,
      count,
    })
  );

  const maxRoleCount = Math.max(...roleData.map((d) => d.count));
  const maxMonthCount = Math.max(...monthData.map((d) => d.count));

  return (
    <div className={styles.adminReports}>
      {/* User Statistics Section */}
      <div className={styles.statisticsSection}>
        <div className={styles.sectionHeader}>
          <h2>
            <UserOutlined /> Thống kê người dùng
          </h2>
          <p className={styles.sectionDescription}>
            Tổng quan về người dùng trên hệ thống
          </p>
        </div>

        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#ee4d2d" }}>
              <UserOutlined />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Tổng người dùng</div>
              <div className={styles.statValue}>{statistics.totalUsers}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#52c41a" }}>
              <CheckCircleOutlined />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Đang hoạt động</div>
              <div className={styles.statValue}>{statistics.activeUsers}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#ff4d4f" }}>
              <CloseCircleOutlined />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Bị vô hiệu hóa</div>
              <div className={styles.statValue}>{statistics.disabledUsers}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#faad14" }}>
              <TeamOutlined />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Tỷ lệ hoạt động</div>
              <div className={styles.statValue}>
                {statistics.totalUsers > 0
                  ? (
                      (statistics.activeUsers / statistics.totalUsers) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.chartsContainer}>
          {/* Users by Role Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>
                <TeamOutlined /> Người dùng theo vai trò
              </h3>
            </div>
            <div className={styles.chartBody}>
              <div className={styles.barChart}>
                {roleData.map((item, index) => (
                  <div key={item.role} className={styles.barItem}>
                    <div className={styles.barLabel}>{item.label}</div>
                    <div className={styles.barWrapper}>
                      <div
                        className={styles.bar}
                        style={{
                          width: `${(item.count / maxRoleCount) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      >
                        <span className={styles.barValue}>{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Users by Month Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>
                <CalendarOutlined /> Người dùng theo tháng
              </h3>
            </div>
            <div className={styles.chartBody}>
              <div className={styles.barChart}>
                {monthData.map((item, index) => (
                  <div key={item.month} className={styles.barItem}>
                    <div className={styles.barLabel}>{item.month}</div>
                    <div className={styles.barWrapper}>
                      <div
                        className={styles.bar}
                        style={{
                          width: `${(item.count / maxMonthCount) * 100}%`,
                          backgroundColor: "#ee4d2d",
                        }}
                      >
                        <span className={styles.barValue}>{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Role Distribution Pie Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>
              <BarChartOutlined /> Phân bố vai trò người dùng
            </h3>
          </div>
          <div className={styles.chartBody}>
            <div className={styles.pieChartContainer}>
              <svg className={styles.pieChart} viewBox="0 0 200 200">
                {(() => {
                  let currentAngle = 0;
                  const total = statistics.totalUsers;
                  return roleData.map((item, index) => {
                    const percentage = (item.count / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;

                    // Calculate path for pie slice
                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (endAngle - 90) * (Math.PI / 180);
                    const radius = 80;
                    const centerX = 100;
                    const centerY = 100;

                    const x1 = centerX + radius * Math.cos(startRad);
                    const y1 = centerY + radius * Math.sin(startRad);
                    const x2 = centerX + radius * Math.cos(endRad);
                    const y2 = centerY + radius * Math.sin(endRad);

                    const largeArc = angle > 180 ? 1 : 0;
                    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    currentAngle = endAngle;

                    return (
                      <path
                        key={item.role}
                        d={path}
                        fill={item.color}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    );
                  });
                })()}
              </svg>
              <div className={styles.pieLegend}>
                {roleData.map((item) => (
                  <div key={item.role} className={styles.legendItem}>
                    <div
                      className={styles.legendColor}
                      style={{ backgroundColor: item.color }}
                    />
                    <div className={styles.legendText}>
                      <span className={styles.legendLabel}>{item.label}</span>
                      <span className={styles.legendValue}>
                        {item.count} (
                        {((item.count / statistics.totalUsers) * 100).toFixed(
                          1
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className={styles.summaryCard}>
          <div className={styles.chartHeader}>
            <h3>
              <BarChartOutlined /> Tổng quan thống kê
            </h3>
          </div>
          <div className={styles.summaryTable}>
            <div className={styles.summaryRow}>
              <div className={styles.summaryLabel}>Tổng số người dùng:</div>
              <div className={styles.summaryValue}>{statistics.totalUsers}</div>
            </div>
            <div className={styles.summaryRow}>
              <div className={styles.summaryLabel}>Người dùng hoạt động:</div>
              <div className={styles.summaryValue} style={{ color: "#52c41a" }}>
                {statistics.activeUsers}
              </div>
            </div>
            <div className={styles.summaryRow}>
              <div className={styles.summaryLabel}>Người dùng bị khóa:</div>
              <div className={styles.summaryValue} style={{ color: "#ff4d4f" }}>
                {statistics.disabledUsers}
              </div>
            </div>
            <div className={styles.summaryDivider} />
            {roleData.map((item) => (
              <div key={item.role} className={styles.summaryRow}>
                <div className={styles.summaryLabel}>{item.label}:</div>
                <div
                  className={styles.summaryValue}
                  style={{ color: item.color }}
                >
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
