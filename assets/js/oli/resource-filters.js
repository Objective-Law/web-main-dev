(function () {
  var browser = document.querySelector("[data-oli-resource-browser]");
  if (!browser) return;
  var buttons = Array.prototype.slice.call(browser.querySelectorAll("[data-oli-resource-filter]"));
  var cards = Array.prototype.slice.call(browser.querySelectorAll("[data-oli-resource-card]"));
  var count = browser.querySelector("[data-oli-resource-count]");
  var empty = browser.querySelector("[data-oli-resource-empty]");

  function render(filter) {
    var visible = 0;
    buttons.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-oli-resource-filter") === filter);
    });
    cards.forEach(function (card) {
      var matches = filter === "all" || card.getAttribute("data-resource-type") === filter;
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    if (count) count.textContent = visible === 1 ? "1 resource" : visible + " resources";
    if (empty) empty.hidden = visible !== 0;
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      render(button.getAttribute("data-oli-resource-filter") || "all");
    });
  });
  render("all");
})();
