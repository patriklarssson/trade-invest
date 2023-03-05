import { Router } from 'express';
import { bankIdCollect, bankIdCollectCustomerId, passwordLogin } from '../controllers/authController';

const authRouter = Router();
authRouter.get('/', passwordLogin)
authRouter.get('/bankid/collect', bankIdCollect)
authRouter.get('/bankid/collect/:customerId', bankIdCollectCustomerId)

export default authRouter;
