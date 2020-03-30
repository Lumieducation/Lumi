import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import express from 'express';
import fileUpload from 'express-fileupload';

import Routes from './Routes';

const app = express();
app.use(Sentry.Handlers.requestHandler());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '50mb'
    })
);

app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 }
    })
);

Routes(app);

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
