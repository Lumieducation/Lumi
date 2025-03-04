import { Context } from '../boot';

export default function content_url(ctx: Context, content_id: string): string {
  ctx.log.debug(`content_url: ${content_id}`);
  return `http://localhost:${
    ctx.is_development ? 8000 : ctx.port
  }/content/${content_id}`;
}
