import { ID } from 'node-appwrite';
import { databases } from './appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

/**
 * Creates a notification for a user and stores it in the Appwrite database.
 * This will trigger real-time updates on the frontend for any connected clients.
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      'notifications',
      ID.unique(),
      {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link || null,
        isRead: false,
        createdAt: new Date().toISOString()
      }
    );
    return document;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error);
    throw error;
  }
}
