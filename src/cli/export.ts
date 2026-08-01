import fs from 'fs';

import { HeadlessContext } from './boot-headless';
import content_import from '../ops/content_import';
import content_export_as_html from '../ops/content_export_as_html';

export default async function exportPackage(
  ctx: HeadlessContext,
  inputPath: string,
  outputPath: string
): Promise<void> {
  const [{ id }] = await content_import(ctx, [inputPath]);

  await content_export_as_html(ctx, id, outputPath, {
    marginX: 0,
    marginY: 0,
    masteryScore: 0,
    maxWidth: 0,
    restrictWidthAndCenter: false,
    showEmbed: false,
    showRights: false
  });

  const stats = await fs.promises.stat(outputPath);
  if (stats.size < 100 * 1024) {
    throw new Error(
      `Export produced an unexpectedly small file (${stats.size} bytes) at "${outputPath}". ` +
        `The export likely failed silently.`
    );
  }
}
