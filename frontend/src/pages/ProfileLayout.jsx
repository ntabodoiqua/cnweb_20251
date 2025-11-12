import { Link, Outlet, useLocation } from "react-router-dom";
import {
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  HomeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { PROTECTED_ROUTES } from "../constants/routes";
import "./profile.css";

/**
 * ProfileLayout - Layout component for profile pages with sidebar navigation
 * Uses <Outlet> for nested routes
 */
const ProfileLayout = () => {
  const location = useLocation();

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
  ];

  // Get active menu item based on current path
  const activeItem =
    menuItems.find((item) => item.path === location.pathname) || menuItems[0];

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-content">
          {/* Sidebar Navigation */}
          <aside className="profile-sidebar">
            <div className="profile-sidebar-header">
              <h3 className="profile-sidebar-title">
                <UserOutlined />
                Tài khoản của tôi
              </h3>
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
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="profile-main">
            <div className="profile-main-header">
              <h1 className="profile-main-title">
                {activeItem.icon}
                {activeItem.label}
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
