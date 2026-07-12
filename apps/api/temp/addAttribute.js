require('dotenv').config({ path: '../.env' });
const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addAttribute() {
  try {
    console.log('Adding aiVideoEnabled attribute to courses collection...');
    await databases.createBooleanAttribute(
      process.env.APPWRITE_DATABASE_ID || 'multicompany',
      'courses',
      'aiVideoEnabled',
      false, // required? no
      true, // default value
      false // array? no
    );
    console.log('Attribute added successfully. Waiting 3 seconds for it to become available...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    if (error.code === 409) {
      console.log('Attribute already exists.');
    } else {
      console.error('Failed to add attribute:', error);
    }
  }
}

addAttribute();
