import fs from 'fs';
import { app } from 'electron';

import { Context } from '../boot';
import Settings from '../types/Settings';
import settings_read from './settings_read';

export default async function settings_check(ctx: Context): Promise<void> {
  const check = await settings_read(ctx);

  const default_settings: Settings = {
    language: app.getLocale(),
    prerelease_features: true,
    updates_automatic: true
  };

  const settings = {
    ...default_settings,
    ...check
  };

  fs.writeFileSync(ctx.paths.settings, JSON.stringify(settings, null, 2));

  ctx.log.info(`Settings checked`);
}
