import { Context } from '../boot';

export default async function window_snackbar_show(
  context: Context,
  content_id: string,
  message: string,
  variant: string
): Promise<void> {
  context.ws.emit(content_id, {
    type: 'show_snackbar',
    payload: {
      message,
      variant
    }
  });
  context.log.debug(`Showing snackbar for ${content_id}`);
}
