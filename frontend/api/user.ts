import apiClient from "@/lib/api";

export interface UserResponse {
  id: number;
  userId: string;
  username: string;
  point: number;
  level: string;
  role: "USER" | "ADMIN";
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

export interface PointHistoryResponse {
  id: number;
  type: string; // PointType enum (LOGIN_DAILY, POST_QUESTION, etc.)
  amount: number;
  balanceAfter: number;
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
    const response = await apiClient.get<UserResponse>("/users");
    return response.data;
  },

  updateUsername: async (username: string): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>("/users", {
      username,
    });
    return response.data;
  },

  getMyQuestions: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<MyQuestionSummaryResponse>> => {
    const response = await apiClient.get<
      PageResponse<MyQuestionSummaryResponse>
    >("/users/questions", {
      params: { page, size },
    });
    return response.data;
  },

  getMyAnswers: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<MyAnswerSummaryResponse>> => {
    const response = await apiClient.get<PageResponse<MyAnswerSummaryResponse>>(
      "/users/answers",
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
    const response = await apiClient.get<
      PageResponse<MyCommentSummaryResponse>
    >("/users/comments", {
      params: { page, size },
    });
    return response.data;
  },

  getMyPointHistory: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<PointHistoryResponse>> => {
    const response = await apiClient.get<PageResponse<PointHistoryResponse>>(
      "/users/me/points",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  deleteUser: async (): Promise<void> => {
    await apiClient.delete("/users/delete");
  },

  // 프로필 이미지 업로드
  uploadProfileImage: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    await apiClient.post("/api/users/me/profile-image", formData);
  },

  // 프로필 이미지 URL 가져오기
  getProfileImageUrl: (userId: number): string => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    return `${API_BASE_URL}/api/users/${userId}/profile-image`;
  },
};
