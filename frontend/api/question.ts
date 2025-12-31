import apiClient from '@/lib/api';

export interface Question {
  id: number;
  title: string;
  content: string;
  username: string;
  tag?: string;
  createdAt: string;
  modifiedAt: string;
  answerCount?: number;
  viewCount?: number;
}

export interface QuestionCreateRequest {
  title: string;
  content: string;
  username: string;
  tag?: string;
}

export interface QuestionUpdateRequest {
  title: string;
  content: string;
  tag?: string;
}

export const questionApi = {
  getQuestions: async (search?: string, sortBy?: string): Promise<Question[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    const response = await apiClient.get<Question[]>('/api/questions', { params });
    return response.data;
  },

  getQuestion: async (id: number): Promise<Question> => {
    const response = await apiClient.get<Question>(`/api/questions/${id}`);
    return response.data;
  },

  createQuestion: async (data: QuestionCreateRequest): Promise<string> => {
    const response = await apiClient.post<string>('/api/questions', data);
    return response.data;
  },

  updateQuestion: async (id: number, data: QuestionUpdateRequest): Promise<string> => {
    const response = await apiClient.put<string>(`/api/questions/${id}`, data);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<string> => {
    const response = await apiClient.delete<string>(`/api/questions/${id}`);
    return response.data;
  },
};



