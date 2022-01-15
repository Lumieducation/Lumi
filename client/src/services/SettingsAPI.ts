import superagent from 'superagent';

import { ISettingsState } from '../state/Settings/SettingsTypes';

export async function getSettings(): Promise<ISettingsState> {
    return (await superagent.get(`/api/v1/settings`)).body;
}

export async function updateSettings(
    settings: ISettingsState
): Promise<ISettingsState> {
    return (await superagent.patch(`/api/v1/settings`).send(settings)).body;
}
