import { Context } from '../boot';

export default async function window_loading_hide(
  context: Context,
  content_id: string
): Promise<void> {
  context.log.debug(`ops:window_loading_hide`, {
    content_id
  });
  context.ws.emit(content_id, {
    type: 'hide_loading'
  });
}
