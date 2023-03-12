import { Router } from 'express';
import { GetIndexContent } from '../controllers/marketController';


const marketRouter = Router();
marketRouter.get('/', GetIndexContent);


export default marketRouter;
