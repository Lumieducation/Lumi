import superagent from 'superagent';

import { IUpdateInfo } from './UpdatesTypes';

export async function getUpdates(): Promise<IUpdateInfo> {
    return (await superagent.get(`/api/v1/updates`)).body;
}

export async function update(): Promise<void> {
    await superagent.post('api/v1/updates');
}
