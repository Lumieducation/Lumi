import superagent from 'superagent';
import { ISystemState } from '../state/System/SystemTypes';

export async function getSystem(): Promise<ISystemState> {
    return (await superagent.get(`/api/v1/system`)).body;
}
