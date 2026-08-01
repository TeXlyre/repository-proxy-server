const ALLOWED_HOSTS = [
    'github.com',
    'githubusercontent.com',
    'gitlab.com',
    'codeberg.org'
];

export const isAllowedHost = (hostname: string): boolean =>
    ALLOWED_HOSTS.some(
        (host) => hostname === host || hostname.endsWith(`.${host}`)
    );

export const validateRepositoryUrl = (url: string): { valid: boolean; error?: string } => {
    try {
        const urlObj = new URL(url);

        if (!isAllowedHost(urlObj.hostname)) {
            return {
                valid: false,
                error: `Only ${ALLOWED_HOSTS.join(', ')} repositories are allowed`
            };
        }

        if (urlObj.protocol !== 'https:') {
            return {
                valid: false,
                error: 'Only HTTPS URLs are allowed'
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
