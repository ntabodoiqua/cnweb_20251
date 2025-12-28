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
  PictureOutlined,
  MessageOutlined,
  GiftOutlined,
  DownOutlined,
  RightOutlined,
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
  const [expandedGroups, setExpandedGroups] = useState([
    "catalog",
    "business",
    "communication",
  ]);

  // Toggle group expansion
  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) =>
      prev.includes(groupKey)
        ? prev.filter((key) => key !== groupKey)
        : [...prev, groupKey]
    );
  };

  // Menu items configuration for seller - Grouped
  const menuGroups = [
    {
      key: "main",
      label: "Chính",
      icon: <DashboardOutlined />,
      items: [
        {
          key: "overview",
          icon: <DashboardOutlined />,
          label: "Tổng quan",
          path: PROTECTED_ROUTES.SELLER_DASHBOARD,
        },
      ],
    },
    {
      key: "catalog",
      label: "Sản phẩm & Danh mục",
      icon: <ShopOutlined />,
      items: [
        {
          key: "products",
          icon: <ShopOutlined />,
          label: "Quản lý sản phẩm",
          path: PROTECTED_ROUTES.SELLER_PRODUCTS,
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
          key: "banners",
          icon: <PictureOutlined />,
          label: "Quản lý Banner",
          path: PROTECTED_ROUTES.SELLER_BANNERS,
        },
      ],
    },
    {
      key: "business",
      label: "Kinh doanh",
      icon: <ShoppingOutlined />,
      items: [
        {
          key: "orders",
          icon: <ShoppingOutlined />,
          label: "Quản lý đơn hàng",
          path: PROTECTED_ROUTES.SELLER_ORDERS,
        },
        {
          key: "coupons",
          icon: <GiftOutlined />,
          label: "Mã giảm giá",
          path: PROTECTED_ROUTES.SELLER_COUPONS,
        },
        {
          key: "statistics",
          icon: <BarChartOutlined />,
          label: "Thống kê & Báo cáo",
          path: PROTECTED_ROUTES.SELLER_STATISTICS,
        },
      ],
    },
    {
      key: "communication",
      label: "Giao tiếp",
      icon: <MessageOutlined />,
      items: [
        {
          key: "customers",
          icon: <TeamOutlined />,
          label: "Khách hàng",
          path: PROTECTED_ROUTES.SELLER_CUSTOMERS,
        },
        {
          key: "chat",
          icon: <MessageOutlined />,
          label: "Tin nhắn",
          path: PROTECTED_ROUTES.SELLER_CHAT,
        },
      ],
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <SettingOutlined />,
      items: [
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Cài đặt cửa hàng",
          path: PROTECTED_ROUTES.SELLER_SETTINGS,
        },
      ],
    },
  ];

  // Flatten all items for finding active item
  const allItems = menuGroups.flatMap((group) => group.items);

  // Get active menu item based on current path
  const activeItem =
    allItems.find((item) => item.path === location.pathname) || allItems[0];

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
                {menuGroups.map((group) => (
                  <li key={group.key} className={styles.menuGroup}>
                    {/* Group Header - Only show if more than 1 item or not collapsed */}
                    {group.items.length > 1 && (
                      <div
                        className={`${styles.menuGroupHeader} ${
                          expandedGroups.includes(group.key)
                            ? styles.expanded
                            : ""
                        }`}
                        onClick={() => !collapsed && toggleGroup(group.key)}
                        title={collapsed ? group.label : ""}
                      >
                        <span className={styles.menuIcon}>{group.icon}</span>
                        {!collapsed && (
                          <>
                            <span className={styles.menuLabel}>
                              {group.label}
                            </span>
                            <span className={styles.menuArrow}>
                              {expandedGroups.includes(group.key) ? (
                                <DownOutlined />
                              ) : (
                                <RightOutlined />
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Group Items */}
                    <ul
                      className={`${styles.menuSubitems} ${
                        group.items.length === 1 ||
                        expandedGroups.includes(group.key) ||
                        collapsed
                          ? styles.expanded
                          : ""
                      }`}
                    >
                      {group.items.map((item) => (
                        <li key={item.key} className={styles.menuItem}>
                          <Link
                            to={item.path}
                            className={`${styles.menuLink} ${
                              location.pathname === item.path
                                ? styles.active
                                : ""
                            } ${
                              group.items.length > 1 ? styles.submenuItem : ""
                            }`}
                            title={collapsed ? item.label : ""}
                          >
                            <span className={styles.menuIcon}>{item.icon}</span>
                            {!collapsed && (
                              <span className={styles.menuLabel}>
                                {item.label}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
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
