'use client';

import { useState } from 'react';
import { answerApi, AnswerResponse } from '@/api/answer';
import ReportModal from './ReportModal';
import CommentModal from './CommentModal';

interface AnswerItemProps {
  answer: AnswerResponse;
  onUpdate: () => void;
  authenticated: boolean;
  questionUserId: number | null;
  currentUserId: number | null;
  hasSelectedAnswer: boolean;
}

export default function AnswerItem({ answer, onUpdate, authenticated, questionUserId, currentUserId, hasSelectedAnswer }: AnswerItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await answerApi.updateAnswer(answer.id, { content: editContent });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      alert('답변 수정에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await answerApi.deleteAnswer(answer.id);
      onUpdate();
    } catch (err) {
      alert('답변 삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleSelect = async () => {
    try {
      await answerApi.selectAnswer(answer.id);
      onUpdate();
    } catch (err) {
      alert('답변 채택에 실패했습니다.');
      console.error(err);
    }
  };

  const handleVote = async () => {
    if (voteLoading) return; // 중복 클릭 방지
    
    setVoteLoading(true);
    try {
      if (isVoted) {
        // 추천 취소
        try {
          await answerApi.unvoteAnswer(answer.id);
          setIsVoted(false);
          onUpdate();
        } catch (unvoteErr: any) {
          // 404 에러는 이미 취소된 상태이므로 상태만 업데이트
          if (unvoteErr.response?.status === 404 || unvoteErr.response?.data?.code === 'VOTE_NOT_FOUND') {
            setIsVoted(false);
            onUpdate();
          } else {
            throw unvoteErr;
          }
        }
      } else {
        // 추천
        try {
          await answerApi.voteAnswer(answer.id);
          setIsVoted(true);
          onUpdate();
        } catch (voteErr: any) {
          // 409 에러는 이미 추천한 상태이므로 취소 시도
          if (voteErr.response?.status === 409 || voteErr.response?.data?.code === 'ALREADY_VOTED') {
            try {
              await answerApi.unvoteAnswer(answer.id);
              setIsVoted(false);
              onUpdate();
            } catch (unvoteErr2) {
              alert('추천 취소에 실패했습니다.');
              console.error(unvoteErr2);
            }
          } else {
            throw voteErr;
          }
        }
      }
    } catch (err: any) {
      alert('추천에 실패했습니다.');
      console.error(err);
    } finally {
      setVoteLoading(false);
    }
  };

  const handleReport = (reason: string) => {
    // TODO: 백엔드 API 호출
    alert(`답변 신고가 접수되었습니다: ${reason}`);
  };

  const canEdit = authenticated && currentUserId !== null && answer.userId !== undefined && currentUserId === answer.userId;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border p-6 transition-all duration-300 animate-fade-in ${
      answer.isSelect 
        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-green-200/50' 
        : 'border-slate-200 hover:shadow-xl hover:border-indigo-300'
    }`}>
      {answer.isSelect && (
        <div className="mb-4 flex items-center gap-2 text-green-700 font-bold bg-green-100 px-4 py-2 rounded-xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          채택된 답변
        </div>
      )}

      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white mb-4"
          />
          <div className="flex space-x-3">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-md"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(answer.content);
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 text-slate-700 whitespace-pre-wrap leading-relaxed text-base">{answer.content}</div>
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="font-semibold">{answer.vote}</span>
            </div>
            <span className="text-sm text-slate-500">{formatDate(answer.createdAt)}</span>
            {authenticated && (
              <>
                <button
                  onClick={handleVote}
                  disabled={voteLoading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50 ${
                    isVoted
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill={isVoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {voteLoading ? '처리 중...' : (isVoted ? '추천 취소' : '추천')}
                </button>
                {!answer.isSelect && !hasSelectedAnswer && authenticated && currentUserId !== null && questionUserId !== null && currentUserId === questionUserId && (
                  <button
                    onClick={handleSelect}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    채택
                  </button>
                )}
                {canEdit && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                    >
                      삭제
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReport={handleReport}
        type="answer"
      />

      {/* 답변 댓글 버튼 */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <button
          onClick={() => setShowCommentModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          댓글 보기
        </button>
      </div>

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        postId={answer.id}
        isQuestion={false}
        title="답변 댓글"
      />
    </div>
  );
}

