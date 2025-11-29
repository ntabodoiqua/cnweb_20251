import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  ShopOutlined,
  TagsOutlined,
  AppstoreOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ControlOutlined,
  SolutionOutlined,
  PictureOutlined,
  TeamOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { PROTECTED_ROUTES } from "../../constants/routes";
import "./admin-dashboard.css";

/**
 * AdminDashboardLayout - Layout component for admin dashboard with collapsible sidebar
 * Similar to ProfileLayout but with collapse/expand functionality
 */
const AdminDashboardLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([
    "users",
    "catalog",
    "business",
  ]);

  // Toggle group expansion
  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) =>
      prev.includes(groupKey)
        ? prev.filter((key) => key !== groupKey)
        : [...prev, groupKey]
    );
  };

  // Menu items configuration - Grouped
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
          path: PROTECTED_ROUTES.ADMIN_DASHBOARD,
        },
      ],
    },
    {
      key: "users",
      label: "Người dùng & Cửa hàng",
      icon: <TeamOutlined />,
      items: [
        {
          key: "users",
          icon: <UserOutlined />,
          label: "Quản lý người dùng",
          path: PROTECTED_ROUTES.ADMIN_USERS,
        },
        {
          key: "stores",
          icon: <ShopOutlined />,
          label: "Quản lý cửa hàng",
          path: PROTECTED_ROUTES.ADMIN_STORES,
        },
        {
          key: "seller-profiles",
          icon: <SolutionOutlined />,
          label: "Hồ sơ người bán",
          path: PROTECTED_ROUTES.ADMIN_SELLER_PROFILES,
        },
      ],
    },
    {
      key: "catalog",
      label: "Danh mục & Sản phẩm",
      icon: <DatabaseOutlined />,
      items: [
        {
          key: "categories",
          icon: <AppstoreOutlined />,
          label: "Danh mục sàn",
          path: PROTECTED_ROUTES.ADMIN_CATEGORIES,
        },
        {
          key: "brands",
          icon: <TagsOutlined />,
          label: "Thương hiệu",
          path: PROTECTED_ROUTES.ADMIN_BRANDS,
        },
        {
          key: "product-attributes",
          icon: <ControlOutlined />,
          label: "Thuộc tính sản phẩm",
          path: PROTECTED_ROUTES.ADMIN_PRODUCT_ATTRIBUTES,
        },
        {
          key: "products",
          icon: <ShoppingOutlined />,
          label: "Sản phẩm",
          path: PROTECTED_ROUTES.ADMIN_PRODUCTS,
        },
        {
          key: "banners",
          icon: <PictureOutlined />,
          label: "Banner",
          path: PROTECTED_ROUTES.ADMIN_BANNERS,
        },
      ],
    },
    {
      key: "business",
      label: "Kinh doanh",
      icon: <FileTextOutlined />,
      items: [
        {
          key: "orders",
          icon: <ShoppingCartOutlined />,
          label: "Đơn hàng",
          path: PROTECTED_ROUTES.ADMIN_ORDERS,
        },
        {
          key: "payments",
          icon: <DollarOutlined />,
          label: "Thanh toán",
          path: PROTECTED_ROUTES.ADMIN_PAYMENTS,
        },
        {
          key: "reports",
          icon: <BarChartOutlined />,
          label: "Báo cáo & Thống kê",
          path: PROTECTED_ROUTES.ADMIN_REPORTS,
        },
      ],
    },
    {
      key: "system",
      label: "Hệ thống",
      icon: <SettingOutlined />,
      items: [
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Cài đặt",
          path: PROTECTED_ROUTES.ADMIN_SETTINGS,
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
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-content">
          {/* Collapsible Sidebar Navigation */}
          <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
            {/* Sidebar Header */}
            <div className="admin-sidebar-header">
              <h3 className="admin-sidebar-title">
                <DashboardOutlined />
                {!collapsed && <span>Admin Dashboard</span>}
              </h3>
              <button
                className="admin-sidebar-toggle"
                onClick={toggleSidebar}
                title={collapsed ? "Mở rộng" : "Thu nhỏ"}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            </div>

            {/* Sidebar Menu */}
            <nav>
              <ul className="admin-menu">
                {menuGroups.map((group) => (
                  <li key={group.key} className="admin-menu-group">
                    {/* Group Header - Only show if more than 1 item or not collapsed */}
                    {group.items.length > 1 && (
                      <div
                        className={`admin-menu-group-header ${
                          expandedGroups.includes(group.key) ? "expanded" : ""
                        }`}
                        onClick={() => !collapsed && toggleGroup(group.key)}
                        title={collapsed ? group.label : ""}
                      >
                        <span className="admin-menu-icon">{group.icon}</span>
                        {!collapsed && (
                          <>
                            <span className="admin-menu-label">
                              {group.label}
                            </span>
                            <span className="admin-menu-arrow">
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
                      className={`admin-menu-subitems ${
                        group.items.length === 1 ||
                        expandedGroups.includes(group.key) ||
                        collapsed
                          ? "expanded"
                          : ""
                      }`}
                    >
                      {group.items.map((item) => (
                        <li key={item.key} className="admin-menu-item">
                          <Link
                            to={item.path}
                            className={`admin-menu-link ${
                              location.pathname === item.path ? "active" : ""
                            } ${group.items.length > 1 ? "submenu-item" : ""}`}
                            title={collapsed ? item.label : ""}
                          >
                            <span className="admin-menu-icon">{item.icon}</span>
                            {!collapsed && (
                              <span className="admin-menu-label">
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
            className={`admin-main ${collapsed ? "sidebar-collapsed" : ""}`}
          >
            <div className="admin-main-header">
              <h1 className="admin-main-title">
                {activeItem.icon}
                <span>{activeItem.label}</span>
              </h1>
              <p className="admin-main-subtitle">
                Quản lý và giám sát hệ thống HUSTBuy
              </p>
            </div>

            {/* Nested routes will render here */}
            <div className="admin-main-content">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
