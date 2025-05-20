import bunyan from 'bunyan';
import * as Express from 'express';

import { Context } from '../boot';

export interface Request extends Express.Request {
  ctx: Context;
  log: bunyan.Logger;
  lng: string;
}
