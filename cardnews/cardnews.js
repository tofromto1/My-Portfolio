// 페이지를 새로 열면 항상 TOP에서 시작
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Persistent project navigation — 항상 고정/불투명 상태로 유지
  const projectNavLinks = [...document.querySelectorAll('.project-nav__links a[href^="#"]')];

  // 현재 섹션 표시
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

  // 위 / 아래 빠른 이동
  // 맨 위에서는 ↑만 숨김. Hero 내부의 별도 ↓ 버튼은 사용하지 않음.
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

  // Gallery viewer
  const galleryItems = [
    { src: 'assets/card-1.png', alt: '카드뉴스 1번 표지' },
    { src: 'assets/card-2.png', alt: '카드뉴스 2번 지원내용 및 신청 정보' },
    { src: 'assets/card-3.png', alt: '카드뉴스 3번 기간 및 사용처 정보' },
    { src: 'assets/card-4.png', alt: '카드뉴스 4번 사용가능 업종 예시' },
    { src: 'assets/card-5.png', alt: '카드뉴스 5번 사용불가 업종 예시' },
    { src: 'assets/card-6.png', alt: '카드뉴스 6번 마무리 페이지' }
  ];

  const mainImage = document.querySelector('#galleryMain');
  const counter = document.querySelector('#galleryIndex');
  const galleryMain = document.querySelector('.gallery__main');
  const thumbs = [...document.querySelectorAll('.gallery__thumb')];
  const prevBtn = document.querySelector('.gallery__arrow--prev');
  const nextBtn = document.querySelector('.gallery__arrow--next');
  let currentIndex = 0;

  const showGalleryItem = (index) => {
    if (!mainImage || !galleryMain || !counter) return;
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];

    galleryMain.classList.add('is-changing');
    window.setTimeout(() => {
      mainImage.src = item.src;
      mainImage.alt = item.alt;
      counter.textContent = String(currentIndex + 1).padStart(2, '0');
      thumbs.forEach((thumb, i) => {
        const active = i === currentIndex;
        thumb.classList.toggle('is-active', active);
        thumb.setAttribute('aria-current', active ? 'true' : 'false');
      });
      galleryMain.classList.remove('is-changing');
    }, prefersReducedMotion ? 0 : 110);
  };

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => showGalleryItem(Number(thumb.dataset.index)));
  });
  prevBtn?.addEventListener('click', () => showGalleryItem(currentIndex - 1));
  nextBtn?.addEventListener('click', () => showGalleryItem(currentIndex + 1));

  document.addEventListener('keydown', (event) => {
    const gallerySection = document.querySelector('#gallery');
    if (!gallerySection) return;
    const rect = gallerySection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (event.key === 'ArrowLeft') showGalleryItem(currentIndex - 1);
    if (event.key === 'ArrowRight') showGalleryItem(currentIndex + 1);
  });
})();
