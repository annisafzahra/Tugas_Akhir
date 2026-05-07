import axios from "axios";
import { loginType } from "@/type/loginType";
import { registerType } from "@/type/registerType";
import { getToken } from "./token";

export const BASEURL = process.env.NEXT_PUBLIC_API_URL + "/api/";

export const api = axios.create({
  baseURL: BASEURL,
  // withCredentials: true,
  timeout: 60000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AUTH
export const login = (data: loginType) => api.post("login/", data);
export const register = (data: registerType) => api.post("user/create/", data);
export const getUser = () => api.get("user/get/");

export const getListNetworkTraffic = () => api.get("networkTraffic/list/");
export const uploadFileCSV = (data: FormData) => api.post("uploadCSV/", data);