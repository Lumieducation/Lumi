import { Context } from '../boot';
import window_open from './window_open';
import content_list from './content_list';

export default async function content_open_all_from_working_directory(
  context: Context
): Promise<string[]> {
  context.log.info('ops:content_open_all_from_working_directory');
  const content_ids = await content_list(context);
  content_ids.forEach((content_id, index) => {
    window_open(context, content_id);
  });

  return content_ids;
}
