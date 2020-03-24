import {
    ActionTypes,
    IState,
    ITreeEntry,
    LUMIFS_CREATE_DIRECTORY_ERROR,
    LUMIFS_CREATE_DIRECTORY_REQUEST,
    LUMIFS_CREATE_DIRECTORY_SUCCESS,
    LUMIFS_GET_FILETREE_ERROR,
    LUMIFS_GET_FILETREE_REQUEST,
    LUMIFS_GET_FILETREE_SUCCESS,
    LUMIFS_SET_CURRENTDIRECTORY,
    LUMIFS_UPDATE_FILETREE,
    LUMIFS_UPDATE_ROOT
} from './types';

import api from '../../api';

export function createFS(
    path: string,
    name: string,
    type: 'directory' | 'file'
): any {
    return (dispatch: any, getState: () => IState) => {
        dispatch({
            payload: {
                name,
                path,
                type
            },
            type: LUMIFS_CREATE_DIRECTORY_REQUEST
        });

        return api.editor
            .createFS({
                body: {
                    name,
                    path,
                    type
                }
            })
            .then(({ body }) => {
                dispatch(getFileTree(getState().fs.root));
                return dispatch({
                    payload: { name, type, path: (body as any).path },
                    type: LUMIFS_CREATE_DIRECTORY_SUCCESS
                });
            })
            .catch((error: Error) => {
                return dispatch({
                    error,
                    payload: { name, path },
                    type: LUMIFS_CREATE_DIRECTORY_ERROR
                });
            });
    };
}
export function getFileTree(path?: string): any {
    return (dispatch: any, getState: () => IState) => {
        const PATH = path || getState().fs.root;

        dispatch({
            payload: { path: PATH },
            type: LUMIFS_GET_FILETREE_REQUEST
        });

        return api.editor
            .getFiletree({
                path: PATH
            })
            .then(({ body }) => {
                dispatch({
                    payload: body,
                    type: LUMIFS_GET_FILETREE_SUCCESS
                });
                dispatch(updateFileTree(body as ITreeEntry));
                dispatch(updateFileTreeRoot((body as ITreeEntry).path));
            })
            .catch((error: Error) => {
                dispatch({
                    error,
                    payload: { path },
                    type: LUMIFS_GET_FILETREE_ERROR
                });
            });
    };
}

export function updateFileTree(fileTree: ITreeEntry): ActionTypes {
    return {
        payload: fileTree,
        type: LUMIFS_UPDATE_FILETREE
    };
}

export function updateFileTreeRoot(root: string): ActionTypes {
    return {
        payload: { root },
        type: LUMIFS_UPDATE_ROOT
    };
}

export function updateCurrentDirectory(
    directory: string,
    type: 'file' | 'directory'
): ActionTypes {
    return {
        payload: { type, currentDirectory: directory },
        type: LUMIFS_SET_CURRENTDIRECTORY
    };
}
