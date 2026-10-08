// 페이지를 새로 열면 항상 TOP에서 시작
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const header = document.querySelector('.project-header');
const revealItems = document.querySelectorAll('.reveal');
const lightbox = document.querySelector('[data-lightbox-root]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxClose = document.querySelector('[data-lightbox-close]');
const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

const slider = document.querySelector('[data-slider]');
const slides = slider ? Array.from(slider.querySelectorAll('.key-slide')) : [];
const prevButton = document.querySelector('[data-slide-prev]');
const nextButton = document.querySelector('[data-slide-next]');
const currentCounter = document.querySelector('[data-slide-current]');
let currentSlide = 0;

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
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
  const open = () => openLightbox(trigger.dataset.lightbox);

  trigger.addEventListener('click', open);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

function showSlide(index) {
  if (!slides.length) return;
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === currentSlide);
  });
  if (currentCounter) {
    currentCounter.textContent = String(currentSlide + 1).padStart(2, '0');
  }
}

prevButton?.addEventListener('click', () => showSlide(currentSlide - 1));
nextButton?.addEventListener('click', () => showSlide(currentSlide + 1));

window.addEventListener('keydown', (event) => {
  if (lightbox?.classList.contains('is-open')) {
    if (event.key === 'Escape') closeLightbox();
    return;
  }

  const activeElement = document.activeElement;
  const sliderHasFocus = activeElement?.closest?.('.key-message-block');
  if (!sliderHasFocus) return;

  if (event.key === 'ArrowLeft') showSlide(currentSlide - 1);
  if (event.key === 'ArrowRight') showSlide(currentSlide + 1);
});

showSlide(0);

const heroVideo = document.querySelector('#heroVideo');
const heroSound = document.querySelector('#heroSound');

// 사용자가 직접 SOUND ON을 선택했는지 기억
let soundEnabled = false;

if (heroVideo && heroSound) {

  function updateHeroVolume() {
    // 사용자가 SOUND ON을 누른 적이 없다면 계속 무음
    if (!soundEnabled) {
      heroVideo.muted = true;
      return;
    }

    const rect = heroVideo.getBoundingClientRect();

    // 영상이 화면 위로 얼마나 사라졌는지
    const hiddenAmount = Math.max(0, -rect.top);

    // 영상 높이의 50% 동안 소리가 서서히 줄어듦
    const fadeDistance = rect.height * 0.5;

    const volume = Math.max(
      0,
      Math.min(1, 1 - hiddenAmount / fadeDistance)
    );

    // SOUND ON 상태는 유지하고 볼륨만 스크롤에 따라 변경
    heroVideo.muted = false;
    heroVideo.volume = volume;
  }

  heroSound.addEventListener('click', () => {

    if (!soundEnabled) {
      // SOUND ON
      soundEnabled = true;

      heroVideo.muted = false;
      heroVideo.volume = 1;
      heroVideo.loop = false;
      heroVideo.currentTime = 0;
      heroVideo.play();

      heroSound.textContent = 'SOUND OFF';

      updateHeroVolume();

    } else {
      // SOUND OFF
      soundEnabled = false;

      heroVideo.muted = true;
      heroVideo.volume = 1;
      heroVideo.loop = true;

      heroSound.textContent = 'SOUND ON ↗';
    }
  });

  window.addEventListener(
    'scroll',
    () => {
      requestAnimationFrame(updateHeroVolume);
    },
    { passive: true }
  );
}