import express from 'express';
import https from 'https';
import { validateRepositoryUrl } from './utils/validator';
import { corsMiddleware } from './middleware/cors';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(corsMiddleware);

const downloadBuffer = (targetUrl: string): Promise<{ buffer: Buffer; headers: import('http').IncomingHttpHeaders }> => {
    return new Promise((resolve, reject) => {
        const req = https.get(targetUrl, {
            headers: { 'User-Agent': 'Repository-Proxy/1.0' }
        }, (response) => {
            if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadBuffer(response.headers.location).then(resolve).catch(reject);
                return;
            }

            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve({ buffer: Buffer.concat(chunks), headers: response.headers }));
            response.on('error', reject);
        });
        req.on('error', reject);
    });
};

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
        const { buffer, headers } = await downloadBuffer(targetUrl);

        const contentDisposition = headers['content-disposition'];
        const filename = new URL(targetUrl).pathname.split('/').pop() || 'download';

        res.set({
            'Content-Type': headers['content-type'] || 'application/octet-stream',
            'Content-Length': buffer.byteLength.toString(),
            'Content-Disposition': contentDisposition || `attachment; filename="${filename}"`,
            'Cache-Control': 'public, max-age=3600'
        });

        res.send(buffer);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to fetch repository' });
        }
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Repository proxy server running on port ${PORT}`);
});
