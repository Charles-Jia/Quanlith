/* ================================================================
   QUANLITH — interactions
   ================================================================ */
(function () {
  "use strict";

  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav__links");

  /* ---- Nav: shrink/blur on scroll ---- */
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navLinks.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            // gentle stagger for grouped siblings
            const delay = Math.min(i * 60, 180);
            e.target.style.transitionDelay = delay + "ms";
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---- Background videos: ensure playback + play only while in view ---- */
  const videos = document.querySelectorAll("video.media__vid");
  videos.forEach((v) => {
    v.muted = true;
    v.setAttribute("muted", "");
    v.playsInline = true;
  });
  const tryPlay = (v) => {
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };
  if ("IntersectionObserver" in window) {
    const vo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) tryPlay(e.target);
          else e.target.pause();
        });
      },
      { threshold: 0.2 }
    );
    videos.forEach((v) => vo.observe(v));
  } else {
    videos.forEach(tryPlay);
  }
})();
