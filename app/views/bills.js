// Home Ledger — Bills.
//
// November 2026, seen from the October close: what is due, when, and
// whether it is paid. Marking a bill paid writes a real November expense
// into the ledger, so the bills page and the ledger can never disagree;
// the paid state survives a reload.

window.Views.bills = function (el, ctx) {
  var B = window.Budget, K = window.ViewKit;
  var bills = B.upcomingBills();
  var total = bills.reduce(function (s, b) { return s + b.amount; }, 0);
  var paidTotal = bills.filter(function (b) { return b.paid; })
    .reduce(function (s, b) { return s + b.amount; }, 0);

  var html = [];
  html.push('<div class="page-head"><h1>Bills — November 2026</h1></div>');
  html.push('<p class="lede-sub">Due after the October close. ' + B.fmt(total) + " in all · " + B.fmt(paidTotal) + " paid · " + B.fmt(total - paidTotal) + " still to pay. Rent and council tax go out on the 1st; the bus pass renews the same day.</p>");

  html.push('<table class="rows"><thead><tr><th>Due</th><th>Bill</th><th class="num">Amount</th><th>Status</th><th></th></tr></thead><tbody>');
  bills.forEach(function (b) {
    var day = Number(b.due.slice(8, 10));
    html.push("<tr" + (b.paid ? ' class="paid-row"' : "") + "><td>" + day + " Nov</td><td>" + K.esc(b.payee) + "</td>");
    html.push('<td class="num">' + B.fmt(b.amount) + "</td>");
    html.push('<td>' + (b.paid ? '<span class="pill paid">Paid</span>' : '<span class="pill due">Due</span>') + "</td>");
    html.push('<td>' + (b.paid
      ? '<button class="btn small" data-unpay="' + b.id + '">Mark unpaid</button>'
      : '<button class="btn small" data-pay="' + b.id + '">Mark paid</button>') + "</td></tr>");
  });
  html.push("</tbody></table>");
  html.push('<p class="fine">Marking a bill paid adds it to the November ledger as an expense, and it stays paid when you come back. An unpaid bill is not counted as spent — only money that has actually gone out counts. Paid bills show in <a href="#/transactions/2026-11/all">November transactions</a>.</p>');
  var payTotal = window.HOUSEHOLD.pay.reduce(function (s, job) { return s + job.amount; }, 0);
  var carried = ctx.summaries["2026-10"].netChange;
  var spare = payTotal + carried - total;
  html.push('<section class="card"><h2>How the month is covered</h2><p>November pay of ' + B.fmt(payTotal) + " lands on the 1st, on top of the " + B.fmt(carried) + " October carried forward. The November bills above are " + B.fmt(total) + ", so the month is covered with " + B.fmt(spare) + " to spare.</p></section>");

  el.innerHTML = html.join("");

  el.querySelectorAll("[data-pay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var bill = bills.find(function (b) { return b.id === btn.getAttribute("data-pay"); });
      window.Store.markBillPaid(bill);
      ctx.refresh();
    });
  });
  el.querySelectorAll("[data-unpay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var bill = bills.find(function (b) { return b.id === btn.getAttribute("data-unpay"); });
      window.Store.markBillUnpaid(bill);
      ctx.refresh();
    });
  });
  window.__shotReady = true;
};
