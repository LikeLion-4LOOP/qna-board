'use client';

import { useState } from 'react';
import { answerApi, AnswerResponse } from '@/api/answer';
import AnswerItem from './AnswerItem';

interface AnswerListProps {
  questionId: number;
  answers: AnswerResponse[];
  onUpdate: () => void;
  authenticated: boolean;
  questionUserId: number | null;
  currentUserId: number | null;
}

// 채택된 답변이 있는지 확인하는 함수
const hasSelectedAnswer = (answers: AnswerResponse[]): boolean => {
  return answers.some(answer => answer.isSelect);
};

export default function AnswerList({ questionId, answers, onUpdate, authenticated, questionUserId, currentUserId }: AnswerListProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await answerApi.createAnswer(questionId, { content });
      setContent('');
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || '답변 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const [showAnswerForm, setShowAnswerForm] = useState(false);

  return (
    <div>
      {authenticated && (
        <div className="mb-6">
          {!showAnswerForm ? (
            <button
              onClick={() => setShowAnswerForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              답변 작성하기
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                답변 작성
              </h3>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={(e) => {
                handleSubmit(e);
                setShowAnswerForm(false);
              }}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white mb-4"
                  placeholder="답변을 입력하세요..."
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        작성 중...
                      </span>
                    ) : (
                      '답변 작성'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAnswerForm(false);
                      setContent('');
                    }}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {answers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-slate-500 text-lg">등록된 답변이 없습니다.</p>
          </div>
        ) : (
          answers.map((answer) => (
            <AnswerItem
              key={answer.id}
              answer={answer}
              onUpdate={onUpdate}
              authenticated={authenticated}
              questionUserId={questionUserId}
              currentUserId={currentUserId}
              hasSelectedAnswer={hasSelectedAnswer(answers)}
            />
          ))
        )}
      </div>
    </div>
  );
}

