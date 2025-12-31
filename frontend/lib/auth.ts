// 인증 관련 유틸리티 함수

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('deviceId');
};

export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'web';
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};



