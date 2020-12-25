import Logger from '../../helpers/Logger';

import {
    IH5PEditorState,
    TabActionTypes,
    H5PEDITOR_CLOSE_TAB,
    H5PEDITOR_OPEN_TAB,
    H5PEDITOR_SELECT_TAB,
    H5PEDITOR_UPDATE_TAB,
    H5PEDITOR_LOADED,
    Modes
} from './H5PEditorTypes';

import {
    H5P_LOADEDITORCONTENT_SUCCESS,
    H5P_LOADPLAYERCONTENT_REQUEST,
    H5P_LOADPLAYERCONTENT_SUCCESS,
    H5P_SAVECONTENT_SUCCESS,
    H5P_SAVECONTENT_REQUEST,
    H5P_EXPORT_REQUEST,
    H5P_EXPORT_SUCCESS,
    H5P_EXPORT_ERROR
} from '../h5p/H5PTypes';

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
            case H5P_EXPORT_REQUEST:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        index === state.activeTabIndex
                            ? {
                                  ...tab,
                                  loadingIndicator: true,
                                  saveButtonState: 'loading'
                              }
                            : tab
                    )
                };

            case H5P_EXPORT_SUCCESS:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        index === state.activeTabIndex
                            ? {
                                  ...tab,
                                  loadingIndicator: false,
                                  saveButtonState: 'success',
                                  path: action.payload.path
                              }
                            : tab
                    )
                };

            case H5P_EXPORT_ERROR:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        index === state.activeTabIndex
                            ? {
                                  ...tab,
                                  loadingIndicator: false,
                                  saveButtonState: 'error'
                              }
                            : tab
                    )
                };

            case H5P_LOADEDITORCONTENT_SUCCESS:
                return {
                    ...state,
                    tabList: state.tabList.map((tab, index) =>
                        parseInt(tab.contentId || '') ===
                        parseInt(action.payload.contentId)
                            ? {
                                  ...tab,
                                  mainLibrary: (action.payload
                                      .content as any).library.split(' ')[0]
                              }
                            : tab
                    )
                };

            case H5P_SAVECONTENT_REQUEST:
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

            case H5P_SAVECONTENT_SUCCESS:
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
                                  saveButtonState: 'default',
                                  viewDisabled: false,
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
                            saveButtonState: 'hidden',
                            viewDisabled: true,
                            mainLibrary: '',
                            name: 'missing title',
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
