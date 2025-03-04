import { dialog } from 'electron';

export default async function dialog_message_show(
  message: string,
  type: 'none' | 'info' | 'error' | 'question' | 'warning'
): Promise<void> {
  await dialog.showMessageBox({
    message,
    type
  });
}
