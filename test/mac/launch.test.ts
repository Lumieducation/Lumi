import path from 'path';
import { Application } from 'spectron';

describe('Application launch', () => {
    let app: any;
    beforeAll(async done => {
        app = new Application({
            env: {
                USERDATA: path.join(__dirname, 'data')
            },
            path: path.join(
                __dirname,
                '..',
                '..',
                'dist',
                'mac',
                'Lumi.app',
                'Contents',
                'MacOS',
                'Lumi'
            )
        });
        await app.start();
        done();
    });

    afterAll(async done => {
        await app.stop();
        done();
    });

    it('shows an initial window', async done => {
        const count = await app.client.getWindowCount();
        expect(count).toBeGreaterThan(0);
        done();
    });
});
