import { databases } from '../services/appwrite';
import { Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

const COLLECTIONS = [
  {
    id: 'print_orders',
    name: 'Printing Orders',
    attributes: [
      { key: 'userId', type: 'string', size: 100, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'serviceType', type: 'string', size: 100, required: true },
      { key: 'status', type: 'string', size: 50, required: false, defaultValue: 'pending' },
      { key: 'price', type: 'float', required: false },
      { key: 'quantity', type: 'integer', required: false, defaultValue: 1 },
      { key: 'paperSize', type: 'string', size: 50, required: false },
      { key: 'colorMode', type: 'string', size: 50, required: false },
      { key: 'sides', type: 'string', size: 50, required: false },
      { key: 'bindingType', type: 'string', size: 100, required: false },
      { key: 'specialInstructions', type: 'string', size: 1000, required: false },
      // Note: Appwrite string arrays require size for the inner string elements
      { key: 'fileUrls', type: 'string_array', size: 1000, required: false },
      { key: 'fileUrl', type: 'string', size: 1000, required: false },
      { key: 'deliveryMethod', type: 'string', size: 100, required: false },
      { key: 'paymentStatus', type: 'string', size: 50, required: false, defaultValue: 'pending' },
      { key: 'pricingType', type: 'string', size: 50, required: false },
      { key: 'pageCount', type: 'integer', required: false },
      { key: 'receiptUrl', type: 'string', size: 1000, required: false },
      { key: 'fileType', type: 'string', size: 100, required: false },
      { key: 'printingType', type: 'string', size: 100, required: false },
      { key: 'doubleSided', type: 'boolean', required: false }
    ]
  },
  {
    id: 'pricing_config',
    name: 'Pricing Config',
    attributes: [
      { key: 'serviceType', type: 'string', size: 100, required: true },
      { key: 'basePrice', type: 'float', required: true },
      { key: 'perPagePrice', type: 'float', required: false },
      { key: 'isActive', type: 'boolean', required: false, defaultValue: true }
    ]
  },
  {
    id: 'print_messages',
    name: 'Printing Messages',
    attributes: [
      { key: 'orderId', type: 'string', size: 100, required: true },
      { key: 'senderId', type: 'string', size: 100, required: true },
      { key: 'message', type: 'string', size: 2000, required: true },
      { key: 'senderRole', type: 'string', size: 50, required: true },
      { key: 'timestamp', type: 'datetime', required: false }
    ]
  }
];

async function setupPrintingCollections() {
  console.log(`Setting up Printing collections...`);

  for (const collection of COLLECTIONS) {
    try {
      try {
        await databases.getCollection(DATABASE_ID, collection.id);
        console.log(`✅ Collection ${collection.name} already exists.`);
      } catch (error: any) {
        if (error.code === 404) {
          console.log(`Creating collection: ${collection.name}`);
          
          await databases.createCollection(
            DATABASE_ID,
            collection.id,
            collection.name,
            [
              Permission.read(Role.any()),
              Permission.create(Role.any()),
              Permission.update(Role.any()),
              Permission.delete(Role.any())
            ]
          );
          console.log(`✅ Created collection: ${collection.name}`);
        } else {
          throw error;
        }
      }

      for (const attr of collection.attributes) {
        console.log(`Creating attribute: ${attr.key} (${attr.type}) in ${collection.id}`);
        try {
          if (attr.type === 'string') {
            await databases.createStringAttribute(
              DATABASE_ID, collection.id, attr.key, attr.size || 255, attr.required, attr.defaultValue as string | undefined
            );
          } else if (attr.type === 'string_array') {
            await databases.createStringAttribute(
              DATABASE_ID, collection.id, attr.key, attr.size || 255, attr.required, attr.defaultValue as string | undefined, true
            );
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(
              DATABASE_ID, collection.id, attr.key, attr.required, 0, 999999999, attr.defaultValue as number | undefined
            );
          } else if (attr.type === 'float') {
            await databases.createFloatAttribute(
              DATABASE_ID, collection.id, attr.key, attr.required, 0, 999999999, attr.defaultValue as number | undefined
            );
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              DATABASE_ID, collection.id, attr.key, attr.required, attr.defaultValue as boolean | undefined
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              DATABASE_ID, collection.id, attr.key, attr.required, attr.defaultValue as string | undefined
            );
          }
        } catch (error: any) {
          if (error.code === 409) {
            console.log(`Attribute ${attr.key} already exists in ${collection.id}.`);
          } else {
            console.error(`❌ Error creating attribute ${attr.key}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to setup collection ${collection.name}:`, error);
    }
  }

  console.log(`\n🎉 Printing setup complete. Waiting 5 seconds for Appwrite indexing...`);
  await new Promise(resolve => setTimeout(resolve, 5000));
}

setupPrintingCollections()
  .then(() => {
    console.log('Printing Schema init successful.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Printing Schema init failed:', err);
    process.exit(1);
  });
