declare module 'avanza' {

    type LoginCredentials = import("./models/Avanza").LoginCredentials
    type AuthResponse = import("./models/Avanza").AuthResponse

    class Avanza implements AvanzaActions {
      constructor(options?: any);

      authenticate(credentials: LoginCredentials): Promise<AuthResponse>;
    }

    const avanza: typeof Avanza;
    export default avanza;
  }