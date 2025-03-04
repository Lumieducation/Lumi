import path from 'path';

import { Context } from '../boot';

export default function content_path(ctx: Context, content_id: string): string {
  return path.join(ctx.paths.content, content_id);
}
