import { Router } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { databases } from '../services/appwrite';
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
        Query.search('participants', userId),
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

    // Verify user is in room
    const room = await databases.getDocument(databaseId, 'chat_rooms', roomId);
    if (!(room as any).participants.includes(userId)) {
      return res.status(403).json({ error: 'You are not a participant in this room' });
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

    const participants = [userId, targetUserId].sort(); // Sort to ensure consistent matching
    const roomId = `direct_${participants[0]}_${participants[1]}`;

    try {
       // Check if room exists
       const room = await databases.getDocument(databaseId, 'chat_rooms', roomId);
       return res.json({ room });
    } catch {
       // Create new room if it doesn't exist
       const newRoom = await databases.createDocument(
         databaseId,
         'chat_rooms',
         roomId,
         {
           type: 'direct',
           participants: participants,
         }
       );
       return res.json({ room: newRoom });
    }
  } catch (err: any) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
