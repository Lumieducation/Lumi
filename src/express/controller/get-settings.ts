import * as Express from 'express';

import settings_read from '../../ops/settings_read';

const router = Express.Router();

router.get(`/api/v1/settings`, async (req: any, res: any, next: any) => {
  const settings = await settings_read(req.ctx);

  res.status(200).json(settings);
});

export default router;
