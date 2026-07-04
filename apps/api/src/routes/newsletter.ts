import express from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';

const router = express.Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COLLECTION = 'newsletter_subscribers';

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
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
router.post('/unsubscribe', async (req, res) => {
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

export const newsletterRouter = router;
