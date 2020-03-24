import { push } from 'connected-react-router';

import superagent from 'superagent';

import {
    RUN_GET_ANALYTICS_ERROR,
    RUN_GET_ANALYTICS_REQUEST,
    RUN_GET_ANALYTICS_SUCCESS,
    RUN_GET_H5P_ERROR,
    RUN_GET_H5P_REQUEST,
    RUN_GET_H5P_SUCCESS,
    RUN_UPLOAD_ERROR,
    RUN_UPLOAD_REQUEST,
    RUN_UPLOAD_SUCCESS
} from './types';

import * as UI from '../ui';

import api from '../../api';

export function getAnalytics(id: string): any {
    return (dispatch: any) => {
        dispatch({
            analytics_id: id,
            type: RUN_GET_ANALYTICS_REQUEST
        });

        return api.run
            .getAnalytics({
                id
            })
            .then(response => {
                return dispatch({
                    payload: response.body,
                    type: RUN_GET_ANALYTICS_SUCCESS
                });
            })
            .catch(error => {
                return dispatch({
                    error,
                    payload: { analytics_id: id },
                    type: RUN_GET_ANALYTICS_ERROR
                });
            });
    };
}

export function getH5P(id: number): any {
    return (dispatch: any) => {
        dispatch({
            payload: { id },
            type: RUN_GET_H5P_REQUEST
        });

        dispatch(UI.actions.changeRequestState('run_geth5p', 'pending', 0));

        return api.run
            .geth5p({
                id
            })
            .then(({ body }) => {
                dispatch(
                    UI.actions.changeRequestState('run_geth5p', 'success', 0)
                );
                return dispatch({
                    payload: body,
                    type: RUN_GET_H5P_SUCCESS
                });
            })
            .catch(error => {
                dispatch(
                    UI.actions.changeRequestState('run_geth5p', 'error', 0)
                );
                return dispatch({
                    error,
                    payload: { id },
                    type: RUN_GET_H5P_ERROR
                });
            });
    };
}

export function upload(file: File): any {
    return (dispatch: any) => {
        dispatch({
            payload: { file },
            type: RUN_UPLOAD_REQUEST
        });

        dispatch(UI.actions.changeRequestState('run_upload', 'pending', 0));

        return superagent
            .post(
                process.env.NODE_ENV === 'development'
                    ? 'http://localhost:3001/v0/h5p'
                    : 'http://api.lumi.run/v0/h5p'
            )
            .attach('h5p', file)
            .on('progress', event => {
                dispatch(
                    UI.actions.changeRequestState(
                        'run_upload',
                        'pending',
                        event.percent
                    )
                );
            })
            .then(({ body }) => {
                dispatch(
                    UI.actions.changeRequestState(
                        'run_upload',
                        'success',
                        100,
                        body.analytics_id
                    )
                );
                return dispatch({
                    payload: body,
                    type: RUN_UPLOAD_SUCCESS
                });
            })
            .catch(error => {
                dispatch(
                    UI.actions.changeRequestState(
                        'run_upload',
                        'error',
                        100,
                        error.response.body.message
                    )
                );

                return dispatch({
                    error,
                    payload: {},
                    type: RUN_UPLOAD_ERROR
                });
            });
    };
}

export function uploadFile(file: File): any {
    return async (dispatch: any) => {
        const uploadAction = await dispatch(upload(file));

        if (uploadAction.error) {
            return;
        }

        dispatch(push(`/analytics?id=${uploadAction.payload.analytics_id}`));
    };
}
