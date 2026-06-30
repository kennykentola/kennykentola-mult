require('dotenv').config();
const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

async function main() {
  try {
    console.log('Creating academic_tasks collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        'academic_tasks',
        'Academic Tasks',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('academic_tasks collection created.');
    } catch (e) {
      if (e.code === 409) console.log('academic_tasks already exists.');
      else throw e;
    }

    // Attributes for academic_tasks
    const taskAttributes = [
      { type: 'string', name: 'projectId', size: 255, required: true },
      { type: 'string', name: 'title', size: 255, required: true },
      { type: 'boolean', name: 'completed', required: false, default: false }
    ];

    for (const attr of taskAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(DATABASE_ID, 'academic_tasks', attr.name, attr.size, attr.required);
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(DATABASE_ID, 'academic_tasks', attr.name, attr.required, attr.default);
        }
        console.log(`Created attribute ${attr.name} on academic_tasks`);
      } catch (e) {
        if (e.code === 409) console.log(`Attribute ${attr.name} already exists`);
        else throw e;
      }
    }

    console.log('Creating academic_payments collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        'academic_payments',
        'Academic Payments',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
      console.log('academic_payments collection created.');
    } catch (e) {
      if (e.code === 409) console.log('academic_payments already exists.');
      else throw e;
    }

    // Attributes for academic_payments
    const paymentAttributes = [
      { type: 'string', name: 'projectId', size: 255, required: true },
      { type: 'integer', name: 'amount', required: true },
      { type: 'string', name: 'receiptUrl', size: 1000, required: true },
      { type: 'string', name: 'status', size: 50, required: false, default: 'pending' }, // pending, approved, rejected
      { type: 'integer', name: 'installmentNumber', required: true }
    ];

    for (const attr of paymentAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(DATABASE_ID, 'academic_payments', attr.name, attr.size, attr.required);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(DATABASE_ID, 'academic_payments', attr.name, attr.required);
        }
        console.log(`Created attribute ${attr.name} on academic_payments`);
      } catch (e) {
        if (e.code === 409) console.log(`Attribute ${attr.name} already exists`);
        else throw e;
      }
    }

    console.log('Initialization complete.');

  } catch (err) {
    console.error('Error in schema initialization:', err);
  }
}

main();
