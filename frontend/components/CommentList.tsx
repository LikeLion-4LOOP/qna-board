'use client';

import { useState, useEffect } from 'react';
import { commentApi, CommentResponse } from '@/api/comment';
import { isAuthenticated } from '@/lib/auth';
import { userApi } from '@/api/user';
import CommentItem from './CommentItem';

interface CommentListProps {
  postId: number;
  isQuestion: boolean;
}

export default function CommentList({ postId, isQuestion }: CommentListProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setAuth(authStatus);
    if (authStatus) {
      userApi.getUser()
        .then((user) => setCurrentUserId(user.id))
        .catch(() => setCurrentUserId(null));
    } else {
      setCurrentUserId(null);
    }
    loadComments();
  }, [postId, isQuestion]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        댓글 ({comments.length})
      </h3>

      {auth && (
        <form onSubmit={handleSubmit} className="mb-6">
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
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '작성'
              )}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            댓글이 없습니다.
          </div>
        ) : (
          comments.map((comment) => (
              <CommentItem
                  key={comment.commentId}
                  comment={comment}
                  onUpdate={loadComments}
                  authenticated={auth}
                  currentUserId={currentUserId}
              />
          ))
        )}
      </div>
    </div>
  );
}

