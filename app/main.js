// Boot and routing for the deal board. The board is a hash-routed single page:
//   #/                     the deal board, filters read from the query part
//   #/deal/<id>           one deal's detail page
//   #/about               how the board is built
// Filters live in the hash query (#/?q=airpods&cat=Audio&min=40) so a filtered
// view is a shareable link, and the back button works between views.

import { CATEGORIES, STORES, deals } from "./deals.js";
import { SORTS, applyFilters, emptyFilters, findDeal } from "./filters.js";
import { aboutView, boardView, dealCard, detailView, notFoundView } from "./views.js";

const root = document.getElementById("app");

function readState() {
  const state = emptyFilters();
  const query = location.hash.split("?")[1] ?? "";
  for (const [key, value] of new URLSearchParams(query)) {
    if (key === "q") state.q = value;
    if (key === "cat" && (value === "All" || CATEGORIES.includes(value))) state.cat = value;
    if (key === "store" && (value === "All" || STORES.includes(value))) state.store = value;
    if (key === "min") state.min = [0, 20, 30, 40, 50].includes(Number(value)) ? Number(value) : 0;
    if (key === "verdict" && ["All", "new-low", "strong", "routine", "weak"].includes(value)) state.verdict = value;
    if (key === "sort" && value in SORTS) state.sort = value;
  }
  return state;
}

function writeState(state) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.cat !== "All") params.set("cat", state.cat);
  if (state.store !== "All") params.set("store", state.store);
  if (state.min) params.set("min", String(state.min));
  if (state.verdict !== "All") params.set("verdict", state.verdict);
  if (state.sort !== "discount") params.set("sort", state.sort);
  const suffix = params.toString();
  location.hash = "#/" + (suffix ? "?" + suffix : "");
}

function wireControls(state) {
  const search = document.getElementById("q");
  const store = document.getElementById("store");
  const min = document.getElementById("min");
  const sort = document.getElementById("sort");
  if (!search) return;
  let timer = 0;
  search.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.q = search.value;
      writeState(state);
    }, 250);
  });
  store.addEventListener("change", () => {
    state.store = store.value;
    writeState(state);
  });
  min.addEventListener("change", () => {
    state.min = Number(min.value);
    writeState(state);
  });
  sort.addEventListener("change", () => {
    state.sort = sort.value;
    writeState(state);
  });
  root.querySelectorAll("[data-cat]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.cat = chip.dataset.cat;
      writeState(state);
    });
  });
  root.querySelectorAll("[data-verdict]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.verdict = chip.dataset.verdict;
      writeState(state);
    });
  });
}

function render() {
  const path = location.hash.split("?")[0];
  if (path.startsWith("#/deal/")) {
    const deal = findDeal(decodeURIComponent(path.slice(7)));
    root.innerHTML = deal ? detailView(deal) : notFoundView();
    document.title = deal ? `${deal.title} — Black Friday Beacon` : "Not found — Black Friday Beacon";
  } else if (path === "#/about") {
    root.innerHTML = aboutView();
    document.title = "How the board is built — Black Friday Beacon";
  } else {
    const state = readState();
    root.innerHTML = boardView(state, CATEGORIES, STORES);
    document.title = "Black Friday Beacon — real deals, checked 27 Nov 2026";
    wireControls(state);
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
render();
