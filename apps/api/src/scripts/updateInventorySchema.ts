import { databases } from '../services/appwrite';
import { AppwriteException, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

const INVENTORY_COLLECTION = {
  id: 'inventory_items',
  name: 'Inventory Items',
  attributes: [
    { key: 'name', type: 'string', size: 255, required: true },
    { key: 'sku', type: 'string', size: 100, required: true },
    { key: 'category', type: 'string', size: 100, required: true },
    { key: 'quantityInStock', type: 'integer', required: false, defaultValue: 0 },
    { key: 'unitPrice', type: 'float', required: false, defaultValue: 0 },
    { key: 'reorderThreshold', type: 'integer', required: false, defaultValue: 5 },
    { key: 'isActive', type: 'boolean', required: false, defaultValue: true },
    { key: 'lastRestockedAt', type: 'datetime', required: false },
  ]
};

async function createInventoryCollection() {
  console.log(`Setting up Inventory collection...`);

  try {
    try {
      await databases.getCollection(DATABASE_ID, INVENTORY_COLLECTION.id);
      console.log(`✅ Collection ${INVENTORY_COLLECTION.name} already exists.`);
    } catch (error: any) {
      if (error.code === 404) {
        console.log(`Creating collection: ${INVENTORY_COLLECTION.name}`);
        
        await databases.createCollection(
          DATABASE_ID,
          INVENTORY_COLLECTION.id,
          INVENTORY_COLLECTION.name,
          [
            Permission.read(Role.any()),
            Permission.create(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any())
          ]
        );
        console.log(`✅ Created collection: ${INVENTORY_COLLECTION.name}`);
      } else {
        throw error;
      }
    }

    // Always try to create attributes
    for (const attr of INVENTORY_COLLECTION.attributes) {
      console.log(`Creating attribute: ${attr.key} (${attr.type})`);
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            INVENTORY_COLLECTION.id,
            attr.key,
            attr.size || 255,
            attr.required,
            attr.defaultValue as string | undefined,
            false // array
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            INVENTORY_COLLECTION.id,
            attr.key,
            attr.required,
            undefined, // min
            undefined, // max
            attr.defaultValue as number | undefined,
            false // array
          );
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            INVENTORY_COLLECTION.id,
            attr.key,
            attr.required,
            undefined, // min
            undefined, // max
            attr.defaultValue as number | undefined,
            false // array
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            INVENTORY_COLLECTION.id,
            attr.key,
            attr.required,
            attr.defaultValue as boolean | undefined,
            false // array
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            INVENTORY_COLLECTION.id,
            attr.key,
            attr.required,
            attr.defaultValue as string | undefined,
            false // array
          );
        }
      } catch (attrErr: any) {
        if (attrErr.code !== 409) { // 409 is already exists
          console.error(`Failed to create ${attr.key}:`, attrErr.message);
        } else {
          console.log(`Attribute ${attr.key} already exists.`);
        }
      }
      // Wait 500ms between attribute creations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ All attributes created for ${INVENTORY_COLLECTION.name}`);
  } catch (error) {
    console.error(`❌ Error setting up Inventory collection:`, error);
  }
}

createInventoryCollection().then(() => {
  console.log('Done!');
  process.exit(0);
});
