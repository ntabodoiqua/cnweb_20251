import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import authService from "../services/authService";
import storageService from "../utils/storage";
import { USER_ROLES } from "../constants";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = storageService.getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token is not expired
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // Token expired, try to refresh
        await refreshAuth();
        return;
      }

      // Get user info from storage or API
      let userInfo = storageService.getUserInfo();

      if (!userInfo) {
        userInfo = await authService.getCurrentUser();
        storageService.setUserInfo(userInfo);
      }

      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);

      const { accessToken, refreshToken, user: userInfo } = data;

      // Save tokens and user info
      storageService.setAccessToken(accessToken);
      if (refreshToken) {
        storageService.setRefreshToken(refreshToken);
      }
      storageService.setUserInfo(userInfo);

      setUser(userInfo);
      setIsAuthenticated(true);

      return { success: true, data };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Đăng nhập thất bại",
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);

      // Auto login after register if tokens are provided
      if (data.accessToken) {
        storageService.setAccessToken(data.accessToken);
        if (data.refreshToken) {
          storageService.setRefreshToken(data.refreshToken);
        }
        if (data.user) {
          storageService.setUserInfo(data.user);
          setUser(data.user);
          setIsAuthenticated(true);
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Đăng ký thất bại",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all storage
      storageService.clearAll();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = storageService.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const data = await authService.refreshToken(refreshToken);

      storageService.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        storageService.setRefreshToken(data.refreshToken);
      }

      // Recheck auth
      await checkAuth();
    } catch (error) {
      console.error("Refresh token failed:", error);
      logout();
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    storageService.setUserInfo(updatedUser);
  };

  const hasRole = (roles) => {
    if (!user || !user.roles) return false;
    if (typeof roles === "string") {
      return user.roles.includes(roles);
    }
    if (Array.isArray(roles)) {
      return roles.some((role) => user.roles.includes(role));
    }
    return false;
  };

  const isAdmin = () => {
    return hasRole(USER_ROLES.ADMIN);
  };

  const isSeller = () => {
    return hasRole(USER_ROLES.SELLER);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isSeller,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
