import superagent from 'superagent';

export async function importAnalytics(): Promise<{
    users: any[];
    interactions: any[];
}> {
    const response = await superagent.get('/api/v1/analytics');

    return {
        users: response.body.users,
        interactions: response.body.interactions
    };
}
