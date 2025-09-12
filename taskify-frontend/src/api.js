import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // backend base URL
  withCredentials: true,
});

// Request interceptor: attach access token (supports both "accessToken" and legacy "token")
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401, try refresh once then retry original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If config is missing (non-axios error) or this request already retried, bail
    if (!originalRequest) return Promise.reject(error);
    if (originalRequest._retry) return Promise.reject(error);

    // Do not try to refresh for auth endpoints themselves
    const authPaths = ["/users/login", "/users/register", "/users/refresh"];
    if (authPaths.some(p => originalRequest.url && originalRequest.url.includes(p))) {
      return Promise.reject(error);
    }

    // Only attempt refresh on 401 Unauthorized
    if (error.response?.status === 401) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        // Use axios (not api) to avoid recursion on this call
        const res = await axios.post("http://localhost:8080/users/refresh", { refreshToken });

        // The backend may return { accessToken, refreshToken } or { token, refreshToken } — handle both
        const newAccess = res.data?.accessToken || res.data?.token;
        const newRefresh = res.data?.refreshToken || refreshToken;

        if (!newAccess) throw new Error("Refresh endpoint did not return a new access token");

        // Save both common keys to be tolerant
        localStorage.setItem("accessToken", newAccess);
        localStorage.setItem("token", newAccess);
        if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

        // Update the header for the original request and retry using api
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (refreshError) {
        // final fallback — clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        // Optional: do not force navigate on library environment; front-end should handle redirect
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;