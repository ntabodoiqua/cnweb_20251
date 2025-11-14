/**
 * Định nghĩa tất cả route paths trong ứng dụng
 * Sử dụng constants để tránh typo và dễ dàng refactor
 */

// Public routes - không yêu cầu đăng nhập
export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ABOUT_US: "/about-us",
  CAREERS: "/careers",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  SELLERS: "/sellers",
  CONTACT: "/contact",
  HELP: "/help",
  ORDERS: "/orders",
  PAYMENT: "/payment",
  RETURNS: "/returns",
  SHIPPING: "/shipping",
  WARRANTY: "/warranty",
};

// Protected routes - yêu cầu đăng nhập
export const PROTECTED_ROUTES = {
  PROFILE: "/profile",
  PROFILE_GENERAL: "/profile/general",
  PROFILE_SELLER: "/profile/seller",
  PROFILE_ORDERS: "/profile/orders",
  PROFILE_ADDRESSES: "/profile/addresses",
  PROFILE_HISTORY: "/profile/history",
  PROFILE_SECURITY: "/profile/security",

  // Admin routes
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",

  // User routes
  USER_ORDERS: "/orders",
  USER_CART: "/cart",
  USER_WISHLIST: "/wishlist",

  // Seller routes
  SELLER_DASHBOARD: "/seller",
  SELLER_PRODUCTS: "/seller/products",
  SELLER_ORDERS: "/seller/orders",
  SELLER_CATEGORIES: "/seller/categories",
  SELLER_CUSTOMERS: "/seller/customers",
  SELLER_STATISTICS: "/seller/statistics",
  SELLER_SETTINGS: "/seller/settings",
};

// Error routes
export const ERROR_ROUTES = {
  NOT_FOUND: "*",
  UNAUTHORIZED: "/unauthorized",
  SERVER_ERROR: "/500",
};

// Route titles cho document.title
export const ROUTE_TITLES = {
  [PUBLIC_ROUTES.HOME]: "Trang chủ",
  [PUBLIC_ROUTES.LOGIN]: "Đăng nhập",
  [PUBLIC_ROUTES.REGISTER]: "Đăng ký",
  [PUBLIC_ROUTES.VERIFY_EMAIL]: "Xác thực email",
  [PUBLIC_ROUTES.FORGOT_PASSWORD]: "Quên mật khẩu",
  [PUBLIC_ROUTES.RESET_PASSWORD]: "Đặt lại mật khẩu",
  [PUBLIC_ROUTES.ABOUT_US]: "Về chúng tôi",
  [PUBLIC_ROUTES.CAREERS]: "Tuyển dụng",
  [PUBLIC_ROUTES.TERMS]: "Điều khoản sử dụng",
  [PUBLIC_ROUTES.PRIVACY]: "Chính sách bảo mật",
  [PUBLIC_ROUTES.SELLERS]: "Bán hàng cùng chúng tôi",
  [PUBLIC_ROUTES.CONTACT]: "Liên hệ",

  [PROTECTED_ROUTES.PROFILE]: "Trang cá nhân",
  [PROTECTED_ROUTES.PROFILE_GENERAL]: "Thông tin chung",
  [PROTECTED_ROUTES.PROFILE_SELLER]: "Hồ sơ người bán",
  [PROTECTED_ROUTES.PROFILE_ORDERS]: "Đơn hàng của tôi",
  [PROTECTED_ROUTES.PROFILE_ADDRESSES]: "Sổ địa chỉ",
  [PROTECTED_ROUTES.PROFILE_HISTORY]: "Lịch sử giao dịch",
  [PROTECTED_ROUTES.PROFILE_SECURITY]: "Bảo mật tài khoản",
  [PROTECTED_ROUTES.ADMIN_DASHBOARD]: "Bảng điều khiển Admin",
  [PROTECTED_ROUTES.ADMIN_USERS]: "Quản lý người dùng",
  [PROTECTED_ROUTES.ADMIN_PRODUCTS]: "Quản lý sản phẩm",
  [PROTECTED_ROUTES.ADMIN_ORDERS]: "Quản lý đơn hàng",
  [PROTECTED_ROUTES.ADMIN_PAYMENTS]: "Quản lý thanh toán",
  [PROTECTED_ROUTES.ADMIN_REPORTS]: "Báo cáo & Thống kê",
  [PROTECTED_ROUTES.ADMIN_SETTINGS]: "Cài đặt hệ thống",
  [PROTECTED_ROUTES.USER_ORDERS]: "Đơn hàng của tôi",
  [PROTECTED_ROUTES.USER_CART]: "Giỏ hàng",
  [PROTECTED_ROUTES.SELLER_DASHBOARD]: "Kênh Người Bán",
  [PROTECTED_ROUTES.SELLER_PRODUCTS]: "Quản lý sản phẩm",
  [PROTECTED_ROUTES.SELLER_ORDERS]: "Quản lý đơn hàng",
  [PROTECTED_ROUTES.SELLER_CATEGORIES]: "Danh mục sản phẩm",
  [PROTECTED_ROUTES.SELLER_CUSTOMERS]: "Khách hàng",
  [PROTECTED_ROUTES.SELLER_STATISTICS]: "Thống kê & Báo cáo",
  [PROTECTED_ROUTES.SELLER_SETTINGS]: "Cài đặt cửa hàng",

  [ERROR_ROUTES.NOT_FOUND]: "Không tìm thấy trang",
  [ERROR_ROUTES.UNAUTHORIZED]: "Không có quyền truy cập",
};

/**
 * Helper function để lấy title của route
 */
export const getRouteTitle = (pathname) => {
  return ROUTE_TITLES[pathname] || "CNWEB E-Commerce";
};
