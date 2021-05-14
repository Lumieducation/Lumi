import express from 'express';

import proxy from 'express-http-proxy';

export default function (): express.Router {
    const router = express.Router();

    router.use(
        '/',
        proxy(process.env.LUMI_HOST || 'https://api.lumi.education')
    );

    return router;
}
