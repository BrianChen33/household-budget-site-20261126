// Home Ledger — small shared helpers for the views.
window.Views = window.Views || {};

window.ViewKit = (function () {
  function esc(text) {
    return String(text == null ? "" : text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function monthOptions(selected) {
    var B = window.Budget;
    return B.months().map(function (m) {
      return '<option value="' + m + '"' + (m === selected ? " selected" : "") + ">" + B.monthLabel(m) + "</option>";
    }).join("");
  }

  function monthSelect(selected, id) {
    return '<label class="month-pick">Month <select id="' + (id || "month-select") + '">' + monthOptions(selected) + "</select></label>";
  }

  function money(pence, cls) {
    return '<span class="' + (cls || "money") + '">' + window.Budget.fmt(pence) + "</span>";
  }

  return { esc: esc, monthSelect: monthSelect, money: money };
})();
