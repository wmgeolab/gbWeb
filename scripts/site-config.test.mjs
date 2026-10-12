import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { configureHtml, getSiteConfig, replaceSiteUrls } from './site-config.mjs';
import { API_PATH, getDownloadLinks } from '../assets/js/boundary-data.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const domains = { dev: 'https://geoboundaries-dev.org', main: 'https://geoboundaries.org' };
const apiDomains = { dev: 'https://www.geoboundaries-dev.org', main: domains.main };

test('Cloudflare branch detection takes precedence over the local checkout', () => {
  assert.equal(getSiteConfig({ WORKERS_CI_BRANCH: 'main', CF_PAGES_BRANCH: 'dev' }).origin, domains.main);
  assert.equal(getSiteConfig({ CF_PAGES_BRANCH: 'dev' }).origin, domains.dev);
  assert.equal(getSiteConfig({ WORKERS_CI_BRANCH: 'refs/heads/main' }).origin, domains.main);
  assert.equal(getSiteConfig({ GBWEB_BRANCH: 'dev', WORKERS_CI_BRANCH: 'main' }).origin, domains.dev);
  assert.equal(getSiteConfig({ WORKERS_CI_BRANCH: 'feature/example' }).origin, domains.dev);
  assert.equal(getSiteConfig({ CF_PAGES_BRANCH: 'dev' }).apiOrigin, apiDomains.dev);
  assert.equal(getSiteConfig({ WORKERS_CI_BRANCH: 'main' }).apiOrigin, apiDomains.main);
});

test('URL rewriting preserves paths and external hosts, including lookalike domains', () => {
  const config = getSiteConfig({ GBWEB_BRANCH: 'dev' });
  const input = String.raw`http://www.geoboundaries.org/api/?q=1#results https:\/\/geoboundaries.org\/data\/test.zip //geoboundaries-dev.org/images/test.png https://geoboundaries.geolab.wm.edu/api_contribute/ https://github.com/wmgeolab/geoBoundaries https://geoboundaries.org.example.com/data team@geoboundaries.org`;
  const output = replaceSiteUrls(input, config);
  assert(output.includes(`${apiDomains.dev}/api/?q=1#results`));
  assert(output.includes(String.raw`https:\/\/geoboundaries-dev.org\/data\/test.zip`));
  assert(output.includes(`${domains.dev}/images/test.png`));
  assert(output.includes(`${domains.dev}/api_contribute/`));
  assert(output.includes('https://github.com/wmgeolab/geoBoundaries'));
  assert(output.includes('https://geoboundaries.org.example.com/data'));
  assert(output.includes('team@geoboundaries.org'));
});

test('development API URLs retain www while website and contribution URLs use the site origin', () => {
  const input = String.raw`https://www.geoboundaries.org/api/nightly/gbOpen/KEN/ADM1/ https:\/\/geoboundaries-dev.org\/api\/nightly\/gbOpen\/ALL\/ALL\/ //www.geoboundaries-dev.org/api/ https://www.geoboundaries-dev.org/countryDownloads.html https://www.geoboundaries-dev.org/api_contribute/ https://data.geoboundaries-dev.org/nightly/gbOpen/KEN/ADM1/boundary.geojson`;
  const output = replaceSiteUrls(input, getSiteConfig({ GBWEB_BRANCH: 'dev' }));
  assert(output.includes(`${apiDomains.dev}/api/nightly/gbOpen/KEN/ADM1/`));
  assert(output.includes(String.raw`https:\/\/www.geoboundaries-dev.org\/api\/nightly\/gbOpen\/ALL\/ALL\/`));
  assert(output.includes(`${apiDomains.dev}/api/`));
  assert(output.includes(`${domains.dev}/countryDownloads.html`));
  assert(output.includes(`${domains.dev}/api_contribute/`));
  assert(output.includes('https://data.geoboundaries-dev.org/nightly/gbOpen/KEN/ADM1/boundary.geojson'));
  assert.equal(replaceSiteUrls(output, getSiteConfig({ GBWEB_BRANCH: 'dev' })), output);
});

test('relative navigation resolves against each page while scripts and fragment links stay valid', () => {
  const config = getSiteConfig({ GBWEB_BRANCH: 'dev' });
  const html = '<head></head><a href="../api.html?q=1#usage">API</a><a href="#menu">Menu</a><a href="https://github.com/example">External</a><script>var markup = "<a href=\'" + value + "\'>Link</a>";</script>';
  const output = configureHtml(html, 'archive/index.html', config);
  assert(output.includes(`href="${domains.dev}/api.html?q=1#usage"`));
  assert(output.includes('href="#menu"'));
  assert(output.includes('href="https://github.com/example"'));
  assert(output.includes('<script>var markup = "<a href=\'" + value'));
  assert(output.includes('<script src="/assets/js/site-config.js"></script>'));
});

test('both branch builds route API responses, downloads, CSV metadata, and contribution forms', async () => {
  const run = (script, branch) => execFileSync(process.execPath, [script], {
    cwd: root,
    env: { ...process.env, GBWEB_BRANCH: branch },
    encoding: 'utf8',
  });
  try {
    for (const [branch, origin] of Object.entries(domains)) {
      const apiOrigin = apiDomains[branch];
      run('scripts/build.mjs', branch);
      run('scripts/check.mjs', branch);
      const runtime = await readFile(join(root, 'dist/assets/js/site-config.js'), 'utf8');
      const window = { location: { origin: 'https://preview.example.workers.dev', pathname: '/index.html' }, open: (url) => { window.opened = url; } };
      const context = vm.createContext({ window, URL, screen: { height: 900 } });
      vm.runInContext(runtime, context);
      assert.equal(window.geoBoundariesConfig.origin, origin);
      assert.equal(window.geoBoundariesConfig.apiOrigin, apiOrigin);
      // The aliases must remain in both builds to normalize URLs from the other environment.
      assert.equal(window.geoBoundariesURL('https://www.geoboundaries.org/data/a.zip?q=1#x'), `${origin}/data/a.zip?q=1#x`);
      assert.equal(window.geoBoundariesURL('https://www.geoboundaries-dev.org/data/a.zip'), `${origin}/data/a.zip`);
      assert.equal(window.geoBoundariesURL('api.html#usage'), `${origin}/api.html#usage`);
      assert.equal(window.geoBoundariesURL('/api/nightly/gbOpen/KEN/ADM1/'), `${apiOrigin}/api/nightly/gbOpen/KEN/ADM1/`);
      assert.equal(window.geoBoundariesURL('https://www.geoboundaries.org/api/nightly/gbOpen/ALL/ALL/'), `${apiOrigin}/api/nightly/gbOpen/ALL/ALL/`);
      assert.equal(window.geoBoundariesURL('https://data.geoboundaries-dev.org/nightly/gbOpen/KEN/ADM1/boundary.geojson'), 'https://data.geoboundaries-dev.org/nightly/gbOpen/KEN/ADM1/boundary.geojson');
      assert.equal(window.geoBoundariesURL('mailto:team@geoboundaries.org'), 'mailto:team@geoboundaries.org');
      assert.equal(window.geoBoundariesURL('https://'), 'https://');
      assert.equal(window.geoBoundariesURL('https://geoboundaries.org.example.com/'), 'https://geoboundaries.org.example.com/');
      context.geoBoundariesURL = window.geoBoundariesURL;
      context.geoBoundariesResponse = window.geoBoundariesResponse;

      for (const name of ['archive/archive_gb4/index.html', 'archive/archive_gb4/archiveIndex.html']) {
        const html = await readFile(join(root, 'dist', name), 'utf8');
        const tableScript = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
          .find((match) => match[1].includes('new Tabulator'))?.[1];
        assert(tableScript, `No download table in ${name}`);
        let options;
        context.Tabulator = function (_selector, config) { options = config; };
        vm.runInContext(tableScript, context, { filename: name });
        assert(options.ajaxURL.startsWith(`${apiOrigin}/api/`), `${name}: wrong API host`);
        const row = { boundaryName: 'Kenya', imagePreview: 'https://www.geoboundaries.org/images/preview.png', relativeURL: '/data/a.zip', externalURL: 'https://github.com/example/data.zip', count: 2, empty: null };
        const downloads = options.columns.filter((column) => column.cellClick && column.field);
        for (const column of downloads) row[column.field] = `https://www.geoboundaries.org/data/${column.field}.zip`;
        const normalized = options.ajaxResponse(options.ajaxURL, {}, [row])[0];
        assert.equal(normalized.boundaryName, 'Kenya');
        assert.equal(normalized.imagePreview, `${origin}/images/preview.png`);
        assert.equal(normalized.relativeURL, `${origin}/data/a.zip`);
        assert.equal(normalized.externalURL, row.externalURL);
        assert.equal(normalized.count, 2);
        assert.equal(normalized.empty, null);
        for (const column of downloads) {
          column.cellClick({}, { getRow: () => ({ getData: () => normalized }) });
          assert.equal(window.opened, `${origin}/data/${column.field}.zip`);
        }
      }
      // Modern download pages use native links; simplified downloads must select simplified geometry.
      assert.equal(new URL(API_PATH, window.geoBoundariesConfig.apiOrigin).href, `${apiOrigin}/api/nightly/gbOpen/ALL/ALL/`);
      const apiDocs = await readFile(join(root, 'dist/api.html'), 'utf8');
      assert(apiDocs.includes(`${apiOrigin}/api/nightly/gbOpen/USA/ADM1/`));
      const downloadRow = {
        gjDownloadURL: 'https://www.geoboundaries.org/data/full.geojson',
        staticDownloadLink: 'https://www.geoboundaries.org/data/all.zip',
        simplifiedGeometryGeoJSON: 'https://www.geoboundaries.org/data/simplified.geojson',
      };
      assert.equal(getDownloadLinks(downloadRow, false, window.geoBoundariesURL)[0].url, `${origin}/data/full.geojson`);
      assert.equal(getDownloadLinks(downloadRow, true, window.geoBoundariesURL)[0].url, `${origin}/data/simplified.geojson`);
      for (const name of ['countryDownloads.html', 'simplifiedDownloads.html']) {
        const html = await readFile(join(root, 'dist', name), 'utf8');
        assert(html.includes('src="/assets/js/downloads.js"'));
        assert(html.includes('data-boundary-browser'));
      }
      const contribution = await readFile(join(root, 'dist/gbContribute.html'), 'utf8');
      assert(contribution.includes(`action="${origin}/api_contribute/"`));
      const sitemap = await readFile(join(root, 'dist/sitemap.txt'), 'utf8');
      assert(sitemap.split(/\r?\n/).filter(Boolean).every((url) => url.startsWith(`${origin}/`)));

      for (const directory of ['assets/js', 'archive/archive_gb4/assets/js']) {
        const metadataScript = await readFile(join(root, 'dist', directory, 'internalData.js'), 'utf8');
        context.Papa = { parse: (_url, options) => options.complete({ data: [{ apiURL: 'https://www.geoboundaries.org/data/example.geojson', boundarySourceURL: 'https://github.com/example', boundaryISO: 'KEN' }] }) };
        vm.runInContext(metadataScript, context);
        let metadata;
        context.loadGeoContrastMetadata((rows) => { metadata = rows; });
        assert.equal(metadata[0].apiURL, `${origin}/data/example.geojson`);
        assert.equal(metadata[0].boundarySourceURL, 'https://github.com/example');
        assert.equal(metadata[0].boundaryISO, 'KEN');
      }
    }
  } finally {
    // Leave dist ready for the checkout's actual branch rather than the last test case.
    execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root, env: process.env });
  }
});
