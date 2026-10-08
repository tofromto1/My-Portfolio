// 페이지를 새로 열면 항상 TOP에서 시작
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const header = document.querySelector('#projectHeader');
const revealItems = document.querySelectorAll('.reveal');
const lightbox = document.querySelector('[data-lightbox-root]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxClose = document.querySelector('[data-lightbox-close]');
const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, io) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

function openLightbox(src) {
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = src;
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
}

lightboxTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openLightbox(trigger.dataset.lightbox));
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox?.classList.contains('is-open')) closeLightbox();
});

// Hero cards: 뒤에 있던 폴라로이드가 살짝 들린 뒤 앞으로 넘어오는 인터랙션
const heroCards = Array.from(document.querySelectorAll('.hero-card'));
const heroStarbucks = document.querySelector('.hero-card-starbucks');
const heroYonsei = document.querySelector('.hero-card-yonsei');
const heroTimers = new WeakMap();

function baseZ(card) {
  return card === heroStarbucks ? 2 : 1;
}

function clearHeroTimer(card) {
  const timer = heroTimers.get(card);
  if (timer) window.clearTimeout(timer);
  heroTimers.delete(card);
}

function liftHeroCard(card) {
  if (!card) return;
  clearHeroTimer(card);

  heroCards.forEach((item) => {
    if (item === card) return;
    item.classList.remove('is-lifting', 'is-front');
    item.style.zIndex = String(baseZ(item));
  });

  card.classList.remove('is-front');
  card.classList.add('is-lifting');

  const timer = window.setTimeout(() => {
    card.style.zIndex = '5';
    card.classList.remove('is-lifting');
    card.classList.add('is-front');
    heroTimers.delete(card);
  }, 155);

  heroTimers.set(card, timer);
}

function resetHeroCard(card) {
  if (!card) return;
  clearHeroTimer(card);
  card.classList.remove('is-lifting', 'is-front');

  const resetTimer = window.setTimeout(() => {
    if (!card.matches(':hover')) card.style.zIndex = String(baseZ(card));
  }, 320);
  heroTimers.set(card, resetTimer);
}

heroCards.forEach((card) => {
  card.style.zIndex = String(baseZ(card));
  card.addEventListener('pointerenter', () => liftHeroCard(card));
  card.addEventListener('pointerleave', () => resetHeroCard(card));
  card.addEventListener('focusin', () => liftHeroCard(card));
  card.addEventListener('focusout', () => resetHeroCard(card));
});

// --------------------------------------------------
// 상세 페이지 ↑ ↓ 빠른 이동
// ↑ = TOP / ↓ = FOOTER
// --------------------------------------------------

const scrollUpBtn = document.querySelector('#scrollUpBtn');
const scrollDownBtn = document.querySelector('#scrollDownBtn');

const reduceMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


function scrollBehavior() {
  return reduceMotion ? 'auto' : 'smooth';
}


// 페이지에서 실제로 이동 가능한 맨 아래
function pageBottom() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
}


// ↓는 언제나 문서의 진짜 맨 아래를 목표로 함
function downTarget() {
  return pageBottom();
}


// 버튼 표시 상태
function updateScrollNav() {

  if (!scrollUpBtn || !scrollDownBtn) return;


  // 페이지 최상단에서만 ↑ 숨김
  const inHero = window.scrollY <= 10;


  // 문서의 실제 맨 아래에 도착하면 ↑↓ 둘 다 숨김
  const atFooter =
    window.scrollY >= pageBottom() - 10;


  scrollUpBtn.classList.toggle(
    'is-hidden',
    inHero || atFooter
  );

  scrollDownBtn.classList.toggle(
    'is-hidden',
    atFooter
  );
}


// ↑ 클릭 → TOP
scrollUpBtn?.addEventListener(
  'click',
  () => {

    window.scrollTo({
      top: 0,
      behavior: scrollBehavior()
    });

  }
);


// ↓ 클릭 → Footer
scrollDownBtn?.addEventListener(
  'click',
  () => {

    window.scrollTo({
      top: downTarget(),
      behavior: scrollBehavior()
    });

  }
);


// 위치에 따라 버튼 표시 갱신
window.addEventListener(
  'scroll',
  updateScrollNav,
  { passive: true }
);

window.addEventListener(
  'resize',
  updateScrollNav
);

window.addEventListener(
  'load',
  updateScrollNav
);

updateScrollNav();