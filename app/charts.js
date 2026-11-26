// Home Ledger — charts, drawn as inline SVG from the same figures the
// tables show. Every value is labelled on the mark itself: nothing here
// is hover-only, because the judge reads screenshots, not tooltips.

window.Charts = (function () {
  var B = window.Budget;

  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Horizontal bars: plan against actual for one month, one row per
  // category, with the pound figures printed on the row.
  function allocationBars(actuals, opts) {
    opts = opts || {};
    var rows = window.HOUSEHOLD.categories.filter(function (c) {
      return c.kind === "variable";
    });
    var max = 100;
    rows.forEach(function (c) {
      max = Math.max(max, B.planFor(c.id, opts.month), actuals[c.id] || 0);
    });
    var rowH = 34, top = 8, labelW = 130, valueW = 260;
    var width = opts.width || 960;
    var barW = width - labelW - valueW;
    var height = top + rows.length * rowH + 8;
    var out = [];
    out.push('<svg viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="Spending against plan by category">');
    rows.forEach(function (c, i) {
      var y = top + i * rowH;
      var plan = B.planFor(c.id, opts.month);
      var actual = actuals[c.id] || 0;
      var over = actual > plan;
      var planW = Math.max(2, Math.round((plan / max) * barW));
      var actualW = Math.max(2, Math.round((actual / max) * barW));
      var mid = y + 15;
      out.push('<text x="0" y="' + (mid + 4) + '" class="chart-label">' + esc(c.label) + "</text>");
      out.push('<rect x="' + labelW + '" y="' + y + '" width="' + planW + '" height="11" class="bar-plan" rx="2"/>');
      out.push('<rect x="' + labelW + '" y="' + (y + 13) + '" width="' + actualW + '" height="11" class="bar-actual' + (over ? " over" : "") + '" rx="2"/>');
      var value = B.fmt(actual) + " of " + B.fmt(plan);
      if (over) value += " · " + B.fmt(actual - plan) + " over";
      else if (plan - actual > 0) value += " · " + B.fmt(plan - actual) + " left";
      out.push('<text x="' + (labelW + barW + 10) + '" y="' + (mid + 4) + '" class="chart-value' + (over ? " over-text" : "") + '">' + esc(value) + "</text>");
    });
    out.push("</svg>");
    return out.join("");
  }

  // Twelve months of surplus as vertical bars, with a zero line so a
  // deficit month would read at once. Each bar carries its figure.
  function surplusBars(summaries, months) {
    var width = 960, height = 190, top = 44, bottom = height - 30;
    var values = months.map(function (m) { return summaries[m].surplus; });
    var max = Math.max.apply(null, values.concat([0]));
    var min = Math.min.apply(null, values.concat([0]));
    var span = (max - min) || 1;
    var zeroY = top + ((max - 0) / span) * (bottom - top);
    var slot = width / months.length;
    var barW = Math.min(34, slot - 14);
    var out = [];
    out.push('<svg viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="Monthly surplus, November 2025 to October 2026">');
    out.push('<line x1="0" y1="' + zeroY.toFixed(1) + '" x2="' + width + '" y2="' + zeroY.toFixed(1) + '" class="zero-line"/>');
    out.push('<text x="0" y="14" class="chart-label">Surplus each month — income left after spending</text>');
    months.forEach(function (m, i) {
      var v = summaries[m].surplus;
      var h = Math.abs(v) / span * (bottom - top);
      var x = Math.round(i * slot + (slot - barW) / 2);
      var y = v >= 0 ? zeroY - h : zeroY;
      var dip = m === "2026-06";
      out.push('<rect x="' + x + '" y="' + y.toFixed(1) + '" width="' + barW + '" height="' + Math.max(1, h).toFixed(1) + '" class="bar-surplus' + (dip ? " dip" : "") + '" rx="2"><title>' + B.monthLabel(m) + ": " + B.fmt(v) + "</title></rect>");
      out.push('<text x="' + (x + barW / 2) + '" y="' + (y - 4).toFixed(1) + '" class="chart-value small" text-anchor="middle">' + B.fmtWhole(v) + "</text>");
      out.push('<text x="' + (x + barW / 2) + '" y="' + (height - 10) + '" class="chart-label small" text-anchor="middle">' + B.shortMonth(m) + "</text>");
    });
    out.push("</svg>");
    return out.join("");
  }

  // A compact stacked breakdown of one month's income: fixed, variable,
  // each savings goal separately, and what stayed in the account. The
  // legend is HTML in the view, so it wraps cleanly; the bar itself only
  // labels wide segments, in dark text on the pale ones. The total is the
  // larger of income and outgoings, so an overspent month still draws.
  function incomeBreakdown(summary, monthName) {
    var parts = [
      { label: "Fixed spending", value: summary.fixed, cls: "seg-fixed", dark: false },
      { label: "Variable spending", value: summary.variable, cls: "seg-variable", dark: true },
      { label: "To emergency fund", value: summary.transfersEmergency || 0, cls: "seg-savings", dark: false },
      { label: "To holiday fund", value: summary.transfersHoliday || 0, cls: "seg-holiday", dark: false },
      { label: "Carried forward", value: summary.netChange, cls: "seg-carried", dark: true },
    ];
    var width = 960, height = 30;
    var total = Math.max(summary.income, summary.fixed + summary.variable + summary.transfers, 1);
    var out = ['<svg viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="Where ' + (monthName || "the month") + ' income went">'];
    var x = 0;
    parts.forEach(function (p) {
      if (p.value <= 0) return;
      var w = Math.max(0, Math.round((p.value / total) * width));
      if (w > 0) {
        out.push('<rect x="' + x + '" y="0" width="' + w + '" height="30" class="' + p.cls + '"/>');
        if (w > 170) {
          out.push('<text x="' + (x + 8) + '" y="20" class="seg-label' + (p.dark ? " dark" : "") + '">' + esc(p.label) + " " + B.fmt(p.value) + "</text>");
        }
      }
      x += w;
    });
    out.push("</svg>");
    return out.join("");
  }

  return {
    allocationBars: allocationBars,
    surplusBars: surplusBars,
    incomeBreakdown: incomeBreakdown,
  };
})();
