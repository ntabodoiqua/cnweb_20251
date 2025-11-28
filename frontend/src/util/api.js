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

// Product APIs
const createProductApi = (productData) => {
  const URL_API = "/api/product/products";
  return axios.post(URL_API, productData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const getProductsApi = (params) => {
  const URL_API = "/api/product/products";
  return axios.get(URL_API, {
    params,
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Get public products with filters (for homepage and products page)
const getPublicProductsApi = (params) => {
  const URL_API = "/api/product/public/products";
  return axios.get(URL_API, {
    params,
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Get public stores (no authentication required)
const getPublicStoresApi = (page = 0, size = 20) => {
  const URL_API = "/api/product/public/stores";
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

// Get public store detail (no authentication required)
const getPublicStoreDetailApi = (storeId) => {
  const URL_API = `/api/product/public/stores/${storeId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Get public store categories (no authentication required)
const getPublicStoreCategoriesApi = (storeId) => {
  const URL_API = `/api/product/public/categories/store/${storeId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Get public product detail (no authentication required)
const getPublicProductDetailApi = (productId) => {
  const URL_API = `/api/product/public/products/${productId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Get public product variant options (no authentication required)
const getPublicProductVariantOptionsApi = (
  productId,
  attributeValueIds = []
) => {
  const URL_API = `/api/product/public/products/${productId}/variant-options`;
  return axios.get(URL_API, {
    data: {
      attributeValueIds: attributeValueIds,
    },
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Find variant by attribute combination (no authentication required)
const findVariantByAttributesApi = (productId, attributeValueIds) => {
  const URL_API = `/api/product/public/products/${productId}/find-variant`;
  return axios.post(
    URL_API,
    {
      attributeValueIds: attributeValueIds,
    },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

// Get public product specifications (no authentication required)
const getPublicProductSpecsApi = (productId) => {
  const URL_API = `/api/product/public/products/${productId}/specs`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Get selection config for product (no authentication required)
const getSelectionConfigApi = (productId) => {
  const URL_API = `/api/product/public/products/${productId}/selection-config`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Find variant by selection options (no authentication required)
const findVariantBySelectionApi = (productId, optionIds) => {
  const URL_API = `/api/product/public/products/${productId}/find-variant-by-selection`;
  return axios.post(
    URL_API,
    {
      optionIds: optionIds,
    },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

// Get variant metadata/specifications (no authentication required - public API)
const getPublicVariantMetadataApi = (productId, variantId) => {
  const URL_API = `/api/product/public/products/${productId}/variants/${variantId}/metadata`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Get available options based on current selections (no authentication required)
const getAvailableOptionsApi = (productId, selectedOptionIds = []) => {
  const URL_API = `/api/product/public/products/${productId}/available-options`;

  // Build query string manually for array params (Spring Boot format)
  const params = new URLSearchParams();
  if (selectedOptionIds && selectedOptionIds.length > 0) {
    selectedOptionIds.forEach((id) => {
      params.append("selectedOptionIds", id);
    });
  }

  const queryString = params.toString();
  const fullUrl = queryString ? `${URL_API}?${queryString}` : URL_API;

  return axios.get(fullUrl, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Get product specifications for seller (authenticated)
const getProductSpecsApi = (productId) => {
  const URL_API = `/api/product/products/${productId}/specs`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Update product specifications (seller)
const updateProductSpecsApi = (productId, specsData) => {
  const URL_API = `/api/product/products/${productId}/specs`;
  return axios.put(URL_API, specsData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const getProductsByStoreApi = (storeId, page = 0, size = 20) => {
  const URL_API = `/api/product/products`;
  return axios.get(URL_API, {
    params: {
      storeId,
      page,
      size,
      sort: "createdAt,desc",
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const getProductDetailApi = (productId) => {
  const URL_API = `/api/product/products/${productId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const updateProductApi = (productId, productData) => {
  const URL_API = `/api/product/products/${productId}`;
  return axios.put(URL_API, productData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const uploadProductImageApi = (productId, file, displayOrder = 1) => {
  const URL_API = `/api/product/products/${productId}/images`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("displayOrder", displayOrder.toString());

  return axios.post(URL_API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Accept-Language": "vi",
    },
  });
};

const deleteProductImageApi = (productId, imageId) => {
  const URL_API = `/api/product/products/${productId}/images/${imageId}`;
  return axios.delete(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const updateProductImageOrderApi = (productId, imageId, displayOrder) => {
  const URL_API = `/api/product/products/${productId}/images/${imageId}/display-order`;
  return axios.put(
    URL_API,
    { displayOrder },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

const updateProductImagesOrderApi = (productId, imagesOrder) => {
  const URL_API = `/api/product/products/${productId}/images/order`;
  return axios.put(URL_API, imagesOrder, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const setProductImagePrimaryApi = (productId, imageId) => {
  const URL_API = `/api/product/products/${productId}/images/${imageId}/primary`;
  return axios.put(
    URL_API,
    {},
    {
      headers: {
        "Accept-Language": "vi",
      },
    }
  );
};

const getCategoriesApi = () => {
  const URL_API = "/api/product/categories";
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const getPlatformCategoriesApi = () => {
  const URL_API = "/api/product/admin/categories";
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const getPlatformCategoryDetailApi = (categoryId) => {
  const URL_API = `/api/product/admin/categories/${categoryId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const getBrandsApi = (page = 0, size = 100) => {
  const URL_API = "/api/product/brands/public";
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

// Get public platform categories (no authentication required)
const getPublicPlatformCategoriesApi = () => {
  const URL_API = "/api/product/public/categories/platform";
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Payment APIs
const createZaloPayOrderApi = (paymentData) => {
  const URL_API = "/api/payment/v1/payments/zalopay/create-order";
  return axios.post(URL_API, paymentData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const queryPaymentStatusApi = (appTransId) => {
  const URL_API = "/api/payment/v1/payments/zalopay/query-order";
  return axios.post(
    URL_API,
    { appTransId },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

// Admin Transaction History API
const getAdminTransactionHistoryApi = (params = {}) => {
  const URL_API = "/api/payment/v1/transactions/admin/history";
  return axios.get(URL_API, {
    params: {
      appUser: params.appUser || "",
      status: params.status || "",
      startDate: params.startDate || "",
      endDate: params.endDate || "",
      minAmount: params.minAmount || "",
      maxAmount: params.maxAmount || "",
      bankCode: params.bankCode || "",
      searchKeyword: params.searchKeyword || "",
      page: params.page ?? 0,
      size: params.size ?? 10,
      sortBy: params.sortBy || "createdAt",
      sortDirection: params.sortDirection || "DESC",
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Order APIs
const createOrderApi = (orderData) => {
  const URL_API = "/api/order/api/v1/orders";
  return axios.post(URL_API, orderData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const applyCouponToOrdersApi = (couponCode, orderIds) => {
  const URL_API = `/api/order/api/v1/orders/apply-coupon?couponCode=${encodeURIComponent(
    couponCode
  )}`;
  return axios.post(URL_API, orderIds, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const initiateOrderPaymentApi = (orderIds, expireDurationSeconds = null) => {
  const URL_API = "/api/order/api/v1/orders/payment";
  const requestBody = {
    orderIds: orderIds,
  };

  // Chỉ thêm expireDurationSeconds nếu có giá trị
  if (expireDurationSeconds !== null && expireDurationSeconds !== undefined) {
    requestBody.expireDurationSeconds = expireDurationSeconds;
  }

  return axios.post(URL_API, requestBody, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Get my orders with filters
const getMyOrdersApi = (params = {}) => {
  const URL_API = "/api/order/api/v1/orders/my-orders";
  return axios.get(URL_API, {
    params: {
      search: params.search || "",
      status: params.status || "",
      paymentStatus: params.paymentStatus || "",
      startDate: params.startDate || "",
      endDate: params.endDate || "",
      minAmount: params.minAmount || "",
      maxAmount: params.maxAmount || "",
      page: params.page || 0,
      size: params.size || 10,
      sort: params.sort || "createdAt,desc",
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Get store orders with filters (for seller)
const getStoreOrdersApi = (storeId, params = {}) => {
  const URL_API = `/api/order/api/v1/orders/store/${storeId}`;
  return axios.get(URL_API, {
    params: {
      search: params.search || "",
      status: params.status || "",
      paymentStatus: params.paymentStatus || "",
      startDate: params.startDate || "",
      endDate: params.endDate || "",
      minAmount: params.minAmount || "",
      maxAmount: params.maxAmount || "",
      page: params.page || 0,
      size: params.size || 10,
      sort: params.sort || "createdAt,desc",
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Admin Orders API - Get all orders for admin
const getAdminOrdersApi = (params = {}) => {
  const URL_API = "/api/order/api/v1/orders/admin";
  return axios.get(URL_API, {
    params: {
      search: params.search || "",
      status: params.status || "",
      paymentStatus: params.paymentStatus || "",
      startDate: params.startDate || "",
      endDate: params.endDate || "",
      minAmount: params.minAmount || "",
      maxAmount: params.maxAmount || "",
      page: params.page || 0,
      size: params.size || 10,
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Cart APIs
const getCartApi = () => {
  const URL_API = "/api/order/api/v1/cart";
  const token = localStorage.getItem("access_token");

  const headers = {
    "Accept-Language": "vi",
  };

  // Chễ gửi X-Session-Id nếu là guest (chưa đăng nhập)
  // Khi đã đăng nhập, axios interceptor sẽ tự động thêm Authorization header
  if (!token) {
    const sessionId =
      localStorage.getItem("cart_session_id") || generateSessionId();
    headers["X-Session-Id"] = sessionId;
  }

  return axios.get(URL_API, { headers });
};

const addToCartApi = (cartItemData) => {
  const URL_API = "/api/order/api/v1/cart/items";
  const token = localStorage.getItem("access_token");

  const headers = {
    "Accept-Language": "vi",
    "Content-Type": "application/json",
  };

  // Chỉ gửi X-Session-Id nếu là guest (chưa đăng nhập)
  // Khi đã đăng nhập, axios interceptor sẽ tự động thêm Authorization header
  if (!token) {
    const sessionId =
      localStorage.getItem("cart_session_id") || generateSessionId();
    headers["X-Session-Id"] = sessionId;
  }

  return axios.post(
    URL_API,
    {
      productId: cartItemData.productId,
      productName: cartItemData.productName,
      variantId: cartItemData.variantId || null,
      variantName: cartItemData.variantName || null,
      imageUrl: cartItemData.imageUrl,
      quantity: cartItemData.quantity,
      price: cartItemData.price,
      originalPrice: cartItemData.originalPrice || cartItemData.price,
    },
    { headers }
  );
};

const updateCartItemApi = (productId, variantId, quantity) => {
  const URL_API = "/api/order/api/v1/cart/items";
  const token = localStorage.getItem("access_token");

  const headers = {
    "Accept-Language": "vi",
    "Content-Type": "application/json",
  };

  // Chỉ gửi X-Session-Id nếu là guest (chưa đăng nhập)
  // Khi đã đăng nhập, axios interceptor sẽ tự động thêm Authorization header
  if (!token) {
    const sessionId =
      localStorage.getItem("cart_session_id") || generateSessionId();
    headers["X-Session-Id"] = sessionId;
  }

  return axios.put(
    URL_API,
    {
      productId,
      variantId,
      quantity,
    },
    { headers }
  );
};

const removeCartItemApi = (productId, variantId) => {
  const URL_API = "/api/order/api/v1/cart/items";
  const token = localStorage.getItem("access_token");

  const headers = {
    "Accept-Language": "vi",
  };

  // Chỉ gửi X-Session-Id nếu là guest (chưa đăng nhập)
  // Khi đã đăng nhập, axios interceptor sẽ tự động thêm Authorization header
  if (!token) {
    const sessionId =
      localStorage.getItem("cart_session_id") || generateSessionId();
    headers["X-Session-Id"] = sessionId;
  }

  return axios.delete(URL_API, {
    params: {
      productId,
      variantId,
    },
    headers,
  });
};

const clearCartApi = () => {
  const URL_API = "/api/order/api/v1/cart";
  const token = localStorage.getItem("access_token");

  const headers = {
    "Accept-Language": "vi",
  };

  // Chỉ gửi X-Session-Id nếu là guest (chưa đăng nhập)
  // Khi đã đăng nhập, axios interceptor sẽ tự động thêm Authorization header
  if (!token) {
    const sessionId =
      localStorage.getItem("cart_session_id") || generateSessionId();
    headers["X-Session-Id"] = sessionId;
  }

  return axios.delete(URL_API, { headers });
};

const mergeCartApi = (guestSessionId) => {
  const URL_API = "/api/order/api/v1/cart/merge";

  return axios.post(
    URL_API,
    { guestSessionId },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

const getCartCountApi = () => {
  const URL_API = "/api/order/api/v1/cart/count";
  const token = localStorage.getItem("access_token");

  const headers = {
    "Accept-Language": "vi",
  };

  // Chỉ gửi X-Session-Id nếu là guest (chưa đăng nhập)
  // Khi đã đăng nhập, axios interceptor sẽ tự động thêm Authorization header
  if (!token) {
    const sessionId =
      localStorage.getItem("cart_session_id") || generateSessionId();
    headers["X-Session-Id"] = sessionId;
  }

  return axios.get(URL_API, { headers });
};

const validateCartApi = () => {
  const URL_API = "/api/order/api/v1/cart/validate";
  const token = localStorage.getItem("access_token");

  const headers = {
    "Accept-Language": "vi",
  };

  // Chỉ gửi X-Session-Id nếu là guest (chưa đăng nhập)
  // Khi đã đăng nhập, axios interceptor sẽ tự động thêm Authorization header
  if (!token) {
    const sessionId =
      localStorage.getItem("cart_session_id") || generateSessionId();
    headers["X-Session-Id"] = sessionId;
  }

  return axios.get(URL_API, { headers });
};

const getDetailedCartValidationApi = () => {
  const URL_API = "/api/order/api/v1/cart/validate/detailed";
  const token = localStorage.getItem("access_token");

  const headers = {
    "Accept-Language": "vi",
  };

  // Chỉ gửi X-Session-Id nếu là guest (chưa đăng nhập)
  // Khi đã đăng nhập, axios interceptor sẽ tự động thêm Authorization header
  if (!token) {
    const sessionId =
      localStorage.getItem("cart_session_id") || generateSessionId();
    headers["X-Session-Id"] = sessionId;
  }

  return axios.get(URL_API, { headers });
};

// Helper function to generate session ID for guest users
const generateSessionId = () => {
  // Generate session ID with "session_" prefix
  // Backend will add "guest:" prefix, then Redis adds "cart:" prefix
  // Final Redis key: cart:guest:session_{timestamp}_{random}
  const sessionId = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  localStorage.setItem("cart_session_id", sessionId);
  return sessionId;
};

// Product Attributes APIs
const createProductAttributeApi = (attributeData) => {
  const URL_API = "/api/product/product-attributes";
  return axios.post(URL_API, attributeData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const getProductAttributesByCategoryApi = (categoryId) => {
  const URL_API = `/api/product/product-attributes/by-category/${categoryId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const getProductAttributeByIdApi = (attributeId) => {
  const URL_API = `/api/product/product-attributes/${attributeId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const updateProductAttributeApi = (attributeId, attributeData) => {
  const URL_API = `/api/product/product-attributes/${attributeId}`;
  return axios.put(URL_API, attributeData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const deleteProductAttributeApi = (attributeId) => {
  const URL_API = `/api/product/product-attributes/${attributeId}`;
  return axios.delete(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const addCategoriesToAttributeApi = (attributeId, categoryIds) => {
  const URL_API = `/api/product/product-attributes/${attributeId}/categories`;
  return axios.post(
    URL_API,
    { categoryIds },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

const deleteCategoriesFromAttributeApi = (attributeId, categoryIds) => {
  const URL_API = `/api/product/product-attributes/${attributeId}/categories`;
  return axios.delete(URL_API, {
    data: { categoryIds },
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const addValueToAttributeApi = (attributeId, value) => {
  const URL_API = `/api/product/product-attributes/${attributeId}/values`;
  return axios.post(
    URL_API,
    { value },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

const deleteValueFromAttributeApi = (attributeId, value) => {
  const URL_API = `/api/product/product-attributes/${attributeId}/values`;
  return axios.delete(URL_API, {
    data: { value },
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Product Variants APIs
const getProductVariantsApi = (productId) => {
  const URL_API = `/api/product/products/${productId}/variants`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Selection Groups APIs (for seller)
const getSelectionGroupsApi = (productId) => {
  const URL_API = `/api/product/products/${productId}/selections/groups`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const createSelectionGroupApi = (productId, groupData) => {
  const URL_API = `/api/product/products/${productId}/selections/groups`;
  return axios.post(URL_API, groupData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const updateSelectionGroupApi = (productId, groupId, groupData) => {
  const URL_API = `/api/product/products/${productId}/selections/groups/${groupId}`;
  return axios.put(URL_API, groupData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const deleteSelectionGroupApi = (productId, groupId) => {
  const URL_API = `/api/product/products/${productId}/selections/groups/${groupId}`;
  return axios.delete(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const getSelectionGroupDetailApi = (productId, groupId) => {
  const URL_API = `/api/product/products/${productId}/selections/groups/${groupId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Link variants to selection option
const linkVariantsToOptionApi = (productId, groupId, optionId, variantIds) => {
  const URL_API = `/api/product/products/${productId}/selections/groups/${groupId}/options/${optionId}/link-variants`;
  return axios.post(
    URL_API,
    { variantIds },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

// Unlink variants from selection option
const unlinkVariantsFromOptionApi = (
  productId,
  groupId,
  optionId,
  variantIds
) => {
  const URL_API = `/api/product/products/${productId}/selections/groups/${groupId}/options/${optionId}/unlink-variants`;
  return axios.post(
    URL_API,
    { variantIds },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

// Get linked variants for an option
const getLinkedVariantsApi = (productId, groupId, optionId) => {
  const URL_API = `/api/product/products/${productId}/selections/groups/${groupId}/options/${optionId}/variants`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const createVariantApi = (productId, variantData) => {
  const URL_API = `/api/product/products/${productId}/variants`;
  return axios.post(URL_API, variantData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const updateVariantApi = (productId, variantId, variantData) => {
  const URL_API = `/api/product/products/${productId}/variants/${variantId}`;
  return axios.put(URL_API, variantData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const deleteVariantApi = (productId, variantId) => {
  const URL_API = `/api/product/products/${productId}/variants/${variantId}`;
  return axios.delete(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const addAttributeToVariantApi = (productId, variantId, attributeData) => {
  const URL_API = `/api/product/products/${productId}/variants/${variantId}/attributes`;
  return axios.post(URL_API, attributeData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const removeAttributeFromVariantApi = (
  productId,
  variantId,
  attributeId,
  value
) => {
  const URL_API = `/api/product/products/${productId}/variants/${variantId}/attributes`;
  return axios.delete(URL_API, {
    data: {
      attributeId: attributeId,
      value: value,
    },
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Variant Metadata APIs
const getVariantMetadataApi = (productId, variantId) => {
  const URL_API = `/api/product/products/${productId}/variants/${variantId}/metadata`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const updateVariantMetadataApi = (productId, variantId, metadataData) => {
  const URL_API = `/api/product/products/${productId}/variants/${variantId}/metadata`;
  return axios.put(URL_API, metadataData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Upload variant image
const uploadVariantImageApi = (productId, variantId, file) => {
  const URL_API = `/api/product/products/${productId}/variants/${variantId}/image`;
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(URL_API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Accept-Language": "vi",
    },
  });
};

const updateVariantStatusApi = (productId, variantId, isActive) => {
  const URL_API = `/api/product/products/${productId}/variants/${variantId}/status`;
  return axios.patch(URL_API, null, {
    params: {
      isActive,
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const bulkUpdateVariantStatusApi = (productId, variantIds, isActive) => {
  const URL_API = `/api/product/products/${productId}/variants/bulk-status`;
  return axios.patch(
    URL_API,
    {
      variantIds,
      isActive: isActive.toString(),
    },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

const bulkUpdateProductStatusApi = (productIds, isActive) => {
  const URL_API = `/api/product/products/bulk-status`;
  return axios.patch(
    URL_API,
    {
      productIds,
      isActive: isActive.toString(),
    },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

// Admin APIs
const getUsersAdminApi = (params) => {
  const URL_API = "/api/user/admin";
  return axios.get(URL_API, {
    params: {
      ...params,
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const getUserByIdAdminApi = (userId) => {
  const URL_API = `/api/user/admin/${userId}`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const getUserStatisticsApi = () => {
  const URL_API = "/api/user/admin/statistic/users";
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// ============================================
// Brand Management APIs (Admin)
// ============================================

const getBrandsAdminApi = (params) => {
  const URL_API = "/api/product/brands/public";
  return axios.get(URL_API, { params });
};

const createBrandApi = (brandData) => {
  const URL_API = "/api/product/brands";
  return axios.post(URL_API, brandData);
};

const updateBrandApi = (brandId, brandData) => {
  const URL_API = `/api/product/brands/${brandId}`;
  return axios.put(URL_API, brandData);
};

const deleteBrandApi = (brandId) => {
  const URL_API = `/api/product/brands/${brandId}`;
  return axios.delete(URL_API);
};

const uploadBrandLogoApi = (brandId, file) => {
  const URL_API = `/api/product/brands/${brandId}/thumbnail`;
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(URL_API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const toggleBrandStatusApi = (brandId) => {
  const URL_API = `/api/product/brands/${brandId}/toggle-status`;
  return axios.patch(URL_API);
};

// ============================================
// Store Management APIs (Admin)
// ============================================

const getStoresAdminApi = (params) => {
  const URL_API = "/api/product/stores";
  return axios.get(URL_API, {
    params: {
      ...params,
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const toggleStoreStatusApi = (storeId) => {
  const URL_API = `/api/product/stores/${storeId}/toggle-status`;
  return axios.patch(
    URL_API,
    {},
    {
      headers: {
        "Accept-Language": "vi",
      },
    }
  );
};

// ============================================
// Category Management APIs (Admin)
// ============================================

const getCategoriesAdminApi = (params) => {
  const URL_API = "/api/product/admin/categories";
  return axios.get(URL_API, {
    params: {
      ...params,
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const createCategoryAdminApi = (categoryData) => {
  const URL_API = "/api/product/admin/categories";
  return axios.post(URL_API, categoryData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const updateCategoryAdminApi = (categoryId, categoryData) => {
  const URL_API = `/api/product/admin/categories/${categoryId}`;
  return axios.put(URL_API, categoryData, {
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

const deleteCategoryAdminApi = (categoryId) => {
  const URL_API = `/api/product/admin/categories/${categoryId}`;
  return axios.delete(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const toggleCategoryStatusApi = (categoryId) => {
  const URL_API = `/api/product/admin/categories/${categoryId}/toggle-status`;
  return axios.put(URL_API, null, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// ============================================
// Seller Profile Management APIs (Admin)
// ============================================

const getSellerProfilesAdminApi = (params = {}) => {
  const URL_API = "/api/user/seller-profiles";
  return axios.get(URL_API, {
    params: {
      page: params.page || 0,
      size: params.size || 20,
      ...params,
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const approveSellerProfileApi = (profileId) => {
  const URL_API = `/api/user/seller-profiles/${profileId}/approve`;
  return axios.patch(URL_API, null, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const rejectSellerProfileApi = (profileId, rejectionReason) => {
  const URL_API = `/api/user/seller-profiles/${profileId}/reject`;
  return axios.patch(
    URL_API,
    { rejectionReason },
    {
      headers: {
        "Accept-Language": "vi",
        "Content-Type": "application/json",
      },
    }
  );
};

const getSellerDocumentAdminApi = (sellerProfileId) => {
  const URL_API = `/api/user/seller-profiles/admin/${sellerProfileId}/document`;
  return axios.get(URL_API, {
    headers: {
      "Accept-Language": "vi",
    },
  });
};

const uploadCategoryImageAdminApi = (categoryId, file) => {
  const URL_API = `/api/product/admin/categories/${categoryId}/thumbnail`;
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(URL_API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Accept-Language": "vi",
    },
  });
};

const removeCartItemsApi = (variantIds) => {
  const URL_API = "/api/order/api/v1/cart/items/bulk";
  const token = localStorage.getItem("access_token");

  const headers = {
    "Accept-Language": "vi",
    "Content-Type": "application/json",
  };

  // Chỉ gửi X-Session-Id nếu là guest (chưa đăng nhập)
  // Khi đã đăng nhập, axios interceptor sẽ tự động thêm Authorization header
  if (!token) {
    const sessionId =
      localStorage.getItem("cart_session_id") || generateSessionId();
    headers["X-Session-Id"] = sessionId;
  }

  return axios.delete(URL_API, {
    data: variantIds,
    headers,
  });
};

// Upload media file (image/video) for Rich Text Editor - returns public URL
const uploadMediaApi = (file) => {
  const URL_API = "/api/file/files/upload/public";
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(URL_API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Search Suggest API for autocomplete
const getSearchSuggestApi = (query, size = 5) => {
  const URL_API = "/api/product/products/search/suggest";
  return axios.get(URL_API, {
    params: {
      q: query,
      size: size,
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Search Products API with full-text search and filtering (POST)
const searchProductsApi = (searchRequest, page = 0, size = 20) => {
  const URL_API = "/api/product/products/search";
  return axios.post(URL_API, searchRequest, {
    params: {
      page,
      size,
    },
    headers: {
      "Accept-Language": "vi",
      "Content-Type": "application/json",
    },
  });
};

// Quick Search Products API (GET - SEO friendly)
const quickSearchProductsApi = (params = {}) => {
  const URL_API = "/api/product/products/search";
  return axios.get(URL_API, {
    params: {
      q: params.q || "",
      categoryId: params.categoryId || "",
      storeId: params.storeId || "",
      brandId: params.brandId || "",
      priceFrom: params.priceFrom || "",
      priceTo: params.priceTo || "",
      minRating: params.minRating || "",
      sortBy: params.sortBy || "relevance",
      sortDir: params.sortDir || "desc",
      page: params.page ?? 0,
      size: params.size ?? 20,
      aggregations: params.aggregations ?? false,
    },
    headers: {
      "Accept-Language": "vi",
    },
  });
};

// Elasticsearch Health Check API
const getSearchHealthApi = () => {
  const URL_API = "/api/product/products/search/health";
  return axios.get(URL_API, {
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
  createProductApi,
  getProductsApi,
  getPublicProductsApi,
  getPublicStoresApi,
  getPublicStoreDetailApi,
  getPublicStoreCategoriesApi,
  getPublicProductDetailApi,
  getPublicProductVariantOptionsApi,
  findVariantByAttributesApi,
  getPublicProductSpecsApi,
  getSelectionConfigApi,
  findVariantBySelectionApi,
  getAvailableOptionsApi,
  getPublicVariantMetadataApi,
  getProductSpecsApi,
  updateProductSpecsApi,
  getProductsByStoreApi,
  getProductDetailApi,
  updateProductApi,
  uploadProductImageApi,
  deleteProductImageApi,
  updateProductImageOrderApi,
  updateProductImagesOrderApi,
  setProductImagePrimaryApi,
  getCategoriesApi,
  getPlatformCategoriesApi,
  getPublicPlatformCategoriesApi,
  getPlatformCategoryDetailApi,
  getBrandsApi,
  // Payment APIs
  createZaloPayOrderApi,
  queryPaymentStatusApi,
  getAdminTransactionHistoryApi,
  // Order APIs
  createOrderApi,
  applyCouponToOrdersApi,
  initiateOrderPaymentApi,
  getMyOrdersApi,
  getStoreOrdersApi,
  getAdminOrdersApi,
  // Cart APIs
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  removeCartItemsApi,
  clearCartApi,
  mergeCartApi,
  getCartCountApi,
  validateCartApi,
  getDetailedCartValidationApi,
  // Product Attributes APIs
  createProductAttributeApi,
  getProductAttributesByCategoryApi,
  getProductAttributeByIdApi,
  updateProductAttributeApi,
  deleteProductAttributeApi,
  addCategoriesToAttributeApi,
  deleteCategoriesFromAttributeApi,
  addValueToAttributeApi,
  deleteValueFromAttributeApi,
  // Product Variants APIs
  getProductVariantsApi,
  createVariantApi,
  updateVariantApi,
  deleteVariantApi,
  addAttributeToVariantApi,
  removeAttributeFromVariantApi,
  updateVariantStatusApi,
  bulkUpdateVariantStatusApi,
  bulkUpdateProductStatusApi,
  // Selection Groups APIs
  getSelectionGroupsApi,
  createSelectionGroupApi,
  updateSelectionGroupApi,
  deleteSelectionGroupApi,
  getSelectionGroupDetailApi,
  // Link variants to options APIs
  linkVariantsToOptionApi,
  unlinkVariantsFromOptionApi,
  getLinkedVariantsApi,
  // Variant Metadata APIs
  getVariantMetadataApi,
  updateVariantMetadataApi,
  uploadVariantImageApi,
  // Admin APIs
  getUsersAdminApi,
  getUserByIdAdminApi,
  getUserStatisticsApi,
  // Brand Management APIs
  getBrandsAdminApi,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
  uploadBrandLogoApi,
  toggleBrandStatusApi,
  // Store Management APIs
  getStoresAdminApi,
  toggleStoreStatusApi,
  // Category Management APIs
  getCategoriesAdminApi,
  createCategoryAdminApi,
  updateCategoryAdminApi,
  deleteCategoryAdminApi,
  toggleCategoryStatusApi,
  uploadCategoryImageAdminApi,
  // Seller Profile Management APIs
  getSellerProfilesAdminApi,
  approveSellerProfileApi,
  rejectSellerProfileApi,
  getSellerDocumentAdminApi,
  // Media upload API for Rich Text Editor
  uploadMediaApi,
  // Search APIs
  getSearchSuggestApi,
  searchProductsApi,
  quickSearchProductsApi,
  getSearchHealthApi,
};
