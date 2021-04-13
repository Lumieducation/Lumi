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
    showDialog: false,
    uploadProgress: {
        import: {
            state: 'not_started'
        },
        export: {
            state: 'not_started'
        },
        upload: {
            state: 'not_started',
            progress: 0
        }
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
                    ...state
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
