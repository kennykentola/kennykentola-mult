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
    const payloadBase64 = jwt.split('.')[1];
    if (!payloadBase64) throw new Error('Invalid JWT structure');
    
    const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);
    const userId = payload.userId || payload.$id || payload.id;
    
    if (!userId) throw new Error('No userId found in JWT');

    let role: string | undefined;
    let name = 'User';
    let email = '';

    try {
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID || 'multicompany',
        'users_profile',
        [Query.equal('userId', userId), Query.limit(1)]
      );

      if (profiles.documents.length > 0) {
        const profile = profiles.documents[0] as any;
        role = profile.role;
        name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || name;
        email = profile.email || '';
      }
    } catch {
      role = undefined;
    }

    req.user = {
      id: userId,
      email,
      name,
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
    const payloadBase64 = jwt.split('.')[1];
    if (!payloadBase64) throw new Error('Invalid JWT structure');
    
    const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);
    const userId = payload.userId || payload.$id || payload.id;
    
    if (!userId) throw new Error('No userId found in JWT');

    let role: string | undefined;
    let name = 'User';
    let email = '';

    try {
      const profiles = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID || 'multicompany',
        'users_profile',
        [Query.equal('userId', userId), Query.limit(1)]
      );

      if (profiles.documents.length > 0) {
        const profile = profiles.documents[0] as any;
        role = profile.role;
        name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || name;
        email = profile.email || '';
      }
    } catch {
      role = undefined;
    }

    req.user = {
      id: userId,
      email,
      name,
      role
    };

    next();
  } catch (err: any) {
    next();
  }
};

export const requireAdmin = [
  authenticateJWT,
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  }
];