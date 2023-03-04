import Avanza from 'avanza';
import { storeUserSession } from './userSessionService';

export const authenticate = (
  sessionId: string,
  credentials: {
    username: string;
    password: string;
    totpSecret: string;
  }
) => {
  const avanza = new Avanza();
  return avanza
    .authenticate(credentials)
    .then(() => {
      storeUserSession(sessionId, { avanzaSession: avanza as any }, 600000);
    })
};
