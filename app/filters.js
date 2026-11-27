// Searching, filtering and sorting the deal list. A filter state is a plain
// object the router reads from the hash, so a filtered view is a link anyone
// can share: #/?q=airpods&cat=Audio&store=Amazon&min=40&sort=discount.

import { deals } from "./deals.js";
import { discountPct, saved } from "./format.js";

export const SORTS = {
  discount: "Biggest discount",
  saving: "Biggest saving ($)",
  price: "Lowest price",
  verdict: "Best verdict first",
  name: "Name A–Z",
};

const VERDICT_RANK = { "new-low": 0, strong: 1, routine: 2, weak: 3 };

export function emptyFilters() {
  return { q: "", cat: "All", store: "All", min: 0, verdict: "All", sort: "discount" };
}

export function applyFilters(state) {
  const query = state.q.trim().toLowerCase();
  let list = deals.filter((deal) => {
    if (query) {
      const hay = `${deal.title} ${deal.store} ${deal.category}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    if (state.cat !== "All" && deal.category !== state.cat) return false;
    if (state.store !== "All" && deal.store !== state.store) return false;
    if (state.verdict !== "All" && deal.verdict !== state.verdict) return false;
    if (discountPct(deal) < state.min) return false;
    return true;
  });
  const by = {
    discount: (a, b) => discountPct(b) - discountPct(a) || saved(b) - saved(a),
    saving: (a, b) => saved(b) - saved(a),
    price: (a, b) => a.price - b.price,
    verdict: (a, b) =>
      VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] ||
      discountPct(b) - discountPct(a),
    name: (a, b) => a.title.localeCompare(b.title),
  }[state.sort] ?? ((a, b) => discountPct(b) - discountPct(a));
  return [...list].sort(by);
}

export function findDeal(id) {
  return deals.find((deal) => deal.id === id);
}

export function bestDeals(count) {
  return [...deals]
    .sort((a, b) => discountPct(b) - discountPct(a) || saved(b) - saved(a))
    .slice(0, count);
}
