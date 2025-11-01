import React, { useContext } from "react";
import { Card, Row, Col, Statistic, Table, Tag } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../components/context/auth.context";
import "./admin-dashboard.css";

/**
 * Admin Dashboard Page
 * Chỉ ADMIN mới có quyền truy cập
 */
const AdminDashboardPage = () => {
  const { auth } = useContext(AuthContext);

  // Mock data cho demo
  const stats = [
    {
      title: "Tổng người dùng",
      value: 1234,
      prefix: <UserOutlined />,
      color: "#1890ff",
      suffix: "người",
    },
    {
      title: "Tổng đơn hàng",
      value: 567,
      prefix: <ShoppingOutlined />,
      color: "#52c41a",
      suffix: "đơn",
    },
    {
      title: "Doanh thu",
      value: 89500000,
      prefix: <DollarOutlined />,
      color: "#faad14",
      suffix: "đ",
    },
    {
      title: "Tăng trưởng",
      value: 25.8,
      prefix: <RiseOutlined />,
      color: "#f5222d",
      suffix: "%",
    },
  ];

  // Mock data đơn hàng gần đây
  const recentOrders = [
    {
      key: "1",
      orderId: "ORD001",
      customer: "Nguyễn Văn A",
      product: "iPhone 15 Pro Max",
      amount: 29990000,
      status: "completed",
      date: "2024-11-01",
    },
    {
      key: "2",
      orderId: "ORD002",
      customer: "Trần Thị B",
      product: "Samsung Galaxy S24",
      amount: 22990000,
      status: "pending",
      date: "2024-11-01",
    },
    {
      key: "3",
      orderId: "ORD003",
      customer: "Lê Văn C",
      product: "MacBook Pro M3",
      amount: 45990000,
      status: "completed",
      date: "2024-10-31",
    },
    {
      key: "4",
      orderId: "ORD004",
      customer: "Phạm Thị D",
      product: "iPad Air",
      amount: 15990000,
      status: "shipping",
      date: "2024-10-31",
    },
    {
      key: "5",
      orderId: "ORD005",
      customer: "Hoàng Văn E",
      product: "Apple Watch Series 9",
      amount: 12990000,
      status: "completed",
      date: "2024-10-30",
    },
  ];

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(amount),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          completed: {
            color: "success",
            icon: <CheckCircleOutlined />,
            text: "Hoàn thành",
          },
          pending: {
            color: "warning",
            icon: <ClockCircleOutlined />,
            text: "Chờ xử lý",
          },
          shipping: { color: "processing", icon: null, text: "Đang giao" },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1 className="admin-title">Bảng điều khiển Admin</h1>
        <p className="admin-subtitle">
          Chào mừng, <strong>{auth.user.username}</strong> ({auth.user.role})
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="admin-stats">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className="stat-card"
              style={{ borderLeft: `4px solid ${stat.color}` }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Orders */}
      <Card
        title="Đơn hàng gần đây"
        className="admin-card"
        style={{ marginTop: "24px" }}
      >
        <Table
          columns={columns}
          dataSource={recentOrders}
          pagination={{ pageSize: 5 }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Additional Info */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} md={12}>
          <Card title="Thông tin hệ thống" className="admin-card">
            <div className="info-item">
              <span className="info-label">Phiên bản:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái:</span>
              <Tag color="success">Hoạt động</Tag>
            </div>
            <div className="info-item">
              <span className="info-label">Server:</span>
              <span className="info-value">Online</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Quyền truy cập" className="admin-card">
            <div className="info-item">
              <span className="info-label">Vai trò:</span>
              <Tag color="red">{auth.user.role}</Tag>
            </div>
            <div className="info-item">
              <span className="info-label">Username:</span>
              <span className="info-value">{auth.user.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Quyền:</span>
              <span className="info-value">Toàn quyền quản trị</span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;
