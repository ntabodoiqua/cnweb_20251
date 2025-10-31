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

export { createUserApi, loginApi, getUserApi, verifyEmailApi, resendOtpApi };
