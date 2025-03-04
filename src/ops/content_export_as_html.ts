import { Context } from '../boot';
import User from '../models/User';
import exportH5P from './export-h5p';

export default async function content_export_as_html(
  context: Context,
  content_id: string,
  path: string
): Promise<void> {
  await exportH5P(
    context,
    path,
    context.h5pEditor,
    (k) => `${k}`,
    content_id,
    new User(),
    'en',
    {
      format: 'bundle',
      includeReporter: false,
      marginX: 0,
      marginY: 0,
      masteryScore: 0,
      maxWidth: 0,
      restrictWidthAndCenter: false,
      showEmbed: false,
      showRights: false
    }
  );

  context.log.info(
    `Content ${content_id} exported to ${path} as signle HTML file.`
  );
}
