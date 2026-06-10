(function () {
  var widgets = Array.prototype.slice.call(document.querySelectorAll("[data-oli-toc-widget]"));
  if (!widgets.length) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileQuery = window.matchMedia("(max-width: 767px)");
  var masthead = document.querySelector(".masthead");

  function clampLevel(value, fallback) {
    var parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.max(1, Math.min(6, parsed));
  }

  function slugify(text) {
    return (text || "")
      .toLowerCase()
      .trim()
      .replace(/['".,()/:[\]!?]+/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function scrollOffset() {
    if (!masthead) return 12;
    return Math.ceil(masthead.getBoundingClientRect().height) + 12;
  }

  function absoluteTop(element) {
    return Math.round(element.getBoundingClientRect().top + window.scrollY);
  }

  function headingLabel(heading) {
    var clone = heading.cloneNode(true);
    Array.prototype.slice.call(clone.querySelectorAll(".header-link, .sr-only, .screen-reader-text")).forEach(function (node) {
      node.remove();
    });
    return (clone.textContent || "").replace(/\s+/g, " ").trim();
  }

  function hiddenHeading(heading) {
    if (!heading || heading.hidden || heading.closest("[hidden]")) return true;
    if (heading.closest(".sidebar__right, .toc, nav, aside, .page__meta, footer, .oli-share, .oli-resource-page__meta")) return true;
    return heading.getClientRects().length === 0;
  }

  function init(widget) {
    var toggle = widget.querySelector("[data-oli-toc-widget-toggle]");
    var panel = widget.querySelector("[data-oli-toc-widget-panel]");
    var closeButton = widget.querySelector("[data-oli-toc-widget-close]");
    var list = widget.querySelector("[data-oli-toc-widget-list]");
    var page = widget.closest(".page");
    var content = page ? page.querySelector(".page__content") : null;
    var footer = document.querySelector(".page__footer");
    var minLevel = clampLevel(widget.getAttribute("data-min-level"), 2);
    var maxLevel = Math.max(minLevel, clampLevel(widget.getAttribute("data-max-level"), 4));
    var minHeadings = Math.max(1, parseInt(widget.getAttribute("data-min-headings") || "2", 10));
    var selectors = [];
    var items = [];
    var activeId = "";
    var open = false;
    var ticking = false;

    if (!toggle || !panel || !list || !content) {
      widget.hidden = true;
      return;
    }

    if (widget.parentNode !== document.body) document.body.appendChild(widget);
    for (var level = minLevel; level <= maxLevel; level += 1) selectors.push("h" + level);

    function closePanel() {
      open = false;
      widget.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
      document.body.classList.remove("oli-toc-widget--overlay-open");
    }

    function hideWidget() {
      widget.hidden = true;
      closePanel();
    }

    function ensureId(heading, usedIds) {
      if (heading.id) {
        usedIds.add(heading.id);
        return heading.id;
      }
      var base = slugify(headingLabel(heading)) || "section";
      var candidate = base;
      var index = 2;
      while (usedIds.has(candidate) || document.getElementById(candidate)) {
        candidate = base + "-" + index;
        index += 1;
      }
      heading.id = candidate;
      usedIds.add(candidate);
      return candidate;
    }

    function scrollToTarget(target) {
      window.scrollTo({
        top: Math.max(0, absoluteTop(target) - scrollOffset()),
        behavior: reducedMotion.matches ? "auto" : "smooth"
      });
    }

    function buildButton(item) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.className = "oli-toc-widget__link";
      button.dataset.targetId = item.id;
      button.textContent = item.label;
      if (item.level > 0) button.classList.add("oli-toc-widget__link--level-" + item.level);
      button.addEventListener("click", function () {
        if (item.id === "top") {
          window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
        } else {
          scrollToTarget(item.target);
        }
        if (mobileQuery.matches) closePanel();
      });
      li.appendChild(button);
      return li;
    }

    function footerClearance() {
      if (!footer) {
        widget.style.setProperty("--oli-toc-widget-lift", "0px");
        return;
      }
      var footerRect = footer.getBoundingClientRect();
      var styles = window.getComputedStyle(widget);
      var baseBottom = parseFloat(styles.getPropertyValue("--oli-toc-widget-base-bottom")) || 0;
      var lift = Math.max(0, Math.ceil(window.innerHeight - footerRect.top + 16 - baseBottom));
      widget.style.setProperty("--oli-toc-widget-lift", lift + "px");
    }

    function updateActive() {
      if (!items.length) return;
      var marker = window.scrollY + scrollOffset() + 16;
      var nextActive = "top";
      items.forEach(function (item) {
        if (absoluteTop(item.target) <= marker) nextActive = item.id;
      });
      if (Math.ceil(window.scrollY + window.innerHeight) >= Math.ceil(document.documentElement.scrollHeight) - 4) {
        nextActive = items[items.length - 1].id;
      }
      if (activeId === nextActive) return;
      activeId = nextActive;
      Array.prototype.slice.call(list.querySelectorAll(".oli-toc-widget__link")).forEach(function (button) {
        var active = button.dataset.targetId === activeId;
        button.classList.toggle("is-active", active);
        if (active) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
    }

    function render() {
      var usedIds = new Set(Array.prototype.slice.call(document.querySelectorAll("[id]")).map(function (element) {
        return element.id;
      }));
      var headings = Array.prototype.slice.call(content.querySelectorAll(selectors.join(","))).filter(function (heading) {
        return headingLabel(heading) && !hiddenHeading(heading);
      });
      items = headings.map(function (heading) {
        return {
          id: ensureId(heading, usedIds),
          label: headingLabel(heading),
          level: parseInt(heading.tagName.slice(1), 10),
          target: heading
        };
      });
      if (items.length < minHeadings) {
        hideWidget();
        return;
      }
      widget.hidden = false;
      list.innerHTML = "";
      list.appendChild(buildButton({ id: "top", label: "Top", level: 0, target: content }));
      items.forEach(function (item) {
        list.appendChild(buildButton(item));
      });
      footerClearance();
      updateActive();
      closePanel();
    }

    toggle.addEventListener("click", function () {
      open = !open;
      widget.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
      document.body.classList.toggle("oli-toc-widget--overlay-open", open && mobileQuery.matches);
      updateActive();
    });
    closeButton.addEventListener("click", function () {
      closePanel();
      toggle.focus();
    });
    document.addEventListener("click", function (event) {
      if (open && !widget.contains(event.target)) closePanel();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && open) {
        closePanel();
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      footerClearance();
      updateActive();
    });
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        footerClearance();
        updateActive();
      });
    }, { passive: true });
    window.addEventListener("load", render);
    render();
  }

  widgets.forEach(init);
})();
