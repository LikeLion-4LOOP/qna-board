import apiClient from '@/lib/api';
import { getDeviceId, setTokens } from '@/lib/auth';

export interface LoginRequest {
  userId: string;
  password: string;
  deviceId: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  userId: string;
  password: string;
  username: string;
}

export interface SignupResponse {
  id: number;
  userId: string;
  username: string;
}

export const authApi = {
  login: async (userId: string, password: string): Promise<TokenResponse> => {
    const deviceId = getDeviceId();
    const response = await apiClient.post<TokenResponse>('/auth/login', {
      userId,
      password,
      deviceId,
    });
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post<SignupResponse>('/users/signup', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  },
};



