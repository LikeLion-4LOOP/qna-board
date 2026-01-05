"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/api/auth";
import { userApi } from "@/api/user";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 로그인 전 오늘 날짜 확인 (localStorage에 저장된 날짜와 비교)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식
      const lastLoginDate = localStorage.getItem("lastLoginRewardDate");

      await authApi.login(formData.userId, formData.password);

      // 일일 로그인 포인트 지급 여부 확인
      // 백엔드에서 로그인 시 자동으로 rewardForLogin을 호출하므로,
      // 포인트 내역에서 오늘 LOGIN_DAILY가 방금 생성된 것인지 확인
      try {
        // 약간의 지연 후 포인트 내역 조회 (백엔드 처리 시간 고려)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const pointHistory = await userApi.getMyPointHistory(0, 10);
        const now = new Date();

        // 오늘 날짜의 LOGIN_DAILY 타입 내역 중 방금 생성된 것 찾기 (1분 이내)
        const latestLoginReward = pointHistory.content.find(
          (history) => history.type === "LOGIN_DAILY"
        );

        if (latestLoginReward) {
          const historyDate = new Date(latestLoginReward.createdAt);
          historyDate.setHours(0, 0, 0, 0);
          const historyDateStr = historyDate.toISOString().split("T")[0];

          // 오늘 날짜이고, 1분 이내에 생성된 것만
          const historyTime = new Date(latestLoginReward.createdAt).getTime();
          const timeDiff = now.getTime() - historyTime;
          const oneMinute = 1 * 60 * 1000;

          // 오늘 날짜이고, 1분 이내에 생성되었고, localStorage에 저장된 날짜와 다른 경우에만 알림
          // (즉, 오늘 처음 받은 경우)
          if (
            historyDateStr === todayStr &&
            timeDiff < oneMinute &&
            lastLoginDate !== todayStr
          ) {
            // 포인트 지급 알림 표시
            const dateStr = today.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            alert(`${dateStr} 출석 포인트 지급 완료`);

            // 오늘 날짜를 localStorage에 저장
            localStorage.setItem("lastLoginRewardDate", todayStr);
          }
        }
      } catch (pointErr) {
        // 포인트 내역 조회 실패는 무시 (로그인은 성공했으므로)
        console.error("포인트 내역 조회 실패:", pointErr);
      }

      // 로그인 성공 후 강제 새로고침하여 Navbar 업데이트
      window.location.href = "/";
    } catch (err: any) {
      console.error("로그인 에러:", err);
      // 더 자세한 에러 메시지 표시
      if (err.response) {
        // 서버에서 응답이 온 경우
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          "로그인에 실패했습니다.";
        const status = err.response.status;
        if (status === 401) {
          setError(
            `아이디 또는 비밀번호가 올바르지 않습니다. (${errorMessage})`
          );
        } else if (status === 404) {
          setError(
            `사용자를 찾을 수 없습니다. 회원가입을 먼저 진행해주세요. (${errorMessage})`
          );
        } else {
          setError(`서버 오류가 발생했습니다. (${status}: ${errorMessage})`);
        }
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setError(
          "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요."
        );
      } else {
        // 요청 설정 중 오류가 발생한 경우
        setError(
          `요청 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">로그인</h1>
            <p className="text-slate-600">계정에 로그인하세요</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                사용자 ID
              </label>
              <input
                id="userId"
                type="text"
                required
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                placeholder="사용자 ID를 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  로그인 중...
                </span>
              ) : (
                "로그인"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">계정이 없으신가요? </span>
            <Link
              href="/auth/signup"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
