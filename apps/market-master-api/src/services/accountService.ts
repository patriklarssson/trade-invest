import { getUserSession } from './userSessionService';

const getPossitions = (userId: string) => {
  const avanza = getUserSession(userId)?.avanzaSession;
  return avanza.getPositions();
};

export { getPossitions };
