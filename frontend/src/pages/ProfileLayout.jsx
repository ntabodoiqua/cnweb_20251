import { Link, Outlet, useLocation } from "react-router-dom";
import {
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  HomeOutlined,
  HistoryOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { PROTECTED_ROUTES } from "../constants/routes";
import styles from "./Profile.module.css";

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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Sidebar Navigation */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>
                <UserOutlined />
                Tài khoản của tôi
              </h3>
            </div>

            <nav>
              <ul className={styles.menu}>
                {menuItems.map((item) => (
                  <li key={item.key} className={styles.menuItem}>
                    <Link
                      to={item.path}
                      className={`${styles.menuLink} ${
                        location.pathname === item.path ? styles.active : ""
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
          <main className={styles.main}>
            <div className={styles.mainHeader}>
              <h1 className={styles.mainTitle}>
                {activeItem.icon}
                {activeItem.label}
              </h1>
              <p className={styles.mainSubtitle}>
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
