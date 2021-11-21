import Logger from '../../helpers/Logger';
import * as Sentry from '@sentry/browser';

import { ITab, Modes } from './H5PEditorTypes';
import { IState } from '../';

const log = new Logger('selectors:tabs');

export const errorObject: ITab = {
    contentId: 'new',
    id: '0',
    loadingIndicator: false,
    mainLibrary: '',
    name: 'error',
    mode: Modes.edit,
    viewDisabled: true,
    opening: false
};

export function all(state: IState): ITab[] {
    try {
        log.debug(`selecting tab-list`);
        return state.h5peditor.tabList || [];
    } catch (error: any) {
        Sentry.captureException(error);

        log.error(error);
        return [];
    }
}

export function activeTabIndex(state: IState): number {
    try {
        log.debug(`selecting activeTabIndex`);
        return state.h5peditor.activeTabIndex || 0;
    } catch (error: any) {
        Sentry.captureException(error);

        log.error(error);
        return 0;
    }
}

export function activeTab(state: IState): ITab {
    try {
        log.debug(`selecting activeTab`);
        return (
            state.h5peditor.tabList[state.h5peditor.activeTabIndex] ||
            errorObject
        );
    } catch (error: any) {
        Sentry.captureException(error);

        log.error(error);
        return errorObject;
    }
}

export function noActiveTabs(state: IState): boolean {
    try {
        return state.h5peditor.tabList.length === 0;
    } catch (error: any) {
        Sentry.captureException(error);

        log.error(error);
        return false;
    }
}

export function tab(state: IState, tabId: string): ITab {
    return state.h5peditor.tabList.filter(
        (tabInList) => tabInList.id === tabId
    )[0];
}

export function viewDisabled(state: IState): boolean {
    try {
        return state.h5peditor.tabList[state.h5peditor.activeTabIndex]
            .viewDisabled;
    } catch (error: any) {
        return true;
    }
}
