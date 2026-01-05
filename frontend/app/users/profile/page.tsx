"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  userApi,
  UserResponse,
  MyQuestionSummaryResponse,
  MyAnswerSummaryResponse,
  MyCommentSummaryResponse,
} from "@/api/user";
import { isAuthenticated } from "@/lib/auth";
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

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    loadData();
  }, [router]);

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
    } catch (err) {
      setError("정보를 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR");
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
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user.username.charAt(0).toUpperCase()}
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

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              포인트
            </label>
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
    </div>
  );
}
