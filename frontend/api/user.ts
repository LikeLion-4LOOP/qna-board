import apiClient from '@/lib/api';

export interface UserResponse {
  id: number;
  userId: string;
  username: string;
  point: number;
  level: string;
}

export interface UpdateUsernameRequest {
  username: string;
}

export interface MyQuestionSummaryResponse {
  id: number;
  title: string;
  createdAt: string;
}

export interface MyAnswerSummaryResponse {
  id: number;
  content: string;
  questionId: number;
  createdAt: string;
}

export interface MyCommentSummaryResponse {
  commentId: number;
  content: string;
  postId: number;
  isQuestion: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const userApi = {
  getUser: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/users');
    return response.data;
  },

  updateUsername: async (username: string): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>('/users', { username });
    return response.data;
  },

  getMyQuestions: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<MyQuestionSummaryResponse>> => {
    const response = await apiClient.get<PageResponse<MyQuestionSummaryResponse>>(
      '/users/questions',
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  getMyAnswers: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<MyAnswerSummaryResponse>> => {
    const response = await apiClient.get<PageResponse<MyAnswerSummaryResponse>>(
      '/users/answers',
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  getMyComments: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<MyCommentSummaryResponse>> => {
    const response = await apiClient.get<PageResponse<MyCommentSummaryResponse>>(
      '/users/comments',
      {
        params: { page, size },
      }
    );
    return response.data;
  },
};



