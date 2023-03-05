import { Router } from 'express';
import {
  bankId,
  bankIdCollect,
  bankIdCollectCustomerId,
  passwordLogin,
} from '../controllers/authController';

const authRouter = Router();
authRouter.get('/', passwordLogin);
authRouter.get('/bankid', bankId);
authRouter.post('/bankid/collect', bankIdCollect);
authRouter.post('/bankid/collect/:customerId', bankIdCollectCustomerId);

export default authRouter;
