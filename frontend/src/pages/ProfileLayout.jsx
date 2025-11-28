import { useState, useContext } from "react";
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
import styles from "./Profile.module.css";
import { AuthContext } from "../components/context/auth.context";
import { ROLES, hasAnyRole } from "../constants/roles";

/**
 * ProfileLayout - Layout component for profile pages with collapsible sidebar navigation
 * Uses <Outlet> for nested routes
 */
const ProfileLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { auth } = useContext(AuthContext);

  // Menu items configuration
  const allMenuItems = [
    {
      key: "general",
      icon: <UserOutlined />,
      label: "Thông tin chung",
      path: PROTECTED_ROUTES.PROFILE,
      roles: [ROLES.USER, ROLES.SELLER, ROLES.ADMIN], // Hiển thị cho tất cả
    },
    {
      key: "seller",
      icon: <ShopOutlined />,
      label: "Hồ sơ người bán",
      path: PROTECTED_ROUTES.PROFILE_SELLER,
      roles: [ROLES.USER, ROLES.SELLER], // Chỉ hiển thị cho USER và SELLER
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Đơn hàng",
      path: PROTECTED_ROUTES.PROFILE_ORDERS,
      roles: [ROLES.USER, ROLES.SELLER], // Chỉ hiển thị cho USER và SELLER
    },
    {
      key: "addresses",
      icon: <HomeOutlined />,
      label: "Sổ địa chỉ",
      path: PROTECTED_ROUTES.PROFILE_ADDRESSES,
      roles: [ROLES.USER, ROLES.SELLER], // Chỉ hiển thị cho USER và SELLER
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Lịch sử giao dịch",
      path: PROTECTED_ROUTES.PROFILE_HISTORY,
      roles: [ROLES.USER, ROLES.SELLER], // Chỉ hiển thị cho USER và SELLER
    },
    {
      key: "security",
      icon: <LockOutlined />,
      label: "Bảo mật tài khoản",
      path: PROTECTED_ROUTES.PROFILE_SECURITY,
      roles: [ROLES.USER, ROLES.SELLER, ROLES.ADMIN], // Hiển thị cho tất cả
    },
  ];

  // Filter menu items based on user role(s)
  // Sử dụng hasAnyRole để kiểm tra vì auth.user.role có thể chứa nhiều role (scope)
  const menuItems = allMenuItems.filter((item) =>
    hasAnyRole(auth?.user?.role, item.roles)
  );

  // Get active menu item based on current path
  const activeItem =
    menuItems.find((item) => item.path === location.pathname) ||
    menuItems[0] ||
    allMenuItems[0];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Sidebar Navigation */}
          <aside
            className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
          >
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>
                <UserOutlined />
                <span>Tài khoản của tôi</span>
              </h3>
              <button
                className={styles.sidebarToggle}
                onClick={toggleSidebar}
                title={collapsed ? "Mở rộng" : "Thu nhỏ"}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
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
                      title={collapsed ? item.label : ""}
                    >
                      {item.icon}
                      <span className={styles.menuLabel}>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main
            className={`${styles.main} ${
              collapsed ? styles.sidebarCollapsed : ""
            }`}
          >
            <div className={styles.mainHeader}>
              <h1 className={styles.mainTitle}>
                {activeItem.icon}
                <span>{activeItem.label}</span>
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
