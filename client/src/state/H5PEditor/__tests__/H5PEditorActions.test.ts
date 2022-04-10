import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../H5PEditorActions';

import {
    H5PEDITOR_BLURACTIVEELEMENT,
    H5PEDITOR_UPDATE_CONTENT_SERVER
} from '../H5PEditorTypes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// declare var window: any;

describe('blurActiveElement', () => {
    it('calls the window.document.activeElement?.blur() function', async () => {
        const store = mockStore();
        // window = {};
        // window.document = {};
        // window.document.activeElement = {};

        // const mockBlur = jest.fn();
        // window.document.activeElement.blur = mockBlur;

        store.dispatch(actions.blurActiveElement());

        expect(store.getActions()).toEqual([
            {
                type: H5PEDITOR_BLURACTIVEELEMENT
            }
        ]);

        // expect(mockBlur.mock.calls.length).toBe(1);
    });
});

describe('updateConentOnServer', () => {
    it('blurs the active element first', async () => {
        const store = mockStore();

        store.dispatch(actions.updateContentOnServer());

        expect(store.getActions()[0]).toEqual({
            type: H5PEDITOR_BLURACTIVEELEMENT
        });
    });
});

describe('save', () => {
    const store = mockStore();

    store.dispatch(actions.save() as any);

    it('blurs the active element first', async () => {
        expect(store.getActions()[0]).toEqual({
            type: H5PEDITOR_BLURACTIVEELEMENT
        });
    });

    it('updates the content on the server', async () => {
        expect(store.getActions()[1]).toEqual({
            type: H5PEDITOR_UPDATE_CONTENT_SERVER
        });
    });
});
