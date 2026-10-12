import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSiteConfig, replaceSiteUrls } from './site-config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const site = getSiteConfig();
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.map', '.svg', '.txt']);
const excluded = new Set(['.git', '.github', '.htaccess', 'node_modules', 'scripts', '_includes', 'api', 'package.json', 'package-lock.json']);
let assets = 0;

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = join(directory, entry.name);
    const name = relative(output, filename);
    assert(!entry.name.startsWith('.') && !excluded.has(entry.name), `Private/build file published: ${name}`);
    if (entry.isDirectory()) {
      await checkDirectory(filename);
      continue;
    }
    assert(entry.isFile(), `Unexpected asset type: ${name}`);
    assets++;
    assert((await stat(filename)).size <= 25 * 1024 * 1024, `Asset exceeds 25 MiB: ${name}`);
    assert(!['.py', '.rb', '.scss', '.less', '.php', '.jsonc'].includes(extname(name)), `Source file published: ${name}`);
    if (textExtensions.has(extname(name))) {
      const text = await readFile(filename, 'utf8');
      // The injected config is checked below; its distinct API origin is intentional.
      const source = name === 'assets/js/site-config.js' ? text.slice(text.indexOf('\n') + 1) : text;
      assert.equal(replaceSiteUrls(source, site), source, `URL points at the wrong deployment domain: ${name}`);
    }
    if (name.endsWith('.html')) {
      const text = await readFile(filename, 'utf8');
      assert(!/<\?(?:php|=)|<!--\s*#/i.test(text), `Unprocessed server code: ${name}`);
    }
  }
}

await checkDirectory(output);
assert(assets < 20000, 'Asset count exceeds the Workers Free/Pages Free limit');
for (const name of ['index.html', '404.html', '_headers', 'api.html', 'assets/css/main.css', 'assets/css/site.css', 'assets/js/site-config.js', 'assets/js/downloads.js', 'assets/js/boundary-data.js']) {
  await stat(join(output, name));
}
const runtimeConfig = await readFile(join(output, 'assets/js/site-config.js'), 'utf8');
assert(runtimeConfig.startsWith(`window.geoBoundariesConfig = ${JSON.stringify(site)};`), 'Built assets do not match the current deployment branch');
for (const name of ['index.html', 'countryDownloads.html', 'globalDownloads.html', 'simplifiedDownloads.html', 'api.html', 'contribute.html', 'visualize.html', 'gbContribute.html', '404.html']) {
  const html = await readFile(join(output, name), 'utf8');
  assert(html.includes('<html lang="en">'), `${name}: missing page language`);
  assert(html.includes('id="primary-nav"') && html.includes('class="site-footer"'), `${name}: shared navigation/footer missing`);
  assert(html.includes('<main id="main">'), `${name}: missing main landmark`);
  assert(!html.includes('user-scalable=no'), `${name}: page blocks zoom`);
  assert(!html.includes('data-include='), `${name}: footer depends on client-side includes`);
}
console.log(`Validated ${assets} public assets for ${site.origin}; no API data or server/build sources in dist/.`);
