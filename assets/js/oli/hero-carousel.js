(function () {
  var overlays = Array.prototype.slice.call(document.querySelectorAll("[data-oli-overlay]"));
  if (!overlays.length) return;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function parsePoint(value) {
    var parts = String(value || "50% 50%").trim().split(/\s+/);
    function parseAxis(token) {
      token = String(token || "50%").toLowerCase();
      if (token === "left" || token === "top") return 0;
      if (token === "center") return 0.5;
      if (token === "right" || token === "bottom") return 1;
      if (token.indexOf("%") !== -1) return clamp(parseFloat(token) / 100, 0, 1);
      var number = parseFloat(token);
      return Number.isFinite(number) ? clamp(number > 1 ? number / 100 : number, 0, 1) : 0.5;
    }
    return { x: parseAxis(parts[0]), y: parseAxis(parts[1] || parts[0]) };
  }

  function positionSlide(overlay, slide, dimensions) {
    var width = overlay.clientWidth;
    var height = overlay.clientHeight;
    if (!width || !height || !dimensions.width || !dimensions.height) return;
    var focal = parsePoint(slide.dataset.focalPoint);
    var anchor = parsePoint(slide.dataset.anchorPoint);
    var scale = Math.max(width / dimensions.width, height / dimensions.height);
    var renderedWidth = dimensions.width * scale;
    var renderedHeight = dimensions.height * scale;
    var left = clamp(anchor.x * width - focal.x * renderedWidth, width - renderedWidth, 0);
    var top = clamp(anchor.y * height - focal.y * renderedHeight, height - renderedHeight, 0);
    slide.style.backgroundPosition = left + "px " + top + "px";
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
      };
      image.onerror = reject;
      image.src = url;
    });
  }

  function positionOverlay(overlay) {
    Array.prototype.slice.call(overlay.querySelectorAll("[data-oli-overlay-slide]")).forEach(function (slide) {
      var url = slide.dataset.oliOverlayImage;
      if (!url || url.indexOf(".svg") !== -1) {
        slide.style.backgroundPosition = "center";
        return;
      }
      loadImage(url).then(function (dimensions) {
        positionSlide(overlay, slide, dimensions);
      }).catch(function () {
        slide.style.backgroundPosition = "center";
      });
    });
  }

  function setupCarousel(overlay) {
    if (!overlay.hasAttribute("data-oli-overlay-carousel")) return;
    var slides = Array.prototype.slice.call(overlay.querySelectorAll("[data-oli-overlay-slide]"));
    if (slides.length < 2) return;
    var interval = parseInt(overlay.getAttribute("data-oli-overlay-interval"), 10) || 4200;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var current = 0;
    if (reduceMotion) return;
    window.setInterval(function () {
      slides[current].classList.remove("is-active");
      slides[current].setAttribute("aria-hidden", "true");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
      slides[current].removeAttribute("aria-hidden");
    }, interval);
  }

  overlays.forEach(function (overlay) {
    positionOverlay(overlay);
    setupCarousel(overlay);
    window.addEventListener("resize", function () {
      positionOverlay(overlay);
    });
  });
})();
