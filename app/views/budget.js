// Home Ledger — Budget.
//
// Plan against actual for one month. Limits are editable, and money can
// be moved between categories: moving an amount raises one limit and
// lowers another by the same amount, so the total plan never changes.
// Limits belong to the month shown: moving money in October rewrites
// October's plan only, never the earlier months.

window.Views.budget = function (el, ctx) {
  var B = window.Budget, H = window.HOUSEHOLD, K = window.ViewKit;
  var actuals = B.categoryActuals(ctx.month, ctx.ledger);
  var focus = ctx.segments[1] || null; // e.g. "groceries"
  var totalPlan = 0, totalSpent = 0;
  H.categories.forEach(function (c) {
    if (c.kind !== "variable") return;
    totalPlan += B.planFor(c.id, ctx.month);
    totalSpent += actuals[c.id] || 0;
  });

  function donorsFor(catId) {
    return H.categories.filter(function (c) {
      return c.kind === "variable" && c.id !== catId && (B.planFor(c.id, ctx.month) - (actuals[c.id] || 0)) > 0;
    }).sort(function (a, b) {
      return (B.planFor(b.id, ctx.month) - (actuals[b.id] || 0)) - (B.planFor(a.id, ctx.month) - (actuals[a.id] || 0));
    });
  }

  var html = [];
  html.push('<div class="page-head"><h1>Budget — ' + B.monthLabel(ctx.month) + "</h1>" + K.monthSelect(ctx.month) + "</div>");
  html.push('<p class="lede-sub">Variable plan ' + B.fmt(totalPlan) + " · spent " + B.fmt(totalSpent) + " · " + (totalSpent > totalPlan ? B.fmt(totalSpent - totalPlan) + " over" : B.fmt(totalPlan - totalSpent) + " left") + ". Limits are yours to change for this month; moving money keeps the total plan the same.</p>");

  // Allocation tool for the focused category, when it is over plan.
  if (focus) {
    var cat = B.categoryById(focus);
    if (cat && cat.kind === "variable") {
      var spent = actuals[cat.id] || 0, plan = B.planFor(cat.id, ctx.month);
      var over = spent - plan;
      html.push('<section class="card attention" id="allocation"><h2>' + K.esc(cat.label) + ": " + B.fmt(spent) + " spent of " + B.fmt(plan) + " planned</h2>");
      if (over > 0) {
        var donors = donorsFor(cat.id);
        html.push("<p>" + K.esc(cat.label) + " is " + B.fmt(over) + " over plan. Cover it from a category with room, and the total plan stays " + B.fmt(totalPlan) + ".</p>");
        if (donors.length) {
          var donor = donors[0];
          var donorLeft = B.planFor(donor.id, ctx.month) - (actuals[donor.id] || 0);
          var move = Math.min(over, donorLeft);
          html.push('<form id="move-form" class="move-form"><label>Move <span class="money-input">£<input id="move-amount" type="number" min="0.01" step="0.01" value="' + (move / 100).toFixed(2) + '"></span> from <select id="move-from">');
          donors.forEach(function (d) {
            var left = B.planFor(d.id, ctx.month) - (actuals[d.id] || 0);
            html.push('<option value="' + d.id + '"' + (donor && d.id === donor.id ? " selected" : "") + ">" + K.esc(d.label) + " (" + B.fmt(left) + " left)</option>");
          });
          html.push("</select> to " + K.esc(cat.label) + '.</label> <button type="submit" class="btn">Move money</button></form>');
          html.push('<p class="fine" id="move-preview"></p>');
        } else {
          html.push("<p>No category has room left this month, so there is nothing to move from. Raise the " + K.esc(cat.label) + " limit instead, or spend less elsewhere first.</p>");
        }
      } else {
        html.push("<p>" + K.esc(cat.label) + " is inside its plan, with " + B.fmt(plan - spent) + " left.</p>");
      }
      html.push('<p class="fine"><a href="#/transactions/' + ctx.month + "/" + cat.id + '">See the ' + B.fmt(spent) + " in the ledger →</a></p></section>");
    }
  }

  html.push('<section class="card"><h2>Variable spending</h2>');
  html.push('<p class="fine chart-key"><span class="key-plan"></span> Plan &nbsp; <span class="key-actual"></span> Spent &nbsp; <span class="key-over"></span> Over plan</p>');
  html.push(window.Charts.allocationBars(actuals, { month: ctx.month }));
  html.push('<table class="rows"><thead><tr><th>Category</th><th class="num">Plan</th><th class="num">Spent</th><th class="num">Left / over</th><th></th></tr></thead><tbody>');
  H.categories.forEach(function (c) {
    if (c.kind !== "variable") return;
    var spent = actuals[c.id] || 0, plan = B.planFor(c.id, ctx.month);
    var diff = plan - spent;
    html.push("<tr" + (focus === c.id ? ' class="focused"' : "") + "><td><a href=\"#/budget/" + c.id + "?month=" + ctx.month + "\">" + K.esc(c.label) + "</a></td>");
    html.push('<td class="num">' + B.fmt(plan) + '</td><td class="num">' + B.fmt(spent) + '</td>');
    html.push('<td class="num ' + (diff < 0 ? "over-text" : "") + '">' + (diff < 0 ? B.fmt(-diff) + " over" : B.fmt(diff) + " left") + "</td>");
    html.push('<td><button class="btn small" data-edit-limit="' + c.id + '">Edit limit</button></td></tr>');
  });
  html.push("</tbody></table>");
  html.push('<p class="fine"><button class="btn small" id="reset-limits">Reset ' + B.monthLabel(ctx.month) + ' limits to the household plan</button></p></section>');

  html.push('<section class="card"><h2>Fixed bills</h2><table class="rows"><thead><tr><th>Bill</th><th class="num">Amount</th><th></th></tr></thead><tbody>');
  H.categories.forEach(function (c) {
    if (c.kind !== "fixed") return;
    html.push("<tr><td>" + K.esc(c.label) + "</td><td class=\"num\">" + B.fmt(actuals[c.id] || 0) + "</td><td class=\"fine\">Set by the bill — see <a href=\"#/bills\">Bills</a></td></tr>");
  });
  html.push("</tbody></table></section>");

  el.innerHTML = html.join("");

  var sel = el.querySelector("#month-select");
  sel.addEventListener("change", function () {
    var path = focus ? "#/budget/" + focus : "#/budget";
    ctx.go(path, { month: sel.value });
  });

  var form = el.querySelector("#move-form");
  if (form) {
    var amountInput = el.querySelector("#move-amount");
    var fromSelect = el.querySelector("#move-from");
    var preview = el.querySelector("#move-preview");
    var focusedCat = B.categoryById(focus);
    function refreshPreview() {
      var raw = parseFloat(amountInput.value);
      var amount = isFinite(raw) && raw > 0 ? Math.round(raw * 100) : 0;
      var fromId = fromSelect.value;
      var fromCat = B.categoryById(fromId);
      var fromLeft = B.planFor(fromId, ctx.month) - (actuals[fromId] || 0);
      var capped = Math.min(amount, Math.max(0, fromLeft));
      if (amount > fromLeft) {
        preview.textContent = "Most you can move from " + fromCat.label + " is " + B.fmt(fromLeft) + " — the amount will be capped at that.";
      } else if (amount > 0) {
        preview.textContent = "Preview: " + focusedCat.label + " plan " + B.fmt(plan) + " → " + B.fmt(plan + capped) + "; " + fromCat.label + " plan " + B.fmt(B.planFor(fromId, ctx.month)) + " → " + B.fmt(B.planFor(fromId, ctx.month) - capped) + " (" + B.fmt(fromLeft - capped) + " left).";
      } else {
        preview.textContent = "Enter an amount to move.";
      }
    }
    amountInput.addEventListener("input", refreshPreview);
    fromSelect.addEventListener("change", refreshPreview);
    refreshPreview();
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var amount = Math.round(parseFloat(amountInput.value || "0") * 100);
      var fromId = fromSelect.value;
      if (!isFinite(amount) || amount <= 0) return;
      var fromLeft = B.planFor(fromId, ctx.month) - (actuals[fromId] || 0);
      if (amount > fromLeft) amount = fromLeft;
      if (amount <= 0) return;
      window.Store.update(function (data) {
        if (!data.limits[ctx.month]) data.limits[ctx.month] = {};
        data.limits[ctx.month][focus] = B.planFor(focus, ctx.month) + amount;
        data.limits[ctx.month][fromId] = B.planFor(fromId, ctx.month) - amount;
      });
      ctx.refresh();
      var note = el.querySelector("#move-preview");
      if (note) note.textContent = "Moved " + B.fmt(amount) + " from " + B.categoryById(fromId).label + " to " + B.categoryById(focus).label + " for " + B.monthLabel(ctx.month) + ". Total plan unchanged at " + B.fmt(totalPlan) + ".";
    });
  }

  el.querySelectorAll("[data-edit-limit]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-edit-limit");
      var current = (B.planFor(id, ctx.month) / 100).toFixed(2);
      var next = window.prompt("New " + B.monthLabel(ctx.month) + " limit for " + B.categoryById(id).label + " (£):", current);
      if (next === null) return;
      if (!/^\d+(\.\d{1,2})?$/.test(next.trim())) {
        window.alert("That is not a pound amount — use digits with up to two decimals, e.g. 450.00.");
        return;
      }
      var pence = Math.round(parseFloat(next) * 100);
      if (isNaN(pence) || pence < 0) return;
      window.Store.update(function (data) {
        if (!data.limits[ctx.month]) data.limits[ctx.month] = {};
        data.limits[ctx.month][id] = pence;
      });
      ctx.refresh();
    });
  });

  var reset = el.querySelector("#reset-limits");
  if (reset) {
    reset.addEventListener("click", function () {
      if (!window.confirm("Reset the " + B.monthLabel(ctx.month) + " limits to the household plan?")) return;
      window.Store.update(function (data) { delete data.limits[ctx.month]; });
      ctx.refresh();
    });
  }
  window.__shotReady = true;
};
