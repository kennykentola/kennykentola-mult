import { Client, Databases, Storage, Account } from 'node-appwrite';

const client = new Client();

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || 'kennykentolamult';
const apiKey = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function updateCoursePrice() {
  try {
    await databases.updateDocument(DATABASE_ID, 'courses', 'python-django', {
      price: 15000
    });
    console.log('Successfully updated python-django course price to 15000');
  } catch (err: any) {
    console.error('Failed to update course price:', err.message);
  }
}

updateCoursePrice();
