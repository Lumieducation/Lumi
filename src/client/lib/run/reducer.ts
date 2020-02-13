import Logger from '../../helpers/Logger';

// tslint:disable-next-line
import {
    IRunState,
    RUN_GET_ANALYTICS_SUCCESS,
    RUN_GET_H5P_SUCCESS,
    RunActions
} from './types';

import { convert } from '../../helpers/Data';

export const initialState: IRunState = {
    analytics: {},
    h5p: {}
};

const log = new Logger('reducer:run');

export default function tabReducer(
    state: IRunState = initialState,
    action: RunActions
): IRunState {
    try {
        log.debug(`reducing ${action.type}`);
        switch (action.type) {
            case RUN_GET_ANALYTICS_SUCCESS:
                return {
                    ...state,
                    analytics: {
                        ...state.analytics,
                        [action.payload._id]: {
                            ...action.payload,
                            data: convert(action.payload.data)
                        }
                    }
                };

            case RUN_GET_H5P_SUCCESS:
                return {
                    ...state,
                    h5p: {
                        ...state.h5p,
                        [action.payload.id]: action.payload
                    }
                };
            default:
                return state;
        }
    } catch (error) {
        log.error(error);
        return state;
    }
}
