import { account } from './appwrite';

let cachedJwt: string | null = null;
let jwtExpiration: number | null = null;

export function setSessionJwt(jwt: string | null) {
  cachedJwt = jwt;
  jwtExpiration = jwt ? Date.now() + 14 * 60 * 1000 : null;
}

export function clearSessionJwt() {
  cachedJwt = null;
  jwtExpiration = null;
}

export async function getSessionJwt() {
  if (cachedJwt && jwtExpiration && Date.now() < jwtExpiration) {
    return cachedJwt;
  }

  const session = await account.createJWT();
  cachedJwt = session.jwt;
  jwtExpiration = Date.now() + 14 * 60 * 1000; // 14 minutes (Appwrite JWTs expire in 15 mins)
  return cachedJwt;
}
