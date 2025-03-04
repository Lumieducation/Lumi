import * as Express from 'express';
import * as H5P from '@lumieducation/h5p-server';

import User from '../../models/User';

const router = Express.Router();

router.get(
  `/api/v1/content/:contentId/edit`,
  async (req: any, res: any, next: any) => {
    const { contentId } = req.params;

    const editorModel = (await req.ctx.h5pEditor.render(
      contentId === 'undefined' || contentId === 'new' ? undefined : contentId,
      req.language || 'en',
      new User()
    )) as H5P.IEditorModel;

    if (!contentId || contentId === 'undefined' || contentId === 'new') {
      res.send({ keywords: [], published: false, h5p: editorModel });
    } else {
      const content = await req.ctx.h5pEditor.getContent(
        req.params.contentId,
        new User()
      );

      res.send({
        h5p: {
          ...editorModel,
          library: content.library,
          metadata: content.params.metadata,
          params: content.params.params
        }
      });
    }

    req.log.info({
      action: 'h5pContentRoutes.editContent',
      payload: { contentId },
      status: 'success'
    });

    res.status(200).end();
  }
);

export default router;
