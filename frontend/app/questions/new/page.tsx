"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { questionApi } from "@/api/question";
import { userApi } from "@/api/user";
import { isAuthenticated } from "@/lib/auth";
import { CATEGORIES, CategoryId, getCategoryById } from "@/lib/categories";

export default function NewQuestionPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "" as CategoryId | "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/auth/login");
        return;
      }
      setAuthenticated(true);
      try {
        const user = await userApi.getUser();
        setUsername(user.username);
      } catch (err) {
        console.error("사용자 정보 로딩 실패:", err);
      }
    };
    checkAuth();
  }, [router]);

  // 이미지 미리보기 정리 (FileReader는 자동으로 정리되므로 별도 처리 불필요)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 이미지 파일만 필터링
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      alert("이미지 파일만 업로드 가능합니다.");
    }

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = imageFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} 파일이 너무 큽니다. (최대 5MB)`);
        return false;
      }
      return true;
    });

    // 최대 5개까지 제한
    const newImages = [...selectedImages, ...validFiles].slice(0, 5);
    if (newImages.length < selectedImages.length + validFiles.length) {
      alert("이미지는 최대 5개까지 업로드 가능합니다.");
    }

    // 기존 미리보기 URL 정리
    imagePreviews.forEach((url) => {
      if (url && url.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error("URL 해제 실패:", err);
        }
      }
    });

    setSelectedImages(newImages);

    // 미리보기 생성 - FileReader 사용 (각 파일별로 독립적으로 처리)
    const previewPromises = newImages.map((file, idx) => {
      return new Promise<string>((resolve) => {
        if (file && file instanceof File) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            console.log(
              `이미지 미리보기 생성 성공: ${idx}`,
              result.substring(0, 50)
            );
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
      console.log("모든 미리보기 생성 완료:", previews.length);
      setImagePreviews(previews);
    });

    // 로딩 중 표시를 위해 빈 배열로 초기화
    setImagePreviews(Array(newImages.length).fill(""));

    // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const insertImageAtCursor = (imageIndex: number) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 플레이스홀더 삽입 (나중에 실제 이미지로 교체)
    const placeholder = `\n[이미지_${imageIndex}_${Date.now()}]\n`;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.category) {
        setError("카테고리를 선택해주세요.");
        setLoading(false);
        return;
      }

      let finalContent = formData.content;

      const createdQuestion = await questionApi.createQuestion({
        title: formData.title,
        content: formData.content,
        category: questionApi.mapCategoryIdToEnum(formData.category),
      });

      // 이미지가 있으면 업로드하고 플레이스홀더를 실제 이미지로 교체
      if (createdQuestion && createdQuestion.id && selectedImages.length > 0) {
        try {
          await questionApi.uploadImages(createdQuestion.id, selectedImages);

          // 업로드된 이미지 목록 가져오기
          const uploadedImages = await questionApi.getQuestionImages(
            createdQuestion.id
          );

          // 플레이스홀더를 실제 이미지 마크다운으로 교체
          // 모든 플레이스홀더 패턴 찾기: [이미지_인덱스_타임스탬프]
          const placeholderPattern = /\[이미지_(\d+)_\d+\]/g;
          const usedIndices = new Set<number>();

          // 플레이스홀더를 실제 이미지로 교체
          finalContent = finalContent.replace(
            placeholderPattern,
            (matchStr, indexStr) => {
              const index = parseInt(indexStr, 10);
              if (
                index >= 0 &&
                index < uploadedImages.length &&
                !usedIndices.has(index)
              ) {
                usedIndices.add(index);
                const img = uploadedImages[index];
                return `![이미지](${questionApi.getImageUrl(img.id)})`;
              }
              return matchStr; // 매칭되지 않으면 원본 유지
            }
          );

          // 플레이스홀더가 남아있으면 (클릭하지 않은 이미지) 마지막에 추가
          const remainingPlaceholders =
            finalContent.match(/\[이미지_\d+_\d+\]/g);
          if (remainingPlaceholders && remainingPlaceholders.length > 0) {
            // 사용되지 않은 이미지 찾기
            const unusedImages = uploadedImages.filter(
              (_, idx) => !usedIndices.has(idx)
            );
            if (unusedImages.length > 0) {
              const imageMarkdowns = unusedImages
                .map(
                  (img) => `\n![이미지](${questionApi.getImageUrl(img.id)})\n`
                )
                .join("");
              finalContent =
                finalContent.replace(/\[이미지_\d+_\d+\]/g, "") +
                imageMarkdowns;
            } else {
              finalContent = finalContent.replace(/\[이미지_\d+_\d+\]/g, "");
            }
          } else if (uploadedImages.length > 0 && usedIndices.size === 0) {
            // 플레이스홀더가 하나도 없으면 (클릭하지 않은 경우) 마지막에 추가
            const imageMarkdowns = uploadedImages
              .map((img) => `\n![이미지](${questionApi.getImageUrl(img.id)})\n`)
              .join("");
            finalContent = finalContent + imageMarkdowns;
          }

          // 내용이 변경되었으면 업데이트
          if (finalContent !== formData.content) {
            await questionApi.updateQuestion(createdQuestion.id, {
              title: formData.title,
              content: finalContent,
              category: questionApi.mapCategoryIdToEnum(formData.category),
            });
          }
        } catch (imageErr: any) {
          console.error("이미지 업로드 실패:", imageErr);
          // 이미지 업로드 실패해도 질문은 생성되었으므로 계속 진행
        }
      }

      // 생성된 질문의 ID를 사용하여 상세 페이지로 이동
      if (createdQuestion && createdQuestion.id) {
        router.push(`/questions/${createdQuestion.id}`);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "질문 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">질문 작성</h1>
        <p className="text-slate-600">궁금한 점을 질문해보세요</p>
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
            placeholder="질문 제목을 입력하세요"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            카테고리 <span className="text-red-500">*</span>
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
                onClick={() => setFormData({ ...formData, category: "" })}
                className="px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            placeholder="질문 내용을 입력하세요"
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            이미지 (선택사항, 최대 5개)
          </label>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
              disabled={selectedImages.length >= 5}
            />
            <label
              htmlFor="image-upload"
              className={`inline-flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                selectedImages.length >= 5
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
              이미지 추가 ({selectedImages.length}/5)
            </label>

            {/* 이미지 미리보기 */}
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-xs text-slate-600 mb-2">
                  이미지를 클릭하면 텍스트 커서 위치에 삽입됩니다
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group border border-slate-200 rounded-xl overflow-hidden bg-white min-h-[192px]"
                    >
                      {preview &&
                      preview.length > 0 &&
                      preview.startsWith("data:image/") ? (
                        <>
                          <img
                            src={preview}
                            alt={`미리보기 ${index + 1}`}
                            className="w-full h-48 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: "transparent" }}
                            onClick={() => {
                              console.log(
                                "이미지 클릭:",
                                index,
                                "커서 위치:",
                                contentTextareaRef.current?.selectionStart
                              );
                              insertImageAtCursor(index);
                            }}
                            title="클릭하여 텍스트 커서 위치에 삽입"
                            onLoad={(e) => {
                              console.log(
                                "이미지 로드 성공:",
                                index,
                                "크기:",
                                (e.target as HTMLImageElement).naturalWidth,
                                "x",
                                (e.target as HTMLImageElement).naturalHeight
                              );
                            }}
                            onError={(e) => {
                              console.error(
                                "이미지 로드 실패:",
                                index,
                                preview.substring(0, 50)
                              );
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                const existingError =
                                  parent.querySelector(".image-error");
                                if (!existingError) {
                                  const errorDiv =
                                    document.createElement("div");
                                  errorDiv.className =
                                    "image-error w-full h-48 bg-slate-100 flex items-center justify-center";
                                  errorDiv.innerHTML =
                                    '<span class="text-slate-400 text-sm">이미지 로드 실패</span>';
                                  parent.appendChild(errorDiv);
                                }
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">
                              클릭하여 삽입
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-48 bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                          <span className="text-slate-400 text-sm">
                            {preview === ""
                              ? "이미지 로딩 중..."
                              : "이미지 없음"}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">
                          클릭하여 삽입
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
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
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                작성 중...
              </span>
            ) : (
              "작성하기"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
