import { default as reducer, initialState } from '../reducer';
import {
    Modes,
    UI_CHANGE_MODE,
    UI_CHANGE_REQUESTSTATE,
    UI_CLOSE_LEFT_DRAWER,
    UI_OPEN_LEFT_DRAWER
} from '../types';

describe('initialState', () => {
    it('returns the initial state', done => {
        const state = reducer(undefined, { type: 'init' } as any);

        expect(state).toEqual(initialState);
        done();
    });
});

describe('UI_CLOSE_LEFT_DRAWER', () => {
    it('closes the left drawer', done => {
        const state = reducer(
            {
                leftDrawerOpen: true
            } as any,
            {
                type: UI_CLOSE_LEFT_DRAWER
            }
        );

        expect(state.leftDrawerOpen).toBe(false);
        done();
    });
});

describe('UI_OPEN_LEFT_DRAWER', () => {
    it('opens the left-drawer', done => {
        const state = reducer(
            {
                leftDrawerOpen: false
            } as any,
            {
                type: UI_OPEN_LEFT_DRAWER
            }
        );

        expect(state.leftDrawerOpen).toBe(true);

        done();
    });
});

describe('UI_CHANGE_MODE', () => {
    it('changes the mode', done => {
        const state = reducer(
            {
                mode: Modes.view
            } as any,
            {
                payload: {
                    mode: Modes.edit
                },
                type: UI_CHANGE_MODE
            }
        );

        expect(state.mode).toBe(Modes.edit);

        done();
    });
});

describe('UI_CHANGE_REQUESTSTATE', () => {
    const state = reducer(
        {
            mode: Modes.view
        } as any,
        {
            payload: {
                id: 'test',
                state: 'pending'
            },
            type: UI_CHANGE_REQUESTSTATE
        }
    );

    it('does not mutate other fields', () => {
        expect(state.mode).toBe(Modes.view);
    });

    it('adds changes the requeststate', () => {
        expect(state.requestStates.test).toEqual({
            id: 'test',
            state: 'pending'
        });
    });
});
