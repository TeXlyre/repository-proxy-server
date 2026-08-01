const DEFAULT_ALLOWED_HOSTS = [
    'github.com',
    'githubusercontent.com',
    'gitlab.com',
    'codeberg.org',
    'gitea.com',
    'code.forgejo.org',
    'salsa.debian.org',
    'gitlab.gnome.org',
    'gitlab.freedesktop.org',
    'invent.kde.org',
    'framagit.org',
    'gitlab.inria.fr'
];

const configuredHosts = (process.env.ALLOWED_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

const ALLOWED_HOSTS = configuredHosts.length > 0
    ? configuredHosts
    : DEFAULT_ALLOWED_HOSTS;

const isAllowedHost = (hostname: string): boolean =>
    ALLOWED_HOSTS.some(
        (host) => hostname === host || hostname.endsWith(`.${host}`)
    );

const DEFAULT_MAX_DOWNLOAD_BYTES = 512 * 1024 * 1024;

const parsedMaxDownloadBytes = Number.parseInt(process.env.MAX_DOWNLOAD_BYTES ?? '', 10);

export const MAX_DOWNLOAD_BYTES =
    Number.isFinite(parsedMaxDownloadBytes) && parsedMaxDownloadBytes > 0
        ? parsedMaxDownloadBytes
        : DEFAULT_MAX_DOWNLOAD_BYTES;

export const validateRepositoryUrl = (url: string): { valid: boolean; error?: string } => {
    try {
        const urlObj = new URL(url);

        if (urlObj.protocol !== 'https:') {
            return {
                valid: false,
                error: 'Only HTTPS URLs are allowed'
            };
        }

        if (!isAllowedHost(urlObj.hostname.toLowerCase())) {
            return {
                valid: false,
                error: `Host not allowed: ${urlObj.hostname}`
            };
        }

        return { valid: true };
    } catch {
        return {
            valid: false,
            error: 'Invalid URL format'
        };
    }
};
