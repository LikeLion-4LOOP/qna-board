import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 재발급
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 EXPIRED_TOKEN (AUTH_401_2)인 경우에만 재발급 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.code;

      // EXPIRED_TOKEN 에러인 경우에만 재발급 시도
      if (errorCode === "AUTH_401_2") {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            const deviceId = localStorage.getItem("deviceId") || "web";
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
              deviceId,
            });

            const { accessToken, refreshToken: newRefreshToken } =
              response.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // 리프레시 토큰도 만료되었거나 유효하지 않은 경우 로그아웃
          originalRequest._retry = false; // 재시도 플래그 초기화
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("deviceId");
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          return Promise.reject(refreshError);
        }
      } else {
        // EXPIRED_TOKEN이 아닌 다른 401 에러인 경우 로그아웃
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("deviceId");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
