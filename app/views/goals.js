// Home Ledger — Goals.
//
// Two savings goals, each with its opening balance, every contribution
// and its progress to target. Recording a contribution is a transfer
// between the household's own accounts: it moves money, it never counts
// as spending, and the Overview updates with it.

window.Views.goals = function (el, ctx) {
  var B = window.Budget, H = window.HOUSEHOLD, K = window.ViewKit;
  var html = [];
  html.push('<div class="page-head"><h1>Goals</h1></div>');
  html.push('<p class="lede-sub">Saving is a transfer, not spending: moving money to a goal never makes the month look more expensive than it was.</p>');

  H.goals.forEach(function (goal) {
    var balance = B.goalBalance(goal, H.lastMonth);
    var pct = goal.target ? Math.min(100, Math.round((balance / goal.target) * 100)) : 0;
    var contributed = balance - goal.opening;
    html.push('<section class="card"><h2>' + K.esc(goal.name) + "</h2>");
    html.push('<p class="lede">' + B.fmt(balance) + " of " + B.fmt(goal.target) + " — " + pct + "%</p>");
    html.push('<div class="progress" role="img" aria-label="' + K.esc(goal.name) + " " + pct + ' percent funded"><div class="progress-fill" style="width:' + pct + '%"></div></div>');
    html.push("<p>" + K.esc(goal.note) + "</p>");
    html.push('<p class="fine">Opened at ' + B.fmt(goal.opening) + " · contributions so far " + B.fmt(contributed) + ".</p>");
    if (goal.id === "emergency") {
      var extra = window.Store.read().goalExtra[goal.id] || [];
      html.push('<table class="rows"><thead><tr><th>Month</th><th class="num">Contribution</th><th class="num">Balance</th></tr></thead><tbody>');
      var running = goal.opening;
      B.months().forEach(function (m) {
        var c = goal.contributions[m] || 0;
        extra.forEach(function (x) { if (x.month === m) c += x.amount; });
        running += c;
        html.push("<tr><td>" + B.monthLabel(m) + '</td><td class="num">' + (c ? B.fmt(c) : "—") + '</td><td class="num">' + B.fmt(running) + "</td></tr>");
      });
      html.push("</tbody></table>");
      if (balance >= goal.target) {
        html.push('<p class="ok-text">Target reached in October 2026 — six months of essential spending, set aside.</p>');
      }
    }
    html.push("</section>");
  });

  html.push('<section class="card"><h2>Record a contribution</h2><form id="goal-form">');
  html.push('<label>Goal <select name="goal">');
  H.goals.forEach(function (g) {
    html.push('<option value="' + g.id + '">' + K.esc(g.name) + "</option>");
  });
  html.push('</select></label> <label>Amount (£) <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></label> ');
  html.push('<button type="submit" class="btn">Record contribution</button></form>');
  html.push('<p class="fine">Recorded against October 2026, the last completed month, dated 28 October 2026. It moves money from the current account to the goal, and the Overview surplus stays as it was — only the carried-forward cash falls.</p></section>');

  el.innerHTML = html.join("");

  el.querySelector("#goal-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var fd = new FormData(ev.target);
    var pence = Math.round(parseFloat(fd.get("amount")) * 100);
    if (isNaN(pence) || pence <= 0) return;
    var goalId = fd.get("goal");
    window.Store.update(function (data) {
      if (!data.goalExtra[goalId]) data.goalExtra[goalId] = [];
      data.goalExtra[goalId].push({ month: H.lastMonth, amount: pence });
      data.addedTx.push({
        id: "u-goal-" + Date.now().toString(36),
        date: H.lastMonth + "-28", payee: "Transfer to " + (H.goals.find(function (g) { return g.id === goalId; }) || {}).name.toLowerCase(),
        category: null, kind: "transfer", amount: pence,
        account: "current", toAccount: goalId,
      });
    });
    ctx.refresh();
  });
  window.__shotReady = true;
};
