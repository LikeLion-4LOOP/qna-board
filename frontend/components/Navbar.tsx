'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated, clearTokens } from '@/lib/auth';
import { authApi } from '@/api/auth';

export default function Navbar() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setAuthenticated(false);
      router.push('/');
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all">
              Q&A Board
            </Link>
            <div className="ml-10 flex items-center space-x-1">
              <Link
                href="/questions"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                질문 목록
              </Link>
              <Link
                href="/questions/new"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                질문 작성
              </Link>
              {authenticated && (
                <Link
                  href="/users/profile"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  내 프로필
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {authenticated ? (
              <button
                onClick={handleLogout}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

