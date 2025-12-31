'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { questionApi, Question } from '@/api/question';
import { isAuthenticated } from '@/lib/auth';
import { CATEGORIES, CategoryId, getCategoryById } from '@/lib/categories';

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = Number(params?.id);

  const [question, setQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tag: '',
    category: '' as CategoryId | '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    loadQuestion();
  }, [questionId, router]);

  const loadQuestion = async () => {
    try {
      const data = await questionApi.getQuestion(questionId);
      setQuestion(data);
      // 태그에서 카테고리 추출
      let category: CategoryId | '' = '';
      let tag = data.tag || '';
      if (data.tag) {
        const categoryMatch = CATEGORIES.find(cat => data.tag?.includes(cat.name));
        if (categoryMatch) {
          category = categoryMatch.id;
          // 카테고리 이름 제거하고 나머지 태그만 추출
          const parts = data.tag.split(',');
          tag = parts.length > 1 ? parts.slice(1).join(',').trim() : '';
        }
      }

      setFormData({
        title: data.title,
        content: data.content,
        tag,
        category,
      });
    } catch (err) {
      setError('질문을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // 카테고리와 태그를 합쳐서 tag 필드로 전송
      const tagValue = formData.category 
        ? `${CATEGORIES.find(c => c.id === formData.category)?.name}${formData.tag ? `, ${formData.tag}` : ''}`
        : formData.tag;
      
      await questionApi.updateQuestion(questionId, {
        title: formData.title,
        content: formData.content,
        tag: tagValue || undefined,
      });
      router.push(`/questions/${questionId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '질문 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">질문 수정</h1>
        <p className="text-slate-600">질문 내용을 수정하세요</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 animate-fade-in">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
            제목
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
            카테고리
          </label>
          {formData.category ? (
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getCategoryById(formData.category).color} text-white rounded-xl text-sm font-semibold`}>
                <span>{getCategoryById(formData.category).icon}</span>
                {getCategoryById(formData.category).name}
              </span>
              <button
                type="button"
                onClick={() => setShowCategorySelect(true)}
                className="px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
                    <h2 className="text-2xl font-bold text-slate-900">카테고리 선택</h2>
                    <button
                      onClick={() => setShowCategorySelect(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                            : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                        }`}
                      >
                        <div className="text-4xl mb-3">{category.icon}</div>
                        <div className={`text-base font-semibold ${formData.category === category.id ? 'text-white' : 'text-slate-700'}`}>
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
          <label htmlFor="tag" className="block text-sm font-semibold text-slate-700 mb-2">
            추가 태그 (선택사항)
          </label>
          <input
            id="tag"
            type="text"
            value={formData.tag}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
            placeholder="예: JPA, Hibernate, Redux 등 세부 태그"
          />
          <p className="mt-2 text-xs text-slate-500">카테고리 외에 추가로 태그를 입력할 수 있습니다</p>
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-2">
            내용
          </label>
          <textarea
            id="content"
            required
            rows={15}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white resize-none"
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
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                수정 중...
              </span>
            ) : (
              '수정하기'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

