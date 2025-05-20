import { dialog } from 'electron';

export default async function dialog_export_save_as_show(
  title: string,
  name: string,
  extensions: string[]
): Promise<{
  file_path: string | undefined;
  canceled: boolean;
}> {
  const result = await dialog.showSaveDialog({
    title,
    filters: [{ name, extensions }],
    properties: ['showOverwriteConfirmation']
  });

  return {
    file_path: result.filePath,
    canceled: result.canceled
  };
}
