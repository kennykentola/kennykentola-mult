import { databases } from '../services/appwrite';
import { AppwriteException } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const DATABASE_NAME = 'KennyKentola Multi-Company Database';

interface AttributeDef {
  key: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime';
  size?: number; // Required for strings
  required: boolean;
  defaultValue?: any;
  array?: boolean;
}

interface CollectionDef {
  id: string;
  name: string;
  attributes: AttributeDef[];
}

const collections: CollectionDef[] = [
  {
    id: 'users_profile',
    name: 'Users Profile',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'firstName', type: 'string', size: 100, required: true },
      { key: 'lastName', type: 'string', size: 100, required: true },
      { key: 'phoneNumber', type: 'string', size: 30, required: false },
      { key: 'role', type: 'string', size: 50, required: true, defaultValue: 'Student' },
      { key: 'avatarUrl', type: 'string', size: 500, required: false },
      { key: 'purpose', type: 'string', size: 50, required: false, defaultValue: 'learn' },
      { key: 'enrollments', type: 'string', size: 50, required: false, array: true },
      { key: 'activeProjects', type: 'string', size: 50, required: false, array: true },
      { key: 'printOrders', type: 'string', size: 50, required: false, array: true }
    ]
  },
  {
    id: 'courses',
    name: 'Courses',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'instructorId', type: 'string', size: 50, required: true },
      { key: 'coverImage', type: 'string', size: 500, required: false },
      { key: 'price', type: 'float', required: true, defaultValue: 0 },
      { key: 'isPublished', type: 'boolean', required: true, defaultValue: false }
    ]
  },
  {
    id: 'lessons',
    name: 'Lessons',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 10000, required: false },
      { key: 'videoUrl', type: 'string', size: 500, required: false },
      { key: 'order', type: 'integer', required: true }
    ]
  },
  {
    id: 'live_classes',
    name: 'Live Classes',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'scheduledAt', type: 'datetime', required: true },
      { key: 'durationMinutes', type: 'integer', required: true },
      { key: 'meetingUrl', type: 'string', size: 1000, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'scheduled' }
    ]
  },
  {
    id: 'assignments',
    name: 'Assignments',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'instructions', type: 'string', size: 5000, required: true },
      { key: 'dueDate', type: 'datetime', required: true },
      { key: 'maxPoints', type: 'integer', required: true, defaultValue: 100 }
    ]
  },
  {
    id: 'submissions',
    name: 'Submissions',
    attributes: [
      { key: 'assignmentId', type: 'string', size: 50, required: true },
      { key: 'studentId', type: 'string', size: 50, required: true },
      { key: 'fileUrls', type: 'string', size: 500, required: true, array: true },
      { key: 'studentNote', type: 'string', size: 1000, required: false },
      { key: 'pointsAwarded', type: 'integer', required: false },
      { key: 'feedback', type: 'string', size: 2000, required: false },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending' }
    ]
  },
  {
    id: 'print_orders',
    name: 'Print Orders',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'serviceType', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending' },
      { key: 'price', type: 'float', required: false, defaultValue: 0 },
      { key: 'quantity', type: 'integer', required: false, defaultValue: 1 },
      { key: 'paperSize', type: 'string', size: 20, required: false, defaultValue: 'A4' },
      { key: 'colorMode', type: 'string', size: 20, required: false, defaultValue: 'bw' },
      { key: 'sides', type: 'string', size: 20, required: false, defaultValue: 'single' },
      { key: 'bindingType', type: 'string', size: 50, required: false },
      { key: 'specialInstructions', type: 'string', size: 2000, required: false },
      { key: 'fileUrls', type: 'string', size: 500, required: false, array: true },
      { key: 'deliveryMethod', type: 'string', size: 50, required: false, defaultValue: 'pickup' },
      { key: 'estimatedReadyAt', type: 'datetime', required: false },
      { key: 'completedAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'pricing_config',
    name: 'Pricing Config',
    attributes: [
      { key: 'serviceType', type: 'string', size: 50, required: true },
      { key: 'label', type: 'string', size: 100, required: true },
      { key: 'pricePerUnit', type: 'float', required: true },
      { key: 'unit', type: 'string', size: 50, required: true, defaultValue: 'page' },
      { key: 'colorMultiplier', type: 'float', required: false, defaultValue: 1.5 },
      { key: 'doubleSidedDiscount', type: 'float', required: false, defaultValue: 0.8 },
      { key: 'isActive', type: 'boolean', required: true, defaultValue: true }
    ]
  }
];

// Sleep Helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForAttribute(collectionId: string, attributeKey: string) {
  let attempts = 0;
  while (attempts < 30) {
    try {
      const attr = await databases.getAttribute(DATABASE_ID, collectionId, attributeKey);
      if (attr.status === 'available') {
        return;
      }
      if (attr.status === 'failed') {
        throw new Error(`Attribute '${attributeKey}' in '${collectionId}' failed initialization.`);
      }
    } catch (err: any) {
      // appwrite is registering schema
    }
    await sleep(800);
    attempts++;
  }
  throw new Error(`Timed out waiting for attribute '${attributeKey}' in collection '${collectionId}'`);
}

export async function initializeDatabase() {
  console.log('[Appwrite Init] Starting initialization sequence...');
  
  // 1. Create Database if missing
  try {
    await databases.get(DATABASE_ID);
    console.log(`[Appwrite Init] Database '${DATABASE_ID}' found.`);
  } catch (err) {
    console.log(`[Appwrite Init] Database '${DATABASE_ID}' not found. Creating...`);
    await databases.create(DATABASE_ID, DATABASE_NAME);
    await sleep(1000);
  }

  // 2. Build collections and attributes
  for (const colDef of collections) {
    console.log(`\n--------------------------------------------\n[Collection] Initializing: ${colDef.name} (${colDef.id})`);
    
    let exists = false;
    try {
      await databases.getCollection(DATABASE_ID, colDef.id);
      exists = true;
      console.log(`[Collection] Collection "${colDef.id}" already exists. Skipping creation.`);
    } catch (err) {
      // missing
    }

    if (!exists) {
      await databases.createCollection(DATABASE_ID, colDef.id, colDef.name);
      await sleep(500);
    }

    for (const attr of colDef.attributes) {
      try {
        await databases.getAttribute(DATABASE_ID, colDef.id, attr.key);
        console.log(`  [Attribute] "${attr.key}" already exists. Skipping.`);
      } catch (err) {
        console.log(`  [Attribute] Creating "${attr.key}" (Type: ${attr.type}, Array: ${!!attr.array})...`);
        if (attr.type === 'string') {
          await databases.createStringAttribute(DATABASE_ID, colDef.id, attr.key, attr.size || 255, attr.required, attr.defaultValue, attr.array);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(DATABASE_ID, colDef.id, attr.key, attr.required, undefined, undefined, attr.defaultValue, attr.array);
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(DATABASE_ID, colDef.id, attr.key, attr.required, undefined, undefined, attr.defaultValue, attr.array);
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(DATABASE_ID, colDef.id, attr.key, attr.required, attr.defaultValue, attr.array);
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(DATABASE_ID, colDef.id, attr.key, attr.required, attr.defaultValue, attr.array);
        }
        await waitForAttribute(colDef.id, attr.key);
      }
    }
    console.log(`[Collection] "${colDef.id}" processing completed.`);
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => console.log('\n[Appwrite Init] Database setup finished.'))
    .catch((err) => console.error('[Appwrite Init] Failed:', err));
}
