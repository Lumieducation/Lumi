import superagent from 'superagent';

import { IRunState } from './RunTypes';

export async function getRuns(): Promise<IRunState> {
    const body = (await superagent.get(`/api/run/api/v1/run`)).body;

    if (body === null) {
        throw new Error('invalid body');
    }
    return body;
}

export async function upload(contentId?: string): Promise<IRunState> {
    return (await superagent.post(`/api/run`).send({ contentId })).body;
}

export async function deleteFromRun(id: string): Promise<superagent.Response> {
    return await superagent.delete(`/api/run/api/v1/run/${id}`);
}
