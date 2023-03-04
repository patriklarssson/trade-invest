import { promises } from "dns";
import { InstrumentType } from "./InstrumentType";
import { Security } from "./security/Security";

interface LoginCredentials {
  username: string;
  password: string;
  totpSecret: string;
}

interface AuthResponse {
  securityToken: string;
  authenticationSession: string;
  pushSubscriptionId: string;
  customerId: string;
}

interface AuthErrorResponse {
  statusCode: number;
  statusMessage: string;
  headers: {
    'content-type': string;
    'transfer-encoding': string;
    connection: string;
    date: string;
    server: string;
    'aza-invalid-session': string;
    'cache-control': string;
    pragma: string;
    via: string;
    'strict-transport-security': string;
  };
  body: {
    statusCode: number;
    message: string;
    time: Date;
    errors: any[];
    additional: any;
  };
}

type AvanzaActions = {
    authenticate: (credentials: LoginCredentials) => Promise<AuthResponse>
    // getPositions: () => Promise<any>
    getInstrument: (instrumentType: InstrumentType, instrumentId: number) => Promise<Security>
}

export { LoginCredentials, AuthResponse, AuthErrorResponse, AvanzaActions };
