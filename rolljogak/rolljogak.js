// ROLLJOGAK / DETAIL PAGE — 2026
// GitHub Pages: /rolljogak/index.html, /rolljogak/rolljogak.css,
// /rolljogak/rolljogak.js, /rolljogak/assets/*

// 새로고침 시 상단 시작 (명시적으로 앵커 이동한 경우는 그대로 유지)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => {
  if (!location.hash) window.scrollTo(0, 0);
});

// 메인 포트폴리오로 돌아가면 Works 섹션을 보여주도록 힌트 저장
for (const link of document.querySelectorAll('[data-back-to-works]')) {
  link.addEventListener('click', () => {
    try { sessionStorage.setItem('portfolioTarget', 'works'); } catch (_) {}
  });
}

// 헤더 스크롤 상태
const header = document.querySelector('.project-header');
function updateHeader() { header?.classList.toggle('is-scrolled', window.scrollY > 24); }
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// 섹션 스크롤 진입 모션
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.09 });
  revealItems.forEach(el => revealObserver.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('is-visible'));
}

// 클릭 확대: 이미지 자체 대신 data-lightbox에 지정된 이미지 사용 가능
// 프로세스: 타임라인(화면) -> 전체 프리미어 워크스페이스(모달)
const lightbox = document.querySelector('[data-lightbox-root]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const lightboxClose = document.querySelector('[data-lightbox-close]');
let lightboxOpener = null;

function openLightbox(button) {
  if (!lightbox || !lightboxImage || !button?.dataset.lightbox) return;
  lightboxOpener = button;
  lightboxImage.src = button.dataset.lightbox;
  lightboxImage.alt = button.dataset.lightboxTitle || '확대된 프로젝트 이미지';
  if (lightboxCaption) lightboxCaption.textContent = button.dataset.lightboxTitle || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-lightbox-open');
  lightboxClose?.focus();
}
function closeLightbox() {
  if (!lightbox?.classList.contains('is-open')) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-lightbox-open');
  lightboxImage.removeAttribute('src');
  if (lightboxCaption) lightboxCaption.textContent = '';
  lightboxOpener?.focus();
}
for (const trigger of document.querySelectorAll('[data-lightbox]')) {
  trigger.addEventListener('click', () => openLightbox(trigger));
}
lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox || event.target.classList.contains('lightbox-help')) closeLightbox();
});
window.addEventListener('keydown', event => {
  if (!lightbox?.classList.contains('is-open')) return;
  if (event.key === 'Escape') { event.preventDefault(); closeLightbox(); }
  if (event.key === 'Tab') { // 대화상자 안의 닫기 버튼에 키보드 초점 유지
    event.preventDefault();
    lightboxClose?.focus();
  }
});

// HERO SOUND + 스크롤 페이드 + FINAL CUT의 재생음 겹침 방지
const heroVideo = document.querySelector('#heroVideo');
const heroSound = document.querySelector('#heroSound');
const finalVideo = document.querySelector('#finalVideo');
let soundEnabled = false;
let finalIsPlaying = false;
let heroAudioFrame = null;

function updateHeroVolume() {
  if (!heroVideo) return;
  // SOUND OFF는 사용자의 명시적인 선택이므로, 스크롤로 다시 켜지지 않음
  if (!soundEnabled || finalIsPlaying) {
    heroVideo.muted = true;
    return;
  }
  const rect = heroVideo.getBoundingClientRect();
  const hiddenAmount = Math.max(0, -rect.top);
  const fadeDistance = Math.max(1, rect.height * 0.5);
  const volume = Math.max(0, Math.min(1, 1 - hiddenAmount / fadeDistance));
  heroVideo.volume = volume;
  heroVideo.muted = (volume === 0);
}
function scheduleHeroVolume() {
  if (heroAudioFrame !== null) return;
  heroAudioFrame = requestAnimationFrame(() => {
    heroAudioFrame = null;
    updateHeroVolume();
  });
}
if (heroVideo && heroSound) {
  // autoplay 정책상 최초 재생은 무음. 영상 파일이 실제로 있어야 동작합니다.
  heroVideo.muted = true;
  heroVideo.loop = true;
  heroVideo.play().catch(() => {});

  heroSound.addEventListener('click', async () => {
    if (!soundEnabled) {
      // 사용자 SOUND ON: 다른 플레이어가 재생 중이면 먼저 정지
      if (finalVideo && !finalVideo.paused) finalVideo.pause();
      soundEnabled = true;
      heroVideo.loop = false;
      heroVideo.currentTime = 0;
      heroSound.textContent = 'SOUND OFF';
      heroSound.setAttribute('aria-pressed', 'true');
      updateHeroVolume();
      try { await heroVideo.play(); } catch (error) { /* 브라우저 정책 또는 MP4 누락 */ }
    } else {
      soundEnabled = false;
      heroVideo.muted = true;
      heroVideo.volume = 1;
      heroVideo.loop = true;
      heroSound.textContent = 'SOUND ON ↗';
      heroSound.setAttribute('aria-pressed', 'false');
      if (heroVideo.ended) heroVideo.play().catch(() => {});
    }
  });
  window.addEventListener('scroll', scheduleHeroVolume, { passive: true });
  window.addEventListener('resize', scheduleHeroVolume, { passive: true });
}

if (finalVideo) {
  finalVideo.addEventListener('play', () => {
    finalIsPlaying = true;
    updateHeroVolume();
  });
  const onFinalStop = () => {
    finalIsPlaying = false;
    updateHeroVolume();
  };
  finalVideo.addEventListener('pause', onFinalStop);
  finalVideo.addEventListener('ended', onFinalStop);
}

// 영상 파일이 아직 없으면 포스터 위 안내 문구 노출
if (heroVideo) {
  const unavailable = document.querySelector('[data-video-missing]');
  function showMissingVideo() {
    if (unavailable) unavailable.hidden = false;
    if (heroSound) { heroSound.disabled = true; heroSound.title = '영상 파일을 먼저 추가해주세요.'; }
  }
  heroVideo.addEventListener('error', showMissingVideo);
  heroVideo.querySelector('source')?.addEventListener('error', showMissingVideo);
  if (heroVideo.error) showMissingVideo();
}

// --------------------------------------------------
// 상세 페이지 ↑ / ↓ 빠른 이동 — 명함 페이지 스타일에 맞춤
// ↑ TOP / ↓ FOOTER. 이동할 곳이 없는 방향만 숨깁니다.
// --------------------------------------------------
const scrollUpBtn = document.querySelector('#scrollUpBtn');
const scrollDownBtn = document.querySelector('#scrollDownBtn');
const pageEnd = document.querySelector('#page-end');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getBottomPosition() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}
function getFooterPosition() {
  if (!pageEnd) return getBottomPosition();
  return Math.min(getBottomPosition(), window.scrollY + pageEnd.getBoundingClientRect().top);
}
function updateScrollButtons() {
  const y = window.scrollY;
  const atTop = y <= 400;
  const atFooter = y >= getFooterPosition() - 10;
  const hideUp = atTop || atFooter; // 하단의 BACK TO TOP과 기능이 겹치지 않도록
  if (scrollUpBtn) {
    scrollUpBtn.classList.toggle('is-hidden', hideUp);
    scrollUpBtn.setAttribute('aria-hidden', String(hideUp));
    scrollUpBtn.tabIndex = hideUp ? -1 : 0;
  }
  if (scrollDownBtn) {
    scrollDownBtn.classList.toggle('is-hidden', atFooter);
    scrollDownBtn.setAttribute('aria-hidden', String(atFooter));
    scrollDownBtn.tabIndex = atFooter ? -1 : 0;
  }
}
scrollUpBtn?.addEventListener('click', () => window.scrollTo({top:0,behavior:reducedMotion?'auto':'smooth'}));
scrollDownBtn?.addEventListener('click', () => window.scrollTo({top:getFooterPosition(),behavior:reducedMotion?'auto':'smooth'}));
window.addEventListener('scroll', updateScrollButtons, {passive:true});
window.addEventListener('resize', updateScrollButtons);
window.addEventListener('load', updateScrollButtons);
updateScrollButtons();
