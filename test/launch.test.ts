import path from 'path';
import { Application } from 'spectron';

describe('Application launch', () => {
    let app: Application;
    beforeAll(() => {
        app = new Application({
            env: {
                USERDATA: path.join(__dirname, 'data')
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
    });

    afterAll(() => {
        if (app && app.isRunning()) {
            return app.stop();
        }
    });

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
        const button = await app.client.$('#editor-startpage-secondaryButton');

        expect(button).toBeTruthy();
        done();
    });
});
