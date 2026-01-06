'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/auth';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.signup(formData);
      router.push('/auth/login');
    } catch (err: any) {
      console.error('회원가입 에러:', err);
      // 더 자세한 에러 메시지 표시
      if (err.response) {
        // 서버에서 응답이 온 경우
        const status = err.response.status;
        let errorMessage = err.response.data?.message || err.response.data?.error || '회원가입에 실패했습니다.';
        
        // validation 에러인 경우 (400 에러)
        if (status === 400) {
          // validation 에러 메시지가 있으면 그대로 사용
          if (err.response.data?.message && err.response.data.message.includes('비밀번호')) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = `입력 정보를 확인해주세요. ${errorMessage}`;
          }
          setError(errorMessage);
        } else if (status === 409) {
          setError(`이미 사용 중인 사용자 ID입니다. (${errorMessage})`);
        } else {
          setError(`서버 오류가 발생했습니다. (${status}: ${errorMessage})`);
        }
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else {
        // 요청 설정 중 오류가 발생한 경우
        setError(`요청 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">회원가입</h1>
            <p className="text-slate-600">새로운 계정을 만들어보세요</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="userId" className="block text-sm font-semibold text-slate-700 mb-2">
                사용자 ID
              </label>
              <input
                id="userId"
                type="text"
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                placeholder="사용자 ID를 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                사용자 이름
              </label>
              <input
                id="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                placeholder="사용자 이름을 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  가입 중...
                </span>
              ) : (
                '회원가입'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">이미 계정이 있으신가요? </span>
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

