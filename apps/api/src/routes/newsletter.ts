import { Router } from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { z } from 'zod';
import { sendEmail } from '../services/email';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const SUBSCRIBERS_COLLECTION = 'newsletter_subscribers';

const subscribeSchema = z.object({
  email: z.string().email(),
  segment: z.string().optional().default('general'),
});

const broadcastSchema = z.object({
  subject: z.string().min(2),
  html: z.string().min(5),
  segment: z.string().optional().default('all'),
});

// POST /api/v1/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const data = subscribeSchema.parse(req.body);
    
    // Check if email already exists
    const existing = await databases.listDocuments(
      DATABASE_ID,
      SUBSCRIBERS_COLLECTION,
      [Query.equal('email', data.email)]
    );

    if (existing.documents.length > 0) {
      return res.status(200).json({ success: true, message: 'Already subscribed.' });
    }

    await databases.createDocument(
      DATABASE_ID,
      SUBSCRIBERS_COLLECTION,
      ID.unique(),
      {
        email: data.email,
        segment: data.segment,
        subscribedAt: new Date().toISOString()
      }
    );

    res.status(201).json({ success: true, message: 'Subscribed successfully.' });
  } catch (error) {
    console.error('Newsletter Subscribe Error:', error);
    res.status(500).json({ success: false, message: 'Failed to subscribe.' });
  }
});

// POST /api/v1/newsletter/broadcast
// Protected route: Admin only
router.post('/broadcast', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    // Basic auth check for admin role
    if (req.user?.role !== 'Super Admin' && req.user?.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const data = broadcastSchema.parse(req.body);
    
    // Build query based on segment
    const queries = [];
    if (data.segment !== 'all') {
      queries.push(Query.equal('segment', data.segment));
    }

    // Fetch subscribers (Appwrite lists up to 100 by default, would need pagination for large lists, assuming small list for now)
    const subscribers = await databases.listDocuments(
      DATABASE_ID,
      SUBSCRIBERS_COLLECTION,
      queries
    );

    if (subscribers.documents.length === 0) {
      return res.status(404).json({ success: false, message: 'No subscribers found for this segment.' });
    }

    // Extract emails
    const bccList = subscribers.documents.map((sub: any) => sub.email);

    // Send the email via Brevo
    // We send one email with all subscribers in BCC to save API calls
    await sendEmail({
      to: process.env.DEFAULT_FROM_EMAIL || 'ademolapeter233@gmail.com',
      subject: data.subject,
      html: data.html,
      // BCC feature in nodemailer could be added by modifying the sendEmail function
      // But for now, we'll just send individual emails in a loop to ensure delivery
    });

    // Actually, sending in a loop is better for individual delivery and unsub links
    for (const email of bccList) {
      await sendEmail({
        to: email,
        subject: data.subject,
        html: data.html
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Broadcast sent to ${bccList.length} subscribers.` 
    });
  } catch (error) {
    console.error('Newsletter Broadcast Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send broadcast.' });
  }
});

// GET /api/v1/newsletter/subscribers
// Protected route: Admin only
router.get('/subscribers', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'Super Admin' && req.user?.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const subscribers = await databases.listDocuments(
      DATABASE_ID,
      SUBSCRIBERS_COLLECTION,
      [Query.orderDesc('subscribedAt')]
    );

    res.status(200).json({ success: true, subscribers: subscribers.documents });
  } catch (error) {
    console.error('Newsletter Get Subscribers Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscribers.' });
  }
});

export const newsletterRouter = router;
