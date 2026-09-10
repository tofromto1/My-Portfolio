EUNBI PORTFOLIO — PROTOTYPE V2

파일 구성
- index.html : 페이지 내용 / 텍스트 / 프로젝트 카드
- style.css  : 디자인 / 반응형 / 애니메이션 스타일
- script.js  : Hero 순차 인트로 / 스킬 게이지 / Works 가로 스크롤 / Ending / 모달
- assets/    : Hero 영상·이미지 / Ending 이미지

이번 수정
1) HERO 원 중복
   현재 Flow 영상 자체에 최종 초점 원이 들어 있으므로, 웹의 두 원은 '데굴데굴' 진입 후 영상이 선명해질 때 페이드아웃합니다.
   그래서 최종 표지에는 영상 속 원 하나만 남습니다.

   나중에 원이 없는 Hero 영상을 쓰게 되면 index.html의
   <body data-hero-final-ring="video">
   를
   <body data-hero-final-ring="web">
   로 바꾸면 웹의 큰 원을 최종 화면에 남길 수 있습니다.

2) HERO 순서
   흐린 화면 -> 원 2개 데굴데굴 -> 초점 선명 -> PORTFOLIO/문구가 아래에서 올라옴
   로 단계를 분리했습니다.

3) WORKS 가로 스크롤
   이전 버전의 원인은 CSS 변수 --page-x가 clamp(...) 문자열인데 JS에서 parseFloat하여 NaN이 된 것이었습니다.
   이번 버전은 실제 track 폭을 계산하고 Works 높이도 자동 설정해서 세로 스크롤이 가로 이동으로 연결됩니다.

4) CONTACT
   현재 느낌 유지. your@email.com만 실제 이메일로 교체하면 됩니다.

5) END -> -ing
   END가 나타나는 시점은 거의 유지하고, END가 화면에 머무는 시간을 늘렸습니다.
   END가 위로 사라진 뒤 잠깐 빈 호흡을 두고 -ing가 올라옵니다.

자주 수정할 곳
- Hero 영상: assets/hero-loop.mp4 교체
- Hero 소개문장: index.html에서 '영상과 디자인으로' 검색
- 로고: index.html의 .brand-mark
- 스킬: index.html의 data-level 숫자만 수정
- Works: <article class="work-card"> 블록 복붙
- 상세 링크: 각 work-card의 data-href="#" 를 project-01.html 등으로 변경
- Email: your@email.com 교체
