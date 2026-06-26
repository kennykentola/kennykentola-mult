import { databases } from '../services/appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const PRINT_ORDERS_COLLECTION = 'print_orders';

async function checkSchema() {
  try {
    const collection = await databases.listAttributes(DATABASE_ID, PRINT_ORDERS_COLLECTION);
    console.log(`Attributes in ${PRINT_ORDERS_COLLECTION}:`);
    collection.attributes.forEach((attr: any) => {
      console.log(`- ${attr.key} (${attr.type}) [Required: ${attr.required}]`);
    });
  } catch (err: any) {
    console.error('Failed to fetch schema:', err.message);
  }
}

checkSchema();
