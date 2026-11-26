// Home Ledger — the household's own edits.
//
// Edits live in localStorage so a change survives a reload: a corrected
// limit, a moved allocation, a transaction added, edited or deleted, a
// bill marked paid, an extra goal contribution. When storage is not
// available (a private window, or the file opened from disk with storage
// off) the same edits live in memory for the session, and the site says so
// on the page instead of silently dropping them.

window.Store = (function () {
  var KEY = "home-ledger-v1";
  var memory = null;
  var storageOK = true;
  var lastGood = null;
  var readError = false;
  var writeError = false;

  try {
    window.localStorage.setItem("__home_ledger_probe", "1");
    window.localStorage.removeItem("__home_ledger_probe");
  } catch (e) {
    storageOK = false;
  }

  function blank() {
    return {
      limits: {},        // month -> {category id -> pence} (edited monthly limit)
      addedTx: [],       // full ledger entries the household added
      editedTx: {},      // entry id -> {payee, amount, category, date}
      deletedTx: [],     // entry ids the household deleted
      paidBills: {},     // bill id -> true (November 2026 bills)
      goalExtra: {},     // goal id -> [{month, amount}]
    };
  }

  function validShape(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;
    if (typeof data.limits !== "object" || data.limits === null) return false;
    if (!Array.isArray(data.addedTx) || typeof data.editedTx !== "object" || data.editedTx === null) return false;
    if (!Array.isArray(data.deletedTx) || typeof data.paidBills !== "object" || data.paidBills === null) return false;
    if (typeof data.goalExtra !== "object" || data.goalExtra === null) return false;
    return true;
  }

  function read() {
    if (!storageOK) {
      if (!memory) memory = blank();
      return memory;
    }
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return blank();
      var data = JSON.parse(raw);
      if (!validShape(data)) throw new Error("bad shape");
      // Keep every known key, ignore anything else.
      var out = blank();
      Object.keys(out).forEach(function (k) {
        if (data[k] !== undefined) out[k] = data[k];
      });
      lastGood = out;
      readError = false;
      return out;
    } catch (e) {
      // Never let a damaged save wipe the household's edits: keep the
      // last readable state, and say so next to the action.
      readError = true;
      return lastGood || blank();
    }
  }

  function write(data) {
    lastGood = data;
    if (!storageOK) {
      memory = data;
      return;
    }
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
      writeError = false;
    } catch (e) {
      writeError = true;
      memory = data;
    }
  }

  function update(fn) {
    var data = read();
    fn(data);
    write(data);
    return data;
  }

  // A bill marked paid after the close month becomes a real November
  // expense in the ledger, so the bills page and the ledger agree.
  function markBillPaid(bill) {
    update(function (data) {
      data.paidBills[bill.id] = true;
      var exists = data.addedTx.some(function (tx) { return tx.id === "paid-" + bill.id; });
      if (!exists) {
        data.addedTx.push({
          id: "paid-" + bill.id, date: bill.due, payee: bill.payee,
          category: bill.category, kind: "expense", amount: bill.amount,
          account: "current",
        });
      }
    });
  }

  function markBillUnpaid(bill) {
    update(function (data) {
      delete data.paidBills[bill.id];
      data.addedTx = data.addedTx.filter(function (tx) { return tx.id !== "paid-" + bill.id; });
    });
  }

  return {
    read: read, write: write, update: update,
    markBillPaid: markBillPaid, markBillUnpaid: markBillUnpaid,
    storageOK: function () { return storageOK; },
    storeError: function () { return readError || writeError; },
  };
})();
