import { Router } from 'express';
import { users, databases } from '../services/appwrite';
import { ID } from 'node-appwrite';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

// Register Route
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, role, purpose } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  try {
    // 1. Create User in Appwrite Auth
    const user = await users.create(
      ID.unique(),
      email,
      phoneNumber || undefined,
      password,
      `${firstName} ${lastName}`
    );

    // 2. Create Profile Document in Appwrite DB
    const profile = await databases.createDocument(
      DATABASE_ID,
      'users_profile',
      ID.unique(),
      {
        userId: user.$id,
        firstName,
        lastName,
        phoneNumber: phoneNumber || '',
        role: role || 'Student',
        avatarUrl: '',
        purpose: purpose || 'learn',
        enrollments: [],
        activeProjects: []
      }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        role: role || 'Student',
        purpose: purpose || 'learn'
      },
      profileId: profile.$id
    });
  } catch (err: any) {
    console.error('[Register Router] Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Profile fetching route (authenticated)
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { Query } from 'node-appwrite';

router.get('/profile', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    // Fetch profile document matching the user ID
    const profiles = await databases.listDocuments(
      DATABASE_ID,
      'users_profile',
      [Query.equal('userId', userId || '')]
    );

    if (profiles.total === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json({
      user: req.user,
      profile: profiles.documents[0]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
