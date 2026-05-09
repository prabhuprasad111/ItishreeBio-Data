/**
 * Marriage Portfolio - Itishree Lenka  ::  "Subha Sambandha"
 * ─────────────────────────────────────────────────────────
 * Features:
 *   • Splash / opening animation (Ganesha + mantra + curtain reveal)
 *   • Right-to-left auto photo slider with dot navigation
 *   • EN / OR (Odia) language switcher (persisted in localStorage)
 *   • Bilingual PDF download with auto filename = BIODATA_*
 *   • Subtle scroll-in animations
 */

(function () {
  "use strict";

  var STORAGE_KEY = "portfolio.lang";
  var SUPPORTED = ["en", "or"];
  var DEFAULT_LANG = "en";

  /** Public app state */
  var state = {
    currentLang: DEFAULT_LANG,
    sliderInterval: null,
    sliderPaused: false
  };

  document.addEventListener("DOMContentLoaded", function () {
    initSplash();
    initLanguage();
    initPhotoSlider();
    initDownloadButtons();
    initEntranceAnimation();
  });

  /* =========================================================
     SPLASH / OPENING ANIMATION
     ========================================================= */

  /**
   * Show the splash overlay for ~3.5s, then part the curtains
   * and fade out to reveal the portfolio.
   * The user may dismiss early by clicking "Skip" or anywhere on the splash.
   */
  function initSplash() {
    var splash = document.getElementById("splash");
    var skipBtn = document.getElementById("splashSkip");
    if (!splash) return;

    document.body.classList.add("splash-active");

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      splash.classList.add("parting");
      window.setTimeout(function () {
        splash.classList.add("fade-out");
      }, 900);
      window.setTimeout(function () {
        splash.parentNode && splash.parentNode.removeChild(splash);
        document.body.classList.remove("splash-active");
      }, 1700);
    }

    var autoTimer = window.setTimeout(dismiss, 3400);

    if (skipBtn) {
      skipBtn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        window.clearTimeout(autoTimer);
        dismiss();
      });
    }
  }

  /* =========================================================
     LANGUAGE SWITCHER
     ========================================================= */

  function initLanguage() {
    var saved = safeGetItem(STORAGE_KEY);
    var lang = SUPPORTED.indexOf(saved) >= 0 ? saved : DEFAULT_LANG;

    applyLanguage(lang);

    var buttons = document.querySelectorAll(".lang-btn[data-lang]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-lang");
        if (SUPPORTED.indexOf(target) < 0) return;
        applyLanguage(target);
        safeSetItem(STORAGE_KEY, target);
      });
    });
  }

  /**
   * Apply language to all `[data-en][data-or]` elements.
   * Use innerHTML when content carries markup (set explicitly via data-html
   * or auto-detected); otherwise textContent for safety.
   */
  function applyLanguage(lang) {
    state.currentLang = lang;
    var root = document.documentElement;
    root.setAttribute("lang", lang);

    var nodes = document.querySelectorAll("[data-en], [data-or]");
    nodes.forEach(function (el) {
      var text = el.getAttribute("data-" + lang);
      if (text === null) return;
      var useHtml = el.getAttribute("data-html") === "true" ||
                    /<[a-z][\s\S]*>/i.test(text);
      if (useHtml) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    document.querySelectorAll("[data-en-title], [data-or-title]").forEach(function (el) {
      var t = el.getAttribute("data-" + lang + "-title");
      if (t) el.setAttribute("title", t);
    });

    document.querySelectorAll(".lang-btn[data-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    var docTitleNode = document.querySelector("title[data-" + lang + "]");
    if (docTitleNode) {
      var newTitle = docTitleNode.getAttribute("data-" + lang);
      if (newTitle) document.title = newTitle;
    }
  }

  /* =========================================================
     PHOTO SLIDER (right-to-left auto rotate)
     ========================================================= */

  function initPhotoSlider() {
    var slider = document.getElementById("photoSlider");
    var dotsWrap = document.getElementById("photoDots");
    if (!slider) return;

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".photo-slide"));
    var dots = dotsWrap
      ? Array.prototype.slice.call(dotsWrap.querySelectorAll(".photo-dot"))
      : [];
    if (slides.length < 2) return;

    var current = 0;

    function go(next) {
      if (next === current) return;
      var outgoing = slides[current];
      var incoming = slides[next];

      slides.forEach(function (s) { s.classList.remove("leaving"); });

      outgoing.classList.remove("active");
      outgoing.classList.add("leaving");
      incoming.classList.add("active");

      window.setTimeout(function () {
        outgoing.classList.remove("leaving");
      }, 950);

      dots.forEach(function (d, i) { d.classList.toggle("active", i === next); });
      current = next;
    }

    function nextSlide() {
      var n = (current + 1) % slides.length;
      go(n);
    }

    function startAuto() {
      stopAuto();
      state.sliderInterval = window.setInterval(function () {
        if (!state.sliderPaused) nextSlide();
      }, 4000);
    }
    function stopAuto() {
      if (state.sliderInterval) {
        window.clearInterval(state.sliderInterval);
        state.sliderInterval = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { go(i); });
    });

    slider.addEventListener("mouseenter", function () { state.sliderPaused = true; });
    slider.addEventListener("mouseleave", function () { state.sliderPaused = false; });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAuto(); else startAuto();
    });

    startAuto();
  }

  /* =========================================================
     PDF DOWNLOAD (English / Odia) with auto filename
     ========================================================= */

  /**
   * Browsers use document.title as the suggested PDF filename
   * when "Save as PDF" is chosen in the print dialog. We temporarily
   * swap the title to a clean "BIODATA_*" name, switch language if
   * needed, trigger window.print(), then restore everything afterwards.
   */
  function initDownloadButtons() {
    var items = document.querySelectorAll("[data-pdf-lang]");
    items.forEach(function (item) {
      item.addEventListener("click", function (ev) {
        ev.preventDefault();
        var lang = item.getAttribute("data-pdf-lang");
        if (SUPPORTED.indexOf(lang) < 0) return;
        downloadPdf(lang);
      });
    });
  }

  function downloadPdf(lang) {
    var prevLang = state.currentLang;
    var prevTitle = document.title;
    var pdfName = lang === "or"
      ? "BIODATA_Itishree_Lenka_Odia"
      : "BIODATA_Itishree_Lenka";

    var changed = (prevLang !== lang);
    if (changed) applyLanguage(lang);

    document.title = pdfName;

    var restored = false;
    function restore() {
      if (restored) return;
      restored = true;
      document.title = prevTitle;
      if (changed) applyLanguage(prevLang);
      window.removeEventListener("afterprint", restore);
    }
    window.addEventListener("afterprint", restore);
    window.setTimeout(restore, 60000);

    window.setTimeout(function () {
      try {
        window.print();
      } catch (e) {
        restore();
      }
    }, 350);
  }

  /* =========================================================
     ENTRANCE ANIMATIONS (scroll-in fade & rise)
     ========================================================= */

  function initEntranceAnimation() {
    var targets = document.querySelectorAll(
      ".hero-section, .profile-hero, .detail-card, .contact-card, .portfolio-footer"
    );

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
      return;
    }

    targets.forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.7s ease-out, transform 0.7s ease-out";
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* =========================================================
     STORAGE HELPERS (defensive — private/incognito blocks LS)
     ========================================================= */

  function safeGetItem(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeSetItem(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) { /* ignore */ }
  }
})();
