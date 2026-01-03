'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { questionApi, Question } from '@/api/question';
import { CATEGORIES } from '@/lib/categories';

// 예시 데이터
const exampleQuestions: Question[] = [
  {
    id: 1,
    title: 'React에서 상태 관리는 어떻게 하나요?',
    content: 'React에서 상태 관리를 하는 방법에 대해 궁금합니다. useState와 useReducer의 차이점도 알고 싶어요.',
    username: '개발자1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tag: '개발/IT',
    viewCount: 150,
    answerCount: 8,
  },
  {
    id: 2,
    title: 'Next.js와 React의 차이점은 무엇인가요?',
    content: 'Next.js와 React의 주요 차이점과 각각의 장단점에 대해 알고 싶습니다.',
    username: '학습자',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    tag: '교육/학습',
    viewCount: 120,
    answerCount: 5,
  },
  {
    id: 3,
    title: 'TypeScript를 사용하는 이유는?',
    content: 'JavaScript 대신 TypeScript를 사용하는 이유와 장점에 대해 궁금합니다.',
    username: '프론트엔드',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    tag: '개발/IT',
    viewCount: 200,
    answerCount: 12,
  },
  {
    id: 4,
    title: '운동을 시작하려고 하는데 추천해주세요',
    content: '처음 운동을 시작하는 사람에게 추천하는 운동 방법이 있을까요?',
    username: '건강관심',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    tag: '건강/의료',
    viewCount: 80,
    answerCount: 3,
  },
  {
    id: 5,
    title: '맛있는 파스타 레시피 알려주세요',
    content: '집에서 만들 수 있는 간단하고 맛있는 파스타 레시피를 찾고 있습니다.',
    username: '요리사',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    tag: '요리/음식',
    viewCount: 60,
    answerCount: 4,
  },
];

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useExampleData, setUseExampleData] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await questionApi.getQuestions();
      // 배열인지 확인하고, 배열이 아니면 빈 배열로 처리
      setQuestions(Array.isArray(data) ? data : []);
      setUseExampleData(false);
    } catch (err) {
      console.error('질문 목록 로드 실패:', err);
      // 에러가 발생해도 예시 데이터로 UI 구조는 보여주기
      setQuestions(exampleQuestions);
      setUseExampleData(true);
      setError('실제 데이터를 불러오는데 실패했습니다. 예시 데이터를 표시합니다.');
    } finally {
      setLoading(false);
    }
  };

  // questions가 배열인지 확인
  const questionsArray = Array.isArray(questions) ? questions : [];

  // 인기 질문 (조회수 + 답변 수 기준)
  const popularQuestions = [...questionsArray]
    .sort((a, b) => {
      const aScore = (a.viewCount || 0) + (a.answerCount || 0) * 2;
      const bScore = (b.viewCount || 0) + (b.answerCount || 0) * 2;
      return bScore - aScore;
    })
    .slice(0, 3);

  // 최신 질문
  const latestQuestions = [...questionsArray]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // 통계 계산
  const stats = {
    totalQuestions: questionsArray.length,
    totalAnswers: questionsArray.reduce((sum, q) => sum + (q.answerCount || 0), 0),
    totalViews: questionsArray.reduce((sum, q) => sum + (q.viewCount || 0), 0),
    todayQuestions: questionsArray.filter((q) => {
      const today = new Date();
      const questionDate = new Date(q.createdAt);
      return (
        today.getFullYear() === questionDate.getFullYear() &&
        today.getMonth() === questionDate.getMonth() &&
        today.getDate() === questionDate.getDate()
      );
    }).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 에러 알림 (예시 데이터 사용 시) */}
      {error && useExampleData && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 로딩 중에도 UI 구조는 보여주기 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">인기 질문</h2>
              </div>
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">최신 질문</h2>
              </div>
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-slate-900 mb-6">통계</h2>
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 인기 질문 + 최신 질문 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 인기 질문 섹션 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900">인기 질문</h2>
                <Link
                  href="/questions?sort=popular"
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  더보기 →
                </Link>
              </div>
              {popularQuestions.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <p className="text-sm">인기 질문이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {popularQuestions.map((question, index) => {
                    let categoryMatch = null;
                    if (question.category) {
                      // 백엔드 enum code를 프론트엔드 category ID로 변환
                      const enumToCategoryId: Record<string, string> = {
                        'DEV_IT': 'dev',
                        'EDUCATION': 'education',
                        'HEALTH': 'health',
                        'COOKING': 'cooking',
                        'TRAVEL': 'travel',
                        'SHOPPING': 'shopping',
                        'LIFE': 'lifestyle',
                        'HOBBY': 'hobby',
                        'SPORTS': 'sports',
                        'PET': 'pet',
                        'CAR': 'car',
                        'FINANCE': 'finance',
                        'REAL_ESTATE': 'realestate',
                        'LAW': 'law',
                        'JOB': 'career',
                        'ETC': 'etc',
                      };
                      const categoryId = enumToCategoryId[question.category.code] || 'etc';
                      categoryMatch = CATEGORIES.find((cat) => cat.id === categoryId);
                    } else if (question.tag) {
                      // 하위 호환성
                      categoryMatch = CATEGORIES.find((cat) => question.tag?.includes(cat.name));
                    }
                    return (
                      <Link
                        key={question.id}
                        href={`/questions/${question.id}`}
                        className="block p-3 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1 flex-1">
                            {question.title}
                          </h3>
                          <span className="ml-2 text-xs text-slate-400 font-medium">#{index + 1}</span>
                        </div>
                        {categoryMatch && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium mb-1.5">
                            <span>{categoryMatch.icon}</span>
                            {categoryMatch.name}
                          </span>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            답변 {question.answerCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            조회 {question.viewCount || 0}
                          </span>
                          <span className="text-xs">{new Date(question.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 최신 질문 섹션 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900">최신 질문</h2>
                <Link
                  href="/questions?sort=latest"
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  더보기 →
                </Link>
              </div>
              {latestQuestions.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <p className="text-sm">최신 질문이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {latestQuestions.map((question) => {
                    let categoryMatch = null;
                    if (question.category) {
                      // 백엔드 enum code를 프론트엔드 category ID로 변환
                      const enumToCategoryId: Record<string, string> = {
                        'DEV_IT': 'dev',
                        'EDUCATION': 'education',
                        'HEALTH': 'health',
                        'COOKING': 'cooking',
                        'TRAVEL': 'travel',
                        'SHOPPING': 'shopping',
                        'LIFE': 'lifestyle',
                        'HOBBY': 'hobby',
                        'SPORTS': 'sports',
                        'PET': 'pet',
                        'CAR': 'car',
                        'FINANCE': 'finance',
                        'REAL_ESTATE': 'realestate',
                        'LAW': 'law',
                        'JOB': 'career',
                        'ETC': 'etc',
                      };
                      const categoryId = enumToCategoryId[question.category.code] || 'etc';
                      categoryMatch = CATEGORIES.find((cat) => cat.id === categoryId);
                    } else if (question.tag) {
                      // 하위 호환성
                      categoryMatch = CATEGORIES.find((cat) => question.tag?.includes(cat.name));
                    }
                    return (
                      <Link
                        key={question.id}
                        href={`/questions/${question.id}`}
                        className="block p-3 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1 flex-1">
                            {question.title}
                          </h3>
                          <span className="ml-2 text-xs text-slate-500 font-medium">NEW</span>
                        </div>
                        {categoryMatch && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium mb-1.5">
                            <span>{categoryMatch.icon}</span>
                            {categoryMatch.name}
                          </span>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {question.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            {question.user?.username || question.username || '사용자'}
                          </span>
                          <span className="text-xs">{new Date(question.createdAt).toLocaleString('ko-KR')}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 통계 대시보드 */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg p-4 sticky top-20">
              <h2 className="text-lg font-bold text-slate-900 mb-4">통계</h2>
              <div className="space-y-3">
                <div className="pb-3 border-b border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">전체 질문수</div>
                  <div className="text-xl font-bold text-slate-900">{stats.totalQuestions}</div>
                </div>
                <div className="pb-3 border-b border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">전체 답변수</div>
                  <div className="text-xl font-bold text-slate-900">{stats.totalAnswers}</div>
                </div>
                <div className="pb-3 border-b border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">전체 조회수</div>
                  <div className="text-xl font-bold text-slate-900">{stats.totalViews}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">오늘의 질문</div>
                  <div className="text-xl font-bold text-slate-900">{stats.todayQuestions}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
