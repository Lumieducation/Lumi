import Logger from '../../helpers/Logger';

import {
    RUN_GET_RUNS_SUCCESS,
    IRunState,
    RunActionTypes,
    RUN_UPLOAD_SUCCESS,
    RUN_UPLOAD_REQUEST,
    RUN_UPDATE_STATE,
    RUN_UPLOAD_ERROR
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
                        state: 'pending',
                        progress: 0,
                        runId: undefined
                    }
                };
            case RUN_GET_RUNS_SUCCESS:
                // case RUN_UPLOAD_SUCCESS:
                return {
                    ...state,
                    runs: action.payload.runList
                };

            case RUN_UPLOAD_ERROR:
                return {
                    ...state,
                    showConnectionErrorDialog: true
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
                        runId: action.payload.runId
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
    } catch (error: any) {
        log.error(error);
        return state;
    }
}
