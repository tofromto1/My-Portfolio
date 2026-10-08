/* ========================================
   YEOBACKROK PORTFOLIO INTERACTIONS
   Swiper + GSAP + ScrollTrigger + ScrollSmoother
   ======================================== */
   
// 페이지를 새로 열면 항상 TOP에서 시작
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* GSAP에서 사용할 스크롤 관련 플러그인을 등록 */
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);


  /* ========================================
     1. GSAP ScrollSmoother
     ======================================== */

  let smoother = null;

  if (!reduceMotion) {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0.68,
      effects: true,
      normalizeScroll: true,
      smoothTouch: 0.06,
    });
  }


  /* ========================================
     2. Swiper : 시그니처 메뉴 슬라이드
     ======================================== */

  const signatureSwiper = new Swiper(".signature-swiper", {
    slidesPerView: 1,
    spaceBetween: 18,
    speed: 680,
    loop: true,
    grabCursor: true,
    watchSlidesProgress: true,

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    breakpoints: {
      768: {
        slidesPerView: 1,
        spaceBetween: 22,
      },

      1200: {
        slidesPerView: 1,
        spaceBetween: 26,
      },
    },
  });


  /* ========================================
     3. 첫 화면 진입 애니메이션
     ======================================== */

  if (!reduceMotion) {
    gsap.from(".project-hero [data-reveal]", {
      y: 28,
      opacity: 0,
      duration: 0.82,
      stagger: 0.14,
      ease: "power2.out",
      delay: 0.1,
    });
  }


  /* ========================================
     4. 스크롤 콘텐츠 등장
     ======================================== */

  if (!reduceMotion) {

    gsap.utils.toArray(".reveal-group").forEach((group) => {

      const items = group.querySelectorAll("[data-reveal]");

      if (group.closest(".project-hero")) return;

      gsap.from(items, {
        y: 34,
        opacity: 0,
        duration: 0.76,
        stagger: 0.11,
        ease: "power2.out",

        scrollTrigger: {
          trigger: group,
          start: "top 84%",
          toggleActions: "play none none reverse",
        },
      });

    });

  } else {

    gsap.set("[data-reveal]", {
      opacity: 1,
      y: 0,
    });

  }


  /* ========================================
     HERO 이미지 자동 전환
     ======================================== */

  const heroSlides = document.querySelectorAll(".hero-slide");

  let currentHeroSlide = 0;

  if (heroSlides.length > 1) {

    setInterval(() => {

      heroSlides[currentHeroSlide].classList.remove("active");

      currentHeroSlide =
        (currentHeroSlide + 1) % heroSlides.length;

      heroSlides[currentHeroSlide].classList.add("active");

    }, 3000);

  }


  /* ========================================
     5. 포트폴리오 공통 이동 UI
     ↑ 맨 위
     ↓ 맨 아래 Footer
     ======================================== */

  const scrollUpBtn =
    document.querySelector('[data-scroll="top"]');

  const scrollDownBtn =
    document.querySelector('[data-scroll="bottom"]');

  const pageEnd =
    document.querySelector("#page-end");

  const backToTop =
    document.querySelector(".project-footer__top");


  /* 실제 이동 함수 */
  const scrollToTarget = (target) => {

    /* ScrollSmoother가 작동 중일 때 */
    if (smoother) {

      smoother.scrollTo(
        target,
        true,
        "top top"
      );

    }

    /* 모션 최소화 등으로 ScrollSmoother가 없을 때 */
    else if (target === "#top") {

      window.scrollTo({
        top: 0,
        behavior: reduceMotion
          ? "auto"
          : "smooth",
      });

    }

    else {

      document
        .querySelector(target)
        ?.scrollIntoView({
          behavior: reduceMotion
            ? "auto"
            : "smooth",
          block: "start",
        });

    }
  };


  /* ↑ 클릭 → 맨 위 */
  scrollUpBtn?.addEventListener(
    "click",
    () => {
      scrollToTarget("#top");
    }
  );


  /* ↓ 클릭 → 진짜 맨 아래 Footer */
  scrollDownBtn?.addEventListener(
    "click",
    () => {
      scrollToTarget("#page-end");
    }
  );


  /* Footer의 BACK TO TOP */
  backToTop?.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      scrollToTarget("#top");

    }
  );


  /* ========================================
     화살표 표시 / 숨김
     ======================================== */

  const updateScrollControls = () => {

    if (
      !scrollUpBtn ||
      !scrollDownBtn ||
      !pageEnd
    ) return;


    /* 페이지 맨 위인지 확인 */
    const atTop =
      window.scrollY <= 10;


    /* Footer 위치 확인 */
    const endTop =
      pageEnd.getBoundingClientRect().top;


    /* Footer에 도착했는지 확인 */
    const atFooter =
      endTop <= window.innerHeight * 0.55;


    /*
      맨 위:
      ↑ 숨김
      ↓ 표시

      중간:
      ↑ 표시
      ↓ 표시

      Footer:
      ↑ 숨김
      ↓ 숨김
    */

    scrollUpBtn.classList.toggle(
      "is-hidden",
      atTop || atFooter
    );

    scrollDownBtn.classList.toggle(
      "is-hidden",
      atFooter
    );

  };


  window.addEventListener(
    "scroll",
    updateScrollControls,
    { passive: true }
  );


  /* 처음 페이지 열었을 때도 상태 체크 */
  updateScrollControls();


  /* ========================================
     이미지 로드 후 위치 재계산
     ======================================== */

  window.addEventListener("load", () => {

    ScrollTrigger.refresh();

    updateScrollControls();

  });


  /* ========================================
     화면 크기 변경 시 재계산
     ======================================== */

  window.addEventListener("resize", () => {

    signatureSwiper.update();

    ScrollTrigger.refresh();

    updateScrollControls();

  });

});