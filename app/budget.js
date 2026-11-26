// Home Ledger — shared calculations.
//
// One rule runs through this file: every figure on the site is derived
// from the seed records in data/household.js plus the household's own
// edits in store.js. Nothing is typed twice, so a category total on the
// Budget page always equals the filtered total on the Transactions page,
// and a savings transfer never counts as spending.
//
// Money is integer pence throughout; formatting happens at the edge.

window.Budget = (function () {
  var H = window.HOUSEHOLD;

  function monthKey(year, month) {
    return year + "-" + String(month).padStart(2, "0");
  }

  function parseMonth(key) {
    var parts = key.split("-");
    return { year: Number(parts[0]), month: Number(parts[1]) };
  }

  function lastDayOf(key) {
    var p = parseMonth(key);
    return new Date(Date.UTC(p.year, p.month, 0)).getUTCDate();
  }

  function monthLabel(key) {
    var names = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    var p = parseMonth(key);
    return names[p.month - 1] + " " + p.year;
  }

  function shortMonth(key) {
    var names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var p = parseMonth(key);
    return names[p.month - 1] + " " + String(p.year).slice(2);
  }

  function allMonths() {
    var out = [];
    var cur = H.firstMonth;
    while (cur <= H.lastMonth) {
      out.push(cur);
      var p = parseMonth(cur);
      cur = p.month === 12 ? monthKey(p.year + 1, 1) : monthKey(p.year, p.month + 1);
    }
    return out;
  }

  function fmt(pence) {
    var sign = pence < 0 ? "-" : "";
    var abs = Math.abs(Math.round(pence));
    var pounds = Math.floor(abs / 100);
    var rest = abs % 100;
    return sign + "£" + pounds.toLocaleString("en-GB") + "." + String(rest).padStart(2, "0");
  }

  function fmtWhole(pence) {
    var sign = pence < 0 ? "-" : "";
    var abs = Math.abs(Math.round(pence));
    return sign + "£" + Math.round(abs / 100).toLocaleString("en-GB");
  }

  // Council tax: ten instalments, April to January. 2026/27 is £1,798.26
  // (nine of £179.83, final £179.79); 2025/26 was £1,697.91 (nine of
  // £169.79, final £169.80). February and March have no payment.
  function councilTaxFor(key) {
    var p = parseMonth(key);
    var taxYear = p.month >= 4 ? p.year : p.year - 1; // year the April starts in
    var regular = taxYear === 2026 ? 17983 : 16979;
    var finalPay = taxYear === 2026 ? 17979 : 16980;
    // Instalment number: April is 1 ... January is 10.
    var n = p.month >= 4 ? p.month - 3 : p.month + 9;
    if (p.month === 2 || p.month === 3) return 0;
    return n === 10 ? finalPay : regular;
  }

  function busPassDatesThrough(endDate) {
    var out = [];
    var d = new Date(H.busPass.first + "T00:00:00Z");
    var end = new Date(endDate + "T00:00:00Z");
    while (d <= end) {
      out.push(d.toISOString().slice(0, 10));
      d = new Date(d.getTime() + H.busPass.everyDays * 86400000);
    }
    return out;
  }

  function busPassDates() {
    return busPassDatesThrough(H.lastMonth + "-28");
  }

  // Build the full ledger: pay, scheduled bills, bus passes, goal
  // contributions and the posted variable rows, then layer the household's
  // own edits from the store on top.
  function buildLedger() {
    var entries = [];
    var months = allMonths();
    months.forEach(function (key) {
      var p = parseMonth(key);
      // Pay: two deposits on the 1st.
      H.pay.forEach(function (job) {
        entries.push({
          id: "pay-" + key + "-" + job.who.toLowerCase(),
          date: key + "-01", payee: "Pay — " + job.who, category: null,
          kind: "income", amount: job.amount, account: "current",
        });
      });
      // Scheduled bills.
      H.bills.forEach(function (bill) {
        var amount = bill.councilTax ? councilTaxFor(key) : bill.amount;
        if (!amount) return;
        entries.push({
          id: "bill-" + key + "-" + bill.id,
          date: key + "-" + String(bill.day).padStart(2, "0"),
          payee: bill.payee, category: bill.category,
          kind: "expense", amount: amount, account: "current",
        });
      });
      // Goal contributions, on the last day of the month.
      H.goals.forEach(function (goal) {
        var amount = goal.contributions[key];
        if (!amount) return;
        entries.push({
          id: "goal-" + key + "-" + goal.id,
          date: key + "-" + String(lastDayOf(key)).padStart(2, "0"),
          payee: "Transfer to " + goal.name.toLowerCase(),
          category: null, kind: "transfer", amount: amount,
          account: "current", toAccount: goal.id,
        });
      });
    });
    // November 2026 is the open month, not a closed one: pay lands on the
    // 1st and shows in the ledger, but bills stay due until marked paid,
    // so nothing is ever counted twice.
    H.pay.forEach(function (job) {
      entries.push({
        id: "pay-2026-11-" + job.who.toLowerCase(),
        date: "2026-11-01", payee: "Pay — " + job.who, category: null,
        kind: "income", amount: job.amount, account: "current",
      });
    });
    // Bus passes on their 28-day cadence.
    busPassDates().forEach(function (date) {
      entries.push({
        id: "bus-" + date, date: date, payee: H.busPass.payee,
        category: "transport", kind: "expense", amount: H.busPass.amount,
        account: "current",
      });
    });
    // Posted variable spending, in the order the household wrote it.
    H.variableTx.forEach(function (row, i) {
      entries.push({
        id: "v-" + i, date: row[0], payee: row[1], amount: row[2],
        category: row[3], kind: "expense", account: "current",
      });
    });
    // The household's own edits: added, edited and deleted rows, and
    // bills marked paid after the close month.
    var store = window.Store.read();
    store.addedTx.forEach(function (tx) { entries.push(tx); });
    entries = entries.filter(function (e) { return store.deletedTx.indexOf(e.id) === -1; });
    entries.forEach(function (e) {
      var edit = store.editedTx[e.id];
      if (edit) {
        e.payee = edit.payee; e.amount = edit.amount;
        e.category = edit.category; e.date = edit.date;
      }
    });
    entries.sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : (a.id < b.id ? -1 : 1);
    });
    return entries;
  }

  function categoryById(id) {
    for (var i = 0; i < H.categories.length; i++) {
      if (H.categories[i].id === id) return H.categories[i];
    }
    return null;
  }

  // Limits are scoped to one month: moving money in October rewrites
  // October's plan only, never the earlier months. Older saves kept one
  // limit per category; those still apply everywhere as a fallback.
  function planFor(id, month) {
    var store = window.Store.read();
    if (month && store.limits[month] && store.limits[month][id] !== undefined) {
      return store.limits[month][id];
    }
    if (store.limits[id] !== undefined && typeof store.limits[id] === "number") {
      return store.limits[id];
    }
    var cat = categoryById(id);
    return cat ? cat.plan : 0;
  }

  // Monthly totals for one month. Transfers move money between the
  // household's own accounts, so they are never spending. Transfers are
  // split by destination goal, so the income chart can name each one.
  function monthSummary(key, ledger) {
    var income = 0, fixed = 0, variable = 0, transfers = 0;
    var transfersEmergency = 0, transfersHoliday = 0;
    var fixedIds = {};
    H.categories.forEach(function (c) { if (c.kind === "fixed") fixedIds[c.id] = true; });
    ledger.forEach(function (e) {
      if (e.date.slice(0, 7) !== key) return;
      if (e.kind === "income") income += e.amount;
      else if (e.kind === "expense") {
        if (fixedIds[e.category]) fixed += e.amount; else variable += e.amount;
      } else if (e.kind === "transfer") {
        transfers += e.amount;
        if (e.toAccount === "emergency") transfersEmergency += e.amount;
        else if (e.toAccount === "holiday") transfersHoliday += e.amount;
      }
    });
    return {
      key: key, income: income, fixed: fixed, variable: variable,
      spending: fixed + variable, surplus: income - fixed - variable,
      transfers: transfers,
      transfersEmergency: transfersEmergency, transfersHoliday: transfersHoliday,
      netChange: income - fixed - variable - transfers,
    };
  }

  function allSummaries(ledger) {
    var out = {};
    var balance = H.currentAccountOpening;
    allMonths().forEach(function (key) {
      var s = monthSummary(key, ledger);
      balance += s.netChange;
      s.closingBalance = balance;
      out[key] = s;
    });
    return out;
  }

  function categoryActuals(key, ledger) {
    var out = {};
    H.categories.forEach(function (c) { out[c.id] = 0; });
    ledger.forEach(function (e) {
      if (e.kind === "expense" && e.date.slice(0, 7) === key && e.category) {
        out[e.category] = (out[e.category] || 0) + e.amount;
      }
    });
    return out;
  }

  function goalBalance(goal, upToKey) {
    var balance = goal.opening;
    var months = allMonths();
    months.forEach(function (key) {
      if (key > upToKey) return;
      balance += goal.contributions[key] || 0;
    });
    var store = window.Store.read();
    (store.goalExtra[goal.id] || []).forEach(function (c) {
      if (c.month <= upToKey) balance += c.amount;
    });
    return balance;
  }

  // November 2026 bills, from the October close: what is due, when, and
  // whether the household has marked it paid. The bus pass renews twice
  // in November (1st and 29th), and each renewal is its own bill with its
  // own payment, so nine bills are due for £1,760 in all.
  function upcomingBills() {
    var key = "2026-11";
    var store = window.Store.read();
    var bills = [];
    H.bills.forEach(function (bill) {
      var amount = bill.councilTax ? councilTaxFor(key) : bill.amount;
      bills.push({
        id: bill.id, payee: bill.payee, category: bill.category,
        amount: amount, due: key + "-" + String(bill.day).padStart(2, "0"),
        paid: !!store.paidBills[bill.id],
      });
    });
    busPassDatesThrough("2026-11-30").forEach(function (date) {
      if (date.slice(0, 7) !== key) return;
      var id = "bus-" + date;
      bills.push({
        id: id, payee: H.busPass.payee, category: "transport",
        amount: H.busPass.amount, due: date,
        paid: !!store.paidBills[id],
      });
    });
    bills.sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    return bills;
  }

  // Months the Transactions page can show: the twelve closed months plus
  // November 2026, the open month, where paid bills land.
  function txMonths() {
    return allMonths().concat(["2026-11"]);
  }

  return {
    months: allMonths, txMonths: txMonths, monthLabel: monthLabel, shortMonth: shortMonth,
    fmt: fmt, fmtWhole: fmtWhole, councilTaxFor: councilTaxFor,
    buildLedger: buildLedger, categoryById: categoryById, planFor: planFor,
    monthSummary: monthSummary, allSummaries: allSummaries,
    categoryActuals: categoryActuals, goalBalance: goalBalance,
    upcomingBills: upcomingBills,
  };
})();
