import { Context } from '../boot';

export default async function dialog_export_show(
  ctx: Context,
  content_id: string
) {
  ctx.ws.emit(content_id, { type: 'dialog-export-show' });
}
