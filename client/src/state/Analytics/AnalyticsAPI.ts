import superagent from 'superagent';

import { IInteraction, IUser } from '@lumieducation/xapi-viewer';

export async function importAnalytics(): Promise<{
    users: IUser[];
    interactions: IInteraction[];
}> {
    const response = await superagent.get('/api/v1/analytics');

    return {
        users: response.body.users,
        interactions: response.body.interactions
    };
}
