import fs from 'fs';
import path from 'path';

import { Context } from '../boot';
import content_path from './content_path';

export default async function content_config_write(
  ctx: Context,
  content_id: string,
  key: string,
  value: string
): Promise<void> {
  ctx.log.debug(`ops:content_config_write`, { content_id, key, value });
  const _content_path = content_path(ctx, `${content_id}`);

  const config_file = path.join(_content_path, 'config.json');

  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(config_file, 'utf8'));
  } catch (error) {
    ctx.log.info(`No config file found for content ${content_id}`);
  }

  config[key] = value;

  fs.writeFileSync(config_file, JSON.stringify(config, null, 2));
}
