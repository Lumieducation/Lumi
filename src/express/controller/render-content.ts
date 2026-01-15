import * as Express from 'express';

import user from '../utils/user';
import H5PRenderer from '../utils/h5p-renderer';

const router = Express.Router();

router.get(
  `/api/v1/content/:contentId/render`,
  async (req: any, res: any, next: Express.NextFunction) => {
    try {
      const { contentId } = req.params;

      req.log.info({
        action: 'h5pContentRoutes.render',
        payload: { contentId: req.params.contentId },
        status: 'start'
      });

      const h5pContent = await req.ctx.h5pPlayer.render(
        contentId,
        user,
        req.lng
      );

      h5pContent.integration.urlLibraries = (process.env.CDN_BASE ?? '') + '/h5p/libraries';

      // hotfix for h5p-tooltip.js
      // TODO: Remove once https://github.com/Lumieducation/H5P-Nodejs-library/issues/3374 is fixed
      try {
        h5pContent.integration.core.scripts.push(
          `${process.env.CDN_BASE}/h5p/core/js/h5p-tooltip.js`
        );
        h5pContent.integration.core.styles.push(
          `${process.env.CDN_BASE}/h5p/core/styles/h5p-tooltip.css`
        );
      } catch (error) {
        console.log(error);
      }

      const h5pHtml = H5PRenderer(h5pContent);

      //   const content = await req.context.h5pPlayer.html.render(
      //     contentId,
      //     req.user.getH5Puser()
      //   );

      req.log.info({
        action: 'h5pContentRoutes.render',
        payload: { contentId },
        status: 'success'
      });
      res.send(h5pHtml).end();
    } catch (error) {
      if (error.message === 'h5p-player:content-missing') {
        req.log.info({
          action: 'h5pContentRoutes.render',
          payload: { params: req.params },
          status: 'not-found'
        });
        res.status(404).end();
        return;
      }

      req.log.error({
        action: 'h5pContentRoutes.render',
        payload: { contentId: req.params.contentId },
        status: 'error',
        error
      });
      res.send(error.message).status(500).end();
    }
  }
);

export default router;
