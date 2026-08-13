/* reveal.
 *
 * every element carrying [data-reveal] animates exactly once, in dom order.
 * dom order is authored to equal reading order: within a grid row, left to
 * right; then down to the next row.
 *
 *   [data-reveal]        -> fade + slide up   (text)
 *   [data-reveal=image]  -> fade only         (images)
 *
 * stagger is measured between STARTS, so animations overlap.
 *
 * entry pages fit one screen, so everything is in view at load and runs as
 * one staggered sequence. post pages scroll, so anything starting below the
 * fold waits until it is scrolled into view — otherwise it would animate
 * where nobody can see it.
 */
(function () {
  "use strict";

  function show(el, step) {
    el.style.setProperty("--i", step);
    el.classList.add("is-revealed");
  }

  function init() {
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll("[data-reveal]")
    );
    if (!nodes.length) return;

    var above = [];
    var below = [];

    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].getBoundingClientRect().top < window.innerHeight) {
        above.push(nodes[i]);
      } else {
        below.push(nodes[i]);
      }
    }

    /* in view at load: one staggered sequence, dom order. */
    for (var j = 0; j < above.length; j++) show(above[j], j);

    if (!below.length) return;

    /* no observer support: show it rather than hide it. */
    if (!("IntersectionObserver" in window)) {
      for (var k = 0; k < below.length; k++) show(below[k], 0);
      return;
    }

    /* below the fold: reveal on entry, once, never replayed. */
    var io = new IntersectionObserver(
      function (entries) {
        var step = 0;
        for (var n = 0; n < entries.length; n++) {
          if (!entries[n].isIntersecting) continue;
          show(entries[n].target, step++);
          io.unobserve(entries[n].target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    for (var m = 0; m < below.length; m++) io.observe(below[m]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
