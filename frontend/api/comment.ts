import apiClient from '@/lib/api';

export interface CommentResponse {
  commentId: number;
  postId: number;
  isQuestion: boolean;
  content: string;
  createdAt: string;
  user: {
    id: number;
  };
}

export interface CommentCreateRequest {
  content: string;
}

export interface CommentUpdateRequest {
  content: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const commentApi = {
  getComments: async (
    postId: number,
    isQuestion: boolean,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<CommentResponse>> => {
    const response = await apiClient.get<PageResponse<CommentResponse>>('/comments', {
      params: { postId, isQuestion, page, size },
    });
    return response.data;
  },

  createComment: async (
    postId: number,
    isQuestion: boolean,
    data: CommentCreateRequest
  ): Promise<number> => {
    const response = await apiClient.post<number>('/comments', data, {
      params: { postId, isQuestion },
    });
    return response.data;
  },

  updateComment: async (
    commentId: number,
    data: CommentUpdateRequest
  ): Promise<void> => {
    await apiClient.patch(`/comments/${commentId}`, data);
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },
};



