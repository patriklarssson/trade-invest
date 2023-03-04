import { getUserSession } from './userSessionService';
import { InstrumentType } from '../models/InstrumentType';

const getSecurityById = (userId: string, securityId: number) => {
  const avanza = getUserSession(userId).avanzaSession;
  return avanza.getInstrument(InstrumentType.STOCK, securityId)
};

export { getSecurityById };
