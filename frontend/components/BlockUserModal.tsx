'use client';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: () => void;
  username: string;
}

export default function BlockUserModal({ isOpen, onClose, onBlock, username }: BlockUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">사용자 차단</h2>
        <p className="text-slate-600 mb-6">
          <span className="font-semibold">{username}</span> 사용자를 차단하시겠습니까?
          <br />
          차단된 사용자의 게시물은 더 이상 표시되지 않습니다.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              onBlock();
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            차단하기
          </button>
        </div>
      </div>
    </div>
  );
}

