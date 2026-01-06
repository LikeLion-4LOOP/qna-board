"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  userApi,
  UserResponse,
  MyQuestionSummaryResponse,
  MyAnswerSummaryResponse,
  MyCommentSummaryResponse,
  PointHistoryResponse,
  PageResponse,
  ChangePasswordRequest,
} from "@/api/user";
import { isAuthenticated, clearTokens } from "@/lib/auth";
import { authApi } from "@/api/auth";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [myQuestions, setMyQuestions] = useState<MyQuestionSummaryResponse[]>(
    []
  );
  const [myAnswers, setMyAnswers] = useState<MyAnswerSummaryResponse[]>([]);
  const [myComments, setMyComments] = useState<MyCommentSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "questions" | "answers" | "comments"
  >("questions");
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [showPointHistory, setShowPointHistory] = useState(false);
  const [pointHistory, setPointHistory] = useState<PointHistoryResponse[]>([]);
  const [pointHistoryLoading, setPointHistoryLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPw: "",
    changePw: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    loadData();
  }, [router]);

  const loadProfileImage = async () => {
    if (!user) return;
    try {
      // 프로필 이미지 URL 설정 (이미지가 없으면 null)
      const imageUrl = userApi.getProfileImageUrl(user.id);
      // 이미지 존재 여부 확인을 위해 fetch 시도
      const response = await fetch(imageUrl);
      if (response.ok) {
        setProfileImageUrl(imageUrl);
      }
    } catch (err) {
      // 이미지가 없거나 로드 실패 시 무시
      console.log("프로필 이미지 없음");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, questionsData, answersData, commentsData] =
        await Promise.all([
          userApi.getUser(),
          userApi.getMyQuestions(),
          userApi.getMyAnswers(),
          userApi.getMyComments(),
        ]);
      setUser(userData);
      setNewUsername(userData.username);
      setMyQuestions(questionsData.content);
      setMyAnswers(answersData.content);
      setMyComments(commentsData.content);

      // 프로필 이미지 로드
      loadProfileImageForUser(userData.id);
    } catch (err) {
      setError("정보를 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileImageForUser = async (
    userId: number,
    forceRefresh = false
  ) => {
    try {
      // 캐시 무효화를 위해 타임스탬프 추가
      const imageUrl = userApi.getProfileImageUrl(userId);
      const urlWithTimestamp = forceRefresh
        ? `${imageUrl}?t=${Date.now()}`
        : imageUrl;

      const response = await fetch(urlWithTimestamp, {
        cache: forceRefresh ? "no-cache" : "default",
      });
      if (response.ok) {
        // 타임스탬프를 포함한 URL로 설정하여 캐시 무효화
        setProfileImageUrl(forceRefresh ? urlWithTimestamp : imageUrl);
      } else {
        setProfileImageUrl(null);
      }
    } catch (err) {
      setProfileImageUrl(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    try {
      setUploadingImage(true);
      await userApi.uploadProfileImage(file);

      // 이미지 업로드 후 즉시 반영 (캐시 무효화)
      if (user) {
        await loadProfileImageForUser(user.id, true);
        // Navbar 업데이트를 위한 이벤트 발생
        window.dispatchEvent(
          new CustomEvent("profileImageUpdated", {
            detail: { userId: user.id },
          })
        );
      }
      alert("프로필 이미지가 업로드되었습니다.");
    } catch (err: any) {
      console.error("프로필 이미지 업로드 실패:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "프로필 이미지 업로드에 실패했습니다.";
      alert(`프로필 이미지 업로드 실패: ${errorMessage}`);
    } finally {
      setUploadingImage(false);
      // 파일 입력 초기화
      e.target.value = "";
    }
  };

  const handleUpdateUsername = async () => {
    try {
      const updatedUser = await userApi.updateUsername(newUsername);
      setUser(updatedUser);
      setEditingUsername(false);
    } catch (err) {
      alert("사용자 이름 수정에 실패했습니다.");
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    
    if (!passwordData.currentPw || !passwordData.changePw) {
      setPasswordError("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setChangingPassword(true);
      await userApi.changePassword(passwordData);
      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      setPasswordData({ currentPw: "", changePw: "" });
      setShowChangePassword(false);
      // 비밀번호 변경 후 로그아웃 처리 (백엔드에서 refreshToken 무효화하므로)
      clearTokens();
      router.push("/auth/login");
    } catch (err: any) {
      console.error("비밀번호 변경 실패:", err);
      if (err.response) {
        const status = err.response.status;
        let errorMessage = err.response.data?.message || err.response.data?.error || "비밀번호 변경에 실패했습니다.";
        
        // validation 에러인 경우 (400 에러)
        if (status === 400) {
          // validation 에러 메시지가 있으면 그대로 사용
          if (err.response.data?.message && err.response.data.message.includes("비밀번호")) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = `입력 정보를 확인해주세요. ${errorMessage}`;
          }
        } else if (status === 404 && errorMessage.includes("비밀번호가 일치하지 않습니다")) {
          errorMessage = "현재 비밀번호가 일치하지 않습니다.";
        }
        setPasswordError(errorMessage);
      } else {
        setPasswordError("비밀번호 변경에 실패했습니다.");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR");
  };

  const loadPointHistory = async () => {
    try {
      setPointHistoryLoading(true);
      const data = await userApi.getMyPointHistory(0, 50);
      setPointHistory(data.content);
    } catch (err) {
      console.error("포인트 내역 로딩 실패:", err);
      alert("포인트 내역을 불러오는데 실패했습니다.");
    } finally {
      setPointHistoryLoading(false);
    }
  };

  const handleShowPointHistory = () => {
    setShowPointHistory(true);
    if (pointHistory.length === 0) {
      loadPointHistory();
    }
  };

  const getPointTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      LOGIN_DAILY: "일일 로그인",
      POST_QUESTION: "질문 작성",
      POST_ANSWER: "답변 작성",
      POST_COMMENT: "댓글 작성",
      VOTE_REWARD: "추천 보상",
      VOTE_CANCEL: "추천 취소",
      SELECTED_ANSWER: "답변 채택",
    };
    return typeMap[type] || type;
  };

  const handleDeleteUser = async () => {
    if (
      !confirm(
        "정말 회원 탈퇴를 하시겠습니까?\n탈퇴한 계정은 복구할 수 없습니다."
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      await userApi.deleteUser();

      // 로그아웃 처리
      clearTokens();
      try {
        await authApi.logout();
      } catch (logoutErr) {
        // 로그아웃 실패는 무시 (이미 탈퇴되었으므로)
        console.error("로그아웃 실패:", logoutErr);
      }

      alert("회원 탈퇴가 완료되었습니다.");
      router.push("/auth/login");
    } catch (err: any) {
      console.error("회원 탈퇴 실패:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "회원 탈퇴에 실패했습니다.";
      alert(`회원 탈퇴에 실패했습니다: ${errorMessage}`);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          {error || "사용자 정보를 불러올 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">내 프로필</h1>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8 animate-fade-in">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={user.username}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm cursor-pointer hover:bg-indigo-700 shadow-lg transition-colors"
              title="프로필 이미지 변경"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {user.username}
            </h2>
            <p className="text-slate-500">@{user.userId}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            사용자 이름
          </label>
          {editingUsername ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
              <button
                onClick={handleUpdateUsername}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setEditingUsername(false);
                  setNewUsername(user.username);
                }}
                className="px-5 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-lg text-slate-900 font-medium">
                {user.username}
              </span>
              <button
                onClick={() => setEditingUsername(true)}
                className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
              >
                수정
              </button>
            </div>
          )}
        </div>

        {/* 비밀번호 변경 섹션 */}
        <div className="mb-6 pt-6 border-t border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            비밀번호 변경
          </label>
          {showChangePassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordData.currentPw}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPw: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordData.changePw}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, changePw: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                  placeholder="새 비밀번호를 입력하세요"
                />
                <p className="mt-1 text-xs text-slate-500">
                  비밀번호는 8자 이상이며 문자와 숫자를 포함해야 합니다.
                </p>
              </div>
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {passwordError}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? "변경 중..." : "변경"}
                </button>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ currentPw: "", changePw: "" });
                    setPasswordError(null);
                  }}
                  disabled={changingPassword}
                  className="px-5 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
            >
              비밀번호 변경
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-600">
                포인트
              </label>
              <button
                onClick={handleShowPointHistory}
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
              >
                내역 보기
              </button>
            </div>
            <div className="text-2xl font-bold text-indigo-600">
              {user.point}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              레벨
            </label>
            <div className="text-2xl font-bold text-purple-600">
              {user.level}
            </div>
          </div>
        </div>

        {/* 회원 탈퇴 버튼 */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            회원 탈퇴
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab("questions")}
              className={`py-4 px-6 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "questions"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              내 질문 ({myQuestions.length})
            </button>
            <button
              onClick={() => setActiveTab("answers")}
              className={`py-4 px-6 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "answers"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              내 답변 ({myAnswers.length})
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-4 px-6 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "comments"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              내 댓글 ({myComments.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "questions" && (
            <div className="space-y-4">
              {myQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-lg">작성한 질문이 없습니다.</p>
                </div>
              ) : (
                myQuestions.map((question) => (
                  <Link
                    key={question.id}
                    href={`/questions/${question.id}`}
                    className="block p-5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-all"
                  >
                    <h3 className="font-semibold text-slate-900 mb-2 hover:text-indigo-600 transition-colors">
                      {question.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {formatDate(question.createdAt)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === "answers" && (
            <div className="space-y-4">
              {myAnswers.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p className="text-lg">작성한 답변이 없습니다.</p>
                </div>
              ) : (
                myAnswers.map((answer) => (
                  <Link
                    key={answer.id}
                    href={`/questions/${answer.questionId}`}
                    className="block p-5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-all"
                  >
                    <p className="text-slate-700 mb-2 line-clamp-2">
                      {answer.content}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(answer.createdAt)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              {myComments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg">작성한 댓글이 없습니다.</p>
                </div>
              ) : (
                myComments.map((comment) => (
                  <Link
                    key={comment.commentId}
                    href={`/questions/${comment.postId}`}
                    className="block p-5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-all"
                  >
                    <p className="text-slate-700 mb-2">{comment.content}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 포인트 내역 모달 */}
      {showPointHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-fade-in">
            <div className="p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  포인트 내역
                </h2>
                <button
                  onClick={() => setShowPointHistory(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {pointHistoryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : pointHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-lg">포인트 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pointHistory.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-slate-900">
                            {getPointTypeLabel(history.type)}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              history.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {history.amount >= 0 ? "+" : ""}
                            {history.amount}P
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(history.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-700">
                        Total: {history.balanceAfter}P
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  회원 탈퇴 확인
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">
                정말 회원 탈퇴를 하시겠습니까?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-700 font-semibold mb-2">
                  탈퇴 시 주의사항:
                </p>
                <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                  <li>모든 게시글, 답변, 댓글이 삭제됩니다</li>
                  <li>보유한 포인트가 모두 소멸됩니다</li>
                  <li>탈퇴한 계정은 복구할 수 없습니다</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      처리 중...
                    </>
                  ) : (
                    "탈퇴하기"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
