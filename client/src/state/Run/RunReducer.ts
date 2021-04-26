import Logger from '../../helpers/Logger';

import {
    RUN_GET_RUNS_SUCCESS,
    IRunState,
    RunActionTypes,
    RUN_UPLOAD_SUCCESS,
    RUN_UPLOAD_REQUEST,
    RUN_UPDATE_STATE
} from './RunTypes';

export const initialState: IRunState = {
    runs: [],
    showSetupDialog: false,
    showConnectionErrorDialog: false,
    showUploadDialog: false,
    uploadProgress: {
        state: 'not_started',
        progress: 0
    }
};

const log = new Logger('reducer:run');

export default function runReducer(
    state: IRunState = initialState,
    action: RunActionTypes
): IRunState {
    try {
        log.debug(`reducing ${action.type}`);
        switch (action.type) {
            case RUN_UPLOAD_REQUEST:
                return {
                    ...state,
                    uploadProgress: {
                        state: 'not_started',
                        progress: 0,
                        id: undefined
                    }
                };
            case RUN_GET_RUNS_SUCCESS:
                // case RUN_UPLOAD_SUCCESS:
                return {
                    ...state,
                    runs: action.payload
                };

            case RUN_UPDATE_STATE:
                return {
                    ...state,
                    ...action.payload
                };

            case RUN_UPLOAD_SUCCESS:
                return {
                    ...state,
                    uploadProgress: {
                        state: 'success',
                        progress: 100,
                        id: action.payload.contentId
                    }
                };
            // case 'RUN_UPDATE_UPLOAD_PROGRESS':
            //     return {
            //         ...state,
            //         ...(action as any).payload
            //     };

            default:
                return state;
        }
    } catch (error) {
        log.error(error);
        return state;
    }
}
