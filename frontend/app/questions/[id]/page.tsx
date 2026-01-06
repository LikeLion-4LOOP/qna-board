"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { questionApi, Question } from "@/api/question";
import { answerApi, AnswerResponse } from "@/api/answer";
import { commentApi } from "@/api/comment";
import { userApi } from "@/api/user";
import { reportApi, ReportTargetType } from "@/api/report";
import { isAuthenticated } from "@/lib/auth";
import AnswerList from "@/components/AnswerList";
import CommentModal from "@/components/CommentModal";
import ReportModal from "@/components/ReportModal";
import BlockUserModal from "@/components/BlockUserModal";
import { CATEGORIES } from "@/lib/categories";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = Number(params?.id);

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [images, setImages] = useState<
    { id: number; url: string; originalName: string }[]
  >([]);

  const loadQuestion = async () => {
    try {
      const data = await questionApi.getQuestion(questionId);
      setQuestion(data);
    } catch (err) {
      setError("질문을 불러오는데 실패했습니다.");
      console.error(err);
    }
  };

  const loadAnswers = async () => {
    try {
      const data = await answerApi.getAnswers(questionId);
      // 채택된 답변을 맨 위로 정렬
      const sortedAnswers = [...data.content].sort((a, b) => {
        const aSelected =
          a.isSelect ?? (a as { select?: boolean }).select ?? false;
        const bSelected =
          b.isSelect ?? (b as { select?: boolean }).select ?? false;
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });
      setAnswers(sortedAnswers);
      setLoading(false);
    } catch (err) {
      console.error("답변 로딩 실패:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      if (auth) {
        try {
          const user = await userApi.getUser();
          setCurrentUserId(user.id);
        } catch (err) {
          console.error("사용자 정보 로딩 실패:", err);
          setCurrentUserId(null);
        }
      } else {
        setCurrentUserId(null);
      }
    };
    checkAuth();
    loadQuestion();
  }, [questionId]);

  // URL 변경 감지 (수정 후 돌아올 때)
  useEffect(() => {
    const handleFocus = () => {
      loadQuestion();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [questionId]);

  useEffect(() => {
    if (question) {
      loadAnswers();
      loadCommentCount();
      loadImages();
    }
  }, [question]);

  const loadImages = async () => {
    try {
      const imageList = await questionApi.getQuestionImages(questionId);
      const imageUrls = imageList.map((img) => ({
        id: img.id,
        url: questionApi.getImageUrl(img.id),
        originalName: img.originalName,
      }));
      setImages(imageUrls);
    } catch (err) {
      console.error("이미지 로딩 실패:", err);
    }
  };

  const loadCommentCount = async () => {
    try {
      const data = await commentApi.getComments(questionId, true);
      setCommentCount(data.totalElements || data.content.length);
    } catch (err) {
      console.error("댓글 갯수 로딩 실패:", err);
      setCommentCount(0);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await questionApi.deleteQuestion(questionId);
      router.push("/");
    } catch (err) {
      alert("삭제에 실패했습니다.");
      console.error(err);
    }
  };

  const handleReport = async (reason: string) => {
    try {
      const result = await reportApi.report({
        targetType: "QUESTION" as ReportTargetType,
        targetId: questionId,
        reason,
      });
      if (result.hidden) {
        alert("신고가 접수되었습니다. 신고 누적으로 인해 해당 글이 숨김 처리되었습니다.");
        router.push("/");
      } else {
        alert(`신고가 접수되었습니다. (누적 신고: ${result.totalReports}건)`);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "신고 처리에 실패했습니다.";
      alert(errorMessage);
      console.error(err);
    }
  };

  const handleBlockUser = () => {
    // TODO: 백엔드 API 호출
    if (question) {
      alert(`${question.username} 사용자를 차단했습니다.`);
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

  if (error || !question) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          {error || "질문을 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          목록으로
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8 animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-slate-900 flex-1 pr-4">
            {question.title}
          </h1>
          <div className="flex items-center gap-4">
            {/* 사용자 프로필 및 정보 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                {question.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  {question.user?.username || question.username || "사용자"}
                </div>
                <div className="text-xs text-slate-500">
                  {formatDate(question.createdAt)}
                  {question.modifiedAt &&
                    question.modifiedAt !== question.createdAt && (
                      <span className="ml-2">
                        (수정: {formatDate(question.modifiedAt)})
                      </span>
                    )}
                </div>
              </div>
            </div>
            {/* 질문 신고 버튼 */}
            {authenticated &&
              currentUserId !== null &&
              question.user &&
              currentUserId !== question.user.id && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  신고
                </button>
              )}
            {authenticated &&
              currentUserId !== null &&
              question.user &&
              currentUserId === question.user.id && (
                <div className="flex space-x-2">
                  <Link
                    href={`/questions/${questionId}/edit`}
                    className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-medium transition-colors"
                  >
                    삭제
                  </button>
                </div>
              )}
          </div>
        </div>

        {question.category &&
          (() => {
            // 백엔드 enum code를 프론트엔드 category ID로 변환
            const enumToCategoryId: Record<string, string> = {
              DEV_IT: "dev",
              EDUCATION: "education",
              HEALTH: "health",
              COOKING: "cooking",
              TRAVEL: "travel",
              SHOPPING: "shopping",
              LIFE: "lifestyle",
              HOBBY: "hobby",
              SPORTS: "sports",
              PET: "pet",
              CAR: "car",
              FINANCE: "finance",
              REAL_ESTATE: "realestate",
              LAW: "law",
              JOB: "career",
              ETC: "etc",
            };
            const categoryId =
              enumToCategoryId[question.category.code] || "etc";
            const categoryMatch = CATEGORIES.find(
              (cat) => cat.id === categoryId
            );

            if (categoryMatch) {
              return (
                <div className="mb-4 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${categoryMatch.color} text-white rounded-xl text-sm font-semibold shadow-md`}
                  >
                    <span className="text-lg">{categoryMatch.icon}</span>
                    {categoryMatch.name}
                  </span>
                </div>
              );
            }
            return (
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold">
                  {question.category.displayName}
                </span>
              </div>
            );
          })()}

        <div className="mb-6 text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">
          {question.content.split("\n").map((line, index) => {
            // 마크다운 이미지 형식 파싱: ![alt](url)
            const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
            if (imageMatch) {
              const [, alt, url] = imageMatch;
              const imageId = url.match(/\/images\/(\d+)/)?.[1];
              const image = imageId
                ? images.find((img) => img.id === Number(imageId))
                : null;

              if (image) {
                return (
                  <div key={index} className="my-4">
                    <img
                      src={image.url}
                      alt={alt || image.originalName}
                      className="w-full max-w-2xl mx-auto rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(image.url, "_blank")}
                    />
                  </div>
                );
              }
            }
            return <div key={index}>{line || "\u00A0"}</div>;
          })}
        </div>
          {images.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                      <img
                          key={image.id}
                          src={`http://localhost:8080/api/questions/images/${image.id}`}
                          alt={image.originalName}
                          className="rounded-xl border border-slate-200 cursor-pointer"
                          onClick={() =>
                              window.open(
                                  `http://localhost:8080/api/questions/images/${image.id}`,
                                  "_blank"
                              )
                          }
                      />
                  ))}
              </div>
          )}
        {images.length > 0 && (
  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
    {images.map((image) => (
      <img
        key={image.id}
        src={`http://localhost:8080/api/questions/images/${image.id}`}
        alt={image.originalName}
        className="rounded-xl border border-slate-200 cursor-pointer"
        onClick={() =>
          window.open(
            `http://localhost:8080/api/questions/images/${image.id}`,
            "_blank"
          )
        }
      />
    ))}
  </div>
)}
        {/* 이미지가 content에 포함되지 않은 경우 하단에 표시 */}
        {images.length > 0 &&
          !question.content.match(/!\[.*?\]\(.*?\/images\/\d+.*?\)/) && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative border border-slate-200 rounded-xl overflow-hidden group"
                  >
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(image.url, "_blank")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <button
            onClick={() => setShowCommentModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            댓글 보기 ({commentCount})
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
          답변
        </h2>
        <AnswerList
          questionId={questionId}
          answers={answers}
          onUpdate={() => {
            loadAnswers();
          }}
          authenticated={authenticated}
          questionUserId={question.user?.id || null}
          currentUserId={currentUserId}
        />
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReport={handleReport}
        type="question"
      />

      {question && (
        <BlockUserModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          onBlock={handleBlockUser}
          username={question.username}
        />
      )}

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        postId={questionId}
        isQuestion={true}
        title="질문 댓글"
      />
    </div>
  );
}
