import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import * as api from './H5PApi';
import {
    ContentId,
    DeleteActions,
    LoadPlayerContentActions,
    LoadEditorContentActions,
    SaveContentActions,
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
    H5P_UPDATE_SUCCESS,
    H5P_LOADPLAYERCONTENT_REQUEST,
    H5P_LOADPLAYERCONTENT_SUCCESS,
    H5P_SAVECONTENT_REQUEST,
    H5P_SAVECONTENT_SUCCESS,
    H5P_SAVECONTENT_ERROR,
    H5P_LOADEDITORCONTENT_REQUEST,
    H5P_LOADEDITORCONTENT_SUCCESS
} from './H5PTypes';

export function saveContent(
    tabId: string,
    contentId: string,
    requestBody: { library: string; params: any }
): ThunkAction<void, null, null, SaveContentActions> {
    return async (dispatch: ThunkDispatch<null, null, SaveContentActions>) => {
        dispatch({
            payload: {
                tabId,
                library: requestBody.library,
                params: requestBody.params
            },
            type: H5P_SAVECONTENT_REQUEST
        });

        try {
            if (contentId) {
                const response = JSON.parse(
                    (await api.saveContent(contentId, requestBody)).text
                );

                dispatch({
                    payload: {
                        tabId,
                        contentId: response.contentId,
                        metadata: response.metadata
                    },
                    type: H5P_SAVECONTENT_SUCCESS
                });

                return response;
            }

            const response = JSON.parse(
                (await api.createContent(requestBody)).text
            );
            dispatch({
                payload: {
                    tabId,
                    contentId: response.contentId,
                    metadata: response.metadata
                },
                type: H5P_SAVECONTENT_SUCCESS
            });

            return response;
        } catch (error) {
            dispatch({
                payload: {
                    tabId
                },
                type: H5P_SAVECONTENT_ERROR
            });
        }
    };
}

export function loadEditorContent(
    contentId: ContentId
): ThunkAction<void, null, null, LoadEditorContentActions> {
    return async (
        dispatch: ThunkDispatch<null, null, LoadEditorContentActions>
    ) => {
        dispatch({
            payload: { contentId },
            type: H5P_LOADEDITORCONTENT_REQUEST
        });

        try {
            const content = JSON.parse(
                (await api.loadEditorContent(contentId)).text
            );

            dispatch({
                payload: { contentId, content },
                type: H5P_LOADEDITORCONTENT_SUCCESS
            });

            return content;
        } catch (error) {
            throw new Error(error);
        }
    };
}

export function loadPlayerContent(
    contentId: ContentId
): ThunkAction<void, null, null, LoadPlayerContentActions> {
    if (!contentId) {
        throw new Error('no contentid');
    }
    return async (
        dispatch: ThunkDispatch<null, null, LoadPlayerContentActions>
    ) => {
        dispatch({
            payload: { contentId },
            type: H5P_LOADPLAYERCONTENT_REQUEST
        });

        const content = JSON.parse(
            (await api.loadPlayerContent(contentId)).text
        );

        dispatch({
            payload: { contentId, content },
            type: H5P_LOADPLAYERCONTENT_SUCCESS
        });

        return content;
    };
}

export function deleteH5P(
    contentId: ContentId
): ThunkAction<void, null, null, DeleteActions> {
    return (dispatch: ThunkDispatch<null, null, DeleteActions>) => {
        dispatch({
            payload: { contentId },
            type: H5P_DELETE_REQUEST
        });

        return api
            .deleteH5P(contentId)
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
    contentId: ContentId,
    path?: string
): ThunkAction<void, null, null, ExportActions> {
    return (dispatch: any) => {
        dispatch({
            payload: { id: contentId, path },
            type: H5P_EXPORT_REQUEST
        });

        return api
            .exportH5P(contentId, path)
            .then(({ body }) =>
                dispatch({
                    // tslint:disable-next-line: object-shorthand-properties-first
                    payload: { id: contentId, ...body },
                    type: H5P_EXPORT_SUCCESS
                })
            )
            .catch((error: Error) =>
                dispatch({
                    error,
                    payload: { id: contentId, path },
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

        return api
            .importH5P(path)
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

        return api
            .updateH5P(
                {
                    id,
                    library,
                    metadata,
                    parameters
                },
                id
            )
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
