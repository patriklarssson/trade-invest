import { AuthErrorResponse } from '../models/Avanza';
import { authenticate } from '../services/avanzaService';

const passwordLogin = (req, res, next) => {
  console.log('authing...');
  const { username, password, totpSecret } = req.body;
  let credentials = {
    username,
    password,
    totpSecret,
  };
  if (process.env.NODE_ENV === 'development') {
    credentials = {
      username: process.env.AVA_USERNAME,
      password: process.env.PASSWORD,
      totpSecret: process.env.TOTPSECRET,
    };
  }
  authenticate(req.session.id, credentials)
  .then(() => next())
  .catch((error: AuthErrorResponse) => res.send(error));
};

const bankIdCollect = (req, res, next) => {

}
const bankIdCollectCustomerId = (req, res, next) => {

}

export {passwordLogin, bankIdCollect, bankIdCollectCustomerId}
