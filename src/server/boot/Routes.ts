import express from 'express';
import routes from '../routes';

export default function boot(app: express.Application): express.Application {
    app.use('/', routes());
    return app;
}
