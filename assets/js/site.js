// Cloudflare Pages redirects .html URLs to extensionless paths.
const pageSlug = location.pathname.split("/").pop() || "index";
const currentPage = pageSlug.endsWith(".html") ? pageSlug : `${pageSlug}.html`;
const section = {
  "countryDownloads.html": "downloads",
  "globalDownloads.html": "downloads",
  "simplifiedDownloads.html": "downloads",
  "visualize.html": "visualize",
  "api.html": "api",
  "contribute.html": "contribute",
  "gbContribute.html": "contribute",
}[currentPage];
document
  .querySelector(`[data-nav="${section}"]`)
  ?.setAttribute("aria-current", "page");
const dataset = {
  "countryDownloads.html": "country",
  "globalDownloads.html": "global",
  "simplifiedDownloads.html": "simplified",
}[currentPage];
document
  .querySelector(`[data-dataset="${dataset}"]`)
  ?.setAttribute("aria-current", "page");

// Keep local navigation in the preview. API requests still use the configured branch.
if (["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) {
  document.querySelectorAll("a[href],form[action]").forEach((element) => {
    const attribute = element.tagName === "FORM" ? "action" : "href";
    const url = new URL(element.getAttribute(attribute), location.href);
    if (
      url.origin === window.geoBoundariesConfig?.origin &&
      !/^\/(?:api|api_contribute|data)\//.test(url.pathname)
    ) {
      element.setAttribute(attribute, url.pathname + url.search + url.hash);
    }
  });
}

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#primary-nav");
if (toggle && nav) {
  const mobile = matchMedia("(max-width: 760px)");
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.hidden = mobile.matches;
  };
  toggle.hidden = false;
  close();
  mobile.addEventListener("change", close);
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.hidden = expanded;
  });
  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobile.matches) {
      close();
      toggle.focus();
    }
  });
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copy);
    const status = button.parentElement.querySelector('[role="status"]');
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      if (status) status.textContent = "Copied to clipboard.";
    } catch {
      if (status) status.textContent = "Select the text above to copy it.";
    }
  });
});
