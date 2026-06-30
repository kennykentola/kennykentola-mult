require('dotenv').config();
const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

async function main() {
  try {
    console.log('Adding assignedMentorId to student_projects...');
    try {
      await databases.createStringAttribute(DATABASE_ID, 'student_projects', 'assignedMentorId', 255, false);
      console.log('assignedMentorId added successfully.');
    } catch (e) {
      if (e.code === 409) console.log('assignedMentorId already exists.');
      else throw e;
    }

    console.log('Adding assignedMentorName to student_projects...');
    try {
      await databases.createStringAttribute(DATABASE_ID, 'student_projects', 'assignedMentorName', 255, false);
      console.log('assignedMentorName added successfully.');
    } catch (e) {
      if (e.code === 409) console.log('assignedMentorName already exists.');
      else throw e;
    }
    
  } catch (err) {
    console.error('Error adding attributes:', err);
  }
}

main();
