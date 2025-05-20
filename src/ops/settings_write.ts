import fs from 'fs';

import { Context } from '../boot';
import Settings from '../types/Settings';

export default async function settings_write(
  ctx: Context,
  update: Partial<Settings>
): Promise<void> {
  ctx.log.debug(`ops:settings_write`, update);
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(ctx.paths.settings, 'utf8'));
  } catch (error) {
    ctx.log.debug(`No settings file found.`);
  }

  settings = { ...settings, ...update };

  fs.writeFileSync(ctx.paths.settings, JSON.stringify(settings, null, 2));
}
