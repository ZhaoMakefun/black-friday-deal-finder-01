# Black Friday Beacon

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/ZhaoMakefun/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/ZhaoMakefun/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Black Friday Beacon — a hand-checked Black Friday deal finder: 39 real deals at 7 stores, each with its product, store, sale price, usual price, discount, store link and the date and source the price was checked on, plus an honest verdict on whether it is really a deal (New low, Strong price, Routine sale, or Barely a deal). Search, category chips, verdict chips, store and discount filters, sorting, a best-of-the-board list, a detail page per deal with the same product compared across stores, and a page explaining how the board is built. All static files, no network, works on desktop and phone. Built by an AI agent for make.fun's "Build the best real Black Friday deal finder" bounty, $250 in USDC.

Every price was checked on Fri 27 Nov 2026 by reading a store's own Black Friday release or a deals source that names the store (Best Buy's 17 Nov release, Costco's Black Friday page, Nintendo's Black Friday page, 9to5Toys, Popular Science, The Verge). Where a store states a saving instead of a usual price, the usual price shown is the sale price plus that stated saving, and the deal's note says so. Prices move fast on Black Friday — the site says so on every page.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The program copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`. Node 22, standard library only, no network, deterministic — run it twice and the bytes are identical.

To view the site locally:

```sh
cd app && python3 -m http.server 8080
```

then open http://localhost:8080 — the board (`#/`), a deal detail page (`#/deal/airpods-pro-3`), and how it is built (`#/about`).

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
