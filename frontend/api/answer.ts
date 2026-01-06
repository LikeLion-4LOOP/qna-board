import apiClient from '@/lib/api';

export interface AnswerResponse {
  id: number;
  questionId: number;
  content: string;
  userId: number;
  vote: number;
  isSelect?: boolean;
  select?: boolean; // 백엔드에서 select로 올 수 있음
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
  };
}

// 백엔드 응답을 정규화하는 헬퍼 함수
export const normalizeAnswer = (answer: any): AnswerResponse => {
  return {
    ...answer,
    isSelect: answer.isSelect ?? answer.select ?? false,
  };
};

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
    const response = await apiClient.get<PageResponse<any>>(
      `/api/questions/${questionId}/answers`,
      {
        params: { page, size },
      }
    );
    // 응답 데이터 정규화
    return {
      ...response.data,
      content: response.data.content.map(normalizeAnswer),
    };
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

  unvoteAnswer: async (answerId: number): Promise<void> => {
    await apiClient.delete(`/api/answers/${answerId}/vote`);
  },

  checkVoteStatus: async (answerId: number): Promise<boolean> => {
    const response = await apiClient.get<boolean>(
      `/api/answers/${answerId}/vote/check`
    );
    return response.data;
  },
};



