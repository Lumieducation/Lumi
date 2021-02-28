import superagent from 'superagent';

import { IRunState } from './RunTypes';

export async function getRuns(): Promise<IRunState> {
    return (await superagent.get(`/api/v1/run`)).body;
}

export async function upload(): Promise<IRunState> {
    return (await superagent.post(`/api/v1/run/upload`)).body;
}

// export async function updateSettings(
//     settings: ISettingsState
// ): Promise<ISettingsState> {
//     return (await await superagent.patch(`/api/v1/settings`).send(settings))
//         .body;
// }

// export async function updateContentTypeCache(): Promise<superagent.Response> {
//     return superagent.get(`/api/v1/h5p/content-type-cache/update`);
// }
