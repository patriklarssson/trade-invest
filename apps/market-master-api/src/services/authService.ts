import { Avanza } from '@trade-invest/avanza';
import { storeUserSession } from './userSessionService';

const authenticate = (
  sessionId: string,
  credentials: {
    username: string;
    password: string;
    totpSecret: string;
  }
) => {
  const avanza = new Avanza();
  return avanza.authenticate(credentials as any).then(() => {
    storeUserSession(sessionId, { avanzaSession: avanza as any }, 600000);
  });
};

const initBankId = () => {
  const avanza = new Avanza();
  return avanza.bankId();
};

const checkBankIdCollect = (transactionId: string) => {
  const avanza = new Avanza();
  return avanza.bankIdCollect(transactionId);
};

const bankIdEstablishConnection = (
  transactionId: string,
  customerId: number
) => {
  const avanza = new Avanza();
  return avanza.bankIdCollectCustomerId(transactionId, customerId).then(() => avanza);
};

export {authenticate, initBankId, checkBankIdCollect, bankIdEstablishConnection}