"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { questionApi, Question, QuestionImageMeta } from "@/api/question";
import { isAuthenticated } from "@/lib/auth";
import { CATEGORIES, CategoryId, getCategoryById } from "@/lib/categories";

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = Number(params?.id);

  const [question, setQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "" as CategoryId | "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [existingImages, setExistingImages] = useState<QuestionImageMeta[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    loadQuestion();
  }, [questionId, router]);

  const loadQuestion = async () => {
    try {
      const data = await questionApi.getQuestion(questionId);
      setQuestion(data);

      // category에서 카테고리 추출
      let category: CategoryId | "" = "";
      if (data.category) {
        // 백엔드 enum code를 프론트엔드 category ID로 변환
        const enumToCategoryId: Record<string, CategoryId> = {
          DEV_IT: "dev",
          EDUCATION: "education",
          HEALTH: "health",
          COOKING: "cooking",
          TRAVEL: "travel",
          SHOPPING: "shopping",
          LIFE: "lifestyle",
          HOBBY: "hobby",
          SPORTS: "sports",
          PET: "pet",
          CAR: "car",
          FINANCE: "finance",
          REAL_ESTATE: "realestate",
          LAW: "law",
          JOB: "career",
          ETC: "etc",
        };
        category = enumToCategoryId[data.category.code] || "etc";
      }

      setFormData({
        title: data.title,
        content: data.content,
        category,
      });

      // 기존 이미지 로드
      try {
        const imageList = await questionApi.getQuestionImages(questionId);
        setExistingImages(imageList);
      } catch (imgErr) {
        console.error("이미지 로딩 실패:", imgErr);
      }
    } catch (err) {
      setError("질문을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      alert("이미지 파일만 업로드 가능합니다.");
    }

    const maxSize = 5 * 1024 * 1024;
    const validFiles = imageFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} 파일이 너무 큽니다. (최대 5MB)`);
        return false;
      }
      return true;
    });

    const totalImages =
      existingImages.length + selectedImages.length + validFiles.length;
    if (totalImages > 5) {
      alert("이미지는 최대 5개까지 업로드 가능합니다.");
      const remaining = 5 - existingImages.length - selectedImages.length;
      if (remaining > 0) {
        validFiles.splice(remaining);
      } else {
        return;
      }
    }

    const newImages = [...selectedImages, ...validFiles];
    setSelectedImages(newImages);

    // 먼저 빈 배열로 초기화하여 로딩 상태 표시
    setImagePreviews(Array(newImages.length).fill(""));

    // 미리보기 생성 - FileReader 사용 (각 파일별로 독립적으로 처리)
    const previewPromises = newImages.map((file, idx) => {
      return new Promise<string>((resolve) => {
        if (file && file instanceof File) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.onerror = (err) => {
            console.error(`이미지 읽기 실패: ${idx}`, err);
            resolve("");
          };
          reader.readAsDataURL(file);
        } else {
          resolve("");
        }
      });
    });

    // 모든 미리보기가 생성되면 상태 업데이트
    Promise.all(previewPromises).then((previews) => {
      setImagePreviews(previews);
    });
  };

  const handleRemoveNewImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const insertNewImageAtCursor = (imageIndex: number) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 플레이스홀더 삽입 (나중에 실제 이미지로 교체)
    const placeholder = `\n[새이미지_${imageIndex}_${Date.now()}]\n`;

    const newContent =
      formData.content.substring(0, start) +
      placeholder +
      formData.content.substring(end);

    setFormData({ ...formData, content: newContent });

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + placeholder.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertImageAtCursor = (imageId: number) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const imageUrl = questionApi.getImageUrl(imageId);
    const imageMarkdown = `\n![이미지](${imageUrl})\n`;

    const newContent =
      formData.content.substring(0, start) +
      imageMarkdown +
      formData.content.substring(end);

    setFormData({ ...formData, content: newContent });

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + imageMarkdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!formData.category) {
        setError("카테고리를 선택해주세요.");
        setSubmitting(false);
        return;
      }

      await questionApi.updateQuestion(questionId, {
        title: formData.title,
        content: formData.content,
        category: questionApi.mapCategoryIdToEnum(formData.category),
      });

      // 새 이미지 업로드하고 플레이스홀더를 실제 이미지로 교체
      let finalContent = formData.content;

      if (selectedImages.length > 0) {
        try {
          await questionApi.uploadImages(questionId, selectedImages);

          // 업로드된 이미지 목록 가져오기
          const uploadedImages = await questionApi.getQuestionImages(
            questionId
          );

          // 새로 업로드된 이미지만 필터링 (기존 이미지 제외)
          const newImages = uploadedImages.filter(
            (img) => !existingImages.some((existing) => existing.id === img.id)
          );

          // placeholder 문자열만 순서대로 수집
          const placeholderPattern = /\[이미지_(\d+)_\d+\]/g;
          const placeholders: string[] = [];

          let m;
          while ((m = placeholderPattern.exec(finalContent)) !== null) {
            placeholders.push(m[0]);
          }

          // placeholder 등장 순서대로 이미지 매핑
          let cursor = 0;

          placeholders.forEach((ph) => {
            if (cursor < uploadedImages.length) {
              const img = uploadedImages[cursor++];
              finalContent = finalContent.replace(
                ph,
                `![이미지](${questionApi.getImageUrl(img.id)})`
              );
            } else {
              // 매칭 실패한 placeholder 제거
              finalContent = finalContent.replace(ph, "");
            }
          });

          // 남은 플레이스홀더 제거
          finalContent = finalContent.replace(/\[새이미지_\d+_\d+\]/g, "");

          // 내용이 변경되었으면 업데이트
          if (finalContent !== formData.content) {
            await questionApi.updateQuestion(questionId, {
              title: formData.title,
              content: finalContent,
              category: questionApi.mapCategoryIdToEnum(formData.category),
            });
          }
        } catch (imageErr: any) {
          console.error("이미지 업로드 실패:", imageErr);
        }
      }

      // 질문 수정 후 상세 페이지로 이동하고 새로고침하여 수정 시간 반영
      router.push(`/questions/${questionId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "질문 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 이미지 미리보기 정리 (FileReader는 자동으로 정리되므로 별도 처리 불필요)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">질문 수정</h1>
        <p className="text-slate-600">질문 내용을 수정하세요</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 animate-fade-in"
      >
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            제목
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            카테고리
          </label>
          {formData.category ? (
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${
                  getCategoryById(formData.category).color
                } text-white rounded-xl text-sm font-semibold`}
              >
                <span>{getCategoryById(formData.category).icon}</span>
                {getCategoryById(formData.category).name}
              </span>
              <button
                type="button"
                onClick={() => setShowCategorySelect(true)}
                className="px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                변경
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCategorySelect(true)}
              className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                카테고리 선택하기
              </div>
            </button>
          )}

          {/* 카테고리 선택 모달 */}
          {showCategorySelect && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col animate-fade-in">
                <div className="p-6 border-b border-slate-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">
                      카테고리 선택
                    </h2>
                    <button
                      onClick={() => setShowCategorySelect(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-6 h-6 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setFormData({ ...formData, category: category.id });
                          setShowCategorySelect(false);
                        }}
                        className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${
                          formData.category === category.id
                            ? `border-indigo-500 bg-gradient-to-br ${category.color} text-white shadow-lg`
                            : "border-slate-200 bg-white hover:border-indigo-300 text-slate-700"
                        }`}
                      >
                        <div className="text-4xl mb-3">{category.icon}</div>
                        <div
                          className={`text-base font-semibold ${
                            formData.category === category.id
                              ? "text-white"
                              : "text-slate-700"
                          }`}
                        >
                          {category.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            내용
          </label>
          <textarea
            ref={contentTextareaRef}
            id="content"
            required
            rows={15}
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white resize-none"
          />
        </div>

        {/* 이미지 관리 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            이미지 (선택사항, 최대 5개)
          </label>

          {/* 기존 이미지 */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-600 mb-2">
                기존 이미지 (클릭하여 텍스트 커서 위치에 삽입)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group border border-slate-200 rounded-xl overflow-hidden bg-white"
                  >
                    <img
                      src={questionApi.getImageUrl(img.id)}
                      alt={img.originalName}
                      className="w-full h-32 object-contain cursor-pointer hover:opacity-90 transition-opacity bg-white"
                      onClick={() => insertImageAtCursor(img.id)}
                      title="클릭하여 텍스트 커서 위치에 삽입"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.classList.add("bg-slate-100");
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 새 이미지 업로드 */}
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload-edit"
              disabled={existingImages.length + selectedImages.length >= 5}
            />
            <label
              htmlFor="image-upload-edit"
              className={`inline-flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                existingImages.length + selectedImages.length >= 5
                  ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-600 hover:border-indigo-500 hover:text-indigo-600"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              이미지 추가 ({existingImages.length + selectedImages.length}/5)
            </label>

            {/* 새 이미지 미리보기 */}
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-xs text-slate-600 mb-2">
                  이미지를 클릭하면 텍스트 커서 위치에 삽입됩니다
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group border border-slate-200 rounded-xl overflow-hidden bg-white min-h-[128px]"
                    >
                      {preview &&
                      preview.length > 0 &&
                      preview.startsWith("data:image/") ? (
                        <>
                          <img
                            src={preview}
                            alt={`미리보기 ${index + 1}`}
                            className="w-full h-32 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: "transparent" }}
                            onClick={() => {
                              insertNewImageAtCursor(index);
                            }}
                            title="클릭하여 텍스트 커서 위치에 삽입"
                            onError={(e) => {
                              console.error(
                                "이미지 로드 실패:",
                                index,
                                preview.substring(0, 50)
                              );
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-32 bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                          <span className="text-slate-400 text-sm">
                            {preview === ""
                              ? "이미지 로딩 중..."
                              : "이미지 없음"}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNewImage(index);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                수정 중...
              </span>
            ) : (
              "수정하기"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
