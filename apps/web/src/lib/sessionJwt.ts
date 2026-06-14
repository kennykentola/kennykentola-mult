import { account } from './appwrite';

let cachedJwt: string | null = null;

export function setSessionJwt(jwt: string | null) {
  cachedJwt = jwt;
}

export function clearSessionJwt() {
  cachedJwt = null;
}

export async function getSessionJwt() {
  if (cachedJwt) {
    return cachedJwt;
  }

  const session = await account.createJWT();
  cachedJwt = session.jwt;
  return cachedJwt;
}
