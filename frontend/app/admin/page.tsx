"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reportApi, ReportTargetType } from "@/api/report";
import { userApi, UserResponse } from "@/api/user";
import { isAuthenticated } from "@/lib/auth";
import {
  HiddenQuestion,
  HiddenAnswer,
  HiddenComment,
} from "@/api/report";

type TabType = "QUESTION" | "ANSWER" | "COMMENT";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("QUESTION");
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [questions, setQuestions] = useState<HiddenQuestion[]>([]);
  const [answers, setAnswers] = useState<HiddenAnswer[]>([]);
  const [comments, setComments] = useState<HiddenComment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/auth/login");
        return;
      }

      try {
        const userData = await userApi.getUser();
        setUser(userData);

        if (userData.role !== "ADMIN") {
          alert("관리자만 접근할 수 있습니다.");
          router.push("/");
          return;
        }
      } catch (err) {
        console.error("사용자 정보 로딩 실패:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadData();
    }
  }, [activeTab, page, user]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      switch (activeTab) {
        case "QUESTION": {
          const data = await reportApi.getHiddenQuestions(page, size);
          setQuestions(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          break;
        }
        case "ANSWER": {
          const data = await reportApi.getHiddenAnswers(page, size);
          setAnswers(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          break;
        }
        case "COMMENT": {
          const data = await reportApi.getHiddenComments(page, size);
          setComments(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          break;
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "데이터를 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRestore = async (targetType: ReportTargetType, targetId: number) => {
    if (!confirm("정말 숨김을 해제하시겠습니까?")) return;

    try {
      await reportApi.restore(targetType, targetId);
      alert("숨김 해제되었습니다.");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "숨김 해제에 실패했습니다.");
      console.error(err);
    }
  };

  const handleDelete = async (targetType: ReportTargetType, targetId: number) => {
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      await reportApi.delete(targetType, targetId);
      alert("삭제되었습니다.");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
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

  if (user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">관리자 페이지</h1>
        <p className="text-slate-600">숨김 처리된 글을 관리할 수 있습니다.</p>
      </div>

      {/* 탭 */}
      <div className="mb-6 border-b border-slate-200">
        <div className="flex gap-4">
          {(["QUESTION", "ANSWER", "COMMENT"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(0);
              }}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "QUESTION" && "질문"}
              {tab === "ANSWER" && "답변"}
              {tab === "COMMENT" && "댓글"}
              {activeTab === tab && ` (${totalElements})`}
            </button>
          ))}
        </div>
      </div>

      {/* 데이터 표시 */}
      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {activeTab === "QUESTION" && (
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  숨김 처리된 질문이 없습니다.
                </div>
              ) : (
                questions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {question.title}
                        </h3>
                        <p className="text-slate-600 mb-2 line-clamp-3">
                          {question.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>작성자: {question.user.username}</span>
                          <span>작성일: {formatDate(question.createdAt)}</span>
                          <span>조회수: {question.viewCount}</span>
                          <span>답변수: {question.answerCount}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleRestore("QUESTION", question.id)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors"
                        >
                          숨김 해제
                        </button>
                        <button
                          onClick={() => handleDelete("QUESTION", question.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "ANSWER" && (
            <div className="space-y-4">
              {answers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  숨김 처리된 답변이 없습니다.
                </div>
              ) : (
                answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <p className="text-slate-700 mb-2 line-clamp-3">
                          {answer.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>작성자: {answer.user.username}</span>
                          <span>작성일: {formatDate(answer.createdAt)}</span>
                          <span>추천수: {answer.vote}</span>
                          <span>질문 ID: {answer.questionId}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleRestore("ANSWER", answer.id)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors"
                        >
                          숨김 해제
                        </button>
                        <button
                          onClick={() => handleDelete("ANSWER", answer.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "COMMENT" && (
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  숨김 처리된 댓글이 없습니다.
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <p className="text-slate-700 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>작성자: {comment.user.username}</span>
                          <span>작성일: {formatDate(comment.createdAt)}</span>
                          <span>
                            {comment.isQuestion ? "질문" : "답변"} ID: {comment.postId}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleRestore("COMMENT", comment.id)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors"
                        >
                          숨김 해제
                        </button>
                        <button
                          onClick={() => handleDelete("COMMENT", comment.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                이전
              </button>
              <span className="px-4 py-2 text-slate-700">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

