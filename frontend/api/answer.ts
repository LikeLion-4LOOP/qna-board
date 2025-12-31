import apiClient from '@/lib/api';

export interface AnswerResponse {
  id: number;
  questionId: number;
  content: string;
  userId: number;
  vote: number;
  isSelect: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerCreateRequest {
  content: string;
}

export interface AnswerUpdateRequest {
  content: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const answerApi = {
  getAnswers: async (
    questionId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<AnswerResponse>> => {
    const response = await apiClient.get<PageResponse<AnswerResponse>>(
      `/api/questions/${questionId}/answers`,
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  createAnswer: async (
    questionId: number,
    data: AnswerCreateRequest
  ): Promise<AnswerResponse> => {
    const response = await apiClient.post<AnswerResponse>(
      `/api/questions/${questionId}/answers`,
      data
    );
    return response.data;
  },

  updateAnswer: async (
    answerId: number,
    data: AnswerUpdateRequest
  ): Promise<AnswerResponse> => {
    const response = await apiClient.patch<AnswerResponse>(
      `/api/answers/${answerId}`,
      data
    );
    return response.data;
  },

  deleteAnswer: async (answerId: number): Promise<void> => {
    await apiClient.delete(`/api/answers/${answerId}`);
  },

  selectAnswer: async (answerId: number): Promise<void> => {
    await apiClient.post(`/api/answers/${answerId}/select`);
  },

  voteAnswer: async (answerId: number): Promise<void> => {
    await apiClient.post(`/api/answers/${answerId}/vote`);
  },
};



