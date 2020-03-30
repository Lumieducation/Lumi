import { findIndex } from 'lodash';

import Logger from '../../helpers/Logger';

import {
    ITabState,
    TabActionTypes,
    TABS_CLOSE_TAB,
    TABS_OPEN_TAB,
    TABS_RESET_SAVINGSTATE,
    TABS_SELECT_TAB,
    TABS_UPDATE_TAB
} from './types';

export const initialState: ITabState = {
    activeTabIndex: 0,
    list: []
};

const log = new Logger('reducer:tabs');

export default function tabReducer(
    state: ITabState = initialState,
    action: TabActionTypes
): ITabState {
    try {
        log.debug(`reducing ${action.type}`);
        switch (action.type) {
            case TABS_CLOSE_TAB:
                return {
                    ...state,
                    activeTabIndex: 0,
                    list: state.list.filter(tab => tab.id !== action.payload.id)
                };

            case TABS_OPEN_TAB:
                if (
                    state.list.some(
                        tab => tab.path === action.payload.tab.path
                    ) &&
                    action.payload.tab.path
                ) {
                    return {
                        ...state,
                        activeTabIndex: findIndex(
                            state.list,
                            tab => tab.path === action.payload.tab.path
                        )
                    };
                }
                return {
                    ...state,
                    activeTabIndex: state.list.length,
                    list: [...state.list, action.payload.tab]
                };

            case TABS_RESET_SAVINGSTATE:
                return {
                    ...state,
                    list: state.list.map(tab =>
                        tab.contentId === action.payload.contentId
                            ? {
                                  ...tab,
                                  savingState: undefined
                              }
                            : tab
                    )
                };

            case TABS_SELECT_TAB:
                return {
                    ...state,
                    activeTabIndex: action.payload.value
                };

            case TABS_UPDATE_TAB:
                return {
                    ...state,
                    list: state.list.map(tab =>
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
