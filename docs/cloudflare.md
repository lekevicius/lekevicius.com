# Cloudflare deployment

The site is prepared for **Cloudflare Workers with static assets**. It is an
Astro static-site build: Strapi is read during the build, and the finished HTML,
feeds, Open Graph images, fonts, CSS, JavaScript, and optimized content images
are uploaded together.

Cloudflare recommends Workers for new Astro projects. Static-asset requests on
Workers are free and unlimited, and the assets are automatically served through
Cloudflare's tiered cache. This keeps the deployment simple while leaving a
straightforward path to Worker APIs, SSR, the Images binding, and observability
later.

## Why the new Workers Cache is not enabled

[Workers Cache](https://blog.cloudflare.com/workers-cache/) (announced July 6, 2026) is a tiered cache placed in front of **Worker code**. On a hit, Cloudflare
can return a cached response without invoking the Worker. It is especially
useful for server-rendered HTML, API responses, and image transformations.

This deployment has no runtime Worker script. Its files use the separate,
built-in [Workers static asset cache](https://developers.cloudflare.com/workers/static-assets/),
which is already tiered. Adding a Worker just to set `Cache-Control` would add a
second caching layer, runtime code, and billable invocations on cache misses
without making the static site meaningfully faster.

If the site later moves to on-demand Strapi rendering or a Cloudflare Images
transformation endpoint, add a Worker entrypoint and then enable:

```jsonc
"cache": {
  "enabled": true
}
```

That future Worker must return suitable `Cache-Control` headers and needs an
invalidation plan (for example cache tags purged by a protected Strapi webhook).

## First deployment with Workers Builds

1. Push this repository to GitHub. The current production branch is `master`.
2. In the Cloudflare dashboard, open **Workers & Pages**, choose **Create
   application**, then **Import a repository**.
3. Select `lekevicius/lekevicius.com` and use these settings:

   | Setting                       | Value                           |
   | ----------------------------- | ------------------------------- |
   | Worker name                   | `lekevicius-next`               |
   | Production branch             | `master`                        |
   | Root directory                | `packages/site`                 |
   | Build command                 | `bun run build`                 |
   | Deploy command                | `bunx wrangler deploy`          |
   | Non-production deploy command | `bunx wrangler versions upload` |

   The Worker name should match `name` in `packages/site/wrangler.jsonc`.

4. In **Settings > Build > Build Variables and Secrets**, add the build-time
   values below. These are build variables, not Worker runtime variables,
   because the deployed site does not fetch Strapi at request time.

   | Variable                       | Suggested production value                                | Secret? |
   | ------------------------------ | --------------------------------------------------------- | ------- |
   | `BUN_VERSION`                  | `1.3.14`                                                  | No      |
   | `STRAPI_URL`                   | Public base URL of the deployed Strapi API                | No      |
   | `STRAPI_TOKEN`                 | Read-only Strapi API token                                | Yes     |
   | `SITE_URL`                     | `https://next.lekevicius.com`                             | No      |
   | `PUBLIC_ROBOTS`                | `index, follow`                                           | No      |
   | `PUBLIC_STRAPI_ASSET_BASE_URL` | Public media/CDN base URL, if different from `STRAPI_URL` | No      |

   `STRAPI_TOKEN` needs only the read permissions required by the collections in
   `src/content.config.ts`. The loader also requires read access to Strapi's
   content-type metadata endpoint. Never put the token in a `PUBLIC_*` variable.

   Do not add the optional `OG_BUCKET`/`S3_*` variables unless Open Graph images
   should continue to be uploaded to the old S3-compatible bucket. With those
   variables absent, OG images are deployed as Worker static assets.

5. Enable **Build cache** in the same Build settings. Bun's download cache will
   be reused between builds.
6. Deploy. The build intentionally fails if Strapi is missing or unreachable,
   preventing a successful-looking deployment with empty collections.

You can verify the same path locally from `packages/site`:

```sh
bun run preview:cloudflare
```

For a manual deployment after `wrangler login`:

```sh
bun run deploy:cloudflare
```

## Attach `next.lekevicius.com`

The `lekevicius.com` zone must be in the same Cloudflare account as the Worker.

1. Open the `lekevicius-next` Worker.
2. Go to **Settings > Domains & Routes > Add > Custom Domain**.
3. Enter `next.lekevicius.com`.

Cloudflare creates the DNS record and TLS certificate. If `next` already has an
A, AAAA, or CNAME record, remove that conflicting record first. A Worker Custom
Domain is the origin, so do not also configure a Worker Route or a CNAME for the
same hostname.

If this later moves to another hostname, change `SITE_URL` to that final
hostname before rebuilding so canonical URLs and the sitemap stay correct.

## Rebuild automatically from Strapi

Content is compiled into the site, so publishing in Strapi must trigger a new
build before it appears at `next.lekevicius.com`.

1. In the Worker, go to **Settings > Builds > Deploy Hooks**.
2. Create a hook named `strapi-content`, targeting `master`, and copy its URL.
3. Treat that URL as a secret: possession of it is enough to trigger a build.
4. In the production Strapi admin, go to **Settings > Webhooks**, add a webhook,
   and paste the Deploy Hook URL.
5. Select entry publish/unpublish/update/delete and media create/update/delete
   events. If Strapi does not expose publish-specific filters, selecting all
   entry and media events is safe; Cloudflare deduplicates hooks that arrive
   while a build is still queued or initializing.

After a publish, inspect **Deployments > Build History** in Cloudflare. The
deployed site updates atomically when the new asset version is ready.

## Image handling

The recommended initial setup keeps image ownership in Strapi's existing public
object storage and lets Astro optimize images at build time:

- Relative Strapi URLs such as `/uploads/photo.jpg` are resolved against
  `PUBLIC_STRAPI_ASSET_BASE_URL`, falling back to `STRAPI_URL`.
- The Strapi/media host is added to Astro's allowed remote image domains from
  those variables.
- Astro emits optimized, fingerprinted image files into `dist/_astro`.
- The Worker serves those files itself, so visitors do not hit Strapi for page
  images and the one-year immutable browser-cache rule is safe.
- A new Strapi image normally receives a new content-hashed URL; the webhook
  rebuild then deploys the new optimized file without stale-cache purges.

The Strapi media origin must be publicly readable by the Cloudflare build. It
does not need browser CORS access for build-time optimization.

Cloudflare Images is not needed initially. Consider it only if you need many
responsive sizes generated on request, private media, transformations without a
rebuild, or runtime format/quality decisions. At that point, an Images binding
plus Workers Cache is a good pairing; repeat requests can bypass both the Worker
and the transformation.

## Pages alternative

Pages will also host this build. Use root `packages/site`, build command
`bun run build`, output directory `dist`, the same variables, a Pages Custom
Domain, and a Pages Deploy Hook connected to Strapi.

It is not the recommended new setup here: Workers has the same free static-asset
request model, Cloudflare and Astro now recommend it for new projects, and it
has the cleaner upgrade path to the newly announced Workers Cache and Images
binding.

## Relevant documentation

- [Deploy Astro to Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Workers Deploy Hooks](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Workers Cache configuration](https://developers.cloudflare.com/workers/cache/configuration/)
- [Cloudflare Images optimization](https://developers.cloudflare.com/images/optimization/transformations/overview/)
