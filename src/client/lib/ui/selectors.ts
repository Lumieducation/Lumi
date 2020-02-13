import Logger from '../../helpers/Logger';

import { IState, Modes, RequestStates } from './types';

const log = new Logger('selectors:ui');

export function leftDrawerOpen(state: IState): boolean {
    try {
        log.debug(`selecting leftDrawerOpen`);
        return state.ui.leftDrawerOpen;
    } catch (error) {
        log.error(error);
        return false;
    }
}

export function mode(state: IState): Modes {
    try {
        log.debug('selection mode');
        return state.ui.mode;
    } catch (error) {
        log.error(error);
        return Modes.view;
    }
}

export function requestState(state: IState, id: string): RequestStates {
    try {
        return state.ui.requestStates[id].state;
    } catch (error) {
        return undefined;
    }
}

export function requestProgress(state: IState, id: string): number {
    try {
        return state.ui.requestStates[id].progress;
    } catch (error) {
        return 0;
    }
}

export function requestMessage(state: IState, id: string): string {
    try {
        return state.ui.requestStates[id].message;
    } catch (error) {
        return '';
    }
}
