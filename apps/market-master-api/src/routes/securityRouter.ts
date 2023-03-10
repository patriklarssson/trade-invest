import { Router } from 'express';
import { getSecurity } from '../controllers/securityController';
import { requireLogin } from '../middlewares/requireLogin';

const securityRouter = Router();

securityRouter.all('/*', requireLogin, function (req, res, next) {
  next();
});

securityRouter.get('/:securityId', getSecurity);

export default securityRouter;
