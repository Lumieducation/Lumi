import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from '../actions';

import {
    CLOSE_SNACKBAR,
    ENQUEUE_SNACKBAR,
    INotification,
    REMOVE_SNACKBAR
} from '../types';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('closeSnackbar', () => {
    it('dispatches the correct actions-types', done => {
        const key = '1337';

        const expectedActions = [
            {
                dismissAll: false,
                // tslint:disable-next-line: object-shorthand-properties-first
                key,
                type: CLOSE_SNACKBAR
            }
        ];
        const store = mockStore();

        store.dispatch(actions.closeSnackbar(key));
        expect(store.getActions()).toEqual(expectedActions);
        done();
    });
});

describe('removeSnackbar', () => {
    it('dispatches the correct actions-types', done => {
        const key = '1337';

        const expectedActions = [
            {
                key,
                type: REMOVE_SNACKBAR
            }
        ];
        const store = mockStore();

        store.dispatch(actions.removeSnackbar(key));
        expect(store.getActions()).toEqual(expectedActions);
        done();
    });
});
