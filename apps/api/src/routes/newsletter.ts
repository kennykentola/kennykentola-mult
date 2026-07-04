import express, { Request, Response } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = express.Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COLLECTION = 'newsletter_subscribers';

// Subscribe to newsletter
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    // Check if already subscribed
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION, [
      Query.equal('email', email)
    ]);

    if (existing.documents.length > 0) {
      return res.json({ success: true, message: 'Already subscribed' });
    }

    await databases.createDocument(
      DATABASE_ID,
      COLLECTION,
      ID.unique(),
      {
        email,
        subscribedAt: new Date().toISOString()
      }
    );

    res.status(201).json({ success: true, message: 'Successfully subscribed to the newsletter!' });
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again later.' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION, [
      Query.equal('email', email)
    ]);

    if (existing.documents.length > 0) {
      // Delete all matching subscriptions just in case there are duplicates
      for (const doc of existing.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTION, doc.$id);
      }
    }

    res.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ success: false, message: 'Failed to unsubscribe. Please try again later.' });
  }
});

// Admin: Get all subscribers
router.get('/subscribers', requireAdmin, async (req: Request, res: Response) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    res.json({ success: true, subscribers: response.documents });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ success: false, message: 'Failed to load subscribers' });
  }
});

// Admin: Broadcast newsletter
router.post('/broadcast', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { subject, html, segment } = req.body;
    // In a real application, you would integrate with Resend, SendGrid, Mailchimp, etc.
    // For now, we will just simulate the broadcast by returning success.
    console.log(`[Newsletter Broadcast] Subject: ${subject}, Segment: ${segment}`);
    console.log(`[Newsletter Broadcast] Content: ${html.substring(0, 100)}...`);
    
    // Log the broadcast event to a collection or simply return
    res.json({ success: true, message: 'Newsletter broadcast sent successfully! (Simulated)' });
  } catch (error: any) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({ success: false, message: 'Failed to send broadcast' });
  }
});

export const newsletterRouter = router;
