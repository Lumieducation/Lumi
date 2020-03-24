import * as selectors from '../selectors';

import { Modes } from '../types';

describe('leftDrawerOpen(): boolean', () => {
    it('returns if the left-drawer is open', done => {
        const state = {
            ui: {
                leftDrawerOpen: true
            }
        };

        expect(selectors.leftDrawerOpen(state as any)).toBe(true);
        done();
    });
});

describe('mode(): Modes', () => {
    it('returns the editor-mode', done => {
        const state = {
            ui: {
                mode: 'edit'
            }
        };

        expect(selectors.mode(state as any)).toBe('edit');
        done();
    });

    it('returns view as the editor-mode if something goes wrong', done => {
        const state = {};

        expect(selectors.mode(state as any)).toBe(Modes.view);
        done();
    });
});
