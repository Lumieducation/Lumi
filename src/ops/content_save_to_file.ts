import fs from 'fs';
import path from 'path';
import fsPromises from 'fs/promises';
import { finished } from 'stream/promises';
import * as H5P from '@lumieducation/h5p-server';

import { Context } from '../boot';
import User from '../models/User';

export default async function content_save_to_file(
  ctx: Context,
  content_id: string,
  filePath: string
): Promise<void> {
  ctx.log.debug(`ops:content_save_to_file`, {
    content_id,
    path: filePath
  });

  const tempPath = path.join(path.dirname(filePath),`.${path.basename(filePath)}.${Date.now()}.tmp`);
  const stream = fs.createWriteStream(tempPath);
  const streamFinished = finished(stream);
  const packageExporter = new H5P.PackageExporter(
    ctx.h5pEditor.libraryManager,
    ctx.h5pEditor.contentStorage,
    ctx.h5pEditor.config
  );

  try {
    await packageExporter.createPackage(content_id, stream, new User());

    // We wait for the writable stream and surface stream errors before replacing
    // the existing file.
    await streamFinished;
    await fsPromises.rename(tempPath, filePath);
  } catch (error) {
    stream.destroy();
    try {
      await streamFinished;
    } catch {
      // Silently ignore errors from the stream, as we're already handling the main error
    }
    await fsPromises.rm(tempPath, { force: true });
    throw error;
  }
}
