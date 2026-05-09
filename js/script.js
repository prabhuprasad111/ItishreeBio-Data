/**
 * Marriage Portfolio - Itishree Lenka
 * Features: print handler, scroll animations, EN/OR language switcher.
 */

(function () {
  "use strict";

  var STORAGE_KEY = "portfolio.lang";
  var SUPPORTED = ["en", "or"];
  var DEFAULT_LANG = "en";

  document.addEventListener("DOMContentLoaded", function () {
    initLanguage();
    initPrintButton();
    initEntranceAnimation();
  });

  /* =========================================================
     LANGUAGE SWITCHER
     ========================================================= */

  /**
   * Read saved language (or default), apply to DOM, and bind toggle buttons.
   */
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
   * Apply language to all elements that carry data-en / data-or attributes.
   * Use innerHTML when data-html="true" (because some translations contain
   * markup like <strong>, <br>, or <sup>); otherwise use textContent for safety.
   */
  function applyLanguage(lang) {
    var root = document.documentElement;
    root.setAttribute("lang", lang);

    var nodes = document.querySelectorAll("[data-en], [data-or]");
    nodes.forEach(function (el) {
      var text = el.getAttribute("data-" + lang);
      if (text === null) return;
      var useHtml = el.getAttribute("data-html") === "true" || /<[a-z][\s\S]*>/i.test(text);
      if (useHtml) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    var titleAttrs = document.querySelectorAll(
      "[data-en-title], [data-or-title]"
    );
    titleAttrs.forEach(function (el) {
      var t = el.getAttribute("data-" + lang + "-title");
      if (t) el.setAttribute("title", t);
    });

    var buttons = document.querySelectorAll(".lang-btn[data-lang]");
    buttons.forEach(function (btn) {
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      }
    });

    var docTitleNode = document.querySelector("title[data-" + lang + "]");
    if (docTitleNode) {
      var newTitle = docTitleNode.getAttribute("data-" + lang);
      if (newTitle) document.title = newTitle;
    }
  }

  /* =========================================================
     PRINT
     ========================================================= */

  function initPrintButton() {
    var btn = document.getElementById("printBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.print();
    });
  }

  /* =========================================================
     ENTRANCE ANIMATIONS
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

    targets.forEach(function (el) {
      observer.observe(el);
    });
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
