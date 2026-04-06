import express from 'express';
import { validateRepositoryUrl } from './utils/validator';
import { corsMiddleware } from './middleware/cors';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(corsMiddleware);

app.get('/', async (req, res) => {
    const targetUrl = req.query.url as string;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    const validation = validateRepositoryUrl(targetUrl);
    if (!validation.valid) {
        return res.status(403).json({ error: validation.error });
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Repository-Proxy/1.0'
            }
        });

        const contentDisposition = response.headers.get('content-disposition');
        const filename = new URL(targetUrl).pathname.split('/').pop() || 'download';

        res.set({
            'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
            'Content-Length': response.headers.get('content-length') || '',
            'Content-Disposition': contentDisposition || `attachment; filename="${filename}"`,
            'Cache-Control': 'public, max-age=3600'
        });

        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch repository' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Repository proxy server running on port ${PORT}`);
});
