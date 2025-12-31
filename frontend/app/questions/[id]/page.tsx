'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { questionApi, Question } from '@/api/question';
import { answerApi, AnswerResponse } from '@/api/answer';
import { commentApi, CommentResponse } from '@/api/comment';
import { isAuthenticated } from '@/lib/auth';
import AnswerList from '@/components/AnswerList';
import CommentList from '@/components/CommentList';
import ReportModal from '@/components/ReportModal';
import BlockUserModal from '@/components/BlockUserModal';
import { CATEGORIES } from '@/lib/categories';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = Number(params?.id);

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    loadQuestion();
  }, [questionId]);

  useEffect(() => {
    if (question) {
      loadAnswers();
    }
  }, [question]);

  const loadQuestion = async () => {
    try {
      const data = await questionApi.getQuestion(questionId);
      setQuestion(data);
    } catch (err) {
      setError('질문을 불러오는데 실패했습니다.');
      console.error(err);
    }
  };

  const loadAnswers = async () => {
    try {
      const data = await answerApi.getAnswers(questionId);
      setAnswers(data.content);
    } catch (err) {
      console.error('답변 로딩 실패:', err);
    }
    if (question) {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await questionApi.deleteQuestion(questionId);
      router.push('/');
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleLike = () => {
    if (disliked) setDisliked(false);
    setLiked(!liked);
    // TODO: 백엔드 API 호출
  };

  const handleDislike = () => {
    if (liked) setLiked(false);
    setDisliked(!disliked);
    // TODO: 백엔드 API 호출
  };

  const handleReport = (reason: string) => {
    // TODO: 백엔드 API 호출
    alert(`신고가 접수되었습니다: ${reason}`);
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
          {error || '질문을 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8 animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-slate-900 flex-1 pr-4">{question.title}</h1>
          {authenticated && (
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

        {question.tag && (() => {
          const categoryMatch = CATEGORIES.find(cat => question.tag?.includes(cat.name));
          if (categoryMatch) {
            return (
              <div className="mb-4 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${categoryMatch.color} text-white rounded-xl text-sm font-semibold shadow-md`}
                >
                  <span className="text-lg">{categoryMatch.icon}</span>
                  {categoryMatch.name}
                </span>
                {question.tag.split(',').length > 1 && (
                  <span className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">
                    {question.tag.split(',').slice(1).join(',').trim()}
                  </span>
                )}
              </div>
            );
          }
          return (
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold">
                {question.tag}
              </span>
            </div>
          );
        })()}

        <div className="mb-6 text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">{question.content}</div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
              {question.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{question.username}</div>
              <div className="text-sm text-slate-500">{formatDate(question.createdAt)}</div>
            </div>
            {authenticated && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  사용자 신고
                </button>
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  사용자 차단
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {authenticated && (
              <>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    liked
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  좋아요
                </button>
                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    disliked
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  싫어요
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  신고
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <CommentList postId={questionId} isQuestion={true} />

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
    </div>
  );
}

