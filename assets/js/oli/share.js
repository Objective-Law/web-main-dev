(function () {
  var NATIVE_SHARE_NOOP_STORAGE_KEY = "oli-native-share-noop";

  function getStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function hasRecordedNativeShareNoop() {
    var storage = getStorage();
    if (!storage) return false;
    return storage.getItem(NATIVE_SHARE_NOOP_STORAGE_KEY) === "true";
  }

  function recordNativeShareNoop() {
    var storage = getStorage();
    if (!storage) return;
    storage.setItem(NATIVE_SHARE_NOOP_STORAGE_KEY, "true");
  }

  function matchesMedia(query) {
    return window.matchMedia && window.matchMedia(query).matches;
  }

  function isLikelyTouchShareSurface() {
    var hasTouchPoints = typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0;
    var coarsePointer = matchesMedia("(pointer: coarse)");
    var noHover = matchesMedia("(hover: none)");
    var narrowViewport = matchesMedia("(max-width: 900px)");

    return hasTouchPoints || coarsePointer || noHover || narrowViewport;
  }

  function isSafariFamily() {
    var userAgent = navigator.userAgent || "";
    return /Safari\//.test(userAgent) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/.test(userAgent);
  }

  function isApplePlatform() {
    var userAgentDataPlatform = navigator.userAgentData && navigator.userAgentData.platform;
    if (typeof userAgentDataPlatform === "string") {
      var normalizedPlatform = userAgentDataPlatform.toLowerCase();
      if (normalizedPlatform.indexOf("mac") !== -1 || normalizedPlatform.indexOf("ios") !== -1) {
        return true;
      }
    }

    var platform = (navigator.platform || "").toLowerCase();
    if (/mac|iphone|ipad|ipod/.test(platform)) {
      return true;
    }

    var userAgent = navigator.userAgent || "";
    return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
  }

  function getShareData(element) {
    return {
      title: element.getAttribute("data-share-title") || document.title,
      text: element.getAttribute("data-share-text") || undefined,
      url: element.getAttribute("data-share-url") || window.location.href
    };
  }

  function canUseNativeShare(element) {
    if (hasRecordedNativeShareNoop() || !window.isSecureContext || typeof navigator.share !== "function") {
      return false;
    }

    if (!isLikelyTouchShareSurface() && !(isApplePlatform() && isSafariFamily())) {
      return false;
    }

    var shareData = getShareData(element);
    if (typeof navigator.canShare === "function" && shareData.files && shareData.files.length) {
      try {
        return navigator.canShare(shareData);
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  function attemptNativeShare(shareData) {
    try {
      return Promise.resolve(navigator.share(shareData));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function performNativeShare(shareData) {
    return new Promise(function (resolve, reject) {
      var interactionObserved = false;
      var startedAt = Date.now();

      function markInteraction() {
        interactionObserved = true;
      }

      function cleanup() {
        window.removeEventListener("blur", markInteraction, true);
        document.removeEventListener("visibilitychange", markInteraction, true);
        window.removeEventListener("pagehide", markInteraction, true);
      }

      window.addEventListener("blur", markInteraction, true);
      document.addEventListener("visibilitychange", markInteraction, true);
      window.addEventListener("pagehide", markInteraction, true);

      attemptNativeShare(shareData)
        .then(function () {
          var elapsed = Date.now() - startedAt;
          cleanup();

          if (!interactionObserved && elapsed < 120) {
            recordNativeShareNoop();
            resolve({ status: "noop" });
            return;
          }

          resolve({ status: "shared" });
        })
        .catch(function (error) {
          cleanup();
          reject(error);
        });
    });
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return Promise.resolve();
  }

  function feedback(root, message) {
    var node = root.querySelector("[data-oli-share-feedback]");
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    window.clearTimeout(root._oliShareTimer);
    root._oliShareTimer = window.setTimeout(function () {
      node.hidden = true;
      node.textContent = "";
    }, 2200);
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-oli-share]")).forEach(function (root) {
    Array.prototype.slice.call(root.querySelectorAll("[data-oli-share-popup]")).forEach(function (link) {
      link.addEventListener("click", function (event) {
        var popup = window.open(link.href, "oli-share", "width=620,height=540,menubar=no,toolbar=no,resizable=yes,scrollbars=yes");
        if (popup) {
          event.preventDefault();
          popup.focus();
        }
      });
    });

    var nativeButton = root.querySelector("[data-oli-native-share]");
    if (nativeButton) {
      if (!canUseNativeShare(nativeButton)) {
        nativeButton.hidden = true;
        nativeButton.setAttribute("aria-hidden", "true");
      } else {
        nativeButton.hidden = false;
        nativeButton.removeAttribute("aria-hidden");
      }

      nativeButton.addEventListener("click", function () {
        if (!canUseNativeShare(nativeButton)) {
          nativeButton.hidden = true;
          nativeButton.setAttribute("aria-hidden", "true");
          return;
        }

        var shareData = getShareData(nativeButton);
        performNativeShare(shareData)
          .then(function (result) {
            if (result && result.status === "noop") {
              nativeButton.hidden = true;
              nativeButton.setAttribute("aria-hidden", "true");
              copy(shareData.url).then(function () {
                feedback(root, "Copied to clipboard");
              });
            }
          })
          .catch(function (error) {
            if (!error || error.name === "AbortError") return;
            copy(shareData.url).then(function () {
              feedback(root, "Copied to clipboard");
            });
          });
      });
    }

    var copyButton = root.querySelector("[data-oli-copy-link]");
    if (copyButton) {
      copyButton.addEventListener("click", function () {
        copy(copyButton.getAttribute("data-share-url") || window.location.href).then(function () {
          feedback(root, "Copied to clipboard");
        });
      });
    }

    var printButton = root.querySelector("[data-oli-print]");
    if (printButton) {
      printButton.addEventListener("click", function () {
        window.print();
      });
    }
  });
})();
