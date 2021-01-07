import shortid from 'shortid';

import { default as reducer, initialState } from '../H5PEditorReducer';
import {
    ITab,
    Modes,
    H5P_LOADEDITORCONTENT_SUCCESS,
    H5PEDITOR_EXPORT_REQUEST,
    H5PEDITOR_EXPORT_SUCCESS,
    H5PEDITOR_EXPORT_ERROR
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

describe('H5PEDITOR_EXPORT_REQUEST', () => {
    const state = reducer(
        {
            activeTabIndex: 0,
            tabList: [
                {
                    ...testTab
                }
            ]
        },
        {
            payload: {
                contentId: testTab.contentId || ''
            },
            type: H5PEDITOR_EXPORT_REQUEST
        }
    );

    it('sets the loadingIndicator to true', (done) => {
        expect(state.tabList[0].loadingIndicator).toBeTruthy();
        done();
    });
});

describe('H5PEDITOR_EXPORT_SUCCESS', () => {
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
                contentId: testTab.contentId || ''
            },
            type: H5PEDITOR_EXPORT_SUCCESS
        }
    );

    it('sets the loadingIndicator to false', (done) => {
        expect(state.tabList[0].loadingIndicator).toBeFalsy();
        done();
    });
});

describe('H5PEDITOR_EXPORT_ERROR', () => {
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
                contentId: testTab.contentId || ''
            },
            type: H5PEDITOR_EXPORT_ERROR
        }
    );

    it('sets the loadingIndicator to false', (done) => {
        expect(state.tabList[0].loadingIndicator).toBeFalsy();
        done();
    });
});
