"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { questionApi } from "@/api/question";
import { userApi } from "@/api/user";
import { isAuthenticated } from "@/lib/auth";
import { CATEGORIES, CategoryId, getCategoryById } from "@/lib/categories";

export default function NewQuestionPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "" as CategoryId | "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/auth/login");
        return;
      }
      setAuthenticated(true);
      try {
        const user = await userApi.getUser();
        setUsername(user.username);
      } catch (err) {
        console.error("사용자 정보 로딩 실패:", err);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.category) {
        setError("카테고리를 선택해주세요.");
        setLoading(false);
        return;
      }

      const createdQuestion = await questionApi.createQuestion({
        title: formData.title,
        content: formData.content,
        category: questionApi.mapCategoryIdToEnum(formData.category),
      });
      // 생성된 질문의 ID를 사용하여 상세 페이지로 이동
      if (createdQuestion && createdQuestion.id) {
        router.push(`/questions/${createdQuestion.id}`);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "질문 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">질문 작성</h1>
        <p className="text-slate-600">궁금한 점을 질문해보세요</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 animate-fade-in"
      >
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            제목
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
            placeholder="질문 제목을 입력하세요"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            카테고리 <span className="text-red-500">*</span>
          </label>
          {formData.category ? (
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${
                  getCategoryById(formData.category).color
                } text-white rounded-xl text-sm font-semibold`}
              >
                <span>{getCategoryById(formData.category).icon}</span>
                {getCategoryById(formData.category).name}
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: "" })}
                className="px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                변경
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCategorySelect(true)}
              className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                카테고리 선택하기
              </div>
            </button>
          )}

          {/* 카테고리 선택 모달 */}
          {showCategorySelect && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col animate-fade-in">
                <div className="p-6 border-b border-slate-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">
                      카테고리 선택
                    </h2>
                    <button
                      onClick={() => setShowCategorySelect(false)}
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
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setFormData({ ...formData, category: category.id });
                          setShowCategorySelect(false);
                        }}
                        className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${
                          formData.category === category.id
                            ? `border-indigo-500 bg-gradient-to-br ${category.color} text-white shadow-lg`
                            : "border-slate-200 bg-white hover:border-indigo-300 text-slate-700"
                        }`}
                      >
                        <div className="text-4xl mb-3">{category.icon}</div>
                        <div
                          className={`text-base font-semibold ${
                            formData.category === category.id
                              ? "text-white"
                              : "text-slate-700"
                          }`}
                        >
                          {category.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            내용
          </label>
          <textarea
            id="content"
            required
            rows={15}
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white resize-none"
            placeholder="질문 내용을 입력하세요"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                작성 중...
              </span>
            ) : (
              "작성하기"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
