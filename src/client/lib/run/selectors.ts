import Logger from '../../helpers/Logger';

import { IAnalytics, IState } from './types';

const log = new Logger('selectors:run');

export function analytics(state: IState, id: string): IAnalytics | undefined {
    log.debug(`selecting analytics with id ${id}`);
    return state.run.analytics[id];
}

export function h5p(
    state: IState,
    id: number
):
    | {
          id: number;
          metadata: any;
          parameters: any;
      }
    | undefined {
    return state.run.h5p[id];
}
