import Logger from '../../helpers/Logger';

import { IRunState, RunActionTypes } from './RunTypes';

export const initialState: IRunState = {
    runs: []
};

const log = new Logger('reducer:run');

export default function runReducer(
    state: IRunState = initialState,
    action: RunActionTypes
): IRunState {
    try {
        log.debug(`reducing ${action.type}`);
        switch (action.type) {
            default:
                return state;
        }
    } catch (error) {
        log.error(error);
        return state;
    }
}
