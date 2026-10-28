# Pages CMS — WORKS 관리 안내

이 문서는 현재 Eunbi Portfolio의 실제 파일 구조 기준으로 작성되었습니다.

## 접속과 연결
1. https://app.pagescms.org/ 에서 GitHub로 로그인합니다.
2. GitHub App 설치 대상은 `tofromto1/My-Portfolio` 하나입니다.
3. 저장소 `My-Portfolio`, 브랜치 `main`을 엽니다.
4. 왼쪽 **Works** 컬렉션에서 기존 6개 작품을 확인합니다.
5. Works 메뉴가 없으면 `.pages.yml`이 `main` 최상위에 있는지 확인하고 새로고침합니다.

## 기존 작품
- 리플렛 → `leaflet/index.html`
- 명함 → `business-card/index.html`
- 카드뉴스 → `cardnews/index.html`
- 밀리의 서재 → `milli/index.html`
- 유튜브 '롤조각' → `rolljogak/index.html`
- 기업 브랜딩 → `yeobackrok/index.html`

작품 하나마다 `content/works/{id}.json` 파일 하나가 있습니다. 파일명/ID는 중복하지 않아야 합니다. 기존 제목, 설명, 썸네일, 모달 영상, 상세 링크, 순서를 이관했습니다. 제작 연도와 태그는 원본 카드에 없어서 공란으로 두었습니다. 임의의 값을 넣지 않았습니다.

## 새 작품 추가
1. Works에서 새 항목을 누릅니다.
2. 고유 ID(영문 소문자, 숫자, 하이픈), 제목, 카테고리, 썸네일, 설명, 상세페이지 주소를 입력합니다.
3. 영상이 있는 작품은 모달 미리보기 영상을 지정하고 Badge를 VIDEO로 설정합니다.
4. Published와 Show on homepage를 켜고 Display order 숫자를 지정합니다.
5. 저장합니다. GitHub에 작품별 JSON 파일이 커밋됩니다.

수정은 기존 항목을 열어 저장하면 됩니다. 삭제하면 해당 JSON이 삭제되어 다음 배포에서 카드가 사라집니다. 비공개 처리하려면 Published를 끄고, 메인 노출만 제외하려면 Show on homepage를 끕니다.

## 이미지·동영상
- 기존 미디어는 `assets/`에 그대로 있습니다.
- CMS 이미지 선택/업로드도 `assets/`를 사용하며, 저장되는 공개 경로는 `/My-Portfolio/assets/...`입니다.
- 영상 파일도 `assets/`에서 선택할 수 있습니다.
- 영상 용량이 크면 GitHub 업로드 제한에 유의하세요.

## 상세페이지
상세 HTML은 기존처럼 `leaflet/`, `business-card/`, `cardnews/`, `milli/`, `rolljogak/`, `yeobackrok/` 디렉터리에 존재합니다. CMS의 **VIEW PROJECT URL**에 `milli/index.html` 같은 상대 경로나 외부 전체 URL을 입력하면 썸네일 모달의 링크에 반영됩니다. 이 CMS 설정은 상세페이지 HTML을 자동 생성하거나 수정하지 않습니다.

## 작동 구조
Pages CMS → `content/works/*.json` → `scripts/build-works.mjs` → `data/works.json` → `script.js` → WORKS 카드와 모달.

- `data/works.json`은 초기 데이터도 저장되어 있어 기존 브랜치 배포에서도 기본 6개를 렌더링합니다.
- GitHub Actions `.github/workflows/deploy.yml`은 main 변경마다 Collection 전체를 검증·통합하여 정적 웹사이트와 함께 GitHub Pages로 배포합니다.
- 배포 중 생성된 `data/works.json`은 빌드 아티팩트에 포함됩니다. 불필요한 재커밋이나 무한 실행 루프는 만들지 않습니다.
- 노출 순서는 order 오름차순, 동일한 값일 때 제목순입니다.
- WORKS의 원래 CSS 클래스와 가로 스크롤·모달 구조는 유지합니다.
- 합쳐진 JSON을 가져올 수 없으면 기존 6개 HTML 카드가 안전한 폴백으로 표시됩니다. 이 경우 최신 CMS 수정은 반영되지 않습니다.

## GitHub Pages 설정 및 확인 (중요)
GitHub에서 **My-Portfolio → Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정해야 CMS 변경 시 워크플로의 최신 통합 파일이 게시됩니다. 기존 Source가 Deploy from a branch로 되어 있다면 이 설정 변경은 저장소 소유자가 직접 해야 합니다.

1. Actions 탭에서 **Build and deploy portfolio** 워크플로가 성공했는지 확인합니다.
2. https://tofromto1.github.io/My-Portfolio/ 에서 WORKS 6개, 가로 스크롤, 각 모달과 상세 링크를 확인합니다.
3. CMS에서 제목을 잠시 수정하고 저장한 뒤 워크플로 성공 및 사이트 변경을 확인합니다. 확인 후 제목을 원상복구합니다.

### 오류 시
- Works 목록이 비어 있다면 `.pages.yml`의 `path: content/works` 및 실제 JSON 6개를 확인합니다.
- Actions 실패 시 해당 작업의 **Aggregate and validate WORKS** 로그를 읽습니다. 누락된 필드, 중복 ID, 잘못된 JSON/숫자/공개 여부를 오류로 알려줍니다.
- 웹사이트에 옛 데이터만 보이면 Pages의 Source가 GitHub Actions인지 확인하고 강력 새로고침합니다.
- 작품 ID를 바꿀 때는 파일명도 맞추고 중복이 생기지 않게 주의합니다.

기존 포트폴리오 백업 브랜치: `backup-before-pages-cms-2026-10-28`.
