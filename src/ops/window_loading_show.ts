import { Context } from '../boot';

export default async function window_loading_show(
  context: Context,
  content_id: string
): Promise<void> {
  context.log.debug(`ops:window_loading_show`, {
    content_id
  });
  context.ws.emit(content_id, {
    type: 'show_loading'
  });
}
