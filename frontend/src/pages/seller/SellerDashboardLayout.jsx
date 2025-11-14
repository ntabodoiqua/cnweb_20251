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
} from "@ant-design/icons";
import { PROTECTED_ROUTES } from "../../constants/routes";
import "./seller-dashboard.css";

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
    <div className="seller-dashboard-page">
      <div className="seller-dashboard-container">
        <div className="seller-dashboard-content">
          {/* Collapsible Sidebar Navigation */}
          <aside className={`seller-sidebar ${collapsed ? "collapsed" : ""}`}>
            {/* Sidebar Header */}
            <div className="seller-sidebar-header">
              <h3 className="seller-sidebar-title">
                <ShopOutlined />
                {!collapsed && <span>Kênh Người Bán</span>}
              </h3>
              <button
                className="seller-sidebar-toggle"
                onClick={toggleSidebar}
                title={collapsed ? "Mở rộng" : "Thu nhỏ"}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            </div>

            {/* Sidebar Menu */}
            <nav>
              <ul className="seller-menu">
                {menuItems.map((item) => (
                  <li key={item.key} className="seller-menu-item">
                    <Link
                      to={item.path}
                      className={`seller-menu-link ${
                        location.pathname === item.path ? "active" : ""
                      }`}
                      title={collapsed ? item.label : ""}
                    >
                      <span className="seller-menu-icon">{item.icon}</span>
                      {!collapsed && (
                        <span className="seller-menu-label">{item.label}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main
            className={`seller-main ${collapsed ? "sidebar-collapsed" : ""}`}
          >
            <div className="seller-main-header">
              <h1 className="seller-main-title">
                {activeItem.icon}
                <span>{activeItem.label}</span>
              </h1>
              <p className="seller-main-subtitle">
                Quản lý cửa hàng của bạn trên HUSTBuy
              </p>
            </div>

            {/* Nested routes will render here */}
            <div className="seller-main-content">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardLayout;
