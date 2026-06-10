(function () {
  Array.prototype.slice.call(document.querySelectorAll("[data-oli-visual-media]")).forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-oli-visual-tab]"));
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-oli-visual-panel]"));
    function activate(index) {
      tabs.forEach(function (tab, tabIndex) {
        tab.setAttribute("aria-selected", tabIndex === index ? "true" : "false");
      });
      panels.forEach(function (panel, panelIndex) {
        panel.hidden = panelIndex !== index;
      });
    }
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(index);
      });
    });
  });
})();
