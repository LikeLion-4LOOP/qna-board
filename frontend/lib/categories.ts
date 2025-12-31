// 질문 카테고리 정의 (큰 카테고리만)
export const CATEGORIES = [
  { id: 'dev', name: '개발/IT', icon: '💻', color: 'from-blue-500 to-indigo-500', group: '개발/IT' },
  { id: 'education', name: '교육/학습', icon: '📚', color: 'from-amber-500 to-yellow-500', group: '교육/학습' },
  { id: 'health', name: '건강/의료', icon: '💪', color: 'from-green-500 to-emerald-500', group: '건강/의료' },
  { id: 'cooking', name: '요리/음식', icon: '👨‍🍳', color: 'from-orange-500 to-red-500', group: '요리/음식' },
  { id: 'travel', name: '여행/관광', icon: '✈️', color: 'from-blue-500 to-cyan-500', group: '여행/관광' },
  { id: 'shopping', name: '쇼핑/구매', icon: '🛒', color: 'from-pink-500 to-rose-500', group: '쇼핑/구매' },
  { id: 'lifestyle', name: '생활/가정', icon: '🏠', color: 'from-amber-500 to-orange-500', group: '생활/가정' },
  { id: 'hobby', name: '취미/여가', icon: '🎨', color: 'from-purple-500 to-pink-500', group: '취미/여가' },
  { id: 'sports', name: '스포츠', icon: '⚽', color: 'from-green-500 to-emerald-500', group: '스포츠' },
  { id: 'pet', name: '반려동물', icon: '🐕', color: 'from-amber-500 to-orange-500', group: '반려동물' },
  { id: 'car', name: '자동차', icon: '🚗', color: 'from-red-500 to-pink-500', group: '자동차' },
  { id: 'finance', name: '금융/재테크', icon: '💰', color: 'from-green-500 to-emerald-500', group: '금융/재테크' },
  { id: 'realestate', name: '부동산', icon: '🏘️', color: 'from-amber-600 to-orange-600', group: '부동산' },
  { id: 'law', name: '법률/행정', icon: '⚖️', color: 'from-slate-600 to-gray-600', group: '법률/행정' },
  { id: 'career', name: '직업/진로', icon: '💼', color: 'from-indigo-500 to-purple-500', group: '직업/진로' },
  { id: 'etc', name: '기타', icon: '📌', color: 'from-gray-400 to-slate-400', group: '기타' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export const getCategoryById = (id: string) => {
  return CATEGORIES.find((cat) => cat.id === id) || CATEGORIES[CATEGORIES.length - 1]; // 기본값: 기타
};

export const getCategoryName = (id: string) => {
  return getCategoryById(id).name;
};

// 그룹별로 카테고리 분류
export const getCategoriesByGroup = () => {
  const grouped: Record<string, Array<typeof CATEGORIES[number]>> = {};
  CATEGORIES.forEach((cat) => {
    if (!grouped[cat.group]) {
      grouped[cat.group] = [];
    }
    grouped[cat.group].push(cat);
  });
  return grouped;
};

// 그룹 목록
export const CATEGORY_GROUPS = Array.from(new Set(CATEGORIES.map(cat => cat.group)));
