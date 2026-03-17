import axios from "axios";

export const BASE_URL = "http://localhost:8000";

const instance = axios.create({
  baseURL: BASE_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;