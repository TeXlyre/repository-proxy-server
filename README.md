# Repository Proxy

Simple CORS proxy for GitHub, GitLab, and Codeberg repositories.

## Features

- Proxies repository ZIP downloads from GitHub, GitLab, and Codeberg
- CORS-enabled for browser access
- Secure URL validation
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
- `CLOUDFLARE_API_KEY`: Cloudflare Global API key

## License

MIT