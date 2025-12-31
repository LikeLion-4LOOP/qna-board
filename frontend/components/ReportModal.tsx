'use client';

import { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string) => void;
  type: 'question' | 'answer' | 'comment' | 'user';
}

export default function ReportModal({ isOpen, onClose, onReport, type }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const reasons = [
    '스팸 또는 광고',
    '부적절한 내용',
    '욕설 또는 비방',
    '저작권 침해',
    '기타',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reason = selectedReason === '기타' ? customReason : selectedReason;
    if (reason.trim()) {
      onReport(reason);
      setSelectedReason('');
      setCustomReason('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          {type === 'user' ? '사용자 신고' : '신고하기'}
        </h2>
        <p className="text-slate-600 mb-6">
          {type === 'user'
            ? '이 사용자를 신고하는 이유를 선택해주세요.'
            : '이 콘텐츠를 신고하는 이유를 선택해주세요.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-6">
            {reasons.map((reason) => (
              <label
                key={reason}
                className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mr-3 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700">{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === '기타' && (
            <div className="mb-6">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="신고 사유를 입력하세요"
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!selectedReason || (selectedReason === '기타' && !customReason.trim())}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              신고하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

