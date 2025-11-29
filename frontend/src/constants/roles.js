/**
 * Định nghĩa các role trong hệ thống
 */
export const ROLES = {
  USER: "ROLE_USER",
  ADMIN: "ROLE_ADMIN",
  SELLER: "ROLE_SELLER",
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
  [ROLES.SELLER]: "Người bán",
};

/**
 * Thứ tự ưu tiên của các role (số càng cao thì role càng cao)
 */
export const ROLE_PRIORITY = {
  [ROLES.ADMIN]: 4,
  [ROLES.MODERATOR]: 3,
  [ROLES.SELLER]: 2,
  [ROLES.USER]: 1,
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

/**
 * Lấy role cao nhất từ chuỗi roles (có thể có nhiều role cách nhau bởi dấu cách)
 * @param {string} roleString - Chuỗi role (ví dụ: "ROLE_USER ROLE_SELLER" hoặc "ROLE_ADMIN")
 * @returns {string} - Role cao nhất
 */
export const getHighestRole = (roleString) => {
  if (!roleString) return "";

  // Tách chuỗi role thành mảng (nếu có nhiều role)
  const roles = roleString.includes(" ") ? roleString.split(" ") : [roleString];

  // Tìm role có priority cao nhất
  let highestRole = roles[0];
  let highestPriority = ROLE_PRIORITY[roles[0]] || 0;

  for (let i = 1; i < roles.length; i++) {
    const currentPriority = ROLE_PRIORITY[roles[i]] || 0;
    if (currentPriority > highestPriority) {
      highestPriority = currentPriority;
      highestRole = roles[i];
    }
  }

  return highestRole;
};

/**
 * Lấy tất cả roles từ chuỗi scope
 * @param {string} roleString - Chuỗi role (ví dụ: "ROLE_USER ROLE_SELLER")
 * @returns {string[]} - Mảng các role
 */
export const getAllRoles = (roleString) => {
  if (!roleString) return [];
  return roleString.includes(" ") ? roleString.split(" ") : [roleString];
};

/**
 * Kiểm tra xem scope có chứa role cụ thể không
 * @param {string} roleString - Chuỗi role (ví dụ: "ROLE_USER ROLE_SELLER")
 * @param {string} targetRole - Role cần kiểm tra
 * @returns {boolean}
 */
export const hasRole = (roleString, targetRole) => {
  if (!roleString || !targetRole) return false;
  const roles = getAllRoles(roleString);
  return roles.includes(targetRole);
};

/**
 * Kiểm tra xem scope có chứa bất kỳ role nào trong danh sách không
 * @param {string} roleString - Chuỗi role (ví dụ: "ROLE_USER ROLE_SELLER")
 * @param {string[]} targetRoles - Mảng các role cần kiểm tra
 * @returns {boolean}
 */
export const hasAnyRole = (roleString, targetRoles) => {
  if (!roleString || !targetRoles || targetRoles.length === 0) return false;
  const roles = getAllRoles(roleString);
  return targetRoles.some((targetRole) => roles.includes(targetRole));
};
