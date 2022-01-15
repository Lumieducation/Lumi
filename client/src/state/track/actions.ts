import * as api from '../../services/TrackingAPI';

export function track(
    category: string,
    action: string,
    name?: string,
    value?: number
): any {
    return async (dispatch: any) => {
        await api.track(category, action, name, value);
        dispatch({
            payload: {
                action,
                category,
                name,
                value
            },
            type: 'TRACK'
        });
    };
}
