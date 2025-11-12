import axios from "./axios.customize";

const createUserApi = (userData) => {
  const URL_API = "/api/user/users";
  return axios.post(URL_API, userData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
    // Không gửi Authorization header cho API đăng ký
    transformRequest: [
      (data, headers) => {
        delete headers.Authorization;
        return JSON.stringify(data);
      },
    ],
  });
};

const loginApi = (username, password) => {
  const URL_API = "/api/user/auth/token";
  return axios.post(
    URL_API,
    {
      username,
      password,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "vi",
      },
      // Không gửi Authorization header cho API đăng nhập
      transformRequest: [
        (data, headers) => {
          delete headers.Authorization;
          return JSON.stringify(data);
        },
      ],
    }
  );
};

const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API);
};

const verifyEmailApi = (username, otpCode) => {
  const URL_API = "/api/user/users/verify-email";
  return axios.post(
    URL_API,
    {
      username,
      otpCode,
    },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
      // Không gửi Authorization header cho API xác minh email
      transformRequest: [
        (data, headers) => {
          delete headers.Authorization;
          return JSON.stringify(data);
        },
      ],
    }
  );
};

const resendOtpApi = (username) => {
  const URL_API = "/api/user/users/resend-otp";
  return axios.post(
    URL_API,
    {
      username,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      // Không gửi Authorization header cho API gửi lại OTP
      transformRequest: [
        (data, headers) => {
          delete headers.Authorization;
          return JSON.stringify(data);
        },
      ],
    }
  );
};

const forgotPasswordApi = (username) => {
  const URL_API = "/api/user/users/forgot-password";
  return axios.post(
    URL_API,
    {
      username,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      // Không gửi Authorization header cho API quên mật khẩu
      transformRequest: [
        (data, headers) => {
          delete headers.Authorization;
          return JSON.stringify(data);
        },
      ],
    }
  );
};

const resetPasswordApi = (username, otpCode, newPassword) => {
  const URL_API = "/api/user/users/reset-password";
  return axios.post(
    URL_API,
    {
      username,
      otpCode,
      newPassword,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      // Không gửi Authorization header cho API đặt lại mật khẩu
      transformRequest: [
        (data, headers) => {
          delete headers.Authorization;
          return JSON.stringify(data);
        },
      ],
    }
  );
};

const loginWithGoogleApi = (googleToken) => {
  const URL_API = "/api/user/auth/google";
  return axios.post(
    URL_API,
    {
      token: googleToken,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "vi",
      },
      // Không gửi Authorization header cho API đăng nhập Google
      transformRequest: [
        (data, headers) => {
          delete headers.Authorization;
          return JSON.stringify(data);
        },
      ],
    }
  );
};

const getMyInfoApi = () => {
  const URL_API = "/api/user/users/myInfo";
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const updateMyInfoApi = (userData) => {
  const URL_API = "/api/user/users/myInfo";
  return axios.put(URL_API, userData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const updateAvatarApi = (file) => {
  const URL_API = "/api/user/users/avatar";
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(URL_API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const changePasswordApi = (oldPassword, newPassword) => {
  const URL_API = "/api/user/users/changePassword";
  return axios.put(
    URL_API,
    {
      oldPassword,
      newPassword,
    },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

const getLoginHistoryApi = () => {
  const URL_API = "/api/user/login-history/my";
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const createSellerProfileApi = (profileData) => {
  const URL_API = "/api/user/seller-profiles";
  return axios.post(URL_API, profileData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const getMySellerProfileApi = (page = 0, size = 20) => {
  const URL_API = "/api/user/seller-profiles/me";
  return axios.get(URL_API, {
    params: {
      page,
      size,
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const updateSellerProfileApi = (profileId, profileData) => {
  const URL_API = `/api/user/seller-profiles/${profileId}`;
  return axios.put(URL_API, profileData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const getProvincesApi = () => {
  const URL_API = "/api/user/provinces";
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
    // Không gửi Authorization header
    transformRequest: [
      (data, headers) => {
        delete headers.Authorization;
        return data;
      },
    ],
  });
};

const getWardsByProvinceApi = (provinceId) => {
  const URL_API = `/api/user/wards/province/${provinceId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
    // Không gửi Authorization header
    transformRequest: [
      (data, headers) => {
        delete headers.Authorization;
        return data;
      },
    ],
  });
};

const sendSellerProfileToReviewApi = (profileId) => {
  const URL_API = `/api/user/seller-profiles/${profileId}/sendToReview`;
  return axios.patch(URL_API, null, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

export {
  createUserApi,
  loginApi,
  getUserApi,
  verifyEmailApi,
  resendOtpApi,
  forgotPasswordApi,
  resetPasswordApi,
  loginWithGoogleApi,
  getMyInfoApi,
  updateMyInfoApi,
  updateAvatarApi,
  changePasswordApi,
  getLoginHistoryApi,
  createSellerProfileApi,
  getMySellerProfileApi,
  updateSellerProfileApi,
  getProvincesApi,
  getWardsByProvinceApi,
  sendSellerProfileToReviewApi,
};
