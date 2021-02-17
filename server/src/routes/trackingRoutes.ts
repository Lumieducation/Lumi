import express from 'express';

export default function (): express.Router {
    const router = express.Router();
    router.post(
        `/`,
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            res.status(200).end();
        }
    );

    return router;
}
