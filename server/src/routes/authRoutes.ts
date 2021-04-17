import express from 'express';

import proxy from 'express-http-proxy';

export default function (): express.Router {
    const router = express.Router();

    router.use('/', proxy('http://auth.lumi.education'));

    return router;
}
