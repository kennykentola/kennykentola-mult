import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = 'multicompany';

if (!projectId || !apiKey) {
  console.error('Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function setupConsultations() {
  const collectionId = 'consultations';
  const collectionName = 'Consultations';

  try {
    console.log(`Checking if collection ${collectionId} exists...`);
    await databases.getCollection(databaseId, collectionId);
    console.log(`Collection ${collectionId} already exists.`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`Creating collection ${collectionId}...`);
      await databases.createCollection(
        databaseId,
        collectionId,
        collectionName,
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()), // Anyone can create a consultation request
          Permission.update(Role.users()), // Only logged in users (admins) can update
          Permission.delete(Role.users()),
        ]
      );

      console.log('Creating attributes...');
      
      await databases.createStringAttribute(databaseId, collectionId, 'name', 255, true);
      await databases.createStringAttribute(databaseId, collectionId, 'email', 255, true);
      await databases.createStringAttribute(databaseId, collectionId, 'date', 255, true);
      await databases.createStringAttribute(databaseId, collectionId, 'time', 255, true);
      await databases.createStringAttribute(databaseId, collectionId, 'topic', 255, false, 'General Consultation');
      await databases.createStringAttribute(databaseId, collectionId, 'status', 255, false, 'pending'); // pending, confirmed, completed, cancelled
      
      console.log(`Collection ${collectionId} created successfully.`);
    } else {
      console.error('Error setting up collection:', error);
    }
  }
}

setupConsultations().then(() => {
  console.log('Done.');
}).catch(err => {
  console.error(err);
});
