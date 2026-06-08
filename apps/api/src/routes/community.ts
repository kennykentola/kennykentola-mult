import { Router } from 'express';
import { databases } from '../services/appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { Query, ID } from 'node-appwrite';
import { CreatePostValidation, CreateCommentValidation } from '@company/shared';
import { getIO } from '../services/socket';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const POSTS_COLLECTION = 'community_posts';
const COMMENTS_COLLECTION = 'community_comments';

// Simple XSS sanitization helper
function sanitizeInput(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Fetch all posts (paginated)
router.get('/posts', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const posts = await databases.listDocuments(DATABASE_ID, POSTS_COLLECTION, [
      Query.orderDesc('createdAt'),
      Query.limit(100)
    ]);
    res.status(200).json({ posts: posts.documents, total: posts.total });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a post
router.post('/posts', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const validated = CreatePostValidation.parse(req.body);
    const sanitizedContent = sanitizeInput(validated.content);
    
    // Fetch profile for author name
    const profiles = await databases.listDocuments(DATABASE_ID, 'users_profile', [
      Query.equal('userId', req.user?.id || ''),
      Query.limit(1)
    ]);
    const profile = profiles.documents[0] as any;
    const authorName = profile ? `${profile.firstName} ${profile.lastName}` : req.user?.name || 'Anonymous';

    const newPost = await databases.createDocument(DATABASE_ID, POSTS_COLLECTION, ID.unique(), {
      userId: req.user?.id,
      authorName,
      content: sanitizedContent,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      likes: []
    });

    // Realtime broadcast via Socket.io
    const io = getIO();
    if (io) {
      io.to('community_feed').emit('new_post', newPost);
    }

    res.status(201).json({ post: newPost });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create post' });
  }
});

// Like/unlike a post
router.post('/posts/:postId/like', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { postId } = req.params;
  const userId = req.user?.id || '';

  try {
    const post = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId) as any;
    const likes = post.likes || [];
    let updatedLikes = [...likes];
    let liked = false;

    if (likes.includes(userId)) {
      // Unlike
      updatedLikes = likes.filter((id: string) => id !== userId);
    } else {
      // Like
      updatedLikes.push(userId);
      liked = true;
    }

    const updatedPost = await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
      likes: updatedLikes,
      likesCount: updatedLikes.length
    });

    // Realtime broadcast via Socket.io
    const io = getIO();
    if (io) {
      io.to('community_feed').emit('post_liked', { postId, likesCount: (updatedPost as any).likesCount, likes: (updatedPost as any).likes, userId, liked });
    }

    res.status(200).json({ post: updatedPost as any, liked });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch comments for a post
router.get('/posts/:postId/comments', authenticateJWT, async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await databases.listDocuments(DATABASE_ID, COMMENTS_COLLECTION, [
      Query.equal('postId', postId),
      Query.orderAsc('createdAt'),
      Query.limit(100)
    ]);
    res.status(200).json({ comments: comments.documents });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a comment
router.post('/posts/:postId/comments', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { postId } = req.params;
  try {
    const validated = CreateCommentValidation.parse(req.body);
    const sanitizedContent = sanitizeInput(validated.content);

    // Fetch profile for author name
    const profiles = await databases.listDocuments(DATABASE_ID, 'users_profile', [
      Query.equal('userId', req.user?.id || ''),
      Query.limit(1)
    ]);
    const profile = profiles.documents[0] as any;
    const authorName = profile ? `${profile.firstName} ${profile.lastName}` : req.user?.name || 'Anonymous';

    const newComment = await databases.createDocument(DATABASE_ID, COMMENTS_COLLECTION, ID.unique(), {
      postId,
      userId: req.user?.id,
      authorName,
      content: sanitizedContent,
      createdAt: new Date().toISOString()
    });

    // Increment post comments count
    const post = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId) as any;
    await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
      commentsCount: (post.commentsCount || 0) + 1
    });

    // Realtime broadcast via Socket.io
    const io = getIO();
    if (io) {
      io.to('community_feed').emit('new_comment', { comment: newComment, postId });
    }

    res.status(201).json({ comment: newComment });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add comment' });
  }
});

export default router;
