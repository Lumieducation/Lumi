import debug from 'debug';

import path from 'path';

import {
    ActionTypes,
    IFS,
    LUMIFS_SET_CURRENTDIRECTORY,
    LUMIFS_UPDATE_FILETREE,
    LUMIFS_UPDATE_ROOT
} from './types';

const log = debug('lumi:LUMIFS:reducer');

export const initialState: IFS = {
    activePath: undefined,
    currentDirectory: undefined,
    fileTree: {
        name: 'loading',
        path: '/',
        type: 'directory'
    },
    root: undefined
};

export default function reducer(
    state: IFS = initialState,
    action: ActionTypes
): IFS {
    try {
        log(`reducing ${action.type}`);
        switch (action.type) {
            case LUMIFS_UPDATE_ROOT:
                return {
                    ...state,
                    currentDirectory: action.payload.root,
                    root: action.payload.root
                };

            case LUMIFS_UPDATE_FILETREE: {
                return {
                    ...state,
                    fileTree: action.payload
                };
            }

            case LUMIFS_SET_CURRENTDIRECTORY:
                return {
                    ...state,
                    activePath:
                        action.payload.type === 'file'
                            ? action.payload.currentDirectory
                            : undefined,
                    currentDirectory:
                        action.payload.type === 'directory'
                            ? action.payload.currentDirectory
                            : path.dirname(action.payload.currentDirectory)
                };

            default:
                return state;
        }
    } catch (error) {
        log(error);
        return state;
    }
}
