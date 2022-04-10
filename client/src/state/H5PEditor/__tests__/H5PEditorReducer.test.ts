import { nanoid } from 'nanoid';

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
    it('returns the initial state', async () => {
        const state = reducer(undefined, { type: 'init' } as any);

        expect(state).toEqual(initialState);
    });
});

const testTab: ITab = {
    id: nanoid(),
    contentId: nanoid(),
    loadingIndicator: true,
    viewDisabled: true,
    mainLibrary: 'library',
    name: 'test',
    path: '',
    fileHandleId: undefined,
    mode: Modes.view,
    opening: false
};

describe('H5P_LOADEDITORCONTENT_SUCCESS', () => {
    it('sets the loadingIndicator to false', async () => {
        const state = reducer(
            {
                activeTabIndex: 0,
                tabList: [
                    {
                        ...testTab,
                        loadingIndicator: true
                    }
                ],
                lockDisplay: false,
                showExportDialog: false
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
    });
});

describe('H5PEDITOR_EXPORT_REQUEST', () => {
    const state = reducer(
        {
            activeTabIndex: 0,
            lockDisplay: false,
            showExportDialog: true,
            tabList: [
                {
                    ...testTab
                }
            ]
        },
        {
            payload: {
                contentId: testTab.contentId || '',
                format: 'bundle',
                includeReporter: false
            },
            type: H5PEDITOR_EXPORT_REQUEST
        }
    );

    it('sets the loadingIndicator to true', async () => {
        expect(state.tabList[0].loadingIndicator).toBeTruthy();
    });

    it('locks the display', async () => {
        expect(state.lockDisplay).toBeTruthy();
    });

    it('hides the export dialog', async () => {
        expect(state.showExportDialog).toBeFalsy();
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
            ],
            showExportDialog: true,
            lockDisplay: true
        },
        {
            payload: {
                contentId: testTab.contentId || ''
            },
            type: H5PEDITOR_EXPORT_SUCCESS
        }
    );

    it('sets the loadingIndicator to false', async () => {
        expect(state.tabList[0].loadingIndicator).toBeFalsy();
    });

    it('unlocks the display', async () => {
        expect(state.lockDisplay).toBeFalsy();
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
            ],
            showExportDialog: true,
            lockDisplay: true
        },
        {
            payload: {
                contentId: testTab.contentId || ''
            },
            type: H5PEDITOR_EXPORT_ERROR
        }
    );

    it('sets the loadingIndicator to false', async () => {
        expect(state.tabList[0].loadingIndicator).toBeFalsy();
    });

    it('closes the export Dialog', async () => {
        expect(state.showExportDialog).toBeFalsy();
    });

    it('unlocks the display', async () => {
        expect(state.lockDisplay).toBeFalsy();
    });
});
