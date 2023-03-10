import { Router } from 'express';
import { getHoldings } from '../controllers/accountController';

const accountRouter = Router();
accountRouter.get('/holdings', getHoldings);


export default accountRouter;
