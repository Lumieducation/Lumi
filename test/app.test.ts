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
            args: [path.join(__dirname, '..')]
        });
        return app.start();
    }, 30000);

    afterAll(() => {
        if (app && app.isRunning()) {
            return app.stop();
        }
    });

    describe('launch', () => {
        it('shows an initial window', async (done) => {
            const count = await app.client.getWindowCount();
            expect(count).toBeGreaterThan(0);
            done();
        });

        it('shows the Lumi H5P Editor text', async (done) => {
            const headline = await app.client.$('h1');
            const text = await headline.getText();

            expect(text).toBe('Lumi H5P Editor');
            done();
        });

        it('has the editor-startpage secondary button', async (done) => {
            const button = await app.client.$(
                '#editor-startpage-secondaryButton'
            );

            expect(button).toBeTruthy();
            done();
        });
    });

    describe('Import H5P file', () => {
        it('displays an error snackbar if the imported .h5p file is not valid', async (done) => {
            const ws = socketio(`http://localhost:${PORT}`);

            ws.emit('dispatch', {
                payload: { paths: [`${__dirname}/broken.h5p`] },
                type: 'OPEN_H5P'
            });

            const snackbar = await app.client.$('#notistack-snackbar');
            expect(await snackbar.getText()).toBe(
                'package-validation-failed:invalid-h5p-json-file'
            );

            ws.disconnect();

            done();
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
