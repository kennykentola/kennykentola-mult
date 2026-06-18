import { Router } from 'express';
import { users, databases } from '../services/appwrite';
import { ID, Client, Account } from 'node-appwrite';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

// Register Route
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, purpose } = req.body;
  const role = 'Student';

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  try {
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
        email: email,
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
        role,
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

    let profileDoc = profiles.documents[0];

    // Optional: Sync prefs.role with profile.role if they differ, treating prefs as source of truth for Super Admin
    try {
      const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || '')
        .setJWT(req.headers.authorization!.split(' ')[1]);
      
      const account = new Account(client);
      const user = await account.get();
      const prefsRole = (user.prefs as any)?.role;

      if (prefsRole && prefsRole !== profileDoc.role) {
        profileDoc = await databases.updateDocument(
          DATABASE_ID,
          'users_profile',
          profileDoc.$id,
          { role: prefsRole }
        );
        req.user!.role = prefsRole;
      }
    } catch (e) {
      console.warn('[Auth] Could not sync prefs.role:', e);
    }

    res.status(200).json({
      user: req.user,
      profile: profileDoc
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/profile', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, phoneNumber, emailNotifications, smsNotifications } = req.body;

    const profiles = await databases.listDocuments(
      DATABASE_ID,
      'users_profile',
      [Query.equal('userId', userId || '')]
    );

    if (profiles.total === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const updateData: Record<string, any> = {};
    if (firstName !== undefined) updateData.firstName = String(firstName).trim();
    if (lastName !== undefined) updateData.lastName = String(lastName).trim();
    if (phoneNumber !== undefined) updateData.phoneNumber = String(phoneNumber).trim();
    if (emailNotifications !== undefined) updateData.emailNotifications = Boolean(emailNotifications);
    if (smsNotifications !== undefined) updateData.smsNotifications = Boolean(smsNotifications);

    if (!updateData.firstName && firstName !== undefined) {
      return res.status(400).json({ error: 'First name is required.' });
    }
    if (!updateData.lastName && lastName !== undefined) {
      return res.status(400).json({ error: 'Last name is required.' });
    }

    const updated = await databases.updateDocument(
      DATABASE_ID,
      'users_profile',
      profiles.documents[0].$id,
      updateData
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updated
    });
  } catch (err: any) {
    console.error('[Auth Profile] Error updating profile:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ADMIN: List all platform users
router.get('/admin/users', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  try {
    const profiles = await databases.listDocuments(DATABASE_ID, 'users_profile', [
      Query.limit(100)
    ]);
    
    const authUsers = await users.list();
    const userMap = new Map(authUsers.users.map(u => [u.$id, u.email]));

    const enriched = profiles.documents.map((p: any) => ({
      id: p.$id,
      userId: p.userId,
      name: `${p.firstName} ${p.lastName}`,
      email: userMap.get(p.userId) || 'No Email',
      role: p.role,
      purpose: p.purpose || 'learn',
      clientType: p.clientType || 'commercial',
      date: new Date(p.$createdAt).toLocaleDateString()
    }));

    res.status(200).json({ users: enriched });
  } catch (err: any) {
    console.error('[Auth Admin] Error listing users:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Update user role, purpose, and clientType
router.patch('/admin/users/:profileId/role', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { profileId } = req.params;
  const { role, purpose, clientType } = req.body;

  try {
    const updateData: Record<string, any> = {};
    if (role !== undefined) updateData.role = role;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (clientType !== undefined) updateData.clientType = clientType;

    const updated = await databases.updateDocument(
      DATABASE_ID,
      'users_profile',
      profileId,
      updateData
    );

    res.status(200).json({
      message: 'User profile updated successfully',
      profile: updated
    });
  } catch (err: any) {
    console.error('[Auth Admin] Error updating user:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
