import * as express from 'express';
import debug from 'debug';
import LumiError from '../helpers/LumiError';

const log = debug('lumi:handlers:errorHandler');

export default function (
    error: LumiError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    log(`sending error response`, error);
    res.status(error.status || 500).json(error);
}
