import { Router } from 'express';
import { login } from '../controllers/loginController';


const loginRouter = Router();
loginRouter.get('/', login)

export default loginRouter;
