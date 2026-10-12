import {
  API_PATH,
  PAGE_SIZE,
  safeURL,
  getDownloadLinks,
  filterBoundaries,
  normalizeRows,
} from "./boundary-data.js";

const browser = document.querySelector("[data-boundary-browser]");
const simplified = browser.dataset.resolution === "simplified";
const filters = document.querySelector("#boundary-filters");
const search = document.querySelector("#country-search");
const level = document.querySelector("#level-filter");
const region = document.querySelector("#region-filter");
const results = document.querySelector("#boundary-results");
const count = document.querySelector("#result-count");
const pagination = document.querySelector("#boundary-pagination");
const previous = document.querySelector("#previous-page");
const next = document.querySelector("#next-page");
const pageLabel = document.querySelector("#page-label");
const normalize = window.geoBoundariesURL || ((value) => value);
const params = new URLSearchParams(location.search);
search.value = params.get("q") || "";
level.value = /^ADM[0-5]$/.test(params.get("level")) ? params.get("level") : "";
let rows = [];
let page = 1;
let loaded = false;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function link(label, url, className = "") {
  const node = element("a", className, label);
  node.href = url;
  return node;
}

function metadata(row) {
  const details = element("details");
  details.append(element("summary", "", "Source & metadata"));
  const dl = element("dl");
  for (const [label, field] of [
    ["ID", "boundaryID"],
    ["Source", "boundarySource"],
    ["License", "boundaryLicense"],
    ["Built", "buildDate"],
  ]) {
    dl.append(
      element("dt", "", label),
      element("dd", "", String(row[field] || "Not provided")),
    );
  }
  details.append(dl);
  const preview = safeURL(row.imagePreview, normalize);
  if (preview) details.append(link("View boundary preview ↗", preview));
  return details;
}

function card(row) {
  const article = element("article", "boundary-card");
  const top = element("div", "boundary-meta");
  top.append(
    element("span", "", row.boundaryISO),
    element("span", "level-badge", row.boundaryType),
  );
  article.append(top, element("h2", "", row.boundaryName));
  article.append(
    element(
      "p",
      "",
      `${row.boundaryCanonical && row.boundaryCanonical !== "nan" ? row.boundaryCanonical + " · " : ""}Year represented: ${row.boundaryYearRepresented || "Not provided"}`,
    ),
  );
  article.append(metadata(row));
  const downloads = element("div", "download-links");
  const links = getDownloadLinks(row, simplified, normalize);
  links.forEach((item, index) => {
    const a = link(
      item.label + " ↓",
      item.url,
      `button small ${index ? "secondary" : ""}`,
    );
    a.setAttribute(
      "aria-label",
      `${item.label} for ${row.boundaryName}, ${row.boundaryType}`,
    );
    downloads.append(a);
  });
  if (!links.length)
    downloads.append(
      element("p", "", "No download link supplied for this geometry."),
    );
  article.append(downloads);
  return article;
}

function saveFilters() {
  const url = new URL(location.href);
  for (const [key, value] of [
    ["q", search.value.trim()],
    ["level", level.value],
    ["region", region.value],
  ]) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  history.replaceState(null, "", url);
}

function render() {
  if (!loaded) return;
  const matches = filterBoundaries(rows, {
    query: search.value,
    level: level.value,
    region: region.value,
  });
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  page = Math.min(page, pages);
  const start = (page - 1) * PAGE_SIZE;
  count.textContent = matches.length
    ? `${start + 1}–${Math.min(start + PAGE_SIZE, matches.length)} of ${matches.length.toLocaleString()} boundary files`
    : "No matching boundary files";
  results.replaceChildren(...matches.slice(start, start + PAGE_SIZE).map(card));
  results.setAttribute("aria-busy", "false");
  if (!matches.length) {
    const empty = element("div", "empty-state");
    empty.append(
      element("h2", "", "No matching files"),
      element("p", "", "Change or clear the filters."),
    );
    const reset = element("button", "button secondary", "Clear filters");
    reset.type = "button";
    reset.addEventListener("click", () => filters.reset());
    empty.append(reset);
    results.append(empty);
  }
  pagination.hidden = pages <= 1;
  previous.disabled = page === 1;
  next.disabled = page === pages;
  pageLabel.textContent = `Page ${page} of ${pages}`;
  saveFilters();
}

async function load() {
  loaded = false;
  count.textContent = "Loading boundary data…";
  results.setAttribute("aria-busy", "true");
  results.replaceChildren(
    element("div", "empty-state", "Loading gbOpen metadata…"),
  );
  pagination.hidden = true;
  try {
    const origin =
      window.geoBoundariesConfig?.apiOrigin ||
      window.geoBoundariesConfig?.origin ||
      location.origin;
    const response = await fetch(new URL(API_PATH, origin), {
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok)
      throw new Error(`The API returned HTTP ${response.status}.`);
    rows = normalizeRows(await response.json());
    const regions = [
      ...new Set(rows.map((row) => row.Continent).filter(Boolean)),
    ].sort();
    const selected = region.value || params.get("region");
    region.replaceChildren(
      new Option("All regions", ""),
      ...regions.map((value) => new Option(value, value)),
    );
    if (regions.includes(selected)) region.value = selected;
    loaded = true;
    render();
  } catch (error) {
    count.textContent = "Boundary data unavailable";
    results.setAttribute("aria-busy", "false");
    const empty = element("div", "empty-state");
    empty.append(
      element("h2", "", "Boundary data unavailable"),
      element(
        "p",
        "",
        `${error.name === "TimeoutError" ? "The API request timed out." : error.message} Retry or browse GitHub.`,
      ),
    );
    const retry = element("button", "button", "Retry");
    retry.type = "button";
    retry.addEventListener("click", load);
    const actions = element("div", "hero-actions");
    actions.style.justifyContent = "center";
    actions.append(
      retry,
      link(
        "Browse data on GitHub ↗",
        "https://github.com/wmgeolab/geoBoundaries/tree/main/releaseData/gbOpen",
        "button secondary",
      ),
    );
    empty.append(actions);
    results.replaceChildren(empty);
  }
}

filters.addEventListener("submit", (event) => {
  event.preventDefault();
  page = 1;
  render();
});
search.addEventListener("input", () => {
  page = 1;
  render();
});
level.addEventListener("change", () => {
  page = 1;
  render();
});
region.addEventListener("change", () => {
  page = 1;
  render();
});
filters.addEventListener("reset", () => {
  // Reset to no filters, including when the page was opened with a search query.
  queueMicrotask(() => {
    search.value = "";
    level.value = "";
    region.value = "";
    page = 1;
    render();
  });
});
for (const [button, direction] of [
  [previous, -1],
  [next, 1],
]) {
  button.addEventListener("click", () => {
    page += direction;
    render();
    count.focus();
    count.scrollIntoView({ block: "nearest" });
  });
}
load();
