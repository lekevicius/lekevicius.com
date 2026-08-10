# lekevicius.com

This repository contains the lekevicius.com v8 website and the Strapi CMS that
provides its content.

## Repository layout

```text
.
├── packages/
│   └── admin/   # Strapi 5 CMS
└── site/        # Astro 7 website
```

The projects keep their existing package managers and lockfiles:

- `site/` uses Bun.
- `packages/admin/` uses pnpm and Node.js 18–22.

## Setup

Install each project's dependencies from the repository root:

```sh
bun install --cwd site
pnpm --dir packages/admin install
```

Create local environment files and fill in the required secrets:

```sh
cp site/.env.example site/.env
cp packages/admin/.env.example packages/admin/.env
```

The site needs `STRAPI_URL` and `STRAPI_TOKEN` to load CMS content. The
remaining site variables configure its canonical URL, media URLs, and optional
S3-compatible Open Graph image publishing. Strapi documents its full local
configuration in `packages/admin/.env.example`.

## Development

Run the CMS and site in separate terminals:

```sh
bun run dev:admin
bun run dev:site
```

The default local ports are `1337` for Strapi and `4321` for Astro. Running
`bun run dev` starts the site.

Useful root commands:

| Command | Purpose |
| --- | --- |
| `bun run build` | Build the Astro site and Strapi admin |
| `bun run build:site` | Type-check and build the site |
| `bun run build:admin` | Build the Strapi admin |
| `bun run lint` | Lint the site |
| `bun run format:check` | Check site formatting |

Strapi can also run with Docker Compose from its package directory:

```sh
cd packages/admin
docker compose up
```

## History

This monorepo continues the original v7 `master` history. The complete,
unsquashed histories of the Astro site and Strapi admin were merged as
additional parents, so their original commit IDs remain valid.

The `archive/v7-all-history` branch retains legacy v7 commits that had become
reachable only through old remote-tracking refs. It exists solely as a history
anchor and is not a development branch.
