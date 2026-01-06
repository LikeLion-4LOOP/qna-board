'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated, clearTokens } from '@/lib/auth';
import { authApi } from '@/api/auth';
import { userApi, UserResponse } from '@/api/user';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // 페이지 변경 시마다 인증 상태 확인
    const auth = isAuthenticated();
    setAuthenticated(auth);
    
    // 인증된 경우 사용자 정보 가져오기
    if (auth) {
      userApi.getUser()
        .then((userData) => {
          setUser(userData);
          // 프로필 이미지 로드
          if (userData) {
            loadProfileImage(userData.id);
          }
        })
        .catch(() => {
          setUser(null);
          setProfileImageUrl(null);
        });
    } else {
      setUser(null);
      setProfileImageUrl(null);
    }
  }, [pathname]);

  const loadProfileImage = async (userId: number, forceRefresh = false) => {
    try {
      const imageUrl = userApi.getProfileImageUrl(userId);
      // 캐시 무효화를 위해 타임스탬프 추가
      const urlWithTimestamp = forceRefresh 
        ? `${imageUrl}?t=${Date.now()}`
        : imageUrl;
      
      const response = await fetch(urlWithTimestamp, {
        cache: forceRefresh ? 'no-cache' : 'default'
      });
      if (response.ok) {
        // 타임스탬프를 포함한 URL로 설정하여 캐시 무효화
        setProfileImageUrl(forceRefresh ? urlWithTimestamp : imageUrl);
      } else {
        setProfileImageUrl(null);
      }
    } catch (err) {
      setProfileImageUrl(null);
    }
  };

  // 주기적으로 인증 상태 확인 (로그인/로그아웃 후 즉시 반영)
  useEffect(() => {
    const interval = setInterval(() => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      
      if (auth && !user) {
        userApi.getUser()
          .then((userData) => {
            setUser(userData);
            if (userData) {
              loadProfileImage(userData.id);
            }
          })
          .catch(() => {
            setUser(null);
            setProfileImageUrl(null);
          });
      } else if (!auth) {
        setUser(null);
        setProfileImageUrl(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  // 프로필 이미지 업데이트 이벤트 리스너
  useEffect(() => {
    const handleProfileImageUpdate = (event: CustomEvent) => {
      const userId = event.detail?.userId;
      if (userId && user?.id === userId) {
        // 캐시 무효화를 위해 forceRefresh=true로 호출
        loadProfileImage(userId, true);
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);
    };
  }, [user]);

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
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {authenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    관리자
                  </Link>
                )}
                <Link
                  href="/users/profile"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg overflow-hidden"
                  title="내 프로필"
                  style={{
                    background: profileImageUrl 
                      ? 'none' 
                      : 'linear-gradient(to bottom right, rgb(129, 140, 248), rgb(168, 85, 247))'
                  }}
                >
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={user?.username || '프로필'}
                      className="w-full h-full object-cover"
                      onError={() => setProfileImageUrl(null)}
                    />
                  ) : (
                    user?.username?.charAt(0)?.toUpperCase() || '?'
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  로그아웃
                </button>
              </>
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

