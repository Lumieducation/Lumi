import { Context } from '../boot';

export default async function window_loading_hide(
  context: Context,
  content_id: string
): Promise<void> {
  context.ws.emit(content_id, {
    type: 'hide_loading'
  });
  context.log.debug(`Hiding loading-indicator for ${content_id}`);
}
