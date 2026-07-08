import express from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COLLECTION = 'site_settings';

// Helper to get or create a setting
async function getOrCreateSetting(key: string, defaultValue: string) {
  const existing = await databases.listDocuments(DATABASE_ID, COLLECTION, [
    Query.equal('key', key)
  ]);
  
  if (existing.total > 0) {
    return existing.documents[0];
  }

  return await databases.createDocument(DATABASE_ID, COLLECTION, ID.unique(), {
    key,
    value: defaultValue
  });
}

// Get all settings (Admin)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const settings = await databases.listDocuments(DATABASE_ID, COLLECTION);
    res.json({ success: true, settings: settings.documents });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a specific setting by key (Public or Admin depending on the setting, but we'll make it public for now so the UI can fetch it)
router.get('/:key', async (req, res) => {
  try {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION, [
      Query.equal('key', req.params.key)
    ]);
    
    if (existing.total > 0) {
      res.json({ success: true, setting: existing.documents[0] });
    } else {
      res.status(404).json({ success: false, message: 'Setting not found' });
    }
  } catch (error: any) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a setting (Admin)
router.put('/:key', authenticateJWT, async (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ success: false, message: 'Value is required' });
    }

    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION, [
      Query.equal('key', req.params.key)
    ]);

    let updated;
    if (existing.total > 0) {
      updated = await databases.updateDocument(DATABASE_ID, COLLECTION, existing.documents[0].$id, {
        value
      });
    } else {
      updated = await databases.createDocument(DATABASE_ID, COLLECTION, ID.unique(), {
        key: req.params.key,
        value
      });
    }

    res.json({ success: true, setting: updated });
  } catch (error: any) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
