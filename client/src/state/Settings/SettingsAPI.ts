import superagent from 'superagent';

import { ISettingsState } from './SettingsTypes';

export async function getSettings(): Promise<ISettingsState> {
    return (await superagent.get(`/api/v1/settings`)).body;
}

export async function updateSettings(
    settings: ISettingsState
): Promise<ISettingsState> {
    return (await await superagent.patch(`/api/v1/settings`).send(settings))
        .body;
}
