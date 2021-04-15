import superagent from 'superagent';

import { IFile } from './AnalyticsTypes';

export async function importAnalytics(): Promise<{
    files: IFile[];
}> {
    const response = await superagent.get('/api/v1/analytics');

    return {
        files: response.body
    };
}
