// 페이지를 새로 열면 항상 TOP에서 시작
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('pageshow', () => {
  const target = sessionStorage.getItem('portfolioTarget');

  if (target === 'works') {
    const works = document.querySelector('#works');

    if (works) {
      works.scrollIntoView({
        behavior: 'instant',
        block: 'start'
      });
    }

    sessionStorage.removeItem('portfolioTarget');
    document.documentElement.classList.remove('jump-to-works');
    return;
  }

  document.documentElement.classList.remove('jump-to-works');

  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }

  window.scrollTo(0, 0);
});


const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));


// Hero intro
window.addEventListener('load', () => {
  setTimeout(() => document.body.classList.add('intro-circles'), 220);
  setTimeout(() => document.body.classList.add('intro-focus'), 1750);
  setTimeout(() => document.body.classList.add('intro-copy'), 2650);
});


// Skills
const skillObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const skill = entry.target;
    const target = clamp(Number(skill.dataset.level) || 0, 0, 100);

    $('.skill-fill', skill).style.width = target + '%';

    const value = $('.skill-value', skill);
    let start = null;

    const tick = t => {
      if (!start) start = t;

      const p = clamp((t - start) / 1100, 0, 1);

      value.textContent =
        Math.round(target * (1 - Math.pow(1 - p, 3))) + '%';

      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    obs.unobserve(skill);
  });
}, { threshold: .45 });

$$('.skill').forEach(s => skillObserver.observe(s));


// WORKS 가로 스크롤
const works = $('.works');
const track = $('#worksTrack');
const progressBar = $('#worksProgress');

let worksMaxMove = 0;

function configureWorks() {
  if (innerWidth <= 820) {
    works.style.height = 'auto';
    worksMaxMove = 0;
    track.style.transform = 'none';
    return;
  }

  worksMaxMove = Math.max(0, track.scrollWidth - innerWidth);

  works.style.height =
    Math.ceil(
      innerHeight +
      worksMaxMove +
      innerHeight * .42
    ) + 'px';
}


function updateWorks() {
  if (innerWidth <= 820) {
    track.style.transform = 'none';
    return;
  }

  const rect = works.getBoundingClientRect();

  const scrollable =
    Math.max(1, works.offsetHeight - innerHeight);

  const progress =
    clamp(-rect.top / scrollable, 0, 1);

  track.style.transform =
    `translate3d(${-worksMaxMove * progress}px,0,0)`;

  progressBar.style.width =
    (progress * 100) + '%';
}


// END 애니메이션
const ending = $('.ending');
const endingSticky = $('#endingSticky');

function updateEnding() {
  const r = ending.getBoundingClientRect();
  const total = ending.offsetHeight - innerHeight;
  const p = clamp(-r.top / total, 0, 1);

  const contact =
    p < .17 ? 0 :
    p < .32 ? (p - .17) / .15 :
    p < .48 ? 1 :
    p < .59 ? 1 - (p - .48) / .11 :
    0;

  const blur = clamp(p / .45, 0, 1);
  const curtain = clamp((p - .44) / .25, 0, 1);

  const endOpacity =
    p < .69 ? 0 :
    p < .77 ? (p - .69) / .08 :
    p < .91 ? 1 :
    p < .95 ? 1 - (p - .91) / .04 :
    0;

  const ingOpacity =
    p < .972
      ? 0
      : clamp((p - .972) / .023, 0, 1);

  endingSticky.style.setProperty(
    '--contact-opacity',
    contact.toFixed(3)
  );

  endingSticky.style.setProperty(
    '--end-blur',
    blur.toFixed(3)
  );

  endingSticky.style.setProperty(
    '--darkness',
    clamp((p - .36) / .3, 0, 1).toFixed(3)
  );

  endingSticky.style.setProperty(
    '--curtain',
    curtain.toFixed(3)
  );

  endingSticky.style.setProperty(
    '--end-opacity',
    endOpacity.toFixed(3)
  );

  endingSticky.style.setProperty(
    '--end-y',
    (
      p > .91
        ? (-72 * clamp((p - .91) / .055, 0, 1))
        : 0
    ) + 'px'
  );

  endingSticky.style.setProperty(
    '--ing-opacity',
    ingOpacity.toFixed(3)
  );

  endingSticky.style.setProperty(
    '--ing-y',
    (48 * (1 - ingOpacity)) + 'px'
  );

  endingSticky.style.setProperty(
    '--credit-opacity',
    p > .71
      ? clamp((p - .71) / .08, 0, .72)
      : 0
  );
}


// Header 색상
const header = $('#siteHeader');

function updateHeader() {
  const y = innerHeight * .18;

  const dark = [works, ending].some(sec => {
    const r = sec.getBoundingClientRect();

    return r.top < y && r.bottom > y;
  });

  header.classList.toggle('nav-light', dark);
}


// --------------------------------------------------
// ↑ ↓ QUICK NAVIGATION
// --------------------------------------------------

const hero = $('.hero');

const scrollNav = $('#scrollNav');

const scrollUpBtn = $('#scrollUpBtn');
const scrollDownBtn = $('#scrollDownBtn');

const workCards = $$('.work-card');

const reduceMotion =
  matchMedia('(prefers-reduced-motion: reduce)').matches;


// 현재 페이지의 진짜 맨 아래 위치
function pageBottom() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - innerHeight
  );
}


// 원하는 Y 위치로 이동
function scrollToY(top) {
  window.scrollTo({
    top: clamp(top, 0, pageBottom()),
    behavior: reduceMotion ? 'auto' : 'smooth'
  });
}


// 섹션 시작 위치 계산
function sectionTop(section) {
  return scrollY +
    section.getBoundingClientRect().top;
}


// 화면 중앙이 해당 섹션 안에 있는지 확인
function isMarkerInside(section) {
  const marker = innerHeight * .5;

  const r = section.getBoundingClientRect();

  return (
    r.top <= marker &&
    r.bottom > marker
  );
}


// 현재 WORKS 안인지 확인
function isInWorks() {
  return isMarkerInside(works);
}


// WORKS 첫 작품으로
function scrollWorksToStart() {

  // 모바일에서는 작품이 세로로 쌓임
  if (innerWidth <= 820 && workCards.length) {

    workCards[0].scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center'
    });

    return;
  }

  // PC에서는 가로스크롤 시작 위치
  scrollToY(
    sectionTop(works)
  );
}


// WORKS 마지막 작품으로
function scrollWorksToEnd() {

  // 모바일
  if (innerWidth <= 820 && workCards.length) {

    workCards[
      workCards.length - 1
    ].scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center'
    });

    return;
  }

  // PC에서는 WORKS 가로스크롤 마지막 위치
  scrollToY(
    sectionTop(works) +
    works.offsetHeight -
    innerHeight
  );
}


// ↑ ↓ 버튼 상태 업데이트
function updateScrollNav() {

  if (
    !scrollNav ||
    !scrollUpBtn ||
    !scrollDownBtn
  ) return;


  // 첫 화면에 HERO가 남아 있으면 ↑ 숨기기
  const inHero =
    hero.getBoundingClientRect().bottom > 1;


  const inWorks =
    isInWorks();


  // 진짜 맨 아래인지 확인
  const atBottom =
    scrollY + innerHeight >=
    document.documentElement.scrollHeight - 3;


  // 위치는 고정.
  // 필요 없는 버튼만 사라짐.
  scrollUpBtn.classList.toggle(
    'is-hidden',
    inHero
  );

  scrollDownBtn.classList.toggle(
    'is-hidden',
    atBottom
  );


  // WORKS / END처럼 어두운 구간에서는
  // 버튼 색도 밝은 버전으로
  scrollNav.classList.toggle(
    'on-dark',
    header.classList.contains('nav-light')
  );


  // 접근성용 설명도 현재 위치에 맞게 변경
  scrollUpBtn.setAttribute(
    'aria-label',
    inWorks
      ? 'WORKS 첫 작품으로 이동'
      : 'HOME으로 이동'
  );

  scrollDownBtn.setAttribute(
    'aria-label',
    inWorks
      ? 'WORKS 마지막 작품으로 이동'
      : 'END로 이동'
  );
}


// ↑ 클릭
scrollUpBtn?.addEventListener(
  'click',
  () => {

    if (isInWorks()) {
      const worksStart = sectionTop(works);

      // 이미 WORKS 첫부분에 거의 도착했다면 HOME으로
      if (scrollY <= worksStart + 10) {
        scrollToY(0);
        return;
      }

      // 아니면 WORKS 첫 작품으로
      scrollWorksToStart();
      return;
    }

    // 그 외에는 HOME
    scrollToY(0);
  }
);


// ↓ 클릭
scrollDownBtn?.addEventListener(
  'click',
  () => {

    if (isInWorks()) {
      const worksEnd =
        sectionTop(works) +
        works.offsetHeight -
        innerHeight;

      // 이미 WORKS 끝에 거의 도착했다면 END로
      if (scrollY >= worksEnd - 10) {
        scrollToY(pageBottom());
        return;
      }

      // 아니면 WORKS 마지막 작품으로
      scrollWorksToEnd();
      return;
    }

    // 그 외에는 END
    scrollToY(pageBottom());
  }
);

// --------------------------------------------------
// 전체 스크롤 업데이트
// --------------------------------------------------

let ticking = false;

function onScroll() {

  if (ticking) return;

  ticking = true;

  requestAnimationFrame(() => {

    updateWorks();
    updateEnding();
    updateHeader();

    // 새 ↑ ↓ 버튼
    updateScrollNav();

    ticking = false;
  });
}


function onResize() {
  configureWorks();
  onScroll();
}


addEventListener(
  'scroll',
  onScroll,
  { passive: true }
);

addEventListener(
  'resize',
  onResize
);


configureWorks();

requestAnimationFrame(onScroll);


// --------------------------------------------------
// PROJECT MODAL
// --------------------------------------------------

const modal = $('#projectModal');
const closeBtn = $('.modal-close');

const modalVisual = $('#modalVisual');
const viewProject = $('#viewProject');


function openModal(card, index) {

  $('#modalTitle').textContent =
    card.dataset.title;

  $('#modalCategory').textContent =
    card.dataset.category;

  $('#modalDesc').textContent =
    card.dataset.desc;


  const href =
    card.dataset.href || '#';

  const modalVideo =
    $('#modalVideo');


  modalVisual.href = href;
  viewProject.href = href;


  if (card.dataset.video) {

    // 영상 작품
    modalVisual.style.setProperty(
      '--modal-art',
      'none'
    );

    modalVisual.style.background =
      '#000';

    modalVideo.src =
      card.dataset.video;

    modalVideo.style.display =
      'block';

    modalVideo
      .play()
      .catch(() => {});

  } else {

    // 이미지 작품
    modalVideo.pause();

    modalVideo.removeAttribute(
      'src'
    );

    modalVideo.load();

    modalVideo.style.display =
      'none';

    modalVisual.style.setProperty(
      '--modal-art',
      card.dataset.art
    );

    modalVisual.style.background =
      card.dataset.art;
  }


  modal.classList.add('open');

  modal.setAttribute(
    'aria-hidden',
    'false'
  );

  document.body.style.overflow =
    'hidden';

  closeBtn.focus();
}


function closeModal() {

  modal.classList.remove('open');

  modal.setAttribute(
    'aria-hidden',
    'true'
  );

  document.body.style.overflow = '';
}


$$('.work-card').forEach(
  (card, i) => {

    card.addEventListener(
      'click',
      () => openModal(card, i)
    );

    card.addEventListener(
      'keydown',
      e => {

        if (
          e.key === 'Enter' ||
          e.key === ' '
        ) {

          e.preventDefault();

          openModal(card, i);
        }
      }
    );
  }
);


closeBtn.addEventListener(
  'click',
  closeModal
);


modal.addEventListener(
  'click',
  e => {

    if (e.target === modal) {
      closeModal();
    }
  }
);


addEventListener(
  'keydown',
  e => {

    if (e.key === 'Escape') {
      closeModal();
    }
  }
);


modal.addEventListener(
  'click',
  e => {

    const a =
      e.target.closest('a');

    if (
      a &&
      a.getAttribute('href') === '#'
    ) {
      e.preventDefault();
    }
  }
);