import fs from 'fs';

import { Context } from '../boot';
import Settings from '../types/Settings';

export default async function settings_read(ctx: Context): Promise<Settings> {
  try {
    ctx.log.debug(`ops:settings_read`);
    const settings = JSON.parse(fs.readFileSync(ctx.paths.settings, 'utf8'));
    return settings;
  } catch (error) {
    ctx.log.warn(`Failed to read settings`);
    return undefined;
  }
}
