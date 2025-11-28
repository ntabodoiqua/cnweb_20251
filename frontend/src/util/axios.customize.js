import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Biến để tránh gọi refresh token nhiều lần đồng thời
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Alter defaults after instance has been created
// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response && response.data) return response.data;
    return response;
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest = error.config;

    // Xử lý lỗi 401 (Unauthorized) - token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Bỏ qua refresh nếu đang gọi API login, logout, refresh hoặc các API công khai
      const publicEndpoints = [
        "/api/user/auth/token",
        "/api/user/auth/logout",
        "/api/user/auth/refresh",
        "/api/user/users", // register
        "/api/user/users/verify-email",
        "/api/user/users/resend-otp",
        "/api/user/users/forgot-password",
        "/api/user/users/reset-password",
        "/api/user/auth/google",
        "/api/user/provinces",
        "/api/user/wards/province",
      ];

      const isPublicEndpoint = publicEndpoints.some((endpoint) =>
        originalRequest.url.includes(endpoint)
      );

      if (isPublicEndpoint) {
        console.error("API Error:", error.response?.data || error.message);
        if (error?.response?.data) return error?.response?.data;
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh, đẩy request vào queue
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const token = localStorage.getItem("access_token");

      if (!token) {
        // Không có token, chuyển về trang đăng nhập
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token - không gửi Authorization header
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/auth/refresh`,
          { token },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response?.data?.result?.token) {
          const newToken = response.data.result.token;
          localStorage.setItem("access_token", newToken);

          // Cập nhật token cho request gốc
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Xử lý các request trong queue
          processQueue(null, newToken);

          // Retry request gốc
          return instance(originalRequest);
        } else {
          // Refresh thất bại, logout
          throw new Error("Refresh token failed");
        }
      } catch (refreshError) {
        // Xử lý lỗi refresh token
        console.error("Refresh token error:", refreshError);
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý các lỗi khác
    console.error("API Error:", error.response?.data || error.message);
    if (error?.response?.data) return error?.response?.data;
    return Promise.reject(error);
  }
);

export default instance;
