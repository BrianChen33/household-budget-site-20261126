// Home Ledger — seed records for one example household.
//
// Two adults renting a two-bedroom flat in Manchester, UK. All amounts are
// integer pence. Nothing here is a real person's money: the pay, the shops
// and the savings choices are illustrative records, and the three figures
// that come from public sources are named as benchmarks on the Assumptions
// page, kept separate from the household's own lease and bills.
//
// The ledger is the single source of truth. Monthly totals, category
// actuals, charts, goal balances and bill states are all derived from
// these records in budget.js, so the October close reconciles exactly:
// income £4,000, fixed £1,600, variable £1,400, surplus £1,000, of which
// £800 moves to the emergency fund and £200 stays in the current account.

window.HOUSEHOLD = {
  name: "Home Ledger",
  household: "Example household — two adults, two-bedroom flat, Manchester",
  currency: "GBP",
  lastMonth: "2026-10",
  firstMonth: "2025-11",
  currentAccountOpening: 112000, // pence, balance on 1 November 2025

  // Public benchmarks, with geography, date and source. The household's own
  // lease (£1,250) and bills are separate figures, recorded below.
  benchmarks: [
    {
      label: "Average Manchester two-bedroom private rent",
      value: "£1,239 a month",
      where: "Manchester local authority, all private tenancies",
      when: "September 2026",
      source: "ONS, Price Index of Private Rents (published 21 October 2026)",
    },
    {
      label: "Manchester Band B council tax",
      value: "£1,798.26 a year",
      where: "Manchester City Council, Band B, two adults",
      when: "2026/27",
      source: "Manchester City Council, council tax bands and charges 2026/27",
    },
    {
      label: "Adult Bee Bus ticket, 28 days",
      value: "£80",
      where: "Greater Manchester, all Bee Network buses",
      when: "2026 (fares frozen for the year)",
      source: "Transport for Greater Manchester (TfGM)",
    },
  ],

  // Spending categories. kind fixed/variable; plan is the monthly limit in
  // pence, applied to every month. Plans are the household's own choice.
  categories: [
    { id: "rent", label: "Rent", kind: "fixed", plan: 125000 },
    { id: "council-tax", label: "Council tax", kind: "fixed", plan: 0 },
    { id: "energy", label: "Energy", kind: "fixed", plan: 9600 },
    { id: "water", label: "Water", kind: "fixed", plan: 2800 },
    { id: "broadband", label: "Broadband", kind: "fixed", plan: 2400 },
    { id: "mobile", label: "Mobile phones", kind: "fixed", plan: 1200 },
    { id: "insurance", label: "Home insurance", kind: "fixed", plan: 1017 },
    { id: "groceries", label: "Groceries", kind: "variable", plan: 42000 },
    { id: "dining", label: "Dining out", kind: "variable", plan: 18000 },
    { id: "transport", label: "Transport", kind: "variable", plan: 11000 },
    { id: "household", label: "Household goods", kind: "variable", plan: 15000 },
    { id: "entertainment", label: "Entertainment", kind: "variable", plan: 9000 },
    { id: "clothing", label: "Clothing", kind: "variable", plan: 6000 },
    { id: "health", label: "Health & pharmacy", kind: "variable", plan: 5000 },
    { id: "gifts", label: "Gifts & occasions", kind: "variable", plan: 8000 },
    { id: "home", label: "Home & garden", kind: "variable", plan: 10000 },
    { id: "travel", label: "Travel & days out", kind: "variable", plan: 12000 },
    { id: "personal", label: "Personal care", kind: "variable", plan: 6000 },
    { id: "misc", label: "Miscellaneous", kind: "variable", plan: 6000 },
  ],

  // Take-home pay: two deposits on the 1st of every month.
  pay: [
    { who: "Maya", amount: 215000, day: 1 },
    { who: "Tom", amount: 185000, day: 1 },
  ],

  // Scheduled bills. Council tax runs in ten instalments, April to January,
  // so February and March have no payment. The 2026/27 annual charge is
  // £1,798.26: nine instalments of £179.83 and a final £179.79. The 2025/26
  // charge was £1,697.91 (7/9 of the published Band D £2,183.03): nine of
  // £169.79 and a final £169.80, paid in January 2026.
  bills: [
    { id: "rent", category: "rent", payee: "Northern Lettings (rent)", amount: 125000, day: 1, monthly: true },
    { id: "council-tax", category: "council-tax", payee: "Manchester City Council", day: 1, councilTax: true },
    { id: "energy", category: "energy", payee: "Octopus Energy", amount: 9600, day: 5, monthly: true },
    { id: "water", category: "water", payee: "United Utilities", amount: 2800, day: 12, monthly: true },
    { id: "broadband", category: "broadband", payee: "BT Broadband", amount: 2400, day: 8, monthly: true },
    { id: "mobile", category: "mobile", payee: "EE", amount: 1200, day: 15, monthly: true },
    { id: "insurance", category: "insurance", payee: "Aviva home insurance", amount: 1017, day: 20, monthly: true },
  ],

  // One adult's bus pass: £80 every 28 days, renewing 4 October 2026 in
  // the close month. The 28-day cycle lands twice in November 2026
  // (1st and 29th), so November has two renewals, not one.
  busPass: { payee: "Bee Bus 28-day pass", amount: 8000, first: "2025-11-30", everyDays: 28 },

  goals: [
    {
      id: "emergency",
      name: "Emergency fund",
      target: 1200000,
      opening: 240000, // pence, balance on 1 November 2025
      // Monthly contributions, pence. October's £800 is the last one: the
      // fund reaches its £12,000 target on 31 October 2026.
      contributions: {
        "2025-11": 85000, "2025-12": 60000, "2026-01": 90000, "2026-02": 100000,
        "2026-03": 95000, "2026-04": 80000, "2026-05": 85000, "2026-06": 50000,
        "2026-07": 85000, "2026-08": 70000, "2026-09": 80000, "2026-10": 80000,
      },
      note: "The household's own target: six months of essential spending at £2,000 a month — their planning assumption — kept in an easy-access savings account.",
    },
    {
      id: "holiday",
      name: "Summer holiday 2027",
      target: 150000,
      opening: 0,
      contributions: { "2026-07": 15000, "2026-08": 15000, "2026-09": 15000 },
      note: "A week in Cornwall next summer, saved a little at a time.",
    },
  ],

  // Posted variable spending. One row: [date, payee, pence, category].
  // October 2026 is the full close ledger; earlier months carry one or two
  // rows per category, and every monthly total in the site is the sum of
  // these rows plus the scheduled bills above — nothing is typed twice.
  variableTx: [
    // November 2025
    ["2025-11-04", "Tesco", 23850, "groceries"],
    ["2025-11-18", "Sainsbury's", 18150, "groceries"],
    ["2025-11-08", "Rudy's Pizza", 13000, "dining"],
    ["2025-11-15", "IKEA", 12000, "household"],
    ["2025-11-09", "Vue Cinema", 7000, "entertainment"],
    ["2025-11-12", "Uniqlo", 5500, "clothing"],
    ["2025-11-06", "Boots", 4000, "health"],
    ["2025-11-21", "Birthday gift for Sam", 9000, "gifts"],
    ["2025-11-16", "B&Q", 8500, "home"],
    ["2025-11-02", "Trainline", 11000, "travel"],
    ["2025-11-10", "Haircut — Maya", 6000, "personal"],
    ["2025-11-24", "Post Office", 6000, "misc"],
    // December 2025
    ["2025-12-05", "Tesco", 29640, "groceries"],
    ["2025-12-19", "Sainsbury's", 22360, "groceries"],
    ["2025-12-13", "Dishoom", 21000, "dining"],
    ["2025-12-07", "IKEA", 18000, "household"],
    ["2025-12-20", "Vue Cinema", 12000, "entertainment"],
    ["2025-12-10", "H&M", 14000, "clothing"],
    ["2025-12-03", "Boots", 4500, "health"],
    ["2025-12-15", "Christmas gifts", 19000, "gifts"],
    ["2025-12-08", "B&Q", 6000, "home"],
    ["2025-12-27", "Trainline", 6000, "travel"],
    ["2025-12-11", "Haircut — Tom", 4000, "personal"],
    ["2025-12-22", "Post Office", 3500, "misc"],
    // January 2026
    ["2026-01-06", "Tesco", 22730, "groceries"],
    ["2026-01-20", "Aldi", 18270, "groceries"],
    ["2026-01-10", "The Refuge", 11500, "dining"],
    ["2026-01-14", "Argos", 10500, "household"],
    ["2026-01-16", "Concert tickets", 6500, "entertainment"],
    ["2026-01-17", "Primark", 4500, "clothing"],
    ["2026-01-08", "Boots", 3800, "health"],
    ["2026-01-25", "Flowers", 3500, "gifts"],
    ["2026-01-18", "B&Q", 7500, "home"],
    ["2026-01-04", "Trainline", 9500, "travel"],
    ["2026-01-12", "Haircut — Maya", 6200, "personal"],
    ["2026-01-26", "January sale — homeware", 11500, "misc"],
    // February 2026
    ["2026-02-03", "Tesco", 21800, "groceries"],
    ["2026-02-17", "Aldi", 17800, "groceries"],
    ["2026-02-14", "Rudy's Pizza", 10000, "dining"],
    ["2026-02-09", "B&M", 9500, "household"],
    ["2026-02-21", "Theatre tickets", 5500, "entertainment"],
    ["2026-02-07", "Primark", 3000, "clothing"],
    ["2026-02-05", "Boots", 4200, "health"],
    ["2026-02-13", "Valentine's card & flowers", 2500, "gifts"],
    ["2026-02-15", "B&Q", 6500, "home"],
    ["2026-02-01", "Trainline", 7000, "travel"],
    ["2026-02-11", "Haircut — Tom", 4800, "personal"],
    ["2026-02-19", "Bike service", 17400, "misc"],
    // March 2026
    ["2026-03-05", "Tesco", 24150, "groceries"],
    ["2026-03-19", "Sainsbury's", 18850, "groceries"],
    ["2026-03-12", "Dishoom", 12500, "dining"],
    ["2026-03-08", "IKEA", 11000, "household"],
    ["2026-03-15", "Vue Cinema", 7000, "entertainment"],
    ["2026-03-11", "Uniqlo", 5000, "clothing"],
    ["2026-03-06", "Boots", 4000, "health"],
    ["2026-03-09", "Mother's Day gift", 4000, "gifts"],
    ["2026-03-16", "B&Q", 8000, "home"],
    ["2026-03-02", "Trainline", 12000, "travel"],
    ["2026-03-13", "Haircut — Maya", 6500, "personal"],
    ["2026-03-23", "Post Office & stationery", 8000, "misc"],
    // April 2026
    ["2026-04-07", "Tesco", 25200, "groceries"],
    ["2026-04-21", "Aldi", 18800, "groceries"],
    ["2026-04-11", "The Refuge", 14000, "dining"],
    ["2026-04-13", "Argos", 12500, "household"],
    ["2026-04-18", "Gig tickets", 7500, "entertainment"],
    ["2026-04-09", "H&M", 6500, "clothing"],
    ["2026-04-04", "Boots", 4500, "health"],
    ["2026-04-25", "Birthday gift for Tom", 5500, "gifts"],
    ["2026-04-15", "B&Q", 9000, "home"],
    ["2026-04-03", "Trainline", 13000, "travel"],
    ["2026-04-12", "Haircut — Tom", 5500, "personal"],
    ["2026-04-27", "Charity donation", 5000, "misc"],
    // May 2026
    ["2026-05-06", "Tesco", 23675, "groceries"],
    ["2026-05-20", "Sainsbury's", 18825, "groceries"],
    ["2026-05-09", "Rudy's Pizza", 13500, "dining"],
    ["2026-05-12", "B&M", 11500, "household"],
    ["2026-05-16", "Vue Cinema", 7000, "entertainment"],
    ["2026-05-10", "Uniqlo", 5500, "clothing"],
    ["2026-05-05", "Boots", 4000, "health"],
    ["2026-05-24", "Flowers", 4500, "gifts"],
    ["2026-05-17", "B&Q", 8500, "home"],
    ["2026-05-02", "Trainline", 14000, "travel"],
    ["2026-05-11", "Haircut — Maya", 6000, "personal"],
    ["2026-05-26", "Post Office", 6000, "misc"],
    // June 2026 — the washing machine gives up: a £380 replacement is the month's dip.
    ["2026-06-04", "Tesco", 24400, "groceries"],
    ["2026-06-18", "Aldi", 18600, "groceries"],
    ["2026-06-13", "Dishoom", 12000, "dining"],
    ["2026-06-07", "IKEA", 11000, "household"],
    ["2026-06-20", "Vue Cinema", 6500, "entertainment"],
    ["2026-06-10", "Primark", 4000, "clothing"],
    ["2026-06-06", "Boots", 3800, "health"],
    ["2026-06-22", "Card & gift", 3000, "gifts"],
    ["2026-06-15", "Replacement washing machine", 38000, "home"],
    ["2026-06-21", "B&Q", 9000, "home"],
    ["2026-06-05", "Trainline", 22000, "travel"],
    ["2026-06-12", "Haircut — Maya", 5700, "personal"],
    ["2026-06-28", "Charity donation", 6000, "misc"],
    // July 2026
    ["2026-07-07", "Tesco", 22960, "groceries"],
    ["2026-07-21", "Sainsbury's", 18540, "groceries"],
    ["2026-07-11", "The Refuge", 13000, "dining"],
    ["2026-07-14", "Argos", 10000, "household"],
    ["2026-07-18", "Theatre tickets", 8000, "entertainment"],
    ["2026-07-09", "H&M", 4500, "clothing"],
    ["2026-07-04", "Boots", 3500, "health"],
    ["2026-07-25", "Flowers", 2500, "gifts"],
    ["2026-07-16", "B&Q", 7500, "home"],
    ["2026-07-03", "Trainline", 16000, "travel"],
    ["2026-07-12", "Haircut — Tom", 5500, "personal"],
    ["2026-07-27", "Post Office", 8000, "misc"],
    // August 2026
    ["2026-08-05", "Tesco", 26100, "groceries"],
    ["2026-08-19", "Aldi", 18900, "groceries"],
    ["2026-08-14", "Dishoom", 17000, "dining"],
    ["2026-08-08", "IKEA", 13000, "household"],
    ["2026-08-16", "Vue Cinema", 9500, "entertainment"],
    ["2026-08-11", "Uniqlo", 7000, "clothing"],
    ["2026-08-06", "Boots", 4000, "health"],
    ["2026-08-22", "Birthday gift for Maya", 6000, "gifts"],
    ["2026-08-15", "B&Q", 8500, "home"],
    ["2026-08-02", "Trainline", 18000, "travel"],
    ["2026-08-12", "Haircut — Maya", 5000, "personal"],
    ["2026-08-26", "Charity donation", 5000, "misc"],
    // September 2026
    ["2026-09-08", "Tesco", 24825, "groceries"],
    ["2026-09-22", "Sainsbury's", 18675, "groceries"],
    ["2026-09-12", "Rudy's Pizza", 14500, "dining"],
    ["2026-09-14", "B&M", 12000, "household"],
    ["2026-09-19", "Vue Cinema", 7000, "entertainment"],
    ["2026-09-10", "H&M", 6000, "clothing"],
    ["2026-09-07", "Boots", 4200, "health"],
    ["2026-09-26", "Flowers", 3500, "gifts"],
    ["2026-09-17", "B&Q", 8000, "home"],
    ["2026-09-05", "Trainline", 14000, "travel"],
    ["2026-09-13", "Haircut — Tom", 5800, "personal"],
    ["2026-09-24", "Post Office", 6500, "misc"],
    // October 2026 — the close month, in full detail.
    // Groceries: £447.00 against a £420 plan.
    ["2026-10-03", "Tesco", 8640, "groceries"],
    ["2026-10-07", "Sainsbury's", 5218, "groceries"],
    ["2026-10-10", "Tesco", 7495, "groceries"],
    ["2026-10-14", "Aldi", 4120, "groceries"],
    ["2026-10-17", "Sainsbury's", 6377, "groceries"],
    ["2026-10-21", "Tesco", 5830, "groceries"],
    ["2026-10-24", "Aldi", 3345, "groceries"],
    ["2026-10-28", "Tesco", 3675, "groceries"],
    // Dining out: £140.00, £40 under plan.
    ["2026-10-02", "The Refuge", 4250, "dining"],
    ["2026-10-09", "Rudy's Pizza", 3120, "dining"],
    ["2026-10-16", "Dishoom", 3875, "dining"],
    ["2026-10-23", "Grindsmith coffee & cake", 1285, "dining"],
    ["2026-10-30", "Honest Crust takeaway", 1470, "dining"],
    // Household goods: £132.00.
    ["2026-10-05", "B&M", 2460, "household"],
    ["2026-10-12", "IKEA", 6140, "household"],
    ["2026-10-19", "B&M", 1835, "household"],
    ["2026-10-26", "Argos", 2765, "household"],
    // Entertainment: £65.00.
    ["2026-10-08", "Vue Cinema", 2700, "entertainment"],
    ["2026-10-09", "Netflix", 1299, "entertainment"],
    ["2026-10-10", "Spotify", 1199, "entertainment"],
    ["2026-10-18", "Waterstones", 1302, "entertainment"],
    // Clothing, health, gifts, home, travel, personal, misc.
    ["2026-10-11", "Uniqlo", 4100, "clothing"],
    ["2026-10-06", "Boots", 2140, "health"],
    ["2026-10-20", "Boots", 1660, "health"],
    ["2026-10-13", "Birthday gift for Sam", 5800, "gifts"],
    ["2026-10-27", "Flowers & card", 3800, "gifts"],
    ["2026-10-18", "B&Q", 8800, "home"],
    ["2026-10-11", "Trainline — Liverpool", 4200, "travel"],
    ["2026-10-25", "Trainline — Peak District", 6800, "travel"],
    ["2026-10-25", "Peak District lunch", 5500, "travel"],
    ["2026-10-09", "Haircut — Maya", 3200, "personal"],
    ["2026-10-22", "Haircut — Tom", 2500, "personal"],
    ["2026-10-15", "Post Office & stationery", 1850, "misc"],
    ["2026-10-29", "Charity donation", 3250, "misc"],
  ],
};
