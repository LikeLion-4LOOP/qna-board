'use client';

import { useState, useEffect } from 'react';
import { commentApi, CommentResponse } from '@/api/comment';
import { isAuthenticated } from '@/lib/auth';
import CommentItem from './CommentItem';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  isQuestion: boolean;
  title?: string;
}

export default function CommentModal({ isOpen, onClose, postId, isQuestion, title }: CommentModalProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuth(isAuthenticated());
      loadComments();
    }
  }, [isOpen, postId, isQuestion]);

  const loadComments = async () => {
    try {
      const data = await commentApi.getComments(postId, isQuestion);
      setComments(data.content);
    } catch (err) {
      console.error('댓글 로딩 실패:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      alert('로그인이 필요합니다.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await commentApi.createComment(postId, isQuestion, { content });
      setContent('');
      loadComments();
    } catch (err: any) {
      setError(err.response?.data?.message || '댓글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col border-2 border-indigo-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {title || '댓글'}
            <span className="text-lg font-normal text-slate-500 ml-2">({comments.length})</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 댓글 작성 폼 */}
        {auth && (
          <div className="p-6 border-b border-slate-200">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                  placeholder="댓글을 입력하세요..."
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    '작성'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">댓글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.commentId}
                  comment={comment}
                  onUpdate={loadComments}
                  authenticated={auth}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

