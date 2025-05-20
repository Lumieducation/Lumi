import { Context } from '../boot';
import User from '../models/User';
import exportH5P from './export-h5p';

export default async function content_export_as_html_external(
  context: Context,
  content_id: string,
  path: string,
  options: {
    marginX: number;
    marginY: number;
    masteryScore: number;
    maxWidth: number;
    restrictWidthAndCenter: boolean;
    showEmbed: boolean;
    showRights: boolean;
  }
): Promise<void> {
  context.log.debug(`ops:content_export_as_html_external`, {
    content_id,
    path
  });
  await exportH5P(
    context,
    path,
    context.h5pEditor,
    (k) => `${k}`,
    content_id,
    new User(),
    'en',
    {
      format: 'external',
      includeReporter: false,
      marginX: 0,
      marginY: 0,
      masteryScore: 0,
      maxWidth: 0,
      restrictWidthAndCenter: false,
      showEmbed: false,
      showRights: false,
      ...options
    }
  );
}
