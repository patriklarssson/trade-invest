import { getUserSession } from './userSessionService';
import { InstrumentType } from '../models/InstrumentType';

const getSecurityById = (userId: string, securityId: string) => {
  const avanza = getUserSession(userId).avanzaSession;
  return avanza.getInstrument(InstrumentType.STOCK, securityId)
};

const getOrderbooks = (userId: string, securityId: string[]) => {
  const avanza = getUserSession(userId).avanzaSession;
  return avanza.getOrderbooks(securityId)
};

export { getSecurityById, getOrderbooks };
