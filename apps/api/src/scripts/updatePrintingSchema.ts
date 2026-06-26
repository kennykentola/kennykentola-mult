import { databases } from '../services/appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const PRINT_ORDERS_COLLECTION = 'print_orders';
const PRINT_MESSAGES_COLLECTION = 'print_messages';

async function updatePrintingSchema() {
  console.log('[Printing Schema] Starting schema update...');

  // 1. Update print_orders
  try {
    console.log(`[Printing Schema] Adding new attributes to ${PRINT_ORDERS_COLLECTION}...`);
    
    const attributes = [
      { key: 'paymentStatus', type: 'string', size: 50, required: false, default: 'pending' },
      { key: 'receiptUrl', type: 'string', size: 1000, required: false },
      { key: 'pricingType', type: 'string', size: 50, required: false, default: 'auto' }, // auto or manual
      { key: 'pageCount', type: 'integer', required: false, default: 0 },
      { key: 'estimatedReadyAt', type: 'string', size: 100, required: false }
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(DATABASE_ID, PRINT_ORDERS_COLLECTION, attr.key, attr.size!, attr.required, attr.default as string | undefined);
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(DATABASE_ID, PRINT_ORDERS_COLLECTION, attr.key, attr.required, 0, 100000, attr.default as number | undefined);
        }
        console.log(`  + Added attribute: ${attr.key}`);
      } catch (err: any) {
        if (err.code === 409) {
          console.log(`  ~ Attribute ${attr.key} already exists`);
        } else {
          console.warn(`  ! Failed to add ${attr.key}: ${err.message}`);
        }
      }
    }
  } catch (err: any) {
    console.error(`[Printing Schema] Failed to update orders:`, err.message);
  }

  // 2. Create print_messages
  try {
    console.log(`[Printing Schema] Creating ${PRINT_MESSAGES_COLLECTION} collection...`);
    await databases.createCollection(DATABASE_ID, PRINT_MESSAGES_COLLECTION, 'Print Messages');
    
    const msgAttributes = [
      { key: 'orderId', type: 'string', size: 50, required: true },
      { key: 'senderId', type: 'string', size: 50, required: true },
      { key: 'senderRole', type: 'string', size: 20, required: true }, // admin or customer
      { key: 'message', type: 'string', size: 5000, required: true },
      { key: 'timestamp', type: 'datetime', required: true }
    ];

    for (const attr of msgAttributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(DATABASE_ID, PRINT_MESSAGES_COLLECTION, attr.key, attr.size!, attr.required);
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(DATABASE_ID, PRINT_MESSAGES_COLLECTION, attr.key, attr.required);
        }
        console.log(`  + Added attribute: ${attr.key}`);
      } catch (err: any) {
        if (err.code === 409) {
          console.log(`  ~ Attribute ${attr.key} already exists`);
        } else {
          console.warn(`  ! Failed to add ${attr.key}: ${err.message}`);
        }
      }
    }
  } catch (err: any) {
    if (err.code === 409) {
      console.log(`[Printing Schema] Collection ${PRINT_MESSAGES_COLLECTION} already exists. Skipping.`);
    } else {
      console.error(`[Printing Schema] Failed to create messages collection:`, err.message);
    }
  }

  console.log('[Printing Schema] Done.');
}

updatePrintingSchema();
