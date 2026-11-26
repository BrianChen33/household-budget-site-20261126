// Home Ledger — Transactions.
//
// The ledger itself: every posted row for the month, filterable by
// category and searchable by payee. An expense row can be opened, edited
// or deleted, and a new expense can be added; the month totals everywhere
// else follow from the same rows. Income, transfers and rows posted by
// marking a bill paid are not editable here — they are owned by the pay
// schedule, the goals and the Bills page, so editing them here could
// never leave two balances disagreeing.

window.Views.transactions = function (el, ctx) {
  var B = window.Budget, H = window.HOUSEHOLD, K = window.ViewKit;
  var month = ctx.month;
  var category = ctx.segments[2] || "all";
  var selectedId = ctx.segments[3] || null;
  var q = (ctx.query.q || "").toLowerCase();

  // Dates the ledger can show: the twelve closed months and November
  // 2026, the open month where paid bills land.
  var FIRST_DATE = "2025-11-01", LAST_DATE = "2026-11-30";
  function dateInRange(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= FIRST_DATE && date <= LAST_DATE;
  }

  var rows = ctx.ledger.filter(function (e) {
    if (e.date.slice(0, 7) !== month) return false;
    if (category !== "all" && e.category !== category) return false;
    if (q && e.payee.toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
  rows.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var expenses = rows.filter(function (e) { return e.kind === "expense"; });
  var spent = expenses.reduce(function (sum, e) { return sum + e.amount; }, 0);
  var income = rows.filter(function (e) { return e.kind === "income"; })
    .reduce(function (sum, e) { return sum + e.amount; }, 0);

  function isEditable(e) {
    return e.kind === "expense" && e.id.indexOf("paid-") !== 0;
  }

  var html = [];
  html.push('<div class="page-head"><h1>Transactions — ' + B.monthLabel(month) + "</h1>");
  html.push('<label class="month-pick">Month <select id="tx-month">' + B.txMonths().map(function (m) {
    var label = m === "2026-11" ? "November 2026 (in progress)" : B.monthLabel(m);
    return '<option value="' + m + '"' + (m === month ? " selected" : "") + ">" + label + "</option>";
  }).join("") + "</select></label></div>");

  html.push('<form class="filters" id="tx-filters"><label>Category <select id="tx-category"><option value="all">All categories</option>');
  H.categories.forEach(function (c) {
    html.push('<option value="' + c.id + '"' + (category === c.id ? " selected" : "") + ">" + K.esc(c.label) + "</option>");
  });
  html.push('</select></label><label>Search <input id="tx-search" type="search" value="' + K.esc(ctx.query.q || "") + '" placeholder="Payee…"></label><button type="submit" class="btn">Filter</button></form>');

  var catLabel = category === "all" ? "all categories" : (B.categoryById(category) || { label: category }).label;
  html.push('<p class="lede-sub">' + rows.length + " rows · " + K.esc(catLabel) + " · spent " + B.fmt(spent) + (income ? " · income " + B.fmt(income) : "") + ".</p>");

  html.push('<table class="rows ledger"><thead><tr><th>Date</th><th>Payee</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody>');
  rows.forEach(function (e) {
    var cls = e.kind === "income" ? "income" : e.kind === "transfer" ? "transfer" : "expense";
    var shown = e.kind === "income" ? "+" + B.fmt(e.amount) : e.kind === "transfer" ? B.fmt(e.amount) + " → savings" : "−" + B.fmt(e.amount);
    var catName = e.category ? (B.categoryById(e.category) || { label: e.category }).label : (e.kind === "income" ? "Income" : "Transfer");
    var payeeCell = isEditable(e)
      ? '<a href="#/transactions/' + month + "/" + category + "/" + e.id + (q ? "?q=" + encodeURIComponent(ctx.query.q) : "") + '">' + K.esc(e.payee) + "</a>"
      : K.esc(e.payee);
    html.push('<tr' + (selectedId === e.id ? ' class="focused"' : "") + '><td>' + e.date.slice(5) + '</td><td>' + payeeCell + "</td><td>" + K.esc(catName) + '</td><td class="num ' + cls + '">' + shown + "</td><td>" + (isEditable(e) ? '<button class="btn small" data-edit-tx="' + e.id + '">Edit</button>' : (e.id.indexOf("paid-") === 0 ? '<span class="fine">Paid bill</span>' : "")) + "</td></tr>");
  });
  html.push("</tbody></table>");

  var selected = selectedId ? ctx.ledger.find(function (e) { return e.id === selectedId; }) : null;
  if (selected && isEditable(selected)) {
    html.push('<section class="card" id="edit-tx"><h2>Edit transaction</h2><form id="edit-form">');
    html.push('<label>Date <input name="date" type="date" value="' + selected.date + '" required></label> ');
    html.push('<label>Payee <input name="payee" type="text" value="' + K.esc(selected.payee) + '" required></label> ');
    html.push('<label>Amount (£) <input name="amount" type="number" min="0.01" step="0.01" value="' + (selected.amount / 100).toFixed(2) + '" required></label> ');
    html.push('<label>Category <select name="category">');
    H.categories.forEach(function (c) {
      html.push('<option value="' + c.id + '"' + (selected.category === c.id ? " selected" : "") + ">" + K.esc(c.label) + "</option>");
    });
    html.push('</select></label> <button type="submit" class="btn">Save changes</button> <button type="button" class="btn danger" id="delete-tx">Delete</button></form>');
    html.push('<p class="fine">Saving updates every total that uses this row — the budget page, the overview and the charts. Dates must fall between 1 November 2025 and 30 November 2026.</p><p class="error" id="edit-error" hidden></p></section>');
  } else if (selected) {
    var why = selected.id.indexOf("paid-") === 0
      ? "This row was posted by marking a bill paid — change it on the Bills page, where the bill and its payment stay in step."
      : "Pay and savings transfers are owned by their schedules and goals, so they cannot be edited here.";
    html.push('<section class="card"><h2>' + K.esc(selected.payee) + "</h2><p>" + why + "</p></section>");
  }

  var defaultCat = category !== "all" ? category : "groceries";
  html.push('<details class="card add-tx"><summary>Add an expense</summary><form id="add-form">');
  html.push('<label>Date <input name="date" type="date" value="' + month + '-28" required></label> ');
  html.push('<label>Payee <input name="payee" type="text" placeholder="Shop or biller" required></label> ');
  html.push('<label>Amount (£) <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></label> ');
  html.push('<label>Category <select name="category">');
  H.categories.forEach(function (c) {
    html.push('<option value="' + c.id + '"' + (defaultCat === c.id ? " selected" : "") + ">" + K.esc(c.label) + "</option>");
  });
  html.push('</select></label> <button type="submit" class="btn">Add to the ledger</button></form><p class="error" id="add-error" hidden></p></details>');

  el.innerHTML = html.join("");

  function keepQuery() {
    return q ? { q: ctx.query.q } : {};
  }

  el.querySelector("#tx-month").addEventListener("change", function (ev) {
    ctx.go("#/transactions/" + ev.target.value + "/" + category, keepQuery());
  });
  el.querySelector("#tx-filters").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var cat = el.querySelector("#tx-category").value;
    var query = el.querySelector("#tx-search").value.trim();
    ctx.go("#/transactions/" + month + "/" + cat, query ? { q: query } : {});
  });

  el.querySelectorAll("[data-edit-tx]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      ctx.go("#/transactions/" + month + "/" + category + "/" + btn.getAttribute("data-edit-tx"), keepQuery());
    });
  });

  var editForm = el.querySelector("#edit-form");
  if (editForm && selected) {
    editForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fd = new FormData(editForm);
      var err = el.querySelector("#edit-error");
      var pence = Math.round(parseFloat(fd.get("amount")) * 100);
      if (!isFinite(pence) || pence <= 0) {
        err.textContent = "Enter an amount above £0.00.";
        err.hidden = false;
        return;
      }
      if (!dateInRange(fd.get("date"))) {
        err.textContent = "That date is outside the ledger (1 November 2025 to 30 November 2026) — pick one inside it.";
        err.hidden = false;
        return;
      }
      window.Store.update(function (data) {
        data.editedTx[selected.id] = {
          date: fd.get("date"), payee: fd.get("payee"),
          amount: pence, category: fd.get("category"),
        };
      });
      // Open the row where it now lives.
      ctx.go("#/transactions/" + fd.get("date").slice(0, 7) + "/" + fd.get("category"), keepQuery());
    });
    el.querySelector("#delete-tx").addEventListener("click", function () {
      if (!window.confirm("Delete this transaction?")) return;
      window.Store.update(function (data) {
        data.deletedTx.push(selected.id);
        delete data.editedTx[selected.id];
      });
      ctx.go("#/transactions/" + month + "/" + category, keepQuery());
    });
  }

  var addForm = el.querySelector("#add-form");
  addForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var fd = new FormData(addForm);
    var err = el.querySelector("#add-error");
    var pence = Math.round(parseFloat(fd.get("amount")) * 100);
    if (!isFinite(pence) || pence <= 0) {
      err.textContent = "Enter an amount above £0.00.";
      err.hidden = false;
      return;
    }
    if (!dateInRange(fd.get("date"))) {
      err.textContent = "That date is outside the ledger (1 November 2025 to 30 November 2026) — pick one inside it.";
      err.hidden = false;
      return;
    }
    var id = "u-" + Date.now().toString(36);
    window.Store.update(function (data) {
      data.addedTx.push({
        id: id, date: fd.get("date"), payee: fd.get("payee"),
        amount: pence, category: fd.get("category"),
        kind: "expense", account: "current",
      });
    });
    ctx.go("#/transactions/" + fd.get("date").slice(0, 7) + "/" + fd.get("category"), {});
  });
  window.__shotReady = true;
};
