// Home Ledger — routing and state.
//
// Hash routes: #/overview, #/budget[/category], #/transactions[/month]
// [/category][/transaction], #/bills, #/goals, #/assumptions. A query
// part (?month=2026-09) picks the month on pages that show one. The
// ledger is rebuilt from the seed records plus the household's edits on
// every render, so an edit anywhere is visible everywhere at once.

(function () {
  var B = window.Budget, H = window.HOUSEHOLD;

  var app = document.getElementById("app");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("nav a[data-route]"));

  function parseHash() {
    var raw = window.location.hash || "#/overview";
    var hash = raw.slice(1); // strip "#"
    var qIndex = hash.indexOf("?");
    var path = qIndex === -1 ? hash : hash.slice(0, qIndex);
    var query = {};
    if (qIndex !== -1) {
      hash.slice(qIndex + 1).split("&").forEach(function (pair) {
        var kv = pair.split("=");
        if (!kv[0]) return;
        try {
          query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
        } catch (e) {
          // A malformed query value is ignored, not fatal.
        }
      });
    }
    var segments = path.split("/").filter(function (s) { return s.length > 0; });
    return { segments: segments, query: query };
  }

  function render() {
    window.__shotReady = false;
    var parsed = parseHash();
    var segments = parsed.segments;
    var route = segments[0] || "overview";
    if (!window.Views[route]) route = "overview";

    var month = parsed.query.month || H.lastMonth;
    if (route === "transactions" && segments[1] && /^\d{4}-\d{2}$/.test(segments[1])) {
      month = segments[1];
    }
    // Months the site can show: the twelve closed months, plus November
    // 2026 on the Transactions page, where paid bills land. Anything
    // else — a typo, a future month — falls back to October 2026.
    var allowed = route === "transactions" ? B.txMonths() : B.months();
    if (!/^\d{4}-\d{2}$/.test(month) || allowed.indexOf(month) === -1) {
      month = H.lastMonth;
    }

    var ledger = B.buildLedger();
    var summaries = B.allSummaries(ledger);
    var ctx = {
      ledger: ledger,
      summaries: summaries,
      month: month,
      segments: segments,
      query: parsed.query,
      go: go,
      refresh: render,
    };
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-route") === route);
      if (a.getAttribute("data-route") === route) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    window.Views[route](app, ctx);
    document.title = "Home Ledger — " + route.charAt(0).toUpperCase() + route.slice(1);
    var note = document.getElementById("storage-note");
    if (note) {
      if (!window.Store.storageOK()) {
        note.hidden = false;
        note.textContent = "Edits are kept for this session only — this browser is not storing them.";
      } else if (window.Store.storeError()) {
        note.hidden = false;
        note.textContent = "Your saved edits could not be read or written just now — the last readable copy is being used, and new edits may not survive a reload.";
      } else {
        note.hidden = true;
      }
    }
  }

  function go(path, query) {
    var hash = path;
    var parts = [];
    Object.keys(query || {}).forEach(function (k) {
      if (query[k] !== undefined && query[k] !== "") parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(query[k]));
    });
    if (parts.length) hash += "?" + parts.join("&");
    if (window.location.hash === hash) render();
    else window.location.hash = hash;
  }

  window.addEventListener("hashchange", render);
  render();
})();
