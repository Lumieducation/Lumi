import shortid from 'shortid';

import { default as reducer, initialState } from '../H5PEditorReducer';
import { ITab, Modes, H5P_LOADEDITORCONTENT_SUCCESS } from '../H5PEditorTypes';

describe('initialState', () => {
    it('returns the initial state', (done) => {
        const state = reducer(undefined, { type: 'init' } as any);

        expect(state).toEqual(initialState);
        done();
    });
});

const testTab: ITab = {
    id: shortid(),
    contentId: 'a',
    loadingIndicator: true,
    saveButtonState: 'default',
    viewDisabled: true,
    mainLibrary: 'library',
    name: 'test',
    path: '',
    state: 'closing',
    mode: Modes.view
};

describe('H5P_LOADEDITORCONTENT_SUCCESS', () => {
    it('sets the loadingIndicator to false', (done) => {
        const state = reducer(
            {
                activeTabIndex: 0,
                tabList: [
                    {
                        ...testTab,
                        loadingIndicator: true
                    }
                ]
            },
            {
                payload: {
                    contentId: 'contentId',
                    tabId: testTab.id,
                    content: {} as any
                },
                type: H5P_LOADEDITORCONTENT_SUCCESS
            }
        );
        expect(state.tabList[0].loadingIndicator).toBeFalsy();
        done();
    });
});
