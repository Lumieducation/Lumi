import superagent from 'superagent';

import { IRunState } from './RunTypes';

export async function getRuns(): Promise<IRunState> {
    const body = (await superagent.get(`/api/v1/run/api/list`)).body;

    if (body === null) {
        throw new Error('invalid body');
    }
    return body;
}

export async function upload(
    contentId?: string,
    title?: string,
    mainLibrary?: string
): Promise<IRunState> {
    return (
        await superagent
            .post(`/api/v1/run/upload`)
            .send({ contentId, title, mainLibrary })
    ).body;
}

export async function deleteFromRun(id: string): Promise<superagent.Response> {
    return await superagent.delete(`/api/v1/run/${id}`);
}
