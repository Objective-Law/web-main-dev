(function () {
  const root = document.documentElement;
  const masthead = document.querySelector(".masthead");
  const hashClearance = 24;
  let copiedTimerId = 0;

  function getHeaderLinks() {
    return Array.from(document.querySelectorAll(".page__content .header-link"));
  }

  function getPermalink(targetHash) {
    const url = new URL(window.location.href);
    url.hash = targetHash;
    return url.toString();
  }

  function setMastheadOffset() {
    if (!masthead) {
      return 0;
    }

    const offset = Math.ceil(masthead.getBoundingClientRect().height);
    root.style.setProperty("--oli-masthead-offset", offset + "px");
    return offset;
  }

  function getHashTarget() {
    if (!window.location.hash) {
      return null;
    }

    return document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  }

  function scrollHashTargetIntoPlace() {
    const target = getHashTarget();

    if (!target) {
      return;
    }

    const mastheadOffset = setMastheadOffset() + hashClearance;
    const top = Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - mastheadOffset));

    window.scrollTo({
      top: top,
      behavior: "auto"
    });
  }

  function queueHashTargetScroll() {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(scrollHashTargetIntoPlace);
    });
  }

  function markCopied(link) {
    const headerLinks = getHeaderLinks();

    window.clearTimeout(copiedTimerId);
    headerLinks.forEach(function (item) {
      item.classList.remove("is-copied");
      item.setAttribute("aria-label", "Copy permalink");
      item.title = "Copy permalink";
    });

    link.classList.add("is-copied");
    link.setAttribute("aria-label", "Permalink copied");
    link.title = "Permalink copied";

    let toast = link.querySelector(".oli-permalink-toast");

    if (!toast) {
      toast = document.createElement("span");
      toast.className = "oli-permalink-toast";
      toast.textContent = "Copied to clipboard";
      toast.setAttribute("aria-hidden", "true");
      link.appendChild(toast);
    }

    copiedTimerId = window.setTimeout(function () {
      link.classList.remove("is-copied");
      link.setAttribute("aria-label", "Copy permalink");
      link.title = "Copy permalink";
    }, 1600);
  }

  function fallbackCopy(text) {
    const activeElement = document.activeElement;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.padding = "0";
    textarea.style.border = "0";
    textarea.style.outline = "0";
    textarea.style.boxShadow = "none";
    textarea.style.background = "transparent";
    textarea.style.color = "transparent";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    textarea.style.zIndex = "-1";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    document.body.removeChild(textarea);

    if (activeElement && typeof activeElement.focus === "function") {
      activeElement.focus();
    }

    return copied;
  }

  function copyPermalink(link) {
    const href = link.getAttribute("href");

    if (!href || href.charAt(0) !== "#") {
      return Promise.resolve(false);
    }

    const permalink = getPermalink(href);

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(permalink).then(function () {
        markCopied(link);
        return true;
      }, function () {
        if (fallbackCopy(permalink)) {
          markCopied(link);
          return true;
        }

        return false;
      });
    }

    if (fallbackCopy(permalink)) {
      markCopied(link);
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

  function handlePermalinkActivation(event, link) {
    event.preventDefault();
    event.stopPropagation();
    copyPermalink(link);
  }

  function clusterTrailingHeadingToken(link) {
    if (link.closest(".oli-heading-anchor-cluster")) {
      return;
    }

    const heading = link.parentElement;

    if (!heading || !heading.matches("h1, h2, h3, h4, h5, h6")) {
      return;
    }

    let trailingNode = link.previousSibling;

    while (trailingNode && trailingNode.nodeType === Node.TEXT_NODE && trailingNode.textContent.trim() === "") {
      trailingNode = trailingNode.previousSibling;
    }

    if (!trailingNode || trailingNode.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const trailingText = trailingNode.textContent;
    const match = trailingText.match(/^([\s\S]*?)(\s+)(\S+)\s*$/) ||
      trailingText.match(/^(\s*)(\S+)\s*$/);

    if (!match) {
      return;
    }

    const hasPrecedingText = match.length === 4;
    const prefix = hasPrecedingText ? match[1] + match[2] : match[1];
    const finalToken = hasPrecedingText ? match[3] : match[2];

    if (!finalToken) {
      return;
    }

    const cluster = document.createElement("span");
    cluster.className = "oli-heading-anchor-cluster";
    trailingNode.textContent = prefix;
    cluster.appendChild(document.createTextNode(finalToken));
    heading.insertBefore(cluster, link);
    cluster.appendChild(link);
  }

  function syncHeaderLinks() {
    getHeaderLinks().forEach(function (link) {
      Array.from(link.childNodes).forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === "Permalink") {
          node.remove();
        } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("sr-only")) {
          node.remove();
        }
      });

      if (!link.hasAttribute("aria-label") || link.getAttribute("aria-label") === "Permalink copied") {
        link.setAttribute("aria-label", "Copy permalink");
      }

      if (!link.title || link.title === "Permalink") {
        link.title = "Copy permalink";
      }

      clusterTrailingHeadingToken(link);

      if (link.dataset.oliPermalinkBound === "true") {
        return;
      }

      link.dataset.oliPermalinkBound = "true";
      link.addEventListener("click", function (event) {
        handlePermalinkActivation(event, link);
      });
      link.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        handlePermalinkActivation(event, link);
      });
    });
  }

  if (window.MutationObserver) {
    const observer = new MutationObserver(syncHeaderLinks);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  setMastheadOffset();
  syncHeaderLinks();
  window.addEventListener("resize", setMastheadOffset);
  window.addEventListener("load", function () {
    setMastheadOffset();
    syncHeaderLinks();
    queueHashTargetScroll();
  });
  window.addEventListener("hashchange", function () {
    setMastheadOffset();
    syncHeaderLinks();
    queueHashTargetScroll();
  });
})();
