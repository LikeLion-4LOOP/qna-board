'use client';

import { useState } from 'react';
import { commentApi, CommentResponse } from '@/api/comment';
import { reportApi, ReportTargetType } from '@/api/report';
import ReportModal from './ReportModal';

interface CommentItemProps {
  comment: CommentResponse;
  onUpdate: () => void;
  authenticated: boolean;
  currentUserId: number | null;
}

export default function CommentItem({ comment, onUpdate, authenticated, currentUserId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await commentApi.updateComment(comment.commentId, { content: editContent });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      alert('댓글 수정에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await commentApi.deleteComment(comment.commentId);
      onUpdate();
    } catch (err) {
      alert('댓글 삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const canEdit = authenticated && currentUserId !== null && currentUserId === comment.user.id;

  const handleReport = async (reason: string) => {
    try {
      const result = await reportApi.report({
        targetType: "COMMENT" as ReportTargetType,
        targetId: comment.commentId,
        reason,
      });
      if (result.hidden) {
        alert("신고가 접수되었습니다. 신고 누적으로 인해 해당 댓글이 숨김 처리되었습니다.");
        onUpdate();
      } else {
        alert(`신고가 접수되었습니다. (누적 신고: ${result.totalReports}건)`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "신고 처리에 실패했습니다.";
      alert(errorMessage);
      console.error(err);
    }
  };

  return (
    <div className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {comment.user?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="font-semibold text-slate-900">{comment.user?.username || '사용자'}</span>
            </div>
            <div className="text-slate-700 mb-2 ml-10">{comment.content}</div>
            <div className="text-xs text-slate-400 ml-10">
              {formatDate(comment.createdAt)}
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  삭제
                </button>
              </>
            )}
            {/* 댓글 신고 버튼 */}
            {authenticated && !canEdit && (
              <button
                onClick={() => setShowReportModal(true)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                신고
              </button>
            )}
          </div>
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReport={handleReport}
        type="comment"
      />
    </div>
  );
}

