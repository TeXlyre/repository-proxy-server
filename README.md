# Repository Proxy

Simple CORS proxy for GitHub, GitLab, Gitea, Forgejo, and Codeberg repositories.

## Features

- Proxies repository ZIP downloads from GitHub, GitLab, Gitea, Forgejo, and Codeberg
- Configurable host allowlist with subdomain matching
- CORS-enabled for browser access
- Redirect following with per-hop validation
- Easy deployment with Docker and Cloudflare Tunnel

## Usage

```
https://proxy.emaily.re/?url=REPOSITORY_ZIP_URL
```

Example:
```
https://proxy.emaily.re/?url=https://github.com/user/repo/archive/refs/heads/main.zip
```

## Development

```bash
pnpm install
pnpm dev
```

## Docker Deployment

### Local Development

```bash
pnpm docker:local:build
pnpm docker:local:up
```

### Production with Cloudflare Tunnel

1. Copy `envfile` to `.env` and configure:
   ```bash
   cp envfile .env
   ```

2. Deploy:
   ```bash
   pnpm docker:build
   pnpm deploy:full
   ```

## Environment Variables

- `HOST_DOMAIN`: Domain for the proxy (e.g., proxy.emaily.re)
- `ALLOWED_ORIGINS`: Comma-separated allowed origins or `*` for all
- `ALLOWED_HOSTS`: Comma-separated hosts the proxy may download from. Leave empty to use the built-in defaults. Each entry matches the host itself and any of its subdomains, so `github.com` also covers `codeload.github.com`.
- `CLOUDFLARE_API_KEY`: Cloudflare Global API key

Default `ALLOWED_HOSTS`:

`github.com`, `githubusercontent.com`, `gitlab.com`, `codeberg.org`, `gitea.com`, `code.forgejo.org`, `salsa.debian.org`, `gitlab.gnome.org`, `gitlab.freedesktop.org`, `invent.kde.org`, `framagit.org`, `gitlab.inria.fr`

Setting `ALLOWED_HOSTS` replaces the defaults rather than extending them, so include the hosts you still need:

```
ALLOWED_HOSTS=github.com,githubusercontent.com,gitlab.example.org
```

Redirect targets are validated against the same list, so a host whose downloads redirect elsewhere needs both hosts listed.

## License

MIT
