# 🙋‍♂️qna-board

질문과 답변을 통해 지식을 공유하는 커뮤니티 플랫폼

## 📋 프로젝트 소개

사용자들이 자유롭게 질문을 올리고 답변을 공유할 수 있는 질의응답 게시판 서비스

### 주요 기능
- 질문/답변 작성 및 관리 (CRUD)
- 답변 채택 시스템
- 회원가입 및 로그인
- 댓글 시스템
- 질문 태그 및 검색

## 🛠 기술 스택

**Backend**: Java 21, Spring Boot 3.x, MySQL  
**Frontend**: Next.js 
**Tools**: Gradle

## 📂 프로젝트 구조
```
qna-board/
├─ backend/
│  └─ src/main/java/com/example/qnaboard/
│     ├─ controller/
│     ├─ service/
│     ├─ repository/
│     ├─ domain/
│     ├─ dto/
│     ├─ config/
│     └─ exception/
│
└─ frontend/
   ├─ app/
   ├─ components/
   ├─ pages/
   ├─ api/
   ├─ hooks/
   └─ styles/
```

## 👥 협업 규칙

### Git 브랜치 전략
```
main → develop → feature/*
```

### 커밋 메시지 규칙

**형식**: `[태그] 타입: 내용`

#### 태그
- `[BE]`: 백엔드 관련
- `[FE]`: 프론트엔드 관련
- `[DOCS]`: 문서 작성/수정
- `[CHORE]`: 기타 작업

#### 타입
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링
- `style`: UI/CSS 스타일 변경
- `docs`: 문서 수정
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드, 설정 파일 수정

#### 예시
```bash
# 백엔드
[BE] feat: 질문 등록 API 구현
[BE] fix: 답변 조회 시 NPE 오류 수정
[BE] refactor: QuestionService 코드 개선
[BE] test: QuestionController 단위 테스트 추가

# 프론트엔드
[FE] feat: 질문 목록 페이지 구현
[FE] style: 답변 카드 UI 개선
[FE] fix: 로그인 버튼 클릭 오류 수정
[FE] refactor: API 호출 로직 공통화

# 문서
[DOCS] docs: README 프로젝트 소개 추가
[DOCS] docs: API 명세서 작성

# 기타
[CHORE] chore: Gradle 의존성 업데이트
[CHORE] chore: 프로젝트 초기 구조 설정
```


### 코드 리뷰
- PR 머지 전 최소 2명 승인
- `main` 브랜치 직접 push 금지

## 📅 개발 일정

### Sprint 1: MVP
회원가입, 로그인, 질문/답변 CRUD

### Sprint 2: 기능 개선
답변 채택, 댓글, 태그 기능

### Sprint 3: 확장 기능
검색, 필터, 포인트/레벨 시스템
