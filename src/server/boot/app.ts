import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import express from 'express';
import fileUpload from 'express-fileupload';

import h5pConfig from '../../config/h5pConfig';
import routes from '../routes';

const app = express();
app.use(Sentry.Handlers.requestHandler());

app.use(bodyParser.json({ limit: h5pConfig.maxTotalSize }));
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: h5pConfig.maxTotalSize
    })
);

app.use(
    fileUpload({
        limits: { fileSize: h5pConfig.maxTotalSize }
    })
);

app.use('/', routes());

app.use(Sentry.Handlers.errorHandler());

app.use((error, req, res, next) => {
    Sentry.captureException(error);
    res.status(error.status || 500).json({
        code: error.code,
        message: error.message,
        status: error.status
    });
});

export default app;
