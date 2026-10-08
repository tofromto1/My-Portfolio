// 페이지를 새로 열면 항상 TOP에서 시작
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // Persistent project navigation: fade while scrolling, return when scrolling stops.
  const projectNav = document.querySelector('.project-nav');
  const projectNavLinks = [...document.querySelectorAll('.project-nav__links a[href^="#"]')];
  let navIdleTimer = null;

  const updateProjectNav = () => {
    if (!projectNav) return;
    projectNav.classList.toggle('is-scrolled', window.scrollY > 36);
  };

  const markScrolling = () => {
    if (!projectNav) return;
    updateProjectNav();

    if (!prefersReducedMotion) {
      projectNav.classList.add('is-scrolling');
      projectNav.classList.remove('is-idle');
      window.clearTimeout(navIdleTimer);
      navIdleTimer = window.setTimeout(() => {
        projectNav.classList.remove('is-scrolling');
        projectNav.classList.add('is-idle');
      }, 170);
    }
  };

  window.addEventListener('scroll', markScrolling, { passive: true });
  updateProjectNav();
  projectNav?.classList.add('is-idle');

  // Highlight the section currently being viewed.
  const navSections = projectNavLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      projectNavLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
      });
    }, {
      rootMargin: '-34% 0px -54% 0px',
      threshold: [0, .2, .5, .8]
    });
    navSections.forEach((section) => navObserver.observe(section));
  }

  // Scroll reveal
  const revealItems = [...document.querySelectorAll('.reveal')];
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach((el) => observer.observe(el));
  }

  // Fixed up / down controls: hide the unavailable direction at each end.
  const upButton = document.querySelector('[data-scroll="top"]');
  const downButton = document.querySelector('[data-scroll="bottom"]');

  const setControlVisibility = (button, shouldHide) => {
    if (!button) return;
    button.classList.toggle('is-hidden', shouldHide);
    button.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
    button.tabIndex = shouldHide ? -1 : 0;
  };

  const updateScrollControls = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportBottom = scrollTop + window.innerHeight;
    const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const edge = 12;

    setControlVisibility(upButton, scrollTop <= edge);
    setControlVisibility(downButton, viewportBottom >= pageHeight - edge);
  };

  document.querySelectorAll('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.scroll === 'top'
        ? document.querySelector('#top')
        : document.querySelector('#page-end');
      target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  window.addEventListener('scroll', updateScrollControls, { passive: true });
  window.addEventListener('resize', updateScrollControls);
  updateScrollControls();

  // Lightbox for the six original card images
  const dialog = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxCaption = document.querySelector('#lightbox-caption');
  const closeButton = dialog?.querySelector('.lightbox__close');
  const prevButton = dialog?.querySelector('.lightbox__nav--prev');
  const nextButton = dialog?.querySelector('.lightbox__nav--next');
  const triggers = [...document.querySelectorAll('[data-lightbox]')];
  let currentIndex = 0;

  const renderLightbox = (index) => {
    if (!triggers.length || !dialog) return;
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    const img = trigger.querySelector('img');
    lightboxImage.src = trigger.dataset.lightbox;
    lightboxImage.alt = img?.alt ? `${img.alt} 확대 이미지` : '명함 확대 이미지';
    lightboxCaption.textContent = trigger.dataset.caption || '';
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      renderLightbox(index);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
  });

  closeButton?.addEventListener('click', () => dialog.close());
  prevButton?.addEventListener('click', () => renderLightbox(currentIndex - 1));
  nextButton?.addEventListener('click', () => renderLightbox(currentIndex + 1));

  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.addEventListener('keydown', (event) => {
    if (!dialog?.open) return;
    if (event.key === 'ArrowLeft') renderLightbox(currentIndex - 1);
    if (event.key === 'ArrowRight') renderLightbox(currentIndex + 1);
  });
})();

// --------------------------------------------------
// 상세 페이지 ↑ ↓ 빠른 이동
// ↑ = TOP / ↓ = FOOTER
// --------------------------------------------------

const scrollUpBtn = document.querySelector('#scrollUpBtn');
const scrollDownBtn = document.querySelector('#scrollDownBtn');

const detailHero = document.querySelector('.hero');
const projectFooter = document.querySelector('.project-footer');

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


// Footer의 절대 위치
function footerTop() {

  if (!projectFooter) {
    return pageBottom();
  }

  return (
    window.scrollY +
    projectFooter.getBoundingClientRect().top
  );
}


// ↓가 실제로 도착할 위치
function downTarget() {
  return Math.min(
    footerTop(),
    pageBottom()
  );
}


// 버튼 표시 상태
function updateScrollNav() {

  if (!scrollUpBtn || !scrollDownBtn) return;


  // 첫 Hero 화면에서는 ↑ 숨김
  const inHero = window.scrollY <= 400;


  // Footer 도착 시 ↓ 숨김
  const atFooter =
    window.scrollY >= downTarget() - 10;


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