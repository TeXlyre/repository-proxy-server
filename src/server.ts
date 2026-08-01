import express from 'express';
import https from 'https';

import { validateRepositoryUrl, getAllowedHosts, MAX_DOWNLOAD_BYTES } from './utils/validator';
import { corsMiddleware } from './middleware/cors';

const app = express();
const PORT = process.env.PORT || 8080;
const MAX_REDIRECTS = 5;

app.use(corsMiddleware);

const downloadBuffer = (
    targetUrl: string,
    redirectsLeft: number = MAX_REDIRECTS
): Promise<{ buffer: Buffer; headers: import('http').IncomingHttpHeaders }> => {
    return new Promise((resolve, reject) => {
        const req = https.get(targetUrl, {
            headers: { 'User-Agent': 'Repository-Proxy/1.0' }
        }, (response) => {
            const status = response.statusCode ?? 0;

            if (status >= 300 && status < 400 && response.headers.location) {
                response.resume();

                if (redirectsLeft <= 0) {
                    reject(new Error('Too many redirects'));
                    return;
                }

                const redirectUrl = new URL(response.headers.location, targetUrl).toString();
                const validation = validateRepositoryUrl(redirectUrl);

                if (!validation.valid) {
                    reject(new Error(validation.error));
                    return;
                }

                downloadBuffer(redirectUrl, redirectsLeft - 1).then(resolve).catch(reject);
                return;
            }

            if (status < 200 || status >= 300) {
                response.resume();
                reject(new Error(`Upstream responded with ${status}`));
                return;
            }

            const declaredLength = Number.parseInt(response.headers['content-length'] ?? '', 10);

            if (Number.isFinite(declaredLength) && declaredLength > MAX_DOWNLOAD_BYTES) {
                response.destroy();
                reject(new Error(`Response exceeds ${MAX_DOWNLOAD_BYTES} bytes`));
                return;
            }

            const chunks: Buffer[] = [];
            let received = 0;

            response.on('data', (chunk: Buffer) => {
                received += chunk.byteLength;

                if (received > MAX_DOWNLOAD_BYTES) {
                    response.destroy();
                    reject(new Error(`Response exceeds ${MAX_DOWNLOAD_BYTES} bytes`));
                    return;
                }

                chunks.push(chunk);
            });

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
            res.status(502).json({
                error: error instanceof Error ? error.message : 'Failed to fetch repository'
            });
        }
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Repository proxy server running on port ${PORT}`);
});
