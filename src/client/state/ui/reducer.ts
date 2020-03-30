import Logger from '../../helpers/Logger';

import {
    IUIState,
    Modes,
    UI_CHANGE_MODE,
    UI_CHANGE_REQUESTSTATE,
    UI_CLOSE_LEFT_DRAWER,
    UI_OPEN_LEFT_DRAWER,
    UIActionTypes
} from './types';

const log = new Logger('reducer:ui');

export const initialState: IUIState = {
    leftDrawerOpen: false,
    mode: Modes.view,
    requestStates: {}
};

export default function fileTreeReducer(
    state: IUIState = initialState,
    action: UIActionTypes
): IUIState {
    try {
        log.debug(`reducing ${action.type}`);
        switch (action.type) {
            case UI_CHANGE_MODE:
                return {
                    ...state,
                    mode: action.payload.mode
                };

            case UI_OPEN_LEFT_DRAWER: {
                return {
                    ...state,
                    leftDrawerOpen: true
                };
            }

            case UI_CLOSE_LEFT_DRAWER:
                return {
                    ...state,
                    leftDrawerOpen: false
                };

            case UI_CHANGE_REQUESTSTATE:
                return {
                    ...state,
                    requestStates: {
                        ...state.requestStates,
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
