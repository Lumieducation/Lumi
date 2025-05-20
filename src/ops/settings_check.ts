import fs from 'fs';

import { Context } from '../boot';
import settings_read from './settings_read';
import default_settings from '../../config/default_settings';

export default async function settings_check(ctx: Context): Promise<void> {
  ctx.log.debug(`ops:settings_check`);
  const check = await settings_read(ctx);

  const settings = {
    ...default_settings,
    ...check
  };

  fs.writeFileSync(ctx.paths.settings, JSON.stringify(settings, null, 2));

  ctx.log.info(`Settings checked`);
}
