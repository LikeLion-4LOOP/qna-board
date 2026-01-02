import apiClient from "@/lib/api";

export interface Question {
  id: number;
  title: string;
  content: string;

  username: string;
  user?: {
    id: number;
    username: string;
  };

  category?: {
    code: string; // DEV_IT
    displayName: string; // 개발/IT
  };
  tag?: string; // 하위 호환성을 위해 유지

  createdAt: string;
  updatedAt?: string | null;
  modifiedAt?: string;

  answerCount?: number;
  viewCount?: number;
}

export interface QuestionCreateRequest {
  title: string;
  content: string;
  category: string; // QuestionCategory enum 값 (예: "DEV_IT")
}

export interface QuestionUpdateRequest {
  title: string;
  content: string;
  category: string; // QuestionCategory enum 값 (예: "DEV_IT")
}

// 프론트엔드 카테고리 ID를 백엔드 enum으로 변환
export const mapCategoryIdToEnum = (categoryId: string): string => {
  const mapping: Record<string, string> = {
    dev: "DEV_IT",
    education: "EDUCATION",
    health: "HEALTH",
    cooking: "COOKING",
    travel: "TRAVEL",
    shopping: "SHOPPING",
    lifestyle: "LIFE",
    hobby: "HOBBY",
    sports: "SPORTS",
    pet: "PET",
    car: "CAR",
    finance: "FINANCE",
    realestate: "REAL_ESTATE",
    law: "LAW",
    career: "JOB",
    etc: "ETC",
  };
  return mapping[categoryId] || "ETC";
};
// front배포로 코드 바꿈
export const questionApi = {
  getQuestions: async (
    search?: string,
    sortBy?: string
  ): Promise<Question[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    const response = await apiClient.get<unknown>("/api/questions", { params }); // any->unknown으로 변경
    // Spring Data Page 객체인 경우 content 필드에서 배열 추출
    if (
      response.data &&
      typeof response.data === "object" &&
      "content" in response.data
    ) {
      const page = response.data as { content: Question[] };
      return Array.isArray(page.content) ? page.content : [];
    }
    // 이미 배열인 경우 그대로 반환
    if (Array.isArray(response.data)) {
      return response.data as Question[];
    }
    // 그 외의 경우 빈 배열 반환
    return [];
  },

  getQuestion: async (id: number): Promise<Question> => {
    const response = await apiClient.get<Question>(`/api/questions/${id}`);
    return response.data;
  },

  createQuestion: async (data: QuestionCreateRequest): Promise<string> => {
    const response = await apiClient.post<string>("/api/questions", data);
    return response.data;
  },

  updateQuestion: async (
    id: number,
    data: QuestionUpdateRequest
  ): Promise<string> => {
    const response = await apiClient.put<string>(`/api/questions/${id}`, data);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<string> => {
    const response = await apiClient.delete<string>(`/api/questions/${id}`);
    return response.data;
  },

  // 프론트엔드 카테고리 ID를 백엔드 enum으로 변환
  mapCategoryIdToEnum: (categoryId: string): string => {
    const mapping: Record<string, string> = {
      dev: "DEV_IT",
      education: "EDUCATION",
      health: "HEALTH",
      cooking: "COOKING",
      travel: "TRAVEL",
      shopping: "SHOPPING",
      lifestyle: "LIFE",
      hobby: "HOBBY",
      sports: "SPORTS",
      pet: "PET",
      car: "CAR",
      finance: "FINANCE",
      realestate: "REAL_ESTATE",
      law: "LAW",
      career: "JOB",
      etc: "ETC",
    };
    return mapping[categoryId] || "ETC";
  },
};
