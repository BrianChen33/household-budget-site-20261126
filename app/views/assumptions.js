// Home Ledger — Assumptions.
//
// Where every figure comes from, in plain language: what is an example
// record, what is a public benchmark, and how the month reconciles.

window.Views.assumptions = function (el, ctx) {
  var B = window.Budget, H = window.HOUSEHOLD, K = window.ViewKit;
  var html = [];
  html.push('<div class="page-head"><h1>Assumptions &amp; sources</h1></div>');
  html.push('<p class="lede-sub">This is an example household, not a real family\'s accounts. Its pay, shops and savings choices are illustrative records, chosen so the month reconciles. The three public figures below are benchmarks, kept separate from the household\'s own lease and bills.</p>');

  html.push('<section class="card"><h2>The household</h2><ul class="plain"><li>Two adults, Maya and Tom, renting a two-bedroom flat in Manchester.</li><li>Combined take-home pay £4,000 a month (£2,150 + £1,850), paid on the 1st. Pay is held flat across the twelve months shown, as an example.</li><li>One adult commutes by bus on a 28-day Bee Bus pass; the other walks to work.</li><li>One shared emergency fund, plus a small holiday fund started in July 2026.</li><li>Energy is a fixed-tariff figure, held flat at £96 a month as an example.</li></ul></section>');

  html.push('<section class="card"><h2>How October 2026 adds up</h2><table class="rows"><tbody>');
  var rows = [
    ["Income — two pay deposits", 400000],
    ["Fixed spending, including £1,250 rent", -160000],
    ["Variable spending", -140000],
    ["Surplus (25% of income)", 100000],
    ["Moved to the emergency fund (20% of income)", -80000],
    ["Carried into November", 20000],
  ];
  rows.forEach(function (r) {
    html.push("<tr><td>" + r[0] + '</td><td class="num">' + (r[1] >= 0 ? "+" : "−") + B.fmt(Math.abs(r[1])) + "</td></tr>");
  });
  html.push("</tbody></table>");
  html.push("<p class=\"fine\">A savings transfer is not spending: it moves money between the household's own accounts, so the £800 appears once, as a transfer, and never in a spending total. An unpaid bill is not spending either — only money that has gone out counts.</p></section>");

  html.push('<section class="card"><h2>Public benchmarks</h2><table class="rows"><thead><tr><th>Figure</th><th>Value</th><th>Where &amp; when</th><th>Source</th></tr></thead><tbody>');
  H.benchmarks.forEach(function (b) {
    html.push("<tr><td>" + K.esc(b.label) + "</td><td>" + K.esc(b.value) + "</td><td>" + K.esc(b.where) + ", " + K.esc(b.when) + "</td><td>" + K.esc(b.source) + "</td></tr>");
  });
  html.push("</tbody></table>");
  html.push("<p class=\"fine\">The household's own lease is £1,250 a month — close to the £1,239 benchmark, but its own figure. Council tax is Band B for a two-adult household: £1,798.26 for 2026/27, paid in ten instalments from April to January (nine of £179.83 and a final £179.79), so February and March have no payment. Before April 2026 the 2025/26 charge applied: £1,697.91 a year (7/9 of the published Band D £2,183.03), nine instalments of £169.79 and a final £169.80 in January 2026. The bus pass renews every 28 days at £80; a purchase lands in most months, but November 2026 has two renewals (1st and 29th) because the 28-day cycle lands twice in a 30-day month.</p></section>");

  html.push('<section class="card"><h2>Rates used on this site</h2><ul class="plain"><li><strong>Savings rate</strong> — money moved to savings divided by income. October: £800 ÷ £4,000 = 20%.</li><li><strong>Surplus rate</strong> — income left after spending, divided by income. October: £1,000 ÷ £4,000 = 25%.</li><li><strong>Left / over</strong> — a category\'s plan minus what it spent. Negative means over plan, shown in amber with the word “over”.</li><li><strong>Emergency fund target</strong> — the household\'s own planning assumption: six months of essential spending at £2,000 a month, hence £12,000.</li></ul></section>');

  html.push('<section class="card"><h2>Your edits</h2><p>Limits you change, transactions you add or edit, bills you mark paid and contributions you record are kept in this browser (local storage) so they survive a reload. Nothing leaves the browser: there is no account, no network request and no tracking. If storage is unavailable the edits last for the session only. The figures on this page describe the example as first published; your edits change the live site, so a page you have changed may no longer match the numbers here.</p></section>');

  el.innerHTML = html.join("");
  window.__shotReady = true;
};
