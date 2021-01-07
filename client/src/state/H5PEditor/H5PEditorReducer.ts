import Logger from '../../helpers/Logger';

import {
    IH5PEditorState,
    TabActionTypes,
    H5PEDITOR_CLOSE_TAB,
    H5PEDITOR_OPEN_TAB,
    H5PEDITOR_SELECT_TAB,
    H5PEDITOR_UPDATE_TAB,
    H5PEDITOR_LOADED,
    H5PEDITOR_EXPORT_REQUEST,
    H5PEDITOR_EXPORT_SUCCESS,
    H5PEDITOR_EXPORT_ERROR,
    H5P_LOADEDITORCONTENT_SUCCESS,
    H5P_LOADPLAYERCONTENT_REQUEST,
    H5P_LOADPLAYERCONTENT_SUCCESS,
    H5PEDITOR_UPDATE_SUCCESS,
    H5PEDITOR_UPDATE_REQUEST,
    H5PEDITOR_SAVE_REQUEST,
    H5PEDITOR_SAVE_SUCCESS,
    H5PEDITOR_SAVE_ERROR,
    Modes
} from './H5PEditorTypes';

export const initialState: IH5PEditorState = {
    activeTabIndex: 0,
    tabList: []
};

const log = new Logger('reducer:tabs');

export default function tabReducer(
    state: IH5PEditorState = initialState,
    action: TabActionTypes
): IH5PEditorState {
    try {
        log.debug(`reducing ${action.type}`);
        switch (action.type) {
            case H5PEDITOR_SAVE_REQUEST:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        index === state.activeTabIndex
                            ? {
                                  ...tab,
                                  loadingIndicator: true
                              }
                            : tab
                    )
                };

            case H5PEDITOR_SAVE_SUCCESS:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        index === state.activeTabIndex
                            ? {
                                  ...tab,
                                  loadingIndicator: false,
                                  path: action.payload.path
                              }
                            : tab
                    )
                };

            case H5PEDITOR_SAVE_ERROR:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        index === state.activeTabIndex
                            ? {
                                  ...tab,
                                  loadingIndicator: false
                              }
                            : tab
                    )
                };

            case H5P_LOADEDITORCONTENT_SUCCESS:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        tab.id === action.payload.tabId
                            ? {
                                  ...tab,
                                  loadingIndicator: false
                              }
                            : tab
                    )
                };

            case H5PEDITOR_UPDATE_REQUEST:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        tab.id === action.payload.tabId
                            ? {
                                  ...tab,
                                  loadingIndicator: true
                              }
                            : tab
                    )
                };

            case H5PEDITOR_UPDATE_SUCCESS:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        tab.id === action.payload.tabId
                            ? {
                                  ...tab,
                                  contentId: action.payload.contentId,
                                  name: action.payload.metadata.title,
                                  mainLibrary:
                                      action.payload.metadata.mainLibrary,
                                  viewDisabled: false,
                                  loadingIndicator: false
                              }
                            : tab
                    )
                };

            case H5PEDITOR_LOADED:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        tab.id === action.payload.tabId
                            ? {
                                  ...tab,
                                  viewDisabled: false,
                                  loadingIndicator: false
                              }
                            : tab
                    )
                };

            case H5PEDITOR_EXPORT_REQUEST:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        tab.contentId === action.payload.contentId
                            ? {
                                  ...tab,
                                  loadingIndicator: true
                              }
                            : tab
                    )
                };

            case H5PEDITOR_EXPORT_SUCCESS:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        tab.contentId === action.payload.contentId
                            ? {
                                  ...tab,
                                  loadingIndicator: false
                              }
                            : tab
                    )
                };

            case H5PEDITOR_EXPORT_ERROR:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        tab.contentId === action.payload.contentId
                            ? {
                                  ...tab,
                                  loadingIndicator: false
                              }
                            : tab
                    )
                };

            case H5P_LOADPLAYERCONTENT_REQUEST:
                return {
                    ...state,
                    tabList: state.tabList.map((tab) =>
                        tab.contentId === action.payload.contentId
                            ? {
                                  ...tab,
                                  loadingIndicator: true
                              }
                            : tab
                    )
                };

            case H5P_LOADPLAYERCONTENT_SUCCESS:
                return {
                    ...state,
                    tabList: state.tabList.map((tab) =>
                        tab.contentId === action.payload.contentId
                            ? {
                                  ...tab,
                                  loadingIndicator: false
                              }
                            : tab
                    )
                };

            case H5PEDITOR_CLOSE_TAB:
                return {
                    ...state,
                    activeTabIndex: 0,
                    tabList: state.tabList.filter(
                        (tab) => tab.id !== action.payload.id
                    )
                };

            case H5PEDITOR_OPEN_TAB:
                return {
                    ...state,
                    activeTabIndex: state.tabList.length,
                    tabList: [
                        ...state.tabList,
                        {
                            id: action.payload.id,
                            loadingIndicator: true,
                            viewDisabled: true,
                            mainLibrary: '',
                            name: 'new H5P',
                            path: undefined,
                            state: 'success',
                            mode: Modes.edit,
                            ...action.payload.tab
                        }
                    ]
                };
            // if (
            //     state.tabList.some(
            //         (tab) => tab.path === action.payload.tab.path
            //     ) &&
            //     action.payload.tab.path
            // ) {
            //     return {
            //         ...state,
            //         activeTabIndex: findIndex(
            //             state.tabList,
            //             (tab) => tab.path === action.payload.tab.path
            //         )
            //     };
            // }
            // return {
            //     ...state,
            //     activeTabIndex: state.tabList.length,
            //     tabList: [...state.tabList, action.payload.tab]
            // };

            case H5PEDITOR_SELECT_TAB:
                return {
                    ...state,
                    activeTabIndex: action.payload.value
                };

            case H5PEDITOR_UPDATE_TAB:
                return {
                    ...state,
                    tabList: state.tabList.map((tab) =>
                        tab.id === action.payload.tabId
                            ? { ...tab, ...action.payload.update }
                            : tab
                    )
                };

            default:
                return state;
        }
    } catch (error) {
        log.error(error);
        return state;
    }
}
