require('dotenv').config();
const { Client, Databases, ID } = require('node-appwrite');

async function test() {
  const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || 'kennykentolamult')
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const doc = await databases.createDocument(
      'multicompany',
      'users_profile',
      ID.unique(),
      {
        userId: 'test_user_id_' + Date.now(),
        Email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '',
        role: 'Student',
        avatarUrl: '',
        purpose: 'learn',
        enrollments: [],
        activeProjects: []
      }
    );
    console.log('Success:', doc);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
