import { Router } from 'express';
import {
  GetIndexContent,
  getMarketContents,
} from '../controllers/marketController';
import { requireLogin } from '../middlewares/requireLogin';

const marketRouter = Router();

marketRouter.all('/*', requireLogin, function (req, res, next) {
  next();
});

marketRouter.get('/', GetIndexContent);
marketRouter.get('/lists', getMarketContents);

export default marketRouter;
