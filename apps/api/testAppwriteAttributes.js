require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

async function test() {
  const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || 'kennykentolamult')
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    console.log('Adding initialDocumentUrl...');
    await databases.createStringAttribute('multicompany', 'student_projects', 'initialDocumentUrl', 1000, false);
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
