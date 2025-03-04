import fs from 'fs';
import path from 'path';

import { Context } from '../boot';
import content_path from './content_path';

export default async function content_config_read(
  ctx: Context,
  content_id: string,
  key: string
): Promise<string> {
  try {
    const _content_path = content_path(ctx, content_id);

    const config_file = path.join(_content_path, 'config.json');

    const config = JSON.parse(fs.readFileSync(config_file, 'utf8'));

    return config[key];
  } catch (error) {
    ctx.log.warn(`Failed to read config for content ${content_id}`);
    return undefined;
  }
}
