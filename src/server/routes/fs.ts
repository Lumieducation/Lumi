import express from 'express';

import controller from '../controller/fs';

export default function(): express.Router {
    const router = express.Router();
    router.post(
        `/`,
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            controller
                .createFS(req.body.path, req.body.name, req.body.type)
                .then(result => {
                    res.status(200).json(result);
                })
                .catch(error => next(error));
        }
    );

    router.get(
        `/`,
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            controller
                .fileTree(req.query.path)
                .then(result => {
                    res.status(200).json(result);
                })
                .catch(error => next(error));
        }
    );

    // router.patch(`/`, (req: express.Request, res: express.Response) => {
    //     controller.openFolder().then(result => {
    //         res.status(200).json(result);
    //     });
    // });

    return router;
}
