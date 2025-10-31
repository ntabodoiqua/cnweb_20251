import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../constants";
import "./AdminLayout.css";

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const userMenuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to={ROUTES.HOME}>Về trang chủ</Link>,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to={ROUTES.PROFILE}>Thông tin cá nhân</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: ROUTES.ADMIN_DASHBOARD,
      icon: <DashboardOutlined />,
      label: <Link to={ROUTES.ADMIN_DASHBOARD}>Dashboard</Link>,
    },
    {
      key: ROUTES.ADMIN_PRODUCTS,
      icon: <ShoppingOutlined />,
      label: <Link to={ROUTES.ADMIN_PRODUCTS}>Sản phẩm</Link>,
    },
    {
      key: ROUTES.ADMIN_ORDERS,
      icon: <ShoppingCartOutlined />,
      label: <Link to={ROUTES.ADMIN_ORDERS}>Đơn hàng</Link>,
    },
    {
      key: ROUTES.ADMIN_USERS,
      icon: <UserOutlined />,
      label: <Link to={ROUTES.ADMIN_USERS}>Người dùng</Link>,
    },
    {
      key: ROUTES.ADMIN_CATEGORIES,
      icon: <AppstoreOutlined />,
      label: <Link to={ROUTES.ADMIN_CATEGORIES}>Danh mục</Link>,
    },
  ];

  return (
    <Layout className="admin-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sider"
      >
        <div className="admin-logo">{!collapsed ? "Admin Panel" : "AP"}</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <div className="header-left">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="trigger"
                onClick={() => setCollapsed(!collapsed)}
              />
            ) : (
              <MenuFoldOutlined
                className="trigger"
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
          </div>

          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <span className="username">
                  {user?.fullName || user?.email}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <div className="admin-content-wrapper">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
