import path from 'path';

import { Context } from '../boot';

export default function content_path(ctx: Context, content_id: string): string {
  ctx.log.debug(`ops:content_path`, { content_id });
  return path.join(ctx.paths.content, content_id);
}
