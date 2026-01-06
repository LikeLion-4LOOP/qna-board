import apiClient from "@/lib/api";

export type ReportTargetType = "QUESTION" | "ANSWER" | "COMMENT";

export interface ReportCreateRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
}

export interface ReportResult {
  reported: boolean;
  totalReports: number;
  hidden: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface HiddenQuestion {
  id: number;
  title: string;
  content: string;
  viewCount: number;
  answerCount: number;
  category: {
    code: string;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
  };
}

export interface HiddenAnswer {
  id: number;
  questionId: number;
  content: string;
  userId: number;
  vote: number;
  isSelect: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
  };
}

export interface HiddenComment {
  id: number;
  postId: number;
  isQuestion: boolean;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
}

export const reportApi = {
  // 신고 생성
  report: async (request: ReportCreateRequest): Promise<ReportResult> => {
    const response = await apiClient.post<ReportResult>("/api/reports", request);
    return response.data;
  },

  // 숨김된 질문 목록 조회
  getHiddenQuestions: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<HiddenQuestion>> => {
    const response = await apiClient.get<PageResponse<HiddenQuestion>>(
      "/admin/report/hidden/QUESTION",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  // 숨김된 답변 목록 조회
  getHiddenAnswers: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<HiddenAnswer>> => {
    const response = await apiClient.get<PageResponse<HiddenAnswer>>(
      "/admin/report/hidden/ANSWER",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  // 숨김된 댓글 목록 조회
  getHiddenComments: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<HiddenComment>> => {
    const response = await apiClient.get<PageResponse<HiddenComment>>(
      "/admin/report/hidden/COMMENT",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  // 숨김 해제
  restore: async (
    targetType: ReportTargetType,
    targetId: number
  ): Promise<void> => {
    await apiClient.post(
      `/admin/report/targets/${targetType}/${targetId}/restore`
    );
  },

  // 삭제
  delete: async (
    targetType: ReportTargetType,
    targetId: number
  ): Promise<void> => {
    await apiClient.post(
      `/admin/report/targets/${targetType}/${targetId}/delete`
    );
  },
};

