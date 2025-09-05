import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // backend base URL
  withCredentials: true,
});

// ✅ Request Interceptor - token automatically har request me bhejna
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor - token expire hone par refresh karna
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❌ Agar login ya register request me error aaya → refresh token mat lagao
    if (
      originalRequest.url.includes("/users/login") ||
      originalRequest.url.includes("/users/register")
    ) {
      return Promise.reject(error);
    }

    // ✅ Agar 401 (Unauthorized) mila aur retry flag set nahi hai → refresh token try karo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        // 🔄 Refresh token API call
        const res = await axios.post("http://localhost:8080/users/refresh", {
          refreshToken,
        });

        const newToken = res.data.token;
        localStorage.setItem("token", newToken);

        // ✅ Update header with new token
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // Retry original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // logout karke login page pe bhejna
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
