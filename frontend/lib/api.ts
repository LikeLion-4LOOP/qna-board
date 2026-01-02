import axios from "axios";
import { getDeviceId } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 재발급 요청을 단일화하기 위한 Promise 저장소
let refreshTokenPromise: Promise<{
  accessToken: string;
  refreshToken: string;
}> | null = null;

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

    // refresh 요청 자체는 인터셉터를 거치지 않도록 처리
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // 401 에러인 경우 토큰 재발급 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message;

      // 디버깅을 위한 로그
      console.log("401 에러 발생:", {
        errorCode,
        errorMessage,
        url: originalRequest.url,
        errorData: error.response?.data,
      });

      // EXPIRED_TOKEN (AUTH_401_2)인 경우 재발급 시도
      if (errorCode === "AUTH_401_2") {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            // refreshToken이 없으면 로그아웃
            console.log("refreshToken이 없습니다. 로그아웃 처리");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("deviceId");
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }
            return Promise.reject(error);
          }

          // 재발급이 이미 진행 중이면 기존 Promise 재사용 (동시 요청 방지)
          if (!refreshTokenPromise) {
            const deviceId = getDeviceId();
            console.log("토큰 재발급 시도...", { deviceId });

            // refresh 요청은 인터셉터를 거치지 않도록 axios 직접 사용
            refreshTokenPromise = axios
              .post(
                `${API_BASE_URL}/auth/refresh`,
                {
                  refreshToken,
                  deviceId,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              )
              .then((response) => {
                const { accessToken, refreshToken: newRefreshToken } =
                  response.data;
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", newRefreshToken);
                console.log("토큰 재발급 성공");
                return { accessToken, refreshToken: newRefreshToken };
              })
              .catch((refreshError: any) => {
                // 재발급 실패 시 Promise 초기화
                refreshTokenPromise = null;
                throw refreshError;
              })
              .finally(() => {
                // 성공/실패 관계없이 Promise 초기화 (다음 재발급을 위해)
                // 단, catch에서 이미 null로 설정했으므로 여기서는 안전하게 처리
                setTimeout(() => {
                  refreshTokenPromise = null;
                }, 100);
              });
          } else {
            console.log("재발급이 이미 진행 중입니다. 대기...");
          }

          // 재발급 결과 대기 (기존 Promise 재사용 또는 새로 생성된 Promise)
          if (!refreshTokenPromise) {
            throw new Error("재발급 Promise가 생성되지 않았습니다.");
          }
          const { accessToken, refreshToken: newRefreshToken } =
            await refreshTokenPromise;

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          try {
            return await apiClient(originalRequest);
          } catch (retryError: any) {
            // 재발급 후에도 원래 요청이 실패하면 로그아웃
            if (retryError.response?.status === 401) {
              console.log("재발급 후에도 요청 실패. 로그아웃 처리");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("deviceId");
              if (typeof window !== "undefined") {
                window.location.href = "/auth/login";
              }
            }
            return Promise.reject(retryError);
          }
        } catch (refreshError: any) {
          // 리프레시 토큰도 만료되었거나 유효하지 않은 경우 로그아웃
          const refreshErrorCode = refreshError.response?.data?.code;
          console.log("토큰 재발급 실패:", {
            errorCode: refreshErrorCode,
            errorMessage: refreshError.response?.data?.message,
            errorData: refreshError.response?.data,
            deviceId: getDeviceId(),
          });

          // NOT_MATCH_DEVICE 에러인 경우 특별 처리
          if (refreshErrorCode === "AUTH_401_4") {
            console.error(
              "DeviceId 불일치! 로그인 시 사용한 deviceId와 재발급 시 deviceId가 다릅니다."
            );
          }

          // Promise 초기화
          refreshTokenPromise = null;
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
        // (예: INVALID_TOKEN, NOT_MATCH_DEVICE 등)
        console.log("EXPIRED_TOKEN이 아닌 401 에러. 로그아웃 처리:", errorCode);
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
