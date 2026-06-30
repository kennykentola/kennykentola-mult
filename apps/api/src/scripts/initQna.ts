import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

async function initQna() {
  console.log('Initializing QnA collections...');

  const collections = [
    {
      id: 'course_qna',
      name: 'Course QnA',
      attributes: [
        { key: 'courseId', type: 'string', size: 50, required: true },
        { key: 'lessonId', type: 'string', size: 50, required: false },
        { key: 'userId', type: 'string', size: 50, required: true },
        { key: 'authorName', type: 'string', size: 255, required: true },
        { key: 'content', type: 'string', size: 5000, required: true },
        { key: 'repliesCount', type: 'integer', required: false, default: 0 },
        { key: 'createdAt', type: 'string', size: 50, required: true }
      ]
    },
    {
      id: 'course_qna_replies',
      name: 'Course QnA Replies',
      attributes: [
        { key: 'qnaId', type: 'string', size: 50, required: true },
        { key: 'userId', type: 'string', size: 50, required: true },
        { key: 'authorName', type: 'string', size: 255, required: true },
        { key: 'content', type: 'string', size: 5000, required: true },
        { key: 'createdAt', type: 'string', size: 50, required: true }
      ]
    }
  ];

  for (const coll of collections) {
    try {
      await databases.createCollection(DATABASE_ID, coll.id, coll.name);
      console.log(`Created collection: ${coll.name}`);
      
      for (const attr of coll.attributes) {
        if (attr.type === 'string') {
          await databases.createStringAttribute(DATABASE_ID, coll.id, attr.key, attr.size || 255, attr.required, attr.default as string | undefined);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(DATABASE_ID, coll.id, attr.key, attr.required, 0, 1000000, attr.default);
        }
        console.log(`Added attribute: ${attr.key} to ${coll.name}`);
        // Add a small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e: any) {
      if (e.code === 409) {
        console.log(`Collection ${coll.name} already exists.`);
      } else {
        console.error(`Error creating ${coll.name}:`, e.message);
      }
    }
  }

  console.log('Finished initializing QnA collections.');
}

initQna();
