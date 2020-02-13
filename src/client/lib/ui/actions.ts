import Logger from '../../helpers/Logger';

import {
    Modes,
    RequestStates,
    UI_CHANGE_MODE,
    UI_CHANGE_REQUESTSTATE,
    UI_CLOSE_LEFT_DRAWER,
    UI_OPEN_LEFT_DRAWER,
    UIActionTypes
} from './types';

const log = new Logger('actions:ui');

export function openLeftDrawer(): UIActionTypes {
    log.info(`opening left-drawer`);
    return {
        type: UI_OPEN_LEFT_DRAWER
    };
}

export function closeLeftDrawer(): UIActionTypes {
    log.info(`closing left-drawer`);
    return {
        type: UI_CLOSE_LEFT_DRAWER
    };
}

export function changeMode(mode: Modes): UIActionTypes {
    log.info(`changing mode to ${mode}`);
    return {
        payload: { mode },
        type: UI_CHANGE_MODE
    };
}

export function changeRequestState(
    id: string,
    state: RequestStates,
    progress?: number,
    message?: string
): UIActionTypes {
    log.info(`changing request state of ${id} to ${state}`);

    return {
        payload: {
            id,
            message,
            progress,
            state
        },
        type: UI_CHANGE_REQUESTSTATE
    };
}
