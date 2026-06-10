(function () {
  var annotations = Array.prototype.slice.call(document.querySelectorAll("[data-oli-annotation]"));
  if (!annotations.length) return;

  var data = window.OLI_ANNOTATIONS || {};
  var glossary = data.glossary || {};
  var references = data.references || {};
  var pageCitations = data.pageCitations || {};
  var coarsePointer = window.matchMedia("(pointer: coarse)");
  var viewportMargin = 12;
  var popoverGap = 10;
  var hoverTimer = null;
  var activeAnnotation = null;
  var activePinned = null;
  var dismissedAnnotation = null;

  var layer = document.querySelector("[data-oli-annotation-layer]");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "oli-annotation-layer";
    layer.setAttribute("data-oli-annotation-layer", "");
    document.body.appendChild(layer);
  }
  layer.className = "oli-annotation-layer";
  layer.setAttribute("data-open", "false");

  var popover = document.createElement("span");
  popover.className = "oli-annotation__popover";
  popover.id = "oli-annotation-popover";
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-modal", "false");
  popover.setAttribute("aria-labelledby", "oli-annotation-heading");
  popover.hidden = true;
  popover.innerHTML = [
    '<span class="oli-annotation__card">',
    '<button class="oli-annotation__close" type="button" data-oli-annotation-close hidden aria-label="Close popover"><span aria-hidden="true">&times;</span></button>',
    '<span class="oli-annotation__eyebrow"></span>',
    '<span class="oli-annotation__heading" id="oli-annotation-heading"></span>',
    '<span class="oli-annotation__body"></span>',
    '</span>'
  ].join("");
  layer.appendChild(popover);

  var parts = {
    eyebrow: popover.querySelector(".oli-annotation__eyebrow"),
    heading: popover.querySelector(".oli-annotation__heading"),
    body: popover.querySelector(".oli-annotation__body"),
    close: popover.querySelector("[data-oli-annotation-close]")
  };

  function escapeHTML(value) {
    var div = document.createElement("div");
    div.textContent = value || "";
    return div.innerHTML;
  }

  function para(value) {
    return value ? '<span class="oli-annotation__para">' + escapeHTML(value) + "</span>" : "";
  }

  function contentFor(annotation) {
    var kind = annotation.getAttribute("data-annotation-kind");
    var source;

    if (kind === "glossary") {
      source = glossary[annotation.getAttribute("data-entry-id")] || {};
      return {
        eyebrow: "Glossary",
        heading: source.term || "Glossary",
        body: [para(source.short), para(source.long)].filter(Boolean).join("")
      };
    }

    if (kind === "citation") {
      var sourceId = annotation.getAttribute("data-source-id") || pageCitations[annotation.getAttribute("data-citation-label")] || "";
      source = references[sourceId] || {};
      return {
        eyebrow: "Citation",
        heading: source.title || "Citation",
        body: [
          para([source.author, source.year].filter(Boolean).join(", ")),
          para(source.summary),
          source.url ? '<span class="oli-annotation__para"><a href="' + escapeHTML(source.url) + '" target="_blank" rel="noopener">Open source</a></span>' : ""
        ].filter(Boolean).join("")
      };
    }

    return { eyebrow: "Note", heading: "Note", body: para("No annotation text is available yet.") };
  }

  function setExpanded(annotation, expanded) {
    annotation.setAttribute("aria-expanded", expanded ? "true" : "false");
    annotation.setAttribute("data-open", expanded ? "true" : "false");
  }

  function clearHoverTimer() {
    if (hoverTimer) window.clearTimeout(hoverTimer);
    hoverTimer = null;
  }

  function getTriggerVisualRect(trigger) {
    var rects = trigger ? Array.prototype.slice.call(trigger.getClientRects()).filter(function (rect) {
      return rect.width > 0 && rect.height > 0;
    }) : [];

    if (!rects.length) {
      return trigger ? trigger.getBoundingClientRect() : null;
    }

    return rects.reduce(function (selected, rect) {
      if (rect.bottom > selected.bottom) return rect;
      if (rect.bottom === selected.bottom && rect.left > selected.left) return rect;
      return selected;
    }, rects[0]);
  }

  function positionPopover() {
    if (!activeAnnotation || popover.hidden) return;
    var rect = getTriggerVisualRect(activeAnnotation);
    if (!rect) return;
    popover.style.removeProperty("--oli-annotation-left");
    popover.style.removeProperty("--oli-annotation-top");
    popover.style.removeProperty("--oli-annotation-pointer");

    var popoverRect = popover.getBoundingClientRect();
    var width = popoverRect.width || Math.min(448, window.innerWidth - viewportMargin * 2);
    var centeredLeft = rect.left + rect.width / 2 - width / 2;
    var maxLeft = window.innerWidth - width - viewportMargin;
    var left = Math.min(Math.max(centeredLeft, viewportMargin), Math.max(viewportMargin, maxLeft));
    var pointer = Math.min(Math.max(rect.left + rect.width / 2 - left, 18), width - 18);
    var top = rect.bottom + popoverGap;

    if (top + popoverRect.height > window.innerHeight - viewportMargin) {
      top = Math.max(viewportMargin, rect.top - popoverRect.height - popoverGap);
      popover.setAttribute("data-placement", "top");
    } else {
      popover.setAttribute("data-placement", "bottom");
    }

    popover.style.setProperty("--oli-annotation-left", left.toFixed(2) + "px");
    popover.style.setProperty("--oli-annotation-top", Math.max(viewportMargin, top).toFixed(2) + "px");
    popover.style.setProperty("--oli-annotation-pointer", pointer.toFixed(2) + "px");
  }

  function closeActive(options) {
    var settings = options || {};
    clearHoverTimer();
    if (settings.dismiss && activeAnnotation) dismissedAnnotation = activeAnnotation;
    if (activeAnnotation) setExpanded(activeAnnotation, false);
    activeAnnotation = null;
    activePinned = null;
    popover.hidden = true;
    parts.close.hidden = true;
    layer.setAttribute("data-open", "false");
  }

  function openAnnotation(annotation, options) {
    var settings = options || {};
    if (dismissedAnnotation === annotation && !settings.force) return;
    if (activeAnnotation && activeAnnotation !== annotation) setExpanded(activeAnnotation, false);

    var content = contentFor(annotation);
    activeAnnotation = annotation;
    activePinned = settings.pin ? annotation : null;
    setExpanded(annotation, true);
    parts.eyebrow.textContent = content.eyebrow;
    parts.heading.textContent = content.heading;
    parts.body.innerHTML = content.body || para("No annotation text is available yet.");
    parts.close.hidden = !activePinned;
    popover.hidden = false;
    layer.setAttribute("data-open", "true");
    layer.setAttribute("data-kind", annotation.getAttribute("data-annotation-kind") || "annotation");
    positionPopover();
    window.requestAnimationFrame(positionPopover);
  }

  function scheduleHoverClose() {
    clearHoverTimer();
    if (activePinned) return;
    hoverTimer = window.setTimeout(function () {
      var activeElement = document.activeElement;
      if (activeAnnotation && (activeAnnotation.matches(":hover") || popover.matches(":hover") || activeAnnotation.contains(activeElement) || popover.contains(activeElement))) {
        return;
      }
      closeActive();
    }, 140);
  }

  annotations.forEach(function (annotation) {
    annotation.setAttribute("data-open", "false");

    annotation.addEventListener("mouseenter", function () {
      if (coarsePointer.matches || (activePinned && activePinned !== annotation)) return;
      clearHoverTimer();
      openAnnotation(annotation);
    });

    annotation.addEventListener("mouseleave", function () {
      if (dismissedAnnotation === annotation) dismissedAnnotation = null;
      scheduleHoverClose();
    });

    annotation.addEventListener("focusin", function () {
      if (coarsePointer.matches || (activePinned && activePinned !== annotation)) return;
      clearHoverTimer();
      openAnnotation(annotation);
    });

    annotation.addEventListener("focusout", function () {
      if (dismissedAnnotation === annotation) dismissedAnnotation = null;
      window.setTimeout(scheduleHoverClose, 0);
    });

    annotation.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      dismissedAnnotation = null;
      if (activePinned === annotation) {
        closeActive();
        return;
      }
      openAnnotation(annotation, { pin: true, force: true });
    });

    annotation.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        dismissedAnnotation = null;
        openAnnotation(annotation, { pin: true, force: true });
      } else if (event.key === "Escape") {
        closeActive({ dismiss: true });
      }
    });
  });

  popover.addEventListener("mouseenter", clearHoverTimer);
  popover.addEventListener("mouseleave", scheduleHoverClose);
  popover.addEventListener("focusin", clearHoverTimer);
  popover.addEventListener("focusout", function () {
    window.setTimeout(scheduleHoverClose, 0);
  });

  parts.close.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    var trigger = activeAnnotation;
    closeActive({ dismiss: true });
    if (trigger && document.activeElement !== trigger) {
      try {
        trigger.focus({ preventScroll: true });
      } catch (error) {
        trigger.focus();
      }
    }
  });

  document.addEventListener("click", function (event) {
    if (activePinned && !popover.contains(event.target) && !event.target.closest("[data-oli-annotation]")) closeActive();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && activeAnnotation) {
      closeActive({ dismiss: true });
    }
  });

  window.addEventListener("scroll", function () {
    if (activeAnnotation) positionPopover();
  }, { passive: true });
  window.addEventListener("resize", closeActive);
})();
