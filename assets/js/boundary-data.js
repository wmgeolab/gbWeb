// Shared data helpers. API requests use the API origin selected at build time.
export const API_PATH = "/api/nightly/gbOpen/ALL/ALL/";
export const PAGE_SIZE = 18;

export function safeURL(value, normalize = (url) => url) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(normalize(value));
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function getDownloadLinks(row, simplified, normalize) {
  const fields = simplified
    ? [["simplifiedGeometryGeoJSON", "Simplified GeoJSON"]]
    : [
        ["gjDownloadURL", "GeoJSON"],
        ["staticDownloadLink", "All formats ZIP"],
        ["tjDownloadURL", "TopoJSON"],
      ];
  return fields
    .map(([field, label]) => ({ label, url: safeURL(row[field], normalize) }))
    .filter((link) => link.url);
}

export function filterBoundaries(
  rows,
  { query = "", level = "", region = "" } = {},
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter((row) => {
    const name = `${row.boundaryName} ${row.boundaryISO}`.toLocaleLowerCase();
    return (
      terms.every((term) => name.includes(term)) &&
      (!level || row.boundaryType === level) &&
      (!region || row.Continent === region)
    );
  });
}

export function normalizeRows(response) {
  const rows = Array.isArray(response) ? response : [response];
  if (
    !rows.every(
      (row) =>
        row &&
        typeof row.boundaryName === "string" &&
        /^[A-Z]{3}$/.test(row.boundaryISO) &&
        /^ADM[0-5]$/.test(row.boundaryType),
    )
  ) {
    throw new Error(
      "The API response did not contain valid boundary metadata.",
    );
  }
  return rows.sort(
    (a, b) =>
      a.boundaryName.localeCompare(b.boundaryName) ||
      a.boundaryType.localeCompare(b.boundaryType),
  );
}
