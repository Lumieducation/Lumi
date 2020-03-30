import superagent from 'superagent';

export function track(
    category: string,
    action: string,
    name?: string,
    value?: string
): Promise<superagent.Response> {
    return superagent.post('/api/track/v0').send({
        action,
        category,
        name,
        value
    });
}
