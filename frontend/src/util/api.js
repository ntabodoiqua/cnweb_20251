import axios from './axios.customize';

const createUserApi = (username, password, firstName, lastName, dob, email, phone) => {
    const URL_API = "/api/user/users";
    const data = {
        username,
        password,
        firstName,
        lastName,
        dob,
        email,
        phone
    }

    return axios.post(URL_API, data, {
        headers: {
            'Accept-Language': 'vi',
            'Content-Type': 'application/json'
        }
    })
}

const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    }

    return axios.post(URL_API, data)
}

const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API)
}

export {
    createUserApi, loginApi, getUserApi
}