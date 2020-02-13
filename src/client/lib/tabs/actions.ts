import Logger from '../../helpers/Logger';

import {
    ContentId,
    ITab,
    TabActionTypes,
    TABS_CLOSE_TAB,
    TABS_OPEN_TAB,
    TABS_RESET_SAVINGSTATE,
    TABS_SELECT_TAB,
    TABS_UPDATE_TAB
} from './types';

const log = new Logger('actions:tabs');

export function openTab(tab: ITab): TabActionTypes {
    log.info(`opening tab ${tab.id}`);
    return {
        payload: {
            tab
        },
        type: TABS_OPEN_TAB
    };
}

export function closeTab(id: string): TabActionTypes {
    log.info(`closing tab with id ${id}`);

    return {
        payload: { id },
        type: TABS_CLOSE_TAB
    };
}

export function resetSavingState(contentId: ContentId): TabActionTypes {
    log.info(`resetting savingState for ${contentId}`);
    return {
        payload: { contentId },
        type: TABS_RESET_SAVINGSTATE
    };
}

export function setSavingState(
    tabId: string,
    state: 'error' | 'pending' | 'success'
): any {
    return async (dispatch: any) => {
        setTimeout(() => {
            dispatch(
                updateTab(tabId, {
                    state: 'success'
                })
            );
        }, 2500);
        dispatch(
            updateTab(tabId, {
                state: state === 'pending' ? 'saving' : state
            })
        );
    };
}

export function selectTab(value: number): TabActionTypes {
    log.info(`selecting tab ${value}`);
    return {
        payload: { value },
        type: TABS_SELECT_TAB
    };
}

export function updateTab(
    tabId: string,
    update: Partial<ITab>
): TabActionTypes {
    return {
        payload: { tabId, update },
        type: TABS_UPDATE_TAB
    };
}
