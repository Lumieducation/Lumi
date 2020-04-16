import Logger from '../../helpers/Logger';

import {
    ActionTypes,
    IState,
    UPDATE_AVAILABLE,
    UPDATE_DOWNLOADED,
    UPDATE_ERROR,
    UPDATE_CHECKING_FOR_UPDATE,
    UPDATE_NOT_AVAILABLE,
    UPDATE_PROGRESS
} from './types';

const log = new Logger('reducer:updates');

export const initialState: IState = {
    checking_for_updates: false,
    update_available: false,
    update_downloaded: false
};

export default function fileTreeReducer(
    state: IState = initialState,
    action: ActionTypes
): IState {
    try {
        log.debug(`reducing ${action.type}`);
        switch (action.type) {
            case UPDATE_AVAILABLE:
                return {
                    ...state,
                    update_available: true,
                    update_info: action.payload.info,
                    checking_for_updates: false
                };

            case UPDATE_DOWNLOADED:
                return {
                    ...state,
                    update_downloaded: true,
                    update_info: action.payload.info,
                    checking_for_updates: false
                };

            case UPDATE_ERROR:
                return {
                    ...state,
                    error: action.payload.error,
                    checking_for_updates: false
                };

            case UPDATE_CHECKING_FOR_UPDATE:
                return {
                    ...state,
                    checking_for_updates: true
                };

            case UPDATE_NOT_AVAILABLE:
                return {
                    ...state,
                    checking_for_updates: false,
                    update_available: false
                };

            case UPDATE_PROGRESS:
                return {
                    ...state,
                    checking_for_updates: false,
                    update_progress: action.payload
                };

            default:
                return state;
        }
    } catch (error) {
        log.error(error);
        return state;
    }
}
