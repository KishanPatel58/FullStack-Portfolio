import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Session check — expected when logged out
    const isSessionCheck =
      url.includes("/getadmin") ||
      url.includes("/auth/me");

    if (status === 401 && isSessionCheck) {
      // Silent reject — no toast, no extra logging
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;