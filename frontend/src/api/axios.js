import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://hireflow-1-qr4c.onrender.com/api/",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// Shared promise to prevent concurrent token refresh requests
let refreshPromise = null;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error response is 401 Unauthorized and request has not been retried
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const url = originalRequest.url || "";
      
      // Do not attempt refresh for login, refresh, register, or verify-email endpoints
      if (
        url.includes("login") ||
        url.includes("token/refresh") ||
        url.includes("verify-email") ||
        url.includes("register")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          const baseURL = API.defaults.baseURL || "http://localhost:8000/api/";
          const refreshUrl = baseURL.endsWith("/")
            ? `${baseURL}token/refresh/`
            : `${baseURL}/token/refresh/`;

          // Use the clean global axios instance to avoid interceptor loop
          refreshPromise = axios.post(refreshUrl, { refresh: refreshToken });
        }

        const res = await refreshPromise;
        const newAccessToken = res.data.access;

        localStorage.setItem("token", newAccessToken);
        refreshPromise = null;

        // Update Authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request
        return API(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
