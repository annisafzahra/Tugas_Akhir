import axios from "axios";
import { loginType } from "@/type/loginType";
import { registerType } from "@/type/registerType";
import { getToken } from "./token";

export const BASEURL = "http://127.0.0.1:8000/api/";
// export const BASEURL = process.env.NEXT_PUBLIC_API_URL + "/api/";

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

    const publicEndpoints = ["login/", "user/create/"];
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (token && !isPublicEndpoint) {
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

// TES
export const submitTes = (data: any) => api.post("tes/submit/", data);
export const getHasilTes = () => api.get("tes/get/");
export const getAdminSiswaList = () => api.get("admin/siswa/");
export const getAdminSiswaDetail = (userId: number) => api.get(`admin/siswa/${userId}/`);

// USER
export const getListSiswa = () => api.get(`admin/siswa/`);
export const deleteSiswa = (userId: number) => api.delete(`admin/delete-user/${userId}/`);
