# Deploying gbWeb on Cloudflare

gbWeb is a static website. API data is built and hosted separately and is excluded
from this repository and deployment. No application secrets, database, or runtime
environment variables are needed for the website.

## Fix the current token failure

The reported error comes from **Workers Builds**, before the build command runs.
Repository changes cannot restore a deleted or rolled API token.

1. Open **Workers & Pages → your Worker → Settings → Build → Build Configuration**.
2. Edit the **API token** selection. Choose **Create new token**, or select a
   newly created user API token authorized to deploy Workers to this account.
   Save the selection; a stale token can remain visible in the dropdown.
3. Set the build/deploy commands below, push these repository changes to the
   connected branch, and retry the build.

Cloudflare's automatic token creation supplies the supported build permissions.
For a manually managed Workers deployment token, use the **Edit Cloudflare Workers**
template, scoped to the intended account. Zone permissions matter when deploying
routes/custom domains. Workers Builds currently requires a user-owned token.
Store tokens in Cloudflare or CI secrets, never in this repository or public assets.

References: [stale-token troubleshooting](https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/)
and [Workers Builds configuration/token permissions](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Workers Builds: the existing failing project

Use these settings for the Worker connected to `wmgeolab/gbWeb`:

| Setting | Value |
| --- | --- |
| Production branch | `main`, after these changes are merged there |
| Root directory | Repository root (`/` or blank in the dashboard) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| API token | The replacement selected above |
| Build variables/secrets | None required |

The `name` in the root `wrangler.jsonc` is `gbweb`. **Set it to the exact name of
your existing Worker** before deploying. The dashboard and configuration names
must match. `.nvmrc` selects Node 24; `NODE_VERSION=24` is an optional dashboard
equivalent. Wrangler is pinned in `package.json` and `package-lock.json`.

With Node 24 and npm installed, deploy from your computer:

```sh
npm ci
npm run build
npm run check
npx wrangler deploy --dry-run
npx wrangler login
npx wrangler deploy
```

Run the build before invoking Wrangler directly. `npm run deploy` builds and
deploys in one command; Workers Builds runs the configured dashboard build command.

**Omit the final `.` from `npx wrangler deploy .`.** A positional directory
overrides the configured assets directory and attempts to upload the source
checkout and tooling. `npx wrangler deploy` uses `assets.directory = "./dist"`
and deploys a Worker with static assets.

## Cloudflare Pages

For a Pages project connected directly to GitHub, use:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Root directory | Repository root |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variables | None required; `.nvmrc` selects Node 24 |

Pages Git integration manages deployment authentication and does not use the
Workers Builds token selector. The root Wrangler file is for Workers and lacks
`pages_build_output_dir`; Pages may log that it is ignoring that file.

For CLI deployment, set `name` in `cloudflare/pages/wrangler.jsonc` to your Pages
project name, then run:

```sh
npm ci
npm run build
npm run check
npx wrangler login
npx wrangler pages deploy --cwd cloudflare/pages
```

Or run `npm run pages:deploy` after authenticating. Pages requires a standard-named
Wrangler file, so the separate directory keeps the Workers and Pages configurations
from conflicting. `npm run pages:dev` previews Pages locally; `npm run dev` previews
Workers locally.

## Tokens and variables

| Deployment method | Credentials/variables |
| --- | --- |
| Cloudflare Workers Builds | Select a valid build token in the dashboard; no additional deployment variables needed |
| Cloudflare Pages Git integration | Cloudflare manages authentication; no manually supplied build token needed |
| Local deployment | `npx wrangler login` provides OAuth authentication |
| External CI | Secret `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for the target account |

For a Pages API token, grant **Account → Cloudflare Pages → Edit**, scoped to the
target account. For Workers, use the Workers token described above. Deployment
credentials are not application runtime variables. Do not duplicate a stale build
token in build variables. Node 24 is selected by `.nvmrc`; `NODE_VERSION=24` is optional.

Reference: [Pages CI credentials](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).

## Build behavior and hosting dependencies

- `npm run build` packages public pages, styles, JavaScript, images, fonts, and
  visualization assets into `dist/`. Git files, build tools, credentials, API
  data, Python, Sass/Less, and Apache `.htaccess` are excluded.
- The archived server-side footer include is expanded at build time. `_headers`
  preserves the site's public CORS headers. A real 404 page avoids a homepage
  fallback for missing files.
- `npm run check` verifies the output, asset limits, required public pages, and
  absence of server/build sources or API directories.

The download tables retain their existing API URL:
`https://www.geoboundaries.org/api/current/gbOpen/ALL/ALL/`. API documentation and
upstream download links are preserved. Cloudflare previews therefore use the
separately hosted production API. If the separate process hosts the API at a
different hostname, update the API request URLs in the website accordingly.

Before assigning `www.geoboundaries.org` to this static website, ensure `/api/*`
is served by the separate API deployment. This website intentionally has no API
routes. If both use the same hostname, configure routing for the separate API;
otherwise this static deployment will return 404 for API requests.

The archived PHP endpoint `archive/archive_gb4/gbRequest.html` is excluded because
it requires PHP and legacy server files under `/data/`. This deployment does not
migrate that legacy endpoint, any existing `/data/` files absent from the repo,
or the external contribution-form backend. Retain those services separately if
they are still needed when cutting over an existing production domain.
