import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { configureHtml, getSiteConfig, replaceSiteUrls } from './site-config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const site = getSiteConfig();
const directories = ['archive', 'assets', 'gb5', 'images', 'VIZENGINE'];
const extensions = new Set([
  '.html', '.css', '.js', '.json', '.map', '.png', '.jpg', '.jpeg', '.gif',
  '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.fgb', '.jgw',
]);
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.map', '.svg', '.txt']);
let copied = 0;

function expandIncludes(html, ancestors = []) {
  return Promise.all([...html.matchAll(/<!--\s*#include\s+virtual="([^"]+)"\s*-->/g)]
    .map(async (match) => {
      const source = resolve(root, match[1].replace(/^\//, ''));
      if (!source.startsWith(root) || ancestors.includes(source)) {
        throw new Error(`Invalid or recursive include: ${match[1]}`);
      }
      return [match[0], await expandIncludes(await readFile(source, 'utf8'), [...ancestors, source])];
    })).then((includes) => {
      for (const [directive, content] of includes) html = html.replaceAll(directive, content);
      if (/<!--\s*#/.test(html)) throw new Error('Unsupported server-side include in HTML');
      return html;
    });
}

async function publish(source) {
  const name = relative(root, source);
  const target = join(output, name);
  let content;
  if (extname(source) === '.html') {
    content = await readFile(source, 'utf8');
    if (/<\?(?:php|=)/i.test(content)) {
      // Cloudflare static hosting cannot execute the archived PHP API.
      console.log(`Excluded legacy PHP endpoint: ${name}`);
      return;
    }
    content = await expandIncludes(content);
  } else if (textExtensions.has(extname(source))) {
    content = await readFile(source, 'utf8');
    if (extname(source) === '.json') JSON.parse(content);
  }
  if (content !== undefined) {
    content = replaceSiteUrls(content, site);
    if (extname(source) === '.html') content = configureHtml(content, name, site);
    if (name === 'assets/js/site-config.js') {
      content = `window.geoBoundariesConfig = ${JSON.stringify(site)};\n${content}`;
    }
  }
  await mkdir(dirname(target), { recursive: true });
  if (content === undefined) await copyFile(source, target);
  else await writeFile(target, content);
  copied++;
}

async function publishDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = join(directory, entry.name);
    if (entry.name.startsWith('.') || ['api', 'node_modules', 'package.json', 'package-lock.json'].includes(entry.name)) continue;
    if (entry.isDirectory()) await publishDirectory(source);
    else if (entry.isFile() && extensions.has(extname(entry.name))) await publish(source);
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && (extname(entry.name) === '.html' || ['favicon.gif', 'favicon.ico', 'sitemap.txt', 'LICENSE.txt', '_headers'].includes(entry.name))) {
    await publish(join(root, entry.name));
  }
}
for (const directory of directories) await publishDirectory(join(root, directory));
console.log(`Built dist/: ${copied} public files for branch ${site.branch} (${site.origin}). API data is hosted separately.`);
