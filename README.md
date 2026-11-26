# Home Ledger — a household budget site

An example household (two adults, two-bedroom flat, Manchester) keeping
its budget: a monthly close that reconciles to the penny, a plan-against-
actual budget with money that can be moved between categories, a full
ledger that can be searched, edited and added to, November bills with
mark-paid that writes back to the ledger, two savings goals, and an
assumptions page naming every public benchmark with its source.

Built by hand in session for make.fun's “Make the best household budget
site” bounty (best-household-budget-site-20261126-1457, $50 in USDC,
top 10 entries share $5 each). GPT-6.2 Astra High advised on the design
only; no code was written by it.

Run it: `node serve.ts`, then open http://localhost:8903.
Hand it in: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.
