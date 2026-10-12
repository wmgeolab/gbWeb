import assert from "node:assert/strict";
import test from "node:test";
import {
  filterBoundaries,
  normalizeRows,
  getDownloadLinks,
  safeURL,
} from "../assets/js/boundary-data.js";

const rows = [
  {
    boundaryName: "United States of America",
    boundaryISO: "USA",
    boundaryType: "ADM1",
    Continent: "Northern America",
  },
  {
    boundaryName: "Kenya",
    boundaryISO: "KEN",
    boundaryType: "ADM0",
    Continent: "Africa",
  },
  {
    boundaryName: "Kenya",
    boundaryISO: "KEN",
    boundaryType: "ADM1",
    Continent: "Africa",
  },
];

test("country names, ISO codes, regions and levels combine without losing records", () => {
  assert.equal(filterBoundaries(rows, { query: "  kEn " }).length, 2);
  assert.equal(
    filterBoundaries(rows, {
      query: "United America",
      level: "ADM1",
      region: "Northern America",
    }).length,
    1,
  );
  assert.equal(
    filterBoundaries(rows, { query: "Kenya", level: "ADM1", region: "Africa" })
      .length,
    1,
  );
  assert.equal(
    filterBoundaries(rows, { query: "Kenya", region: "Europe" }).length,
    0,
  );
  assert.equal(filterBoundaries(rows).length, 3);
});

test("invalid metadata fails clearly instead of masquerading as an empty result", () => {
  assert.throws(() => normalizeRows({ error: "API unavailable" }));
  assert.throws(() => normalizeRows([{ ...rows[0], boundaryType: "ADM9" }]));
  assert.equal(normalizeRows(rows)[0].boundaryName, "Kenya");
  assert.equal(normalizeRows(rows[0]).length, 1);
  assert.deepEqual(normalizeRows([]), []);
});

test("simplified downloads never substitute full resolution when a link is missing", () => {
  const row = {
    gjDownloadURL: "https://example.org/full.geojson",
    staticDownloadLink: "https://example.org/all.zip",
    simplifiedGeometryGeoJSON: "https://example.org/simple.geojson",
  };
  assert.equal(
    getDownloadLinks(row, true)[0].url,
    "https://example.org/simple.geojson",
  );
  assert.equal(
    getDownloadLinks(row, false)[0].url,
    "https://example.org/full.geojson",
  );
  assert.deepEqual(
    getDownloadLinks({ ...row, simplifiedGeometryGeoJSON: "" }, true),
    [],
  );
});

test("metadata cannot inject executable or malformed download URLs", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///tmp/test",
    "not a URL",
    null,
    3,
  ])
    assert.equal(safeURL(value), null);
  assert.equal(
    safeURL("https://github.com/example/data.zip"),
    "https://github.com/example/data.zip",
  );
});
