'use client';

import { useState } from 'react';
import { CATEGORIES, CategoryId } from '@/lib/categories';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: CategoryId) => void;
  selectedCategory: CategoryId | null;
  questionCounts?: Record<string, number>;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSelectCategory,
  selectedCategory,
  questionCounts = {},
}: CategoryModalProps) {
  if (!isOpen) return null;

  const handleCategoryClick = (categoryId: CategoryId) => {
    onSelectCategory(categoryId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col animate-fade-in">
        {/* 헤더 */}
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">카테고리로 찾기</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 카테고리 목록 */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => {
              const count = questionCounts[category.id] || 0;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${
                    selectedCategory === category.id
                      ? `border-indigo-500 bg-gradient-to-br ${category.color} text-white shadow-lg`
                      : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                  }`}
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <div className={`text-base font-semibold mb-2 ${selectedCategory === category.id ? 'text-white' : 'text-slate-700'}`}>
                    {category.name}
                  </div>
                  <div className={`text-sm ${selectedCategory === category.id ? 'text-white/80' : 'text-slate-500'}`}>
                    {count}개 질문
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
