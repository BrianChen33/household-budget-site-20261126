// Home Ledger — Overview.
//
// The month close at a glance: what came in, what went out, what moved
// to savings and what carried forward, then the twelve-month picture so
// one bad month (June's boiler) reads in context.

window.Views.overview = function (el, ctx) {
  var B = window.Budget, H = window.HOUSEHOLD, K = window.ViewKit;
  var s = ctx.summaries[ctx.month];
  var actuals = B.categoryActuals(ctx.month, ctx.ledger);
  var over = [];
  H.categories.forEach(function (c) {
    if (c.kind !== "variable") return;
    var spent = actuals[c.id] || 0, plan = B.planFor(c.id, ctx.month);
    if (spent > plan) over.push({ cat: c, spent: spent, plan: plan, diff: spent - plan });
  });
  over.sort(function (a, b) { return b.diff - a.diff; });
  var worst = over[0];
  var savingsRate = s.income ? Math.round((s.transfers / s.income) * 100) : 0;
  var surplusRate = s.income ? Math.round((s.surplus / s.income) * 100) : 0;
  // The month after the one shown: October carries into November.
  var nextKey = (function () {
    var p = ctx.month.split("-");
    var y = Number(p[0]), m = Number(p[1]);
    return m === 12 ? (y + 1) + "-01" : y + "-" + String(m + 1).padStart(2, "0");
  })();
  var next = B.monthLabel(nextKey).split(" ")[0];

  var html = [];
  html.push('<div class="page-head"><h1>' + B.monthLabel(ctx.month) + ' close</h1>' + K.monthSelect(ctx.month) + "</div>");
  html.push('<p class="lede">' + B.fmt(s.transfers) + " moved to savings. " + B.fmt(s.netChange) + " carried into " + next + ".</p>");
  html.push('<p class="lede-sub">An example household — two adults, two-bedroom flat, Manchester. Every figure below is the sum of the ledger rows behind it.</p>');

  html.push('<section class="kpis" aria-label="Month totals">');
  html.push('<div class="kpi"><span class="kpi-label">Income</span><span class="kpi-value">' + B.fmt(s.income) + "</span><span class=\"kpi-note\">Two pay deposits</span></div>");
  html.push('<div class="kpi"><span class="kpi-label">Fixed spending</span><span class="kpi-value">' + B.fmt(s.fixed) + "</span><span class=\"kpi-note\">Rent, tax, bills</span></div>");
  html.push('<div class="kpi"><span class="kpi-label">Variable spending</span><span class="kpi-value">' + B.fmt(s.variable) + "</span><span class=\"kpi-note\">Day-to-day categories</span></div>");
  html.push('<div class="kpi"><span class="kpi-label">Surplus</span><span class="kpi-value">' + B.fmt(s.surplus) + "</span><span class=\"kpi-note\">" + surplusRate + "% of income</span></div>");
  html.push('<div class="kpi accent"><span class="kpi-label">To savings</span><span class="kpi-value">' + B.fmt(s.transfers) + "</span><span class=\"kpi-note\">" + savingsRate + "% of income</span></div>");
  html.push('<div class="kpi"><span class="kpi-label">Current account</span><span class="kpi-value">' + B.fmt(s.closingBalance) + "</span><span class=\"kpi-note\">Balance at month end</span></div>");
  html.push("</section>");

  html.push('<section class="card"><h2>Where the income went</h2>');
  html.push(window.Charts.incomeBreakdown(s, B.monthLabel(ctx.month)));
  var legendItems = '<li><span class="sw seg-fixed"></span>Fixed spending ' + B.fmt(s.fixed) + '</li><li><span class="sw seg-variable"></span>Variable spending ' + B.fmt(s.variable) + '</li><li><span class="sw seg-savings"></span>To emergency fund ' + B.fmt(s.transfersEmergency) + '</li>';
  if (s.transfersHoliday > 0) legendItems += '<li><span class="sw seg-holiday"></span>To holiday fund ' + B.fmt(s.transfersHoliday) + '</li>';
  legendItems += '<li><span class="sw seg-carried"></span>Carried forward ' + B.fmt(s.netChange) + '</li>';
  html.push('<ul class="legend">' + legendItems + "</ul>");
  if (s.netChange < 0) {
    html.push('<p class="fine">Spending and savings came to ' + B.fmt(s.spending + s.transfers) + " against " + B.fmt(s.income) + " of income, so " + B.fmt(-s.netChange) + " was drawn from the opening balance.</p>");
  }
  html.push("</section>");

  html.push('<section class="card"><h2>Twelve months of surplus</h2>');
  html.push(window.Charts.surplusBars(ctx.summaries, B.months()));
  html.push("<p class=\"fine\">June 2026 dips to " + B.fmt(ctx.summaries["2026-06"].surplus) + ": a £380 replacement washing machine. December is Christmas; February and March have no council tax instalment, so their surplus runs higher.</p></section>");

  if (worst) {
    var items = over.map(function (o) {
      return '<a href="#/budget/' + o.cat.id + "?month=" + ctx.month + '">' + K.esc(o.cat.label) + " is " + B.fmt(o.diff) + " over plan</a> — " + B.fmt(o.spent) + " spent against " + B.fmt(o.plan) + " planned";
    }).join("; ");
    html.push('<section class="card attention"><h2>Needs attention</h2><p>' + items + ". Move money from a category with room, or raise the limit.</p></section>");
  } else {
    html.push('<section class="card ok"><h2>Needs attention</h2><p>No category is over plan this month.</p></section>');
  }

  html.push('<section class="card"><h2>Fixed bills this month</h2><table class="rows"><thead><tr><th>Bill</th><th class="num">Amount</th></tr></thead><tbody>');
  H.categories.forEach(function (c) {
    if (c.kind !== "fixed") return;
    html.push("<tr><td>" + K.esc(c.label) + "</td><td class=\"num\">" + B.fmt(actuals[c.id] || 0) + "</td></tr>");
  });
  html.push('</tbody></table><p class="fine"><a href="#/bills">November bills →</a> · <a href="#/goals">Emergency fund →</a></p></section>');

  el.innerHTML = html.join("");
  var sel = el.querySelector("#month-select");
  sel.addEventListener("change", function () {
    ctx.go("#/overview", { month: sel.value });
  });
  window.__shotReady = true;
};
