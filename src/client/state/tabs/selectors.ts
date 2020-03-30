import Logger from '../../helpers/Logger';

import { IState, ITab } from './types';

const log = new Logger('selectors:tabs');

export const errorObject: ITab = {
    contentId: 0,
    id: '0',
    loadingIndicator: false,
    mainLibrary: '',
    name: 'error',
    state: 'error'
};

export function all(state: IState): ITab[] {
    try {
        log.debug(`selecting tab-list`);
        return state.tabs.list || [];
    } catch (error) {
        log.error(error);
        return [];
    }
}

export function activeTabIndex(state: IState): number {
    try {
        log.debug(`selecting activeTabIndex`);
        return state.tabs.activeTabIndex || 0;
    } catch (error) {
        log.error(error);
        return 0;
    }
}

export function activeTab(state: IState): ITab {
    try {
        log.debug(`selecting activeTab`);
        return state.tabs.list[state.tabs.activeTabIndex] || errorObject;
    } catch (error) {
        log.error(error);
        return errorObject;
    }
}

export function noActiveTabs(state: IState): boolean {
    try {
        return state.tabs.list.length === 0;
    } catch (error) {
        log.error(error);
        return false;
    }
}

export function tab(state: IState, tabId: string): ITab {
    return state.tabs.list.filter(tabInList => tabInList.id === tabId)[0];
}
