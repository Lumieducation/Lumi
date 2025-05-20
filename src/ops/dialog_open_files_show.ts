import { dialog } from 'electron';

export default async function dialog_open_files_show(): Promise<string[]> {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  });

  return result.filePaths;
}
