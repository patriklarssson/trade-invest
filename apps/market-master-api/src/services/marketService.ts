import { getUserSession } from './userSessionService';

const getIndex = (userId: string) => {
  const avanza = getUserSession(userId).avanzaSession;
  return avanza.getIndex("19002")
};

export { getIndex };
