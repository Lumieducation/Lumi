import { app } from 'electron';

import { Context } from '../boot';
import settings_read from './settings_read';

export default async function language_get(ctx: Context): Promise<string> {
  try {
    ctx.log.debug(`ops:language_get`);
    let language_code = (await settings_read(ctx)).language;

    if (!language_code) {
      language_code = app.getLocale();
    }

    return language_code;
  } catch (error) {
    return app.getLocale();
  }
}
