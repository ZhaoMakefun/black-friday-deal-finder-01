// Small formatting helpers for prices, discounts and dates. Nothing here knows
// about the page: it only turns numbers into the strings the views show.

export function money(amount) {
  return "$" + amount.toFixed(2).replace(/\.00$/, "");
}

export function discountPct(deal) {
  return Math.round(((deal.was - deal.price) / deal.was) * 100);
}

export function saved(deal) {
  return deal.was - deal.price;
}

export function priceLine(deal) {
  return money(deal.price) + (deal.per ?? "");
}

export function checkedLabel(deal) {
  const [year, month, day] = deal.checked.split("-").map(Number);
  const names = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${names[month - 1]} ${day}, ${year}`;
}

export function median(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
