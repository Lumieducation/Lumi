import * as Express from 'express';
import * as H5P from '@lumieducation/h5p-server';

const router = Express.Router();

router.patch(
  `/api/v1/content/:contentId`,
  async (req: any, res: any, next: Express.NextFunction) => {
    if (
      !req.body.params ||
      !req.body.params.params ||
      !req.body.params.metadata ||
      !req.body.library ||
      !req.user
    ) {
      res.status(400).send('Malformed request').end();
      return;
    }

    let { contentId } = req.params;
    if (contentId === 'new' || contentId === 'undefined') {
      contentId = undefined;
    } else {
      contentId = contentId.toString();
    }

    try {
      const { id, metadata } =
        await req.ctx.h5pEditor.saveOrUpdateContentReturnMetaData(
          contentId,
          req.body.params.params,
          req.body.params.metadata,
          req.body.library,
          req.user
        );

      res.json({ contentId: id, metadata });
      res.status(200).end();
    } catch (error) {
      // Without this catch block failed saves (e.g. invalid metadata) never
      // answered the client at all: the request hung until timeout and the UI
      // spinner stayed up indefinitely.
      req.log.error('express:controller:save-content failed', {
        contentId,
        error: error instanceof Error ? error.message : String(error)
      });
      if (error instanceof H5P.H5pError) {
        res.status(error.httpStatusCode).json({ message: error.message });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Error while saving content' });
    }
  }
);

export default router;
