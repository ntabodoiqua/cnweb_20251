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
};

// Protected routes - yêu cầu đăng nhập
export const PROTECTED_ROUTES = {
  PROFILE: "/profile",
  USER: "/user",

  // Admin routes
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_PRODUCTS: "/admin/products",

  // User routes
  USER_ORDERS: "/orders",
  USER_CART: "/cart",
  USER_WISHLIST: "/wishlist",

  // Seller routes
  SELLER_DASHBOARD: "/seller",
  SELLER_PRODUCTS: "/seller/products",
  SELLER_ORDERS: "/seller/orders",
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

  [PROTECTED_ROUTES.PROFILE]: "Trang cá nhân",
  [PROTECTED_ROUTES.USER]: "Quản lý người dùng",
  [PROTECTED_ROUTES.ADMIN_DASHBOARD]: "Bảng điều khiển Admin",
  [PROTECTED_ROUTES.USER_ORDERS]: "Đơn hàng của tôi",
  [PROTECTED_ROUTES.USER_CART]: "Giỏ hàng",

  [ERROR_ROUTES.NOT_FOUND]: "Không tìm thấy trang",
  [ERROR_ROUTES.UNAUTHORIZED]: "Không có quyền truy cập",
};

/**
 * Helper function để lấy title của route
 */
export const getRouteTitle = (pathname) => {
  return ROUTE_TITLES[pathname] || "CNWEB E-Commerce";
};
