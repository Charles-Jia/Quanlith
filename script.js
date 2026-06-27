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

  /* ---- Background videos ----
     Hero (first section) loads eagerly. The rest preload sequentially in
     document order once the hero is ready, and each shows its poster frame
     until its own data has buffered. A video scrolled into view loads
     immediately regardless of the queue. */
  const videos = [...document.querySelectorAll("video.media__vid")];
  videos.forEach((v) => {
    v.muted = true;
    v.setAttribute("muted", "");
    v.playsInline = true;
  });

  const tryPlay = (v) => {
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };
  const ensureSrc = (v) => {
    if (!v.src && v.dataset.src) {
      v.src = v.dataset.src;
      v.load();
    }
  };

  // Ordered preload chain for the section-2+ videos (those with data-src).
  const lazy = videos.filter((v) => v.dataset.src);
  let qi = 0;
  const pump = () => {
    if (qi >= lazy.length) return;
    const v = lazy[qi++];
    ensureSrc(v);
    const advance = () => {
      v.removeEventListener("loadeddata", advance);
      v.removeEventListener("error", advance);
      pump();
    };
    v.addEventListener("loadeddata", advance, { once: true });
    v.addEventListener("error", advance, { once: true });
  };
  let chained = false;
  const startChain = () => {
    if (chained) return;
    chained = true;
    pump();
  };

  const hero = videos[0];
  if (hero && !hero.dataset.src) {
    if (hero.readyState >= 3) startChain();
    else hero.addEventListener("canplaythrough", startChain, { once: true });
    setTimeout(startChain, 3500); // fallback so the chain never stalls
  } else {
    startChain();
  }

  // Play while in view; load on demand if reached before its turn in the queue.
  if ("IntersectionObserver" in window) {
    const vo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ensureSrc(e.target);
            tryPlay(e.target);
          } else {
            e.target.pause();
          }
        });
      },
      { threshold: 0.2, rootMargin: "300px 0px" }
    );
    videos.forEach((v) => vo.observe(v));
  } else {
    videos.forEach((v) => {
      ensureSrc(v);
      tryPlay(v);
    });
  }
})();
