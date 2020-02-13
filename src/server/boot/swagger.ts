import express from 'express';
import path from 'path';
import createMiddleware from 'swagger-express-middleware';

export default function boot(
    app: express.Application
): Promise<express.Application> {
    return new Promise((resolve, reject) => {
        createMiddleware(
            path.join(
                __dirname,
                '..',
                '..',
                '..',
                '..',
                'src',
                'api',
                'swagger.json'
            ),
            app,
            (err, middleware) => {
                // Add all the Swagger Express Middleware, or just the ones you need.
                // NOTE: Some of these accept optional options (omitted here for brevity)
                app.use(
                    middleware.metadata(),
                    middleware.CORS(),
                    middleware.files(),
                    middleware.parseRequest(),
                    middleware.validateRequest()
                    // middleware.mock()
                );
                resolve(app);
            }
        );
    });
}
