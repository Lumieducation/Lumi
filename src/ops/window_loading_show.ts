import { Context } from '../boot';

export default async function window_loading_show(
  context: Context,
  content_id: string
): Promise<void> {
  context.ws.emit(content_id, {
    type: 'show_loading'
  });
  context.log.debug(`Showing loading-indicator for ${content_id}`);
}
