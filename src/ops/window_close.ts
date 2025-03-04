import { Context } from '../boot';
import content_delete from './content_delete';

export default async function window_close(
  ctx: Context,
  content_id: string
): Promise<void> {
  if (content_id === 'new') {
    return;
  }
  await content_delete(ctx, content_id);
}
