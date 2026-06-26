import { Request, Response, NextFunction } from 'express';
import { Client, Account, Query } from 'node-appwrite';
import { databases } from '../services/appwrite';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const jwt = authHeader.split(' ')[1];

  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '')
      .setJWT(jwt);

    const account = new Account(client);
    const user = await account.get();
    let role: string | undefined;

    try {
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID || 'multicompany',
        'users_profile',
        [Query.equal('userId', user.$id), Query.limit(1)]
      );

      role = (profiles.documents[0] as any)?.role;
    } catch {
      role = undefined;
    }

    req.user = {
      id: user.$id,
      email: user.email,
      name: user.name,
      role
    };

    next();
  } catch (err: any) {
    console.error('[Auth Middleware] JWT verification failed:', err.message);
    res.status(401).json({ error: 'Invalid or expired session token' });
  }
};

export const optionalAuthenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const jwt = authHeader.split(' ')[1];

  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '')
      .setJWT(jwt);

    const account = new Account(client);
    const user = await account.get();
    let role: string | undefined;

    try {
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID || 'multicompany',
        'users_profile',
        [Query.equal('userId', user.$id), Query.limit(1)]
      );

      role = (profiles.documents[0] as any)?.role;
    } catch {
      role = undefined;
    }

    req.user = {
      id: user.$id,
      email: user.email,
      name: user.name,
      role
    };
    next();
  } catch (err: any) {
    next();
  }
};
