import superagent from 'superagent';
import { IRunState } from '../state/Run/RunTypes';

export async function getRuns(): Promise<IRunState> {
    const body = (await await superagent.get(`/api/v1/run`)).body;

    if (body === null) {
        throw new Error('invalid body');
    }
    return body;
}

export async function upload(contentId?: string): Promise<IRunState> {
    return (await superagent.post(`/api/v1/run`).send({ contentId })).body;
}

export async function deleteFromRun(id: string): Promise<superagent.Response> {
    return await superagent.delete(`/api/v1/run/${id}`);
}
