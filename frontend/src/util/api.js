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

const getLoginHistoryApi = (page = 0, size = 10) => {
  const URL_API = "/api/user/login-history/my";
  return axios.get(URL_API, {
    params: {
      page: page,
      size: size,
      sortBy: "loginTime",
      direction: "desc",
    },
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

const getMySellerProfileApi = (page = 0, size = 5) => {
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

const uploadSellerDocumentApi = (profileId, file) => {
  const URL_API = `/api/user/seller-profiles/${profileId}/uploadDocument`;
  const formData = new FormData();
  formData.append("file", file);

  return axios.patch(URL_API, formData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "multipart/form-data",
    },
  });
};

const getSellerDocumentApi = (profileId) => {
  const URL_API = `/api/user/seller-profiles/${profileId}/document`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Address APIs
const getAddressesApi = (page = 0, size = 20) => {
  const URL_API = "/api/user/address";
  return axios.get(URL_API, {
    params: {
      page,
      size,
      sort: "isDefault,desc", // Sắp xếp địa chỉ mặc định lên đầu
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const createAddressApi = (addressData) => {
  const URL_API = "/api/user/address";
  return axios.post(URL_API, addressData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const updateAddressApi = (addressId, addressData) => {
  const URL_API = `/api/user/address/${addressId}`;
  return axios.put(URL_API, addressData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const deleteAddressApi = (addressId) => {
  const URL_API = `/api/user/address/${addressId}`;
  return axios.delete(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const logoutApi = (token) => {
  const URL_API = "/api/user/auth/logout";
  return axios.post(
    URL_API,
    {
      token,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

const refreshTokenApi = (token) => {
  const URL_API = "/api/user/auth/refresh";
  return axios.post(
    URL_API,
    {
      token,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Store APIs
const getMyStoresApi = (page = 0, size = 20) => {
  const URL_API = "/api/product/stores/myStores";
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

const createStoreApi = (storeData) => {
  const URL_API = "/api/product/stores";
  return axios.post(URL_API, storeData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const updateStoreApi = (storeId, storeData) => {
  const URL_API = `/api/product/stores/${storeId}`;
  return axios.put(URL_API, storeData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const deleteStoreApi = (storeId) => {
  const URL_API = `/api/product/stores/${storeId}`;
  return axios.delete(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const activateStoreApi = (storeId) => {
  const URL_API = `/api/product/stores/${storeId}/activate`;
  return axios.put(URL_API, null, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const deactivateStoreApi = (sellerProfileId) => {
  const URL_API = `/api/product/stores/${sellerProfileId}/deactivate`;
  return axios.put(URL_API, null, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const uploadStoreLogoApi = (storeId, file) => {
  const URL_API = `/api/product/stores/${storeId}/media`;
  const formData = new FormData();
  formData.append("type", "1"); // type=1 for logo
  formData.append("file", file);

  return axios.put(URL_API, formData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "multipart/form-data",
    },
  });
};

const uploadStoreBannerApi = (storeId, file) => {
  const URL_API = `/api/product/stores/${storeId}/media`;
  const formData = new FormData();
  formData.append("type", "2"); // type=2 for banner
  formData.append("file", file);

  return axios.put(URL_API, formData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "multipart/form-data",
    },
  });
};

const getWardInfoApi = (wardId) => {
  const URL_API = `/api/user/wards/${wardId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
    // Không gửi Authorization header cho API public
    transformRequest: [
      (data, headers) => {
        delete headers.Authorization;
        return data;
      },
    ],
  });
};

// Store Categories APIs
const getStoreCategoriesApi = (storeId) => {
  const URL_API = `/api/product/seller/stores/${storeId}/categories`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const createStoreCategoryApi = (storeId, categoryData) => {
  const URL_API = `/api/product/seller/stores/${storeId}/categories`;
  return axios.post(URL_API, categoryData, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const updateStoreCategoryApi = (storeId, categoryId, categoryData) => {
  const URL_API = `/api/product/seller/stores/${storeId}/categories/${categoryId}`;
  return axios.put(URL_API, categoryData, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const deleteStoreCategoryApi = (storeId, categoryId) => {
  const URL_API = `/api/product/seller/stores/${storeId}/categories/${categoryId}`;
  return axios.delete(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const uploadCategoryImageApi = (storeId, categoryId, file) => {
  const URL_API = `/api/product/seller/stores/${storeId}/categories/${categoryId}/thumbnail`;
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(URL_API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
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
  uploadSellerDocumentApi,
  getSellerDocumentApi,
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
  logoutApi,
  refreshTokenApi,
  getMyStoresApi,
  createStoreApi,
  updateStoreApi,
  deleteStoreApi,
  activateStoreApi,
  deactivateStoreApi,
  uploadStoreLogoApi,
  uploadStoreBannerApi,
  getWardInfoApi,
  getStoreCategoriesApi,
  createStoreCategoryApi,
  updateStoreCategoryApi,
  deleteStoreCategoryApi,
  uploadCategoryImageApi,
};
