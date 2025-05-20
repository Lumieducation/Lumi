import { Context } from '../boot';

export default async function window_snackbar_show(
  context: Context,
  content_id: string,
  message: string,
  variant: string
): Promise<void> {
  context.log.debug(`ops:window_snackbar_show`, {
    content_id,
    message,
    variant
  });
  context.ws.emit(content_id, {
    type: 'show_snackbar',
    payload: {
      message,
      variant
    }
  });
}
