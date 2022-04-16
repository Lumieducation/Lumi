import superagent from 'superagent';
import { IUpdateInfo } from '../state/Updates/UpdatesTypes';

export async function getUpdates(): Promise<IUpdateInfo> {
    const result = await superagent.get('/api/v1/updates');
    if (result.statusCode === 200) {
        return result.body;
    } else {
        return {
            version: '',
            releaseDate: '',
            releaseName: '',
            releaseNotes: ''
        };
    }
}

export async function update(): Promise<void> {
    await superagent.post('api/v1/updates');
}
