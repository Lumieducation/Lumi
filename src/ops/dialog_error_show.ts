import { dialog } from 'electron';

export default async function dialog_error_show(
  title: string,
  message: string
): Promise<void> {
  await dialog.showErrorBox(title, message);
}
