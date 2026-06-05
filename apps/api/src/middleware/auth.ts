import { Request, Response, NextFunction } from 'express';
import { Client, Account } from 'node-appwrite';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
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

    req.user = {
      id: user.$id,
      email: user.email,
      name: user.name
    };

    next();
  } catch (err: any) {
    console.error('[Auth Middleware] JWT verification failed:', err.message);
    res.status(401).json({ error: 'Invalid or expired session token' });
  }
};
