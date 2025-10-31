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

const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  const data = {
    email,
    password,
  };

  return axios.post(URL_API, data);
};

const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API);
};

export { createUserApi, loginApi, getUserApi };
