"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { questionApi, Question } from "@/api/question";
import { CATEGORIES, CategoryId, getCategoryById } from "@/lib/categories";
import CategoryModal from "@/components/CategoryModal";

type SortOption = "latest" | "popular" | "answers";

function QuestionsPageContent() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams?.get("sort") as SortOption) || "latest"
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(
    null
  );
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [searchQuery, sortBy, selectedCategory]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput);
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      // 카테고리를 백엔드 enum으로 변환
      const categoryEnum = selectedCategory
        ? questionApi.mapCategoryIdToEnum(selectedCategory)
        : undefined;

      // 백엔드에서 검색, 정렬, 카테고리 필터 처리
      const data = await questionApi.getQuestions(
        searchQuery || undefined,
        sortBy,
        categoryEnum
      );
      setQuestions(data);
      setFilteredQuestions(data);
    } catch (err) {
      setError("질문 목록을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const allTags = Array.from(
    new Set(questions.map((q) => q.tag).filter((tag): tag is string => !!tag))
  );

  // 카테고리별 질문 수 계산
  const getCategoryCount = (categoryId: CategoryId) => {
    const categoryName = getCategoryById(categoryId).name;
    return questions.filter((q) => {
      if (q.category) {
        return q.category.displayName === categoryName;
      }
      // 하위 호환성: tag가 있는 경우
      return q.tag && q.tag.includes(categoryName);
    }).length;
  };

  // 모든 카테고리의 질문 수 맵 생성
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = getCategoryCount(cat.id);
    return acc;
  }, {} as Record<string, number>);

  const handleCategorySelect = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    setSelectedTag(null);
    setSearchQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">질문 목록</h1>
        <p className="text-slate-600">다양한 질문들을 탐색해보세요</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색바 */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="제목, 내용, 태그로 검색..."
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                검색
              </button>
            </div>
          </form>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              카테고리로 찾기
            </button>

          {/* 정렬 선택 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white font-medium"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="answers">답변 많은 순</option>
            </select>
          </div>
        </div>

        {/* 선택된 카테고리 표시 */}
        {selectedCategory && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  선택된 카테고리:
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${
                    getCategoryById(selectedCategory).color
                  } text-white rounded-xl text-sm font-semibold`}
                >
                  <span>{getCategoryById(selectedCategory).icon}</span>
                  {getCategoryById(selectedCategory).name}
                </span>
                <span className="text-sm text-slate-500">
                  ({filteredQuestions.length}개 질문)
                </span>
              </div>
              <button
                onClick={() => {
                setSelectedCategory(null);
                setSelectedTag(null);
                setSearchInput("");
                setSearchQuery("");
              }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              필터 초기화
            </button>
            </div>
          </div>
        )}

        {/* 태그 필터 (카테고리 선택 시 숨김) */}
        {!selectedCategory && allTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              태그별 보기
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedTag === null
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                전체
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">오류 발생</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="text-sm text-red-600 space-y-1">
            <p>
              백엔드 서버가 실행 중인지 확인해주세요 (http://3.35.209.3:8080)
            </p>
            <p>데이터베이스 연결이 정상인지 확인해주세요</p>
            <p>
              브라우저 개발자 도구의 네트워크 탭에서 상세 에러를 확인해주세요
            </p>
          </div>
        </div>
      )}

      {!loading && !error && filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <svg
            className="w-16 h-16 mx-auto text-slate-400 mb-4"
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
          <p className="text-slate-500 text-lg">
            {searchQuery || selectedTag
              ? "검색 결과가 없습니다."
              : "등록된 질문이 없습니다."}
          </p>
          <p className="text-slate-400 text-sm mt-2">
            {searchQuery || selectedTag
              ? "다른 검색어나 필터를 시도해보세요."
              : "첫 번째 질문을 작성해보세요!"}
          </p>
        </div>
      ) : !loading && !error ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {filteredQuestions.map((question, index) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}`}
              className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors mb-2">
                    {question.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-2">
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
                            <span
                              key={categoryMatch.id}
                              className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${categoryMatch.color} text-white rounded-lg text-xs font-semibold`}
                            >
                              <span>{categoryMatch.icon}</span>
                              {categoryMatch.name}
                            </span>
                          );
                        }
                        return (
                          <span
                            key="category"
                            className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold"
                          >
                            {question.category.displayName}
                          </span>
                        );
                      })()}
                  </div>
                </div>
              </div>
              <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                {question.content.replace(/!\[.*?\]\(.*?\)/g, '').trim()}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {question.username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">
                      {question.user?.username || question.username || "사용자"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
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
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      답변 {question.answerCount}
                    </span>
                    <span className="flex items-center gap-1">
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      조회 {question.viewCount}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(question.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {/* 카테고리 모달 */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelectCategory={handleCategorySelect}
        selectedCategory={selectedCategory}
        questionCounts={categoryCounts}
      />
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      }
    >
      <QuestionsPageContent />
    </Suspense>
  );
}
