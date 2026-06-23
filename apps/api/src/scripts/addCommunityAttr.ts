import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function addAttribute() {
  const dbId = process.env.APPWRITE_DATABASE_ID || 'multicompany';
  try {
    await databases.createBooleanAttribute(dbId, 'users_profile', 'isCommunityMember', false, false);
    console.log('Added isCommunityMember attribute');
  } catch (err: any) {
    console.log('Attribute might already exist:', err.message);
  }
}

addAttribute();
