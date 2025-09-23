import axios from "axios";
import {store} from "../index";
import { logout } from "./operations/authAPI";

export const axiosInstance = axios.create({});

// Attach interceptor once
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Dispatch logout if token expired/invalid
      store.dispatch(
        logout(() => {
          window.location.href = "/"; // fallback if you don’t have navigate here
        })
      );
    }
    return Promise.reject(err);
  }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method,
    url,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : {},
    params: params ? params : {},
  });
};



// import axios from "axios"

// export const axiosInstance = axios.create({})

// export const apiConnector = (method, url, bodyData, headers, params) =>{
//     return axiosInstance({
//         method : `${method}`,
//         url : `${url}`,
//         data:bodyData ? bodyData : null,
//         headers: headers ? headers : null,
//         params: params ? params : null,
//     });
// };


