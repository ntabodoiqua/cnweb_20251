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

  // Menu items configuration
  const menuItems = [
    {
      key: "overview",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      path: PROTECTED_ROUTES.ADMIN_DASHBOARD,
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      path: PROTECTED_ROUTES.ADMIN_USERS,
    },
    {
      key: "brands",
      icon: <TagsOutlined />,
      label: "Quản lý thương hiệu",
      path: PROTECTED_ROUTES.ADMIN_BRANDS,
    },
    {
      key: "stores",
      icon: <ShopOutlined />,
      label: "Quản lý cửa hàng",
      path: PROTECTED_ROUTES.ADMIN_STORES,
    },
    {
      key: "categories",
      icon: <AppstoreOutlined />,
      label: "Quản lý danh mục sàn",
      path: PROTECTED_ROUTES.ADMIN_CATEGORIES,
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: "Quản lý sản phẩm",
      path: PROTECTED_ROUTES.ADMIN_PRODUCTS,
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Quản lý đơn hàng",
      path: PROTECTED_ROUTES.ADMIN_ORDERS,
    },
    {
      key: "payments",
      icon: <DollarOutlined />,
      label: "Quản lý thanh toán",
      path: PROTECTED_ROUTES.ADMIN_PAYMENTS,
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo & Thống kê",
      path: PROTECTED_ROUTES.ADMIN_REPORTS,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt hệ thống",
      path: PROTECTED_ROUTES.ADMIN_SETTINGS,
    },
  ];

  // Get active menu item based on current path
  const activeItem =
    menuItems.find((item) => item.path === location.pathname) || menuItems[0];

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
                {menuItems.map((item) => (
                  <li key={item.key} className="admin-menu-item">
                    <Link
                      to={item.path}
                      className={`admin-menu-link ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                      title={collapsed ? item.label : ""}
                    >
                      <span className="admin-menu-icon">{item.icon}</span>
                      {!collapsed && (
                        <span className="admin-menu-label">{item.label}</span>
                      )}
                    </Link>
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
