import { Context } from '../boot';

export default async function window_backdrop_show(
  context: Context,
  content_id: string
): Promise<void> {
  context.ws.emit(content_id, { type: 'show_backdrop' });
  context.log.debug(`Showing backdrop for ${content_id}`);
}
