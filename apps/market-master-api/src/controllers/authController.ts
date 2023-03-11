import { AuthErrorResponse } from '../models/Avanza';
import {
  authenticate,
  bankIdEstablishConnection,
  checkBankIdCollect,
  initBankId,
} from '../services/authService';
import { storeUserSession } from '../services/userSessionService';

const passwordLogin = (req, res, next) => {
  const { username, password, totpSecret } = req.body;
  const credentials = {
    username,
    password,
    totpSecret,
  };
  authenticate(req.session.id, credentials)
    .then(() => next())
    .catch((error: AuthErrorResponse) => res.send(error));
};

const bankId = (req, res, next) => {
  initBankId().then((data) => res.send(data));
};
const bankIdCollect = (req, res, next) => {
  const { transactionId } = req.body;
  checkBankIdCollect(transactionId)
  .then((data) => res.send(data))
  .catch((e) => res.send(e))
};
const bankIdCollectCustomerId = (req, res, next) => {
  const { customerId } = req.params;
  const { transactionId } = req.body;
  bankIdEstablishConnection(transactionId, customerId).then((avanza) => {
    storeUserSession(req.session.id, { avanzaSession: avanza }, 600000);
    res.send("OK")
  });
};

export { passwordLogin, bankIdCollect, bankIdCollectCustomerId, bankId };
