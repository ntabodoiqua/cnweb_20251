import React, { useContext } from "react";
import { Card, Descriptions, Tag, Space, Alert, Button, Row, Col } from "antd";
import { AuthContext } from "../components/context/auth.context";
import { getTokenInfo } from "../util/jwt";
import { getRoleName, ROLES } from "../constants/roles";
import {
  UserOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const ProfilePage = () => {
  const { auth } = useContext(AuthContext);
  const token = localStorage.getItem("access_token");
  const tokenInfo = token ? getTokenInfo(token) : null;

  // Format timestamp thành ngày giờ
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("vi-VN");
  };

  // Tính thời gian còn lại của token
  const getTimeRemaining = () => {
    if (!tokenInfo || !tokenInfo.expiresAt) return "N/A";
    const now = Math.floor(Date.now() / 1000);
    const remaining = tokenInfo.expiresAt - now;

    if (remaining < 0) return "Đã hết hạn";

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Card>
          <Row align="middle" gutter={16}>
            <Col>
              <UserOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
            </Col>
            <Col flex="auto">
              <h1 style={{ margin: 0, fontSize: "28px" }}>Hồ sơ của tôi</h1>
              <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
                Quản lý thông tin hồ sơ để bảo mật tài khoản
              </p>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            {/* Auth Status */}
            <Card
              title={
                <>
                  <SafetyOutlined /> Trạng thái xác thực
                </>
              }
              style={{ height: "100%" }}
            >
              <Alert
                message={
                  auth.isAuthenticated ? "Đã đăng nhập" : "Chưa đăng nhập"
                }
                description={
                  auth.isAuthenticated
                    ? "Bạn đã đăng nhập thành công và có quyền truy cập hệ thống."
                    : "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục."
                }
                type={auth.isAuthenticated ? "success" : "warning"}
                showIcon
                icon={
                  auth.isAuthenticated ? <CheckCircleOutlined /> : undefined
                }
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            {/* Role Info */}
            {auth.isAuthenticated && (
              <Card title="Phân quyền" style={{ height: "100%" }}>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div>
                    <div style={{ marginBottom: 8, color: "#666" }}>
                      Vai trò hiện tại:
                    </div>
                    <Tag
                      color={
                        auth.user?.role === ROLES.ADMIN
                          ? "red"
                          : auth.user?.role === ROLES.USER
                          ? "blue"
                          : "default"
                      }
                      style={{ fontSize: "16px", padding: "8px 16px" }}
                    >
                      {getRoleName(auth.user?.role)}
                    </Tag>
                  </div>

                  {auth.user?.role === ROLES.ADMIN && (
                    <Alert
                      message="Bạn có quyền quản trị viên"
                      type="info"
                      showIcon
                    />
                  )}
                </Space>
              </Card>
            )}
          </Col>
        </Row>

        {/* User Info */}
        {auth.isAuthenticated && (
          <Card title="Thông tin tài khoản">
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="Tên đăng nhập" span={2}>
                <strong style={{ fontSize: "16px" }}>
                  {auth.user?.username || "N/A"}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag
                  color={
                    auth.user?.role === ROLES.ADMIN
                      ? "red"
                      : auth.user?.role === ROLES.USER
                      ? "blue"
                      : "default"
                  }
                >
                  {getRoleName(auth.user?.role)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã role">
                <code>{auth.user?.role}</code>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Token Info */}
        {tokenInfo && (
          <Card
            title={
              <>
                <ClockCircleOutlined /> Thông tin phiên đăng nhập
              </>
            }
          >
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="Phát hành bởi" span={2}>
                {tokenInfo.issuer}
              </Descriptions.Item>
              <Descriptions.Item label="Username">
                {tokenInfo.username}
              </Descriptions.Item>
              <Descriptions.Item label="Token ID">
                <code style={{ fontSize: "11px", wordBreak: "break-all" }}>
                  {tokenInfo.tokenId}
                </code>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">
                {formatTimestamp(tokenInfo.issuedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian hết hạn">
                {formatTimestamp(tokenInfo.expiresAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Còn lại">
                <Tag color={tokenInfo.isExpired ? "red" : "green"}>
                  {getTimeRemaining()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={tokenInfo.isExpired ? "red" : "success"}>
                  {tokenInfo.isExpired ? "Đã hết hạn" : "Còn hiệu lực"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Role-based Content */}
        <Card title="Quyền truy cập">
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {auth.user?.role === ROLES.ADMIN && (
              <Alert
                message="🔐 Admin Panel"
                description="Bạn là quản trị viên và có toàn quyền truy cập. Bạn có thể quản lý người dùng, cấu hình hệ thống và xem tất cả các báo cáo."
                type="info"
                showIcon
                action={
                  <Button size="small" type="primary">
                    Đi đến Admin Panel
                  </Button>
                }
              />
            )}

            {auth.user?.role === ROLES.USER && (
              <Alert
                message="👤 User Panel"
                description="Bạn là người dùng thông thường. Bạn có thể xem và chỉnh sửa thông tin cá nhân, quản lý đơn hàng của mình."
                type="success"
                showIcon
              />
            )}

            <Alert
              message="Quyền truy cập"
              description={
                <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                  <li>✓ Xem thông tin cá nhân</li>
                  <li>✓ Chỉnh sửa hồ sơ</li>
                  <li>✓ Quản lý đơn hàng</li>
                  {auth.user?.role === ROLES.ADMIN && (
                    <>
                      <li>✓ Quản lý người dùng (Admin)</li>
                      <li>✓ Cấu hình hệ thống (Admin)</li>
                      <li>✓ Xem báo cáo (Admin)</li>
                    </>
                  )}
                </ul>
              }
              type="info"
            />
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default ProfilePage;
