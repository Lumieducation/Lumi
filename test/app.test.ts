import path from 'path';
import { Application } from 'spectron';
import socketio from 'socket.io-client';

const PORT = 8090;

describe('App', () => {
    let app: Application;
    beforeAll(() => {
        app = new Application({
            env: {
                USERDATA: path.join(__dirname, 'data'),
                PORT: PORT,
                NODE_ENV: 'CI'
            },
            path: path.join(
                __dirname,
                '..',
                'node_modules',
                '.bin',
                'electron'
            ),
            args: [path.join(__dirname, '..')],
            chromeDriverArgs: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        return app.start();
    }, 30000);

    afterAll(async () => {
        if (app && app.isRunning()) {
            await app.stop();
            app.mainProcess.abort();
        }
    });

    describe('launch', () => {
        it('shows an initial window', async () => {
            const count = await app.client.getWindowCount();
            expect(count).toBeGreaterThan(0);
        });

        it('shows the H5P Editor pad', async () => {
            const h5peditor = await app.client.$('launchpad-h5peditor');

            expect(h5peditor).toBeTruthy();
        }, 30000);

        it('shows the Analytics pad', async () => {
            const analytics = await app.client.$('launchpad-analytics');

            expect(analytics).toBeTruthy();
        }, 30000);
    });

    describe('Import H5P file', () => {
        it('displays an error snackbar if the imported .h5p file is not valid', async () => {
            const ws = socketio(`http://localhost:${PORT}`);

            ws.emit('dispatch', {
                payload: { paths: [`${__dirname}/broken.h5p`] },
                type: 'OPEN_H5P'
            });

            const snackbar = await app.client.$('#notistack-snackbar');
            expect(await snackbar.getText()).toBeDefined();

            ws.disconnect();
        });

        // it('imports a valid .h5p file', async (done) => {
        //     const ws = socketio(`http://localhost:${PORT}`);

        //     ws.emit('dispatch', {
        //         payload: { paths: [`${__dirname}/valid.h5p`] },
        //         type: 'OPEN_H5P'
        //     });

        //     setTimeout(() => {
        //         ws.disconnect();
        //         done();
        //     }, 10000);
        // });
    });
});
