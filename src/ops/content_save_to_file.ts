import fs from 'fs';
import * as H5P from '@lumieducation/h5p-server';

import { Context } from '../boot';
import User from '../models/User';

export default async function content_save_to_file(
  ctx: Context,
  content_id: string,
  path: string
): Promise<void> {
  const stream = fs.createWriteStream(path);
  const packageExporter = new H5P.PackageExporter(
    ctx.h5pEditor.libraryManager,
    ctx.h5pEditor.contentStorage,
    ctx.h5pEditor.config
  );

  await packageExporter.createPackage(content_id, stream, new User());

  // We also need to wait for the stream to finish before returning, so
  // that the user is notified correctly about fact that saving is still
  // going on.
  await new Promise<void>((y, n) => {
    stream.on('finish', () => {
      y();
    });
  }).finally(() => {
    stream.close();
  });
}
