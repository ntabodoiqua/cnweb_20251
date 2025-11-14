import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  HomeOutlined,
  HistoryOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { PROTECTED_ROUTES } from "../constants/routes";
import "./profile.css";

/**
 * ProfileLayout - Layout component for profile pages with collapsible sidebar navigation
 * Uses <Outlet> for nested routes
 */
const ProfileLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Menu items configuration
  const menuItems = [
    {
      key: "general",
      icon: <UserOutlined />,
      label: "Thông tin chung",
      path: PROTECTED_ROUTES.PROFILE,
    },
    {
      key: "seller",
      icon: <ShopOutlined />,
      label: "Hồ sơ người bán",
      path: PROTECTED_ROUTES.PROFILE_SELLER,
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Đơn hàng",
      path: PROTECTED_ROUTES.PROFILE_ORDERS,
    },
    {
      key: "addresses",
      icon: <HomeOutlined />,
      label: "Sổ địa chỉ",
      path: PROTECTED_ROUTES.PROFILE_ADDRESSES,
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Lịch sử giao dịch",
      path: PROTECTED_ROUTES.PROFILE_HISTORY,
    },
    {
      key: "security",
      icon: <LockOutlined />,
      label: "Bảo mật tài khoản",
      path: PROTECTED_ROUTES.PROFILE_SECURITY,
    },
  ];

  // Get active menu item based on current path
  const activeItem =
    menuItems.find((item) => item.path === location.pathname) || menuItems[0];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-content">
          {/* Collapsible Sidebar Navigation */}
          <aside className={`profile-sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="profile-sidebar-header">
              <h3 className="profile-sidebar-title">
                <UserOutlined />
                {!collapsed && <span>Tài khoản của tôi</span>}
              </h3>
              <button
                className="profile-sidebar-toggle"
                onClick={toggleSidebar}
                title={collapsed ? "Mở rộng" : "Thu nhỏ"}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            </div>

            <nav>
              <ul className="profile-menu">
                {menuItems.map((item) => (
                  <li key={item.key} className="profile-menu-item">
                    <Link
                      to={item.path}
                      className={`profile-menu-link ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                      title={collapsed ? item.label : ""}
                    >
                      <span className="profile-menu-icon">{item.icon}</span>
                      {!collapsed && (
                        <span className="profile-menu-label">{item.label}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main
            className={`profile-main ${collapsed ? "sidebar-collapsed" : ""}`}
          >
            <div className="profile-main-header">
              <h1 className="profile-main-title">
                {activeItem.icon}
                <span>{activeItem.label}</span>
              </h1>
              <p className="profile-main-subtitle">
                Quản lý thông tin cá nhân của bạn
              </p>
            </div>

            {/* Nested routes will render here */}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
