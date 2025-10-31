import { Layout, Menu, Badge, Dropdown, Avatar, Button } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  HomeOutlined,
  ShoppingOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES, USER_ROLES } from "../../constants";
import "./MainLayout.css";

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to={ROUTES.PROFILE}>Thông tin cá nhân</Link>,
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: <Link to={ROUTES.ORDERS}>Đơn hàng của tôi</Link>,
    },
    ...(isAdmin()
      ? [
          {
            type: "divider",
          },
          {
            key: "admin",
            icon: <UserOutlined />,
            label: <Link to={ROUTES.ADMIN_DASHBOARD}>Quản trị</Link>,
          },
        ]
      : []),
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

  const mainMenuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to={ROUTES.HOME}>Trang chủ</Link>,
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: <Link to={ROUTES.PRODUCTS}>Sản phẩm</Link>,
    },
  ];

  return (
    <Layout className="main-layout">
      <Header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate(ROUTES.HOME)}>
            <ShoppingOutlined
              style={{ fontSize: "24px", marginRight: "8px" }}
            />
            <span>E-Commerce</span>
          </div>

          <Menu
            mode="horizontal"
            items={mainMenuItems}
            className="main-menu"
            theme="dark"
          />

          <div className="header-actions">
            <Badge count={0} showZero>
              <Button
                type="text"
                icon={<ShoppingCartOutlined style={{ fontSize: "20px" }} />}
                onClick={() => navigate(ROUTES.CART)}
                className="header-button"
              />
            </Badge>

            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-info">
                  <Avatar icon={<UserOutlined />} src={user?.avatar} />
                  <span className="username">
                    {user?.fullName || user?.email}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </Header>

      <Content className="content">
        <div className="content-wrapper">{children}</div>
      </Content>

      <Footer className="footer">
        <div className="footer-content">
          <p>© 2025 E-Commerce. All rights reserved.</p>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
