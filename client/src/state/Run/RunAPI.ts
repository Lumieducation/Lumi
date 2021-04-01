import superagent from 'superagent';

import { IRunState } from './RunTypes';

export async function getRuns(): Promise<IRunState> {
    return (await superagent.get(`/api/v1/run`)).body;
}

export async function upload(): Promise<IRunState> {
    return (await superagent.post(`/api/v1/run/upload`)).body;
}

export async function deleteFromRun(
    id: string,
    secret: string
): Promise<superagent.Response> {
    return await superagent.delete(`/api/v1/run/${id}?secret=${secret}`);
}
