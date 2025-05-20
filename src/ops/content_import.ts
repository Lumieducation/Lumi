import fs from 'fs/promises';

import { Context } from '../boot';
import User from '../models/User';
import getUbernameFromH5pJson from './get_ubername_from_h5p_json';

interface Result {
  id: string;
  path: string;
}
export default async function content_import(
  ctx: Context,
  file_paths: string[]
): Promise<Result[]> {
  const result: Result[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const file_path of file_paths) {
    const buffer = await fs.readFile(file_path);

    const { metadata, parameters } = await ctx.h5pEditor.uploadPackage(
      buffer,
      new User()
    );

    const id = await ctx.h5pEditor.saveOrUpdateContent(
      undefined,
      parameters,
      metadata,
      getUbernameFromH5pJson(metadata),
      new User()
    );

    result.push({
      id,
      path: file_path
    });
  }

  return result;
}
