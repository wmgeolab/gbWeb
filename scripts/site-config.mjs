import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const siteHost = '(?:(?:www\\.)?geoboundaries(?:-dev)?\\.org|geoboundaries\\.geolab\\.wm\\.edu)';
const hostBoundary = '(?![a-z0-9_.-])';

export function getSiteConfig(env = process.env) {
  // Cloudflare checks out commits detached from a local branch, so CI wins over Git.
  let branch = env.GBWEB_BRANCH || env.WORKERS_CI_BRANCH || env.CF_PAGES_BRANCH;
  if (!branch) branch = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim();
  branch = branch?.trim().replace(/^refs\/heads\//, '');
  if (!branch) throw new Error('Cannot determine the deployment branch. Set GBWEB_BRANCH to dev or main.');
  return {
    branch,
    origin: branch === 'main' ? 'https://geoboundaries.org' : 'https://geoboundaries-dev.org',
    apiOrigin: branch === 'main' ? 'https://geoboundaries.org' : 'https://www.geoboundaries-dev.org',
  };
}

export function replaceSiteUrls(text, { origin, apiOrigin = origin }) {
  const targetOrigin = (match, offset, source) => {
    const path = source.slice(offset + match.length, offset + match.length + 12).replaceAll('\\/', '/');
    return /^\/api(?:[/?#]|$)/i.test(path) ? apiOrigin : origin;
  };
  // Also update escaped URLs in the archived JSON examples. Email addresses stay intact.
  text = text.replace(new RegExp(`https?:\\\\/\\\\/${siteHost}${hostBoundary}`, 'gi'), (...args) => targetOrigin(...args).replaceAll('/', '\\/'));
  return text.replace(new RegExp(`(?:https?:)?//${siteHost}${hostBoundary}`, 'gi'), targetOrigin);
}

export function configureHtml(html, filename, config) {
  const pageUrl = new URL(filename.replaceAll('\\', '/'), `${config.origin}/`);
  html = html.replace(new RegExp(`(?<![a-z0-9@_./-])www\\.geoboundaries(?:-dev)?\\.org${hostBoundary}`, 'gi'), new URL(config.origin).hostname);
  // Process markup separately so JavaScript-generated HTML and documentation examples stay valid.
  html = html.split(/(<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>)/gi)
    .map((part) => /^<(?:script|style)\b/i.test(part) ? part : part.replace(/(<a\b[^>]*?\bhref\s*=\s*)(["'])(.*?)\2/gi, (match, prefix, quote, href) => {
      if (!href || href.startsWith('#')) return match;
      // Older attribution links used a hostname without a protocol.
      if (/^(?:www\.)?geoboundaries(?:-dev)?\.org(?:[/?#]|$)/i.test(href)) href = `https://${href}`;
      const url = new URL(href, pageUrl);
      if (url.origin !== config.origin) return match;
      return `${prefix}${quote}${url.href}${quote}`;
    })).join('');
  return html.replace(/<head\b[^>]*>/i, '$&\n\t\t<script src="/assets/js/site-config.js"></script>');
}
