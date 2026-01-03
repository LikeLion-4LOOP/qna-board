'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { questionApi, Question } from '@/api/question';
import { CATEGORIES } from '@/lib/categories';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      loadSearchResults();
    }
  }, [query]);

  const loadSearchResults = async () => {
    try {
      setLoading(true);
      // 백엔드에서 검색 처리
      const data = await questionApi.getQuestions(query, 'latest');
      setQuestions(data);
    } catch (err) {
      setError('검색 결과를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          검색 결과: &quot;{query}&quot;
        </h1>
        <p className="text-slate-600">{questions.length}개의 질문을 찾았습니다</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-slate-500 text-lg">검색 결과가 없습니다.</p>
          <p className="text-slate-400 text-sm mt-2">다른 검색어를 시도해보세요.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {questions.map((question) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}`}
              className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors mb-2">
                    {question.title}
                  </h2>
                  {question.category && (() => {
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
                    const categoryMatch = CATEGORIES.find(cat => cat.id === categoryId);
                    
                    if (categoryMatch) {
                      return (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${categoryMatch.color} text-white rounded-lg text-xs font-semibold`}>
                          <span>{categoryMatch.icon}</span>
                          {categoryMatch.name}
                        </span>
                      );
                    }
                    return (
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                        {question.category.displayName}
                      </span>
                    );
                  })()}
                  {!question.category && question.tag && (
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                      {question.tag}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">{question.content}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {question.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm text-slate-600 font-medium">{question.user?.username || question.username || '사용자'}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(question.createdAt).toLocaleString('ko-KR')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

