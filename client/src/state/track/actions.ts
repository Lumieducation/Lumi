import * as api from './api';

export function track(
    category: string,
    action: string,
    name?: string,
    value?: number
): any {
    return api.track(category, action, name, value).then(() => {
        return {
            payload: {
                action,
                category,
                name,
                value
            },
            type: 'TRACK'
        };
    });
}
