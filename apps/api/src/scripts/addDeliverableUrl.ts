import { databases } from '../services/appwrite';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const PRINT_ORDERS_COLLECTION = 'print_orders';

async function run() {
  try {
    console.log(`Adding deliverableUrl to ${PRINT_ORDERS_COLLECTION}...`);
    await databases.createStringAttribute(
      DATABASE_ID,
      PRINT_ORDERS_COLLECTION,
      'deliverableUrl',
      1000,
      false, // required
      undefined,
      false // array
    );
    console.log('Successfully requested attribute creation. Appwrite will process it shortly.');
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

run();
