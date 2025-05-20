import * as Express from 'express';

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
  }
);

export default router;
