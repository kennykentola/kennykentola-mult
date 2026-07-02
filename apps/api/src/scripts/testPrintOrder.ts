import { databases } from '../services/appwrite';
import { ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const PRINT_ORDERS_COLLECTION = 'print_orders';

async function testOrder() {
  console.log('Testing print order creation...');
  try {
    const order = await databases.createDocument(
      DATABASE_ID,
      PRINT_ORDERS_COLLECTION,
      ID.unique(),
      {
        userId: 'test_user_id',
        title: 'Test Thesis Printing',
        serviceType: 'document',
        status: 'pending',
        price: 500,
        quantity: 2,
        paperSize: 'A4',
        colorMode: 'bw',
        sides: 'double',
        bindingType: 'spiral',
        specialInstructions: 'Please print clearly',
        fileUrls: ['https://example.com/file.pdf'],
        fileUrl: 'https://example.com/file.pdf',
        deliveryMethod: 'pickup',
        paymentStatus: 'pending',
        pricingType: 'manual',
        pageCount: 50,
        receiptUrl: '',
        fileType: 'document',
        printingType: 'document',
        doubleSided: true
      }
    );
    console.log('✅ Order created successfully:', order.$id);
  } catch (err: any) {
    console.error('❌ Failed to create order:', err.message);
    process.exit(1);
  }
}

testOrder().then(() => process.exit(0));
