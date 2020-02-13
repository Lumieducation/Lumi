import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions';

import {
    Modes,
    UI_CHANGE_MODE,
    UI_CLOSE_LEFT_DRAWER,
    UI_OPEN_LEFT_DRAWER
} from '../types';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('openLeftDrawer', () => {
    it('dispatches the correct actions-types', done => {
        const expectedActions = [
            {
                type: UI_OPEN_LEFT_DRAWER
            }
        ];
        const store = mockStore();

        store.dispatch(actions.openLeftDrawer());
        expect(store.getActions()).toEqual(expectedActions);
        done();
    });
});

describe('closeLeftDrawer', () => {
    it('dispatches the correct actions-types', done => {
        const expectedActions = [
            {
                type: UI_CLOSE_LEFT_DRAWER
            }
        ];
        const store = mockStore();

        store.dispatch(actions.closeLeftDrawer());
        expect(store.getActions()).toEqual(expectedActions);
        done();
    });
});

describe('changeMode', () => {
    it('dispatches the correct actions-types', done => {
        const mode = Modes.view;
        const expectedActions = [
            {
                payload: { mode },
                type: UI_CHANGE_MODE
            }
        ];
        const store = mockStore();

        store.dispatch(actions.changeMode(Modes.view));
        expect(store.getActions()).toEqual(expectedActions);
        done();
    });
});
