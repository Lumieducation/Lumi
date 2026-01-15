import { dialog } from 'electron';

export default async function show_dialog_save_as(): Promise<{
  file_path: string | undefined;
  canceled: boolean;
}> {
  const result = await dialog.showSaveDialog({
    title: 'Save As',
    filters: [{ name: '.h5p', extensions: ['h5p'] }],
    properties: ['showOverwriteConfirmation']
  });

  return {
    file_path: result.filePath,
    canceled: result.canceled
  };
}
