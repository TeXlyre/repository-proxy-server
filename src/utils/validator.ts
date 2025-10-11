const ALLOWED_HOSTS = [
    'github.com',
    'gitlab.com',
    'codeberg.org'
];

export const validateRepositoryUrl = (url: string): { valid: boolean; error?: string } => {
    try {
        const urlObj = new URL(url);

        if (!ALLOWED_HOSTS.includes(urlObj.hostname)) {
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