import * as Sentry from '@sentry/browser';

import {
    IUpdatesState,
    IUpdatesActionTypes,
    UPDATES_GET_UPDATES_SUCCESS
} from './UpdatesTypes';

export const initialState: IUpdatesState = {
    checkingForUpdates: false,
    updateInfo: {
        version: '',
        releaseName: '',
        releaseNotes: '',
        releaseDate: ''
    },
    downloadProgress: {
        progress: 0,
        bytesPersecond: 0,
        percent: 0,
        total: 0,
        transferred: 0
    }
};

export default function updatesReducer(
    state: IUpdatesState = initialState,
    action: IUpdatesActionTypes
): IUpdatesState {
    try {
        switch (action.type) {
            case UPDATES_GET_UPDATES_SUCCESS:
                return {
                    ...state,
                    updateInfo: action.payload
                };
            default:
                return state;
        }
    } catch (error: any) {
        Sentry.captureException(error);
        return state;
    }
}
