import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import api from '../../api';

import {
    ContentId,
    DeleteActions,
    ExportActions,
    H5P_DELETE_ERROR,
    H5P_DELETE_REQUEST,
    H5P_DELETE_SUCCESS,
    H5P_EXPORT_ERROR,
    H5P_EXPORT_REQUEST,
    H5P_EXPORT_SUCCESS,
    H5P_IMPORT_ERROR,
    H5P_IMPORT_REQUEST,
    H5P_IMPORT_SUCCESS,
    H5P_UPDATE_ERROR,
    H5P_UPDATE_REQUEST,
    H5P_UPDATE_SUCCESS
} from './types';

export function deleteH5P(
    contentId: ContentId
): ThunkAction<void, null, null, DeleteActions> {
    return (dispatch: ThunkDispatch<null, null, DeleteActions>) => {
        dispatch({
            payload: { contentId },
            type: H5P_DELETE_REQUEST
        });

        return api.editor
            .deleteH5P({
                contentId
            })
            .then((response) => {
                return dispatch({
                    payload: { contentId },
                    type: H5P_DELETE_SUCCESS
                });
            })
            .catch((error) => {
                return dispatch({
                    error,
                    payload: { contentId },
                    type: H5P_DELETE_ERROR
                });
            });
    };
}

export function exportH5P(
    id: ContentId,
    path?: string
): ThunkAction<void, null, null, ExportActions> {
    return (dispatch: any) => {
        dispatch({
            payload: { id, path },
            type: H5P_EXPORT_REQUEST
        });

        return api.editor
            .exportH5P({
                contentId: id,
                // tslint:disable-next-line: object-shorthand-properties-first
                path
            })
            .then(({ body }) =>
                dispatch({
                    // tslint:disable-next-line: object-shorthand-properties-first
                    payload: { id, ...body },
                    type: H5P_EXPORT_SUCCESS
                })
            )
            .catch((error: Error) =>
                dispatch({
                    error,
                    payload: { id, path },
                    type: H5P_EXPORT_ERROR
                })
            );
    };
}

export function importH5P(
    path: string
): ThunkAction<void, null, null, ExportActions> {
    return (dispatch: any) => {
        dispatch({
            payload: { path },
            type: H5P_IMPORT_REQUEST
        });

        return api.editor
            .importH5P({
                body: {
                    path
                }
            })
            .then(({ body }) =>
                dispatch({
                    payload: { path, h5p: body },
                    type: H5P_IMPORT_SUCCESS
                })
            )
            .catch((error: Error) =>
                dispatch({
                    error,
                    payload: {
                        path
                    },
                    type: H5P_IMPORT_ERROR
                })
            );
    };
}

export function updateH5P(
    parameters: any,
    metadata: any,
    library: string,
    id?: ContentId
): any {
    return (dispatch: any) => {
        dispatch({
            payload: { parameters, metadata, library, id },
            type: H5P_UPDATE_REQUEST
        });

        return api.editor
            .updateH5P({
                contentId: id,
                h5P: {
                    id,
                    library,
                    metadata,
                    parameters
                }
            })
            .then(({ body }) =>
                dispatch({
                    payload: { ...body },
                    type: H5P_UPDATE_SUCCESS
                })
            )
            .catch((error: Error) =>
                dispatch({
                    error,
                    payload: {
                        id,
                        library,
                        metadata,
                        parameters
                    },
                    type: H5P_UPDATE_ERROR
                })
            );
    };
}
