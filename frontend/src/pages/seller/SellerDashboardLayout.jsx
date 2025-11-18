import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ShopOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TagsOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { PROTECTED_ROUTES } from "../../constants/routes";
import styles from "./seller-dashboard.module.css";

/**
 * SellerDashboardLayout - Layout component for seller dashboard with collapsible sidebar
 * Similar to AdminDashboardLayout but customized for sellers
 */
const SellerDashboardLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Menu items configuration for seller
  const menuItems = [
    {
      key: "overview",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      path: PROTECTED_ROUTES.SELLER_DASHBOARD,
    },
    {
      key: "products",
      icon: <ShopOutlined />,
      label: "Quản lý sản phẩm",
      path: PROTECTED_ROUTES.SELLER_PRODUCTS,
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Quản lý đơn hàng",
      path: PROTECTED_ROUTES.SELLER_ORDERS,
    },
    {
      key: "categories",
      icon: <TagsOutlined />,
      label: "Danh mục sản phẩm",
      path: PROTECTED_ROUTES.SELLER_CATEGORIES,
    },
    {
      key: "product-attributes",
      icon: <AppstoreOutlined />,
      label: "Thuộc tính sản phẩm",
      path: PROTECTED_ROUTES.SELLER_PRODUCT_ATTRIBUTES,
    },
    {
      key: "customers",
      icon: <TeamOutlined />,
      label: "Khách hàng",
      path: PROTECTED_ROUTES.SELLER_CUSTOMERS,
    },
    {
      key: "statistics",
      icon: <BarChartOutlined />,
      label: "Thống kê & Báo cáo",
      path: PROTECTED_ROUTES.SELLER_STATISTICS,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt cửa hàng",
      path: PROTECTED_ROUTES.SELLER_SETTINGS,
    },
  ];

  // Get active menu item based on current path
  const activeItem =
    menuItems.find((item) => item.path === location.pathname) || menuItems[0];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Collapsible Sidebar Navigation */}
          <aside
            className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
          >
            {/* Sidebar Header */}
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>
                <ShopOutlined />
                {!collapsed && <span>Kênh Người Bán</span>}
              </h3>
              <button
                className={styles.sidebarToggle}
                onClick={toggleSidebar}
                title={collapsed ? "Mở rộng" : "Thu nhỏ"}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            </div>

            {/* Sidebar Menu */}
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
                      <span className={styles.menuIcon}>{item.icon}</span>
                      {!collapsed && (
                        <span className={styles.menuLabel}>{item.label}</span>
                      )}
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
                Quản lý cửa hàng của bạn trên HUSTBuy
              </p>
            </div>

            {/* Nested routes will render here */}
            <div className={styles.mainContent}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardLayout;
