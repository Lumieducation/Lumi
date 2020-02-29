import express from 'express';
import nucleus from 'nucleus-nodejs';

export default function(): express.Router {
    const router = express.Router();
    router.post(
        `/`,
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            const body = req.body;
            nucleus.track(`${body.category}/${body.action}/${body.name}`);
            res.status(200).end();
        }
    );

    return router;
}
