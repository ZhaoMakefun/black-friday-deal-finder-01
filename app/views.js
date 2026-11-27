// Rendering: the deal board, one deal's detail page, and the method page.
// Everything is built as HTML strings and set once per route; the deal links
// are ordinary <a href> links to the stores, so they work with no JavaScript.

import { CHECKED_DAY, VERDICTS, deals } from "./deals.js";
import { checkedLabel, discountPct, median, money, priceLine, saved } from "./format.js";
import { applyFilters, bestDeals } from "./filters.js";

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function verdictBadge(deal) {
  const v = VERDICTS[deal.verdict];
  return `<span class="badge badge-${deal.verdict}" title="${esc(v.hint)}">${esc(v.label)}</span>`;
}

export function dealCard(deal) {
  const pct = discountPct(deal);
  return `<article class="card">
    <div class="card-top">
      <span class="store">${esc(deal.store)}</span>
      <span class="cat">${esc(deal.category)}</span>
    </div>
    <h3><a href="#/deal/${deal.id}">${esc(deal.title)}</a></h3>
    <p class="prices">
      <span class="now">${priceLine(deal)}</span>
      <span class="was">${money(deal.was)}${deal.per ?? ""}</span>
      <span class="off">−${pct}%</span>
    </p>
    <p class="save">Save ${money(saved(deal))} · ${verdictBadge(deal)}</p>
    <p class="meta">Checked ${checkedLabel(deal)} · ${esc(deal.source)}</p>
    <p class="actions">
      <a class="btn" href="${esc(deal.url)}" target="_blank" rel="noopener">View at ${esc(deal.store)} ↗</a>
      <a class="btn ghost" href="#/deal/${deal.id}">Details</a>
    </p>
  </article>`;
}

function statsStrip() {
  const pcts = deals.map(discountPct);
  const totalSaved = deals.reduce((sum, d) => sum + saved(d), 0);
  const newLows = deals.filter((d) => d.verdict === "new-low").length;
  return `<section class="stats" aria-label="Board totals">
    <div><strong>${deals.length}</strong><span>verified deals</span></div>
    <div><strong>${Math.max(...pcts)}%</strong><span>deepest cut</span></div>
    <div><strong>${median(pcts)}%</strong><span>median discount</span></div>
    <div><strong>${money(totalSaved)}</strong><span>total savings</span></div>
    <div><strong>${newLows}</strong><span>new lows</span></div>
  </section>`;
}

export function boardView(state, categories, stores) {
  const list = applyFilters(state);
  const top = bestDeals(3);
  const chips = ["All", ...categories]
    .map(
      (c) =>
        `<button class="chip${state.cat === c ? " on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`,
    )
    .join("");
  const storeOptions = ["All", ...stores]
    .map((s) => `<option${state.store === s ? " selected" : ""}>${esc(s)}</option>`)
    .join("");
  const minOptions = [0, 20, 30, 40, 50]
    .map(
      (m) =>
        `<option value="${m}"${state.min === m ? " selected" : ""}>${m === 0 ? "Any discount" : m + "% off or more"}</option>`,
    )
    .join("");
  const sortOptions = Object.entries({
    discount: "Biggest discount",
    saving: "Biggest saving ($)",
    price: "Lowest price",
    verdict: "Best verdict first",
    name: "Name A–Z",
  })
    .map(([k, label]) => `<option value="${k}"${state.sort === k ? " selected" : ""}>${label}</option>`)
    .join("");
  const verdictChips = ["All", "new-low", "strong", "routine", "weak"]
    .map(
      (v) =>
        `<button class="chip small${state.verdict === v ? " on" : ""}" data-verdict="${v}">${v === "All" ? "All verdicts" : VERDICTS[v].label}</button>`,
    )
    .join("");
  const cards = list.map(dealCard).join("");
  return `
  <section class="hero">
    <h1>Black Friday, checked deal by deal.</h1>
    <p>${deals.length} real deals at ${stores.length} stores, each price read from a store release or a deals source on ${CHECKED_DAY} — with an honest verdict on whether it is really a deal.</p>
  </section>
  ${statsStrip()}
  <section class="top3" aria-label="Best deals">
    <h2>Best of the board</h2>
    <ol>
      ${top.map((d, i) => `<li><span class="rank">${i + 1}</span> <a href="#/deal/${d.id}">${esc(d.title)}</a> — <strong>${priceLine(d)}</strong> <span class="was">${money(d.was)}</span> <span class="off">−${discountPct(d)}%</span> at ${esc(d.store)}</li>`).join("")}
    </ol>
  </section>
  <section class="controls" aria-label="Search and filters">
    <label class="search">Search <input id="q" type="search" value="${esc(state.q)}" placeholder="Try “airpods” or “vacuum”…" autocomplete="off"></label>
    <div class="chips" role="group" aria-label="Category">${chips}</div>
    <div class="chips" role="group" aria-label="Verdict">${verdictChips}</div>
    <div class="selects">
      <label>Store <select id="store">${storeOptions}</select></label>
      <label>Discount <select id="min">${minOptions}</select></label>
      <label>Sort by <select id="sort">${sortOptions}</select></label>
    </div>
  </section>
  <p class="count" id="count">${list.length} of ${deals.length} deals</p>
  <section class="grid" id="grid">${cards || `<p class="empty">No deals match those filters. <a href="#/">Clear the filters</a> to see the whole board.</p>`}</section>
  <p class="fine">Prices move fast on Black Friday — the price at checkout is the one that counts. Every deal links to the store's own search for that exact product.</p>`;
}

export function detailView(deal) {
  const pct = discountPct(deal);
  const v = VERDICTS[deal.verdict];
  const compareRows = [
    { store: deal.store, price: deal.price, here: true },
    ...deal.alsoAt,
  ].sort((a, b) => a.price - b.price);
  const cheapest = Math.min(...compareRows.map((r) => r.price));
  const compareHtml = compareRows
    .map(
      (row) =>
        `<tr${row.here ? ' class="here"' : ""}><td>${esc(row.store)}</td><td>${money(row.price)}${deal.per ?? ""}</td><td>${row.price === cheapest ? (row.here ? "This deal — cheapest" : "Cheapest") : "+" + money(row.price - cheapest) + " vs cheapest"}</td></tr>`,
    )
    .join("");
  return `
  <p class="crumb"><a href="#/">← All deals</a> · ${esc(deal.category)} · ${esc(deal.store)}</p>
  <article class="detail">
    <h1>${esc(deal.title)}</h1>
    <p class="prices big">
      <span class="now">${priceLine(deal)}</span>
      <span class="was">${money(deal.was)}${deal.per ?? ""}</span>
      <span class="off">−${pct}%</span>
    </p>
    <p class="save">You save ${money(saved(deal))} off the usual price.</p>
    <p>${verdictBadge(deal)} <strong>${esc(v.label)}</strong> — ${esc(v.hint)}.</p>
    <h2>Why this verdict</h2>
    <p>${esc(deal.note)}</p>
    <h2>Price check</h2>
    <dl class="facts">
      <dt>Sale price</dt><dd>${priceLine(deal)}</dd>
      <dt>Usual price</dt><dd>${money(deal.was)}${deal.per ?? ""}</dd>
      <dt>Discount</dt><dd>${pct}% off — ${money(saved(deal))} saved</dd>
      <dt>Store</dt><dd>${esc(deal.store)}</dd>
      <dt>Checked</dt><dd>${checkedLabel(deal)} (${CHECKED_DAY})</dd>
      <dt>Source</dt><dd>${esc(deal.source)}</dd>
    </dl>
    ${deal.alsoAt.length ? `<h2>Same product, other stores</h2>
    <table class="compare">
      <thead><tr><th>Store</th><th>Price</th><th>Against cheapest</th></tr></thead>
      <tbody>${compareHtml}</tbody>
    </table>` : ""}
    <p class="actions"><a class="btn big" href="${esc(deal.url)}" target="_blank" rel="noopener">View at ${esc(deal.store)} ↗</a></p>
    <p class="fine">Prices change by the hour on Black Friday. Check the price in your cart before you pay — if it has moved, this deal is gone.</p>
  </article>`;
}

export function aboutView() {
  return `
  <article class="about">
    <h1>How this board is built</h1>
    <p>Black Friday Beacon is a hand-checked deal board. Every deal on it was found and checked by reading a store's own Black Friday release or a deals source that names the store — on ${CHECKED_DAY}, the day of Black Friday 2026. No price here was invented, and no deal was copied from another board without checking its source.</p>
    <h2>What each deal shows</h2>
    <ul>
      <li><strong>Sale price and usual price</strong> — the discount is worked out from those two numbers, so it always adds up.</li>
      <li><strong>Checked date and source</strong> — when the price was read and where. Amazon prices move daily, so the source's report date is given too.</li>
      <li><strong>An honest verdict</strong> — New low (the lowest price the source has seen), Strong price (a deep cut on a current model), Routine sale (a real cut, but modest, or a better price exists), or Barely a deal (a token cut — included so shoppers can see what to skip).</li>
      <li><strong>A store link</strong> — to the store's own search for that exact product, so you land on the real listing.</li>
    </ul>
    <h2>What we leave out</h2>
    <p>“Was” prices a store never published, derivative models with no price history, and deals whose only evidence is another deal site's roundup with no store named. Where a store states a saving instead of a usual price, the usual price shown is the sale price plus that stated saving, and the note says so.</p>
    <h2>Sale dates, 2026</h2>
    <ul>
      <li>Amazon Black Friday Week: 19–30 Nov</li>
      <li>Best Buy Black Friday Sale: 19–28 Nov; Cyber Sunday &amp; Monday 29–30 Nov</li>
      <li>Target Black Friday sale: 22–29 Nov</li>
      <li>Walmart Black Friday Deals: 23–29 Nov; Cyber Monday 30 Nov–2 Dec</li>
      <li>Costco Black Friday prices: 27–30 Nov</li>
      <li>Apple Shopping Event (gift card, not a price cut): 27–30 Nov</li>
      <li>Cyber Monday: Mon 30 Nov</li>
    </ul>
    <p><a href="#/">← Back to the deals</a></p>
  </article>`;
}

export function notFoundView() {
  return `<article class="about"><h1>That deal is not on the board</h1><p>It may have sold out or been taken down. <a href="#/">Back to all deals</a>.</p></article>`;
}
