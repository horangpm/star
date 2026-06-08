# HAM SSAM — 배포 가이드

## 파일 구조
```
hamssam/
├── index.html          ← 메인 홈
├── vercel.json         ← Vercel 설정
├── css/
│   └── style.css       ← 전체 스타일
├── js/
│   ├── cosmos.js       ← 우주 배경 캔버스 + 파티클
│   └── main.js         ← 햄버거 메뉴, 스크롤, 방문 카운트
├── pages/
│   ├── shape.html      ← 도형심리분석
│   ├── star.html       ← 별자리차트
│   └── saju.html       ← 운명비밀사주
└── admin/
    └── index.html      ← 관리자 대시보드
```

## GitHub → Vercel 배포 절차

1. GitHub 새 저장소 생성 (예: `ham-ssam`)
2. 이 폴더 전체를 push
```bash
git init
git add .
git commit -m "init: HAM SSAM 홈페이지"
git remote add origin https://github.com/YOUR_ID/ham-ssam.git
git push -u origin main
```
3. [vercel.com](https://vercel.com) → Import Git Repository → 저장소 선택
4. Framework Preset: **Other** (Static Site)
5. Deploy → 완료!

## 관리자 접속
- URL: `your-domain.vercel.app/admin`
- 초기 아이디: `hamssam`
- 초기 비밀번호: `cosmos2025`
- ⚠️ 실제 운영 전 `admin/index.html` 내 ID/PW 변경 필수

## 카카오 오픈채팅 링크
현재 설정: `https://open.kakao.com/o/gbdfKQai`
변경 시 모든 HTML 파일에서 해당 URL 일괄 교체

## 커스터마이징
- 색상: `css/style.css` 상단 `:root` 변수 수정
- 콘텐츠: 각 HTML 파일 직접 수정
- 후기 추가: `index.html` reviews 섹션 수정
