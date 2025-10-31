/**
 * Định nghĩa các role trong hệ thống
 */
export const ROLES = {
  USER: "ROLE_USER",
  ADMIN: "ROLE_ADMIN",
  MODERATOR: "ROLE_MODERATOR",
  // Thêm các role khác nếu cần
};

/**
 * Mapping role sang tên hiển thị
 */
export const ROLE_NAMES = {
  [ROLES.USER]: "Người dùng",
  [ROLES.ADMIN]: "Quản trị viên",
  [ROLES.MODERATOR]: "Điều hành viên",
};

/**
 * Kiểm tra xem role có phải là admin không
 */
export const isAdmin = (role) => role === ROLES.ADMIN;

/**
 * Kiểm tra xem role có phải là user không
 */
export const isUser = (role) => role === ROLES.USER;

/**
 * Lấy tên hiển thị của role
 */
export const getRoleName = (role) => {
  return ROLE_NAMES[role] || "Không xác định";
};
