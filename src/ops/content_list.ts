import * as fs from 'fs';

import { Context } from '../boot';

export default async function content_list(ctx: Context): Promise<string[]> {
  ctx.log.debug(`ops:content_list`);
  const folders = fs.readdirSync(ctx.paths.content);

  const filtered_folders = folders.filter((folder) => !folder.startsWith('.'));

  return filtered_folders;
}
