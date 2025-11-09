/**
 * Decode JWT token without verification
 * Chỉ decode để lấy thông tin, không verify signature
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;

    // JWT có 3 phần: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT format");
      return null;
    }

    // Decode payload (phần thứ 2)
    const payload = parts[1];

    // Base64 decode
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

/**
 * Kiểm tra xem token đã hết hạn chưa
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    // exp là timestamp tính bằng giây, cần nhân với 1000 để so sánh với Date.now()
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    return currentTime > expirationTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

/**
 * Lấy role từ JWT token
 * @param {string} token - JWT token
 * @returns {string|null} - Role của user (ví dụ: "ROLE_USER", "ROLE_ADMIN")
 */
export const getRoleFromToken = (token) => {
  try {
    const decoded = decodeJWT(token);
    return decoded?.scope || null;
  } catch (error) {
    console.error("Error getting role from token:", error);
    return null;
  }
};

/**
 * Lấy username từ JWT token
 * @param {string} token - JWT token
 * @returns {string|null} - Username (từ field "sub")
 */
export const getUsernameFromToken = (token) => {
  try {
    const decoded = decodeJWT(token);
    return decoded?.sub || null;
  } catch (error) {
    console.error("Error getting username from token:", error);
    return null;
  }
};

/**
 * Kiểm tra xem user có role cụ thể không
 * @param {string} token - JWT token
 * @param {string} requiredRole - Role cần kiểm tra
 * @returns {boolean}
 */
export const hasRole = (token, requiredRole) => {
  try {
    const role = getRoleFromToken(token);
    return role === requiredRole;
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
};

/**
 * Lấy tất cả thông tin từ token
 */
export const getTokenInfo = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) return null;

    return {
      issuer: decoded.iss, // VDT2025
      username: decoded.sub, // anhnta
      expiresAt: decoded.exp, // timestamp
      issuedAt: decoded.iat, // timestamp
      tokenId: decoded.jti, // unique id
      role: decoded.scope, // ROLE_USER, ROLE_ADMIN, etc.
      isExpired: isTokenExpired(token),
    };
  } catch (error) {
    console.error("Error getting token info:", error);
    return null;
  }
};
