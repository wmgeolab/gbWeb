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
| Preview deploy command | `npx wrangler preview` |
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

The root Wrangler configuration also runs `node scripts/build.mjs` before a
Workers deployment or preview through the CLI. Set `npm run build` explicitly
as the dashboard build command: Workers Builds does not infer its build command
from Wrangler's custom-build configuration.

### The `dev` branch preview

Keep the preview tracking branch set to `dev`, and the preview deploy command
set to `npx wrangler preview`. The root configuration includes the required
`"previews": {}` block. Assets and compatibility settings stay at the top level;
the static site has no bindings or secrets to override for previews.

Pushing to `dev` triggers the connected preview build. To deploy a preview from
an authenticated local shell, run `npm run preview`. This command builds the
public assets before invoking Wrangler.

The npm install-scripts warnings about esbuild and workerd are not the cause of
the reported missing-`previews` error. No new application variables or tokens
are needed for this configuration change.

Reference: [Workers Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/).

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
  absence of server/build sources or API directories. It also rejects URLs or
  runtime configuration from the wrong deployment branch.
- `npm test` builds and checks both branches, then exercises download buttons
  and metadata normalization with API responses containing production URLs.

## Website development

The primary pages use semantic HTML, native ES modules, and `assets/css/site.css`.
Shared navigation and footers live in `_includes/site-*.shtml` and are expanded at
build time, so they also work without JavaScript. Country and simplified downloads
use the nightly API, with search, combined level/region filters, pagination,
source metadata, and explicit loading/error states. Simplified downloads select
`simplifiedGeometryGeoJSON`; they never substitute a full-resolution archive.
The existing spatial comparison and upload tools retain their computation and
backend dependencies, with the shared site shell layered over their legacy CSS.

Use `npm run pages:dev` for a local Pages preview. Local navigation stays within
the preview, while API requests use the branch's configured API origin. Run `npm test`
and `npm run check` after edits. No frontend framework or extra runtime service is
required. Cloudflare Pages still builds with `npm run build` and publishes `dist`.

Brand color source: [William & Mary digital brand guidance](https://www.wm.edu/brand/visual-brand/web-digital-guidelines/ai-brand-guidelines/).


## Branch-specific domains

| Source branch | Website origin | API origin |
| --- | --- | --- |
| `dev` | `https://geoboundaries-dev.org` | `https://www.geoboundaries-dev.org` |
| `main` | `https://geoboundaries.org` | `https://geoboundaries.org` |

The build detects the branch from `WORKERS_CI_BRANCH` in Workers Builds or
`CF_PAGES_BRANCH` in Pages. Local builds use the checked-out Git branch. These
Cloudflare variables are supplied automatically; no new secrets or manually
configured variables are needed. Other branches use the development domain.
For a local test or a detached checkout outside Cloudflare,
`GBWEB_BRANCH=main npm run build` overrides branch detection.

The selected origins are compiled into the published HTML, JavaScript, sitemap,
and API documentation. Site navigation points at the website domain, while static
CSS/JS assets can still load from the current preview host. API metadata is
normalized before rendering: download and preview-image URLs that refer to
either geoBoundaries domain are rewritten to the selected website origin. `/api/`
URLs use the API origin; the development API requires the `www` hostname.
Dedicated `data.geoboundaries-dev.org` download URLs retain their destinations. Links to
GitHub, data providers, libraries, and email addresses retain their destinations.
The contribution form's `/api_contribute/` action also uses the selected origin.

For example, the `dev` download table requests
`https://www.geoboundaries-dev.org/api/nightly/gbOpen/ALL/ALL/`; `main` requests the
same path on `https://geoboundaries.org`.

This build configuration selects outgoing URLs; domain/DNS association is
managed in Cloudflare. Use a development website Worker connected to the `dev`
branch and keep the production website Worker connected to `main`. Merge these
changes into `main` before deploying that branch.

### Share the domain with the existing API Worker

`geoboundaries-dev.org` is already used by a separate Cloudflare API Worker.
Keep its current domain and DNS records. Adding the website as another Custom
Domain, especially with Preview enabled, conflicts with those records. Use
**Worker Routes** to split requests by path while keeping the existing hostname:

| Route pattern | Destination |
| --- | --- |
| `geoboundaries-dev.org/api/*` | Existing development API Worker |
| `geoboundaries-dev.org/*` | Development website Worker |

Add the specific API route first, then add or change the catch-all website
route. More specific routes take precedence. Add corresponding specific routes
for any other paths the API Worker serves, such as `/data/*` or
`/api_contribute/*`; otherwise the catch-all website route returns 404 for them.
Keep contributions routed to their actual backend if it is a different service.

In the dashboard, open each Worker, then **Settings → Domains & Routes → Add →
Route**, select the `geoboundaries-dev.org` zone, and enter the appropriate
pattern. Use **Route**, rather than **Custom Domain**, for this shared hostname.
The existing DNS record must be proxied through Cloudflare.

Routes target a Worker's live deployment. Set the development website Worker's
production branch to `dev`, its build command to `npm run build`, and its deploy
command to `npx wrangler deploy --name <development-website-worker-name>`.
Wrangler's `--name` must match the Worker receiving that build. For example, a
Worker named `gbweb-dev` uses `npx wrangler deploy --name gbweb-dev`.
`npx wrangler preview` updates a branch Preview and does not publish the live
Worker used by these routes.

For the main deployment, use the equivalent path split on `geoboundaries.org`.
A Workers Preview custom domain produces a hostname such as
`dev.previews.geoboundaries-dev.org`; use a dedicated Preview hostname or the
provided `workers.dev` URL if branch previews are also needed.

On **both domains**, route `/api/*`, `/api_contribute/*`, and any separately
hosted `/data/*` downloads to the corresponding API/backend deployment. This
repository publishes no API or backend routes; those paths return 404 if sent
to this static website alone.

References: [Workers branch variable](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#default-variables),
[Pages branch variable](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables),
and [Workers Preview custom domains](https://developers.cloudflare.com/workers/previews/custom-domains/).
See also [Worker Routes and matching precedence](https://developers.cloudflare.com/workers/configuration/routing/routes/).

The archived PHP endpoint `archive/archive_gb4/gbRequest.html` is excluded because
it requires PHP and legacy server files under `/data/`. This deployment does not
migrate that legacy endpoint, any existing `/data/` files absent from the repo,
or the contribution-form backend. Host those services separately and expose
their paths on the matching development or production domain when needed.
