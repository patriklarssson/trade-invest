import { AvanzaActions } from "../models/Avanza";

interface UserData {
    avanzaSession: AvanzaActions; // replace with your avanzaSession type
  }

  const userSessions = new Map<string, UserData>(); // use a Map to store the user data

  function storeUserSession(
    userId: string,
    userData: UserData,
    expiryTime: number
  ) {
    userSessions.set(userId, userData); // add user data to map

    setTimeout(() => {
      userSessions.delete(userId); // remove user data from map after expiry time
    }, expiryTime);
  }

  function getUserSession(userId: string): UserData | undefined {
    return userSessions.get(userId); // get user data from map
  }

  function clearUserSession(userId: string) {
    userSessions.delete(userId); // remove user data from map
  }

  export {
    storeUserSession,
    getUserSession,
    clearUserSession,
  };