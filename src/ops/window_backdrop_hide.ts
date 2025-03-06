import { Context } from '../boot';

export default async function window_backdrop_hide(
  context: Context,
  content_id: string
): Promise<void> {
  context.log.debug(`ops:window_backdrop_hide`, {
    content_id
  });
  context.ws.emit(content_id, { type: 'hide_backdrop' });
  context.log.debug(`Hiding backdrop for ${content_id}`);
}
