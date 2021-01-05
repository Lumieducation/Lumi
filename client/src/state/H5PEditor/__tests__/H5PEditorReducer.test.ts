import shortid from 'shortid';

import { default as reducer, initialState } from '../H5PEditorReducer';
import {
    ITab,
    Modes,
    H5P_LOADEDITORCONTENT_SUCCESS,
    H5PEDITOR_LOADED,
    H5PEDITOR_EXPORTHTML_REQUEST,
    H5PEDITOR_EXPORTHTML_SUCCESS,
    H5PEDITOR_EXPORTHTML_ERROR
} from '../H5PEditorTypes';

describe('initialState', () => {
    it('returns the initial state', (done) => {
        const state = reducer(undefined, { type: 'init' } as any);

        expect(state).toEqual(initialState);
        done();
    });
});

const testTab: ITab = {
    id: shortid(),
    contentId: shortid(),
    loadingIndicator: true,
    saveButtonState: 'default',
    exportButtonState: 'default',
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

describe('H5PEDITOR_LOADED', () => {
    it('sets the exportButtonState to default', (done) => {
        const state = reducer(
            {
                activeTabIndex: 0,
                tabList: [
                    {
                        ...testTab,
                        exportButtonState: 'hidden'
                    }
                ]
            },
            {
                payload: {
                    tabId: testTab.id
                },
                type: H5PEDITOR_LOADED
            }
        );
        expect(state.tabList[0].exportButtonState).toBe('default');
        done();
    });
});

describe('H5PEDITOR_EXPORTHTML_REQUEST', () => {
    const state = reducer(
        {
            activeTabIndex: 0,
            tabList: [
                {
                    ...testTab,
                    exportButtonState: 'default'
                }
            ]
        },
        {
            payload: {
                contentId: testTab.contentId || ''
            },
            type: H5PEDITOR_EXPORTHTML_REQUEST
        }
    );

    it('sets the exportButtonState to loading', (done) => {
        expect(state.tabList[0].exportButtonState).toBe('loading');
        done();
    });

    it('sets the loadingIndicator to true', (done) => {
        expect(state.tabList[0].loadingIndicator).toBeTruthy();
        done();
    });
});

describe('H5PEDITOR_EXPORTHTML_SUCCESS', () => {
    const state = reducer(
        {
            activeTabIndex: 0,
            tabList: [
                {
                    ...testTab,
                    exportButtonState: 'loading',
                    loadingIndicator: true
                }
            ]
        },
        {
            payload: {
                contentId: testTab.contentId || ''
            },
            type: H5PEDITOR_EXPORTHTML_SUCCESS
        }
    );

    it('sets the exportButtonState to success', (done) => {
        expect(state.tabList[0].exportButtonState).toBe('success');
        done();
    });

    it('sets the loadingIndicator to false', (done) => {
        expect(state.tabList[0].loadingIndicator).toBeFalsy();
        done();
    });
});

describe('H5PEDITOR_EXPORTHTML_ERROR', () => {
    const state = reducer(
        {
            activeTabIndex: 0,
            tabList: [
                {
                    ...testTab,
                    exportButtonState: 'loading',
                    loadingIndicator: true
                }
            ]
        },
        {
            payload: {
                contentId: testTab.contentId || ''
            },
            type: H5PEDITOR_EXPORTHTML_ERROR
        }
    );

    it('sets the exportButtonState to error', (done) => {
        expect(state.tabList[0].exportButtonState).toBe('error');
        done();
    });

    it('sets the loadingIndicator to false', (done) => {
        expect(state.tabList[0].loadingIndicator).toBeFalsy();
        done();
    });
});
