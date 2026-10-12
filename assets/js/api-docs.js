const form = document.querySelector("#endpoint-form");
const release = document.querySelector("#api-release");
const country = document.querySelector("#api-country");
const level = document.querySelector("#api-level");
const output = document.querySelector("#api-endpoint");
const python = document.querySelector("#python-example");
const origin =
  window.geoBoundariesConfig?.apiOrigin ||
  window.geoBoundariesConfig?.origin ||
  location.origin;
function update() {
  const iso = country.value.trim().toUpperCase();
  const endpoint = `${origin}/api/nightly/${release.value}/${iso}/${level.value}/`;
  output.textContent = endpoint;
  const queryAll = iso === "ALL" || level.value === "ALL";
  python.textContent = `import requests\n\nurl = "${endpoint}"\nresponse = requests.get(url, timeout=30)\nresponse.raise_for_status()\n${queryAll ? 'boundaries = response.json()\nfor boundary in boundaries:\n    print(boundary.get("gjDownloadURL"))' : 'boundary = response.json()\nprint(boundary["gjDownloadURL"])'}`;
}
form.addEventListener("input", update);
form.addEventListener("change", update);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  country.value = country.value.trim().toUpperCase();
  update();
  window.open(output.textContent, "_blank", "noopener,noreferrer");
});
update();
