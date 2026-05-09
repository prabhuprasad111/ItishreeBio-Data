/**
 * Marriage Portfolio - Itishree Lenka
 * Light interactivity: print handler + subtle entrance animation.
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initPrintButton();
    initEntranceAnimation();
  });

  /**
   * Bind the Print / Save-as-PDF action.
   * Browsers expose a "Save as PDF" destination in the print dialog,
   * so this single handler covers both flows.
   */
  function initPrintButton() {
    var btn = document.getElementById("printBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      window.print();
    });
  }

  /**
   * Fade-and-rise the major sections into view as they enter the viewport.
   * Falls back gracefully if IntersectionObserver is unavailable.
   */
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
      el.style.transition =
        "opacity 0.7s ease-out, transform 0.7s ease-out";
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
})();
