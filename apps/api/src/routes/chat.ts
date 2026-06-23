import { Router } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { databases, users } from '../services/appwrite';
const databaseId = process.env.APPWRITE_DATABASE_ID || 'multicompany';
import { Query, ID } from 'node-appwrite';

const router = Router();

// 1. Get user's active chat rooms
router.get('/rooms', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const response = await databases.listDocuments(
      databaseId,
      'chat_rooms',
      [
        Query.contains('participants', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]
    );

    res.json({ rooms: response.documents });
  } catch (err: any) {
    console.error('Error fetching chat rooms:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Get historical messages for a specific room
router.get('/history/:roomId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id;

    // Verify user is in room (unless community_global)
    if (roomId === 'community_global') {
      const userPrefs = await users.getPrefs(userId!);
      if (!userPrefs.isCommunityMember) {
        return res.status(403).json({ error: 'You have not joined the community group' });
      }
    } else {
      const room = await databases.getDocument(databaseId, 'chat_rooms', roomId);
      if (!(room as any).participants.includes(userId)) {
        return res.status(403).json({ error: 'You are not a participant in this room' });
      }
    }

    const response = await databases.listDocuments(
      databaseId,
      'chat_messages',
      [
        Query.equal('roomId', roomId),
        Query.orderAsc('$createdAt'),
        Query.limit(200)
      ]
    );

    res.json({ messages: response.documents });
  } catch (err: any) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a new peer-to-peer room (or return existing)
router.post('/rooms', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { targetUserId } = req.body;

    if (!userId || !targetUserId) return res.status(400).json({ error: 'Missing targetUserId' });

    const participants = [userId, targetUserId].sort();

    // Check if direct room already exists
    const response = await databases.listDocuments(
      databaseId,
      'chat_rooms',
      [
        Query.contains('participants', userId),
        Query.limit(100)
      ]
    );

    const existingRoom = response.documents.find((r: any) => 
      r.type === 'direct' && r.participants.includes(targetUserId)
    );

    if (existingRoom) {
      return res.json({ room: existingRoom });
    }

    // Create new room if it doesn't exist
    const newRoom = await databases.createDocument(
      databaseId,
      'chat_rooms',
      ID.unique(),
      {
        type: 'direct',
        participants: participants,
      }
    );
    return res.json({ room: newRoom });

  } catch (err: any) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Search users to start new chat
router.get('/users/search', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const q = (req.query.q as string || '').toLowerCase();
    const userId = req.user?.id;

    // Fetch a batch of users (up to 100 for now) and filter in memory
    // In production, we'd add full-text indexes and use Query.search
    const response = await databases.listDocuments(
      databaseId,
      'users_profile',
      [
        Query.limit(100)
      ]
    );

    let usersList = response.documents;

    // Exclude current user
    if (userId) {
      usersList = usersList.filter((u: any) => u.userId !== userId);
    }

    if (q) {
      usersList = usersList.filter((u: any) => 
        (u.firstName || '').toLowerCase().includes(q) ||
        (u.lastName || '').toLowerCase().includes(q) ||
        (u.phoneNumber || '').toLowerCase().includes(q)
      );
    }

    res.json({ users: usersList });
  } catch (err: any) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Join Community
router.post('/community/join', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch existing prefs
    const userPrefs = await users.getPrefs(userId);
    
    // Update prefs
    await users.updatePrefs(userId, {
      ...userPrefs,
      isCommunityMember: true
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error joining community:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Community Members
router.get('/community/members', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    // List all users. Since we can't query inside prefs directly with the SDK,
    // we fetch users and filter them in memory (or use search if feasible).
    // In production, we'd use a dedicated collection, but for this demo, fetching works.
    const response = await users.list([Query.limit(500)]);

    const members = response.users
      .filter((u: any) => u.prefs?.isCommunityMember === true)
      .map((u: any) => ({
        userId: u.$id,
        firstName: u.name.split(' ')[0] || u.name,
        lastName: u.name.split(' ').slice(1).join(' ') || '',
        role: u.prefs?.role || 'Member'
      }));

    res.json({ members });
  } catch (err: any) {
    console.error('Error fetching community members:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
