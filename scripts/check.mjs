import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
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
    if (name.endsWith('.html')) {
      const text = await readFile(filename, 'utf8');
      assert(!/<\?(?:php|=)|<!--\s*#/i.test(text), `Unprocessed server code: ${name}`);
    }
  }
}

await checkDirectory(output);
assert(assets < 20000, 'Asset count exceeds the Workers Free/Pages Free limit');
for (const name of ['index.html', '404.html', '_headers', 'api.html', 'assets/css/main.css']) {
  await stat(join(output, name));
}
console.log(`Validated ${assets} public assets; no API data or server/build sources in dist/.`);
