import { databases } from '../services/appwrite';
import { ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

const DEFAULT_PRICING = [
  {
    serviceType: 'document',
    label: 'Document Printing',
    pricePerUnit: 50,
    unit: 'page',
    colorMultiplier: 2.0,
    doubleSidedDiscount: 0.1,
    isActive: true,
    basePrice: 0,
    perPagePrice: 50
  },
  {
    serviceType: 'graphic',
    label: 'Graphic Design',
    pricePerUnit: 5000,
    unit: 'design',
    colorMultiplier: 1.0,
    doubleSidedDiscount: 0.0,
    isActive: true,
    basePrice: 5000,
    perPagePrice: 0
  },
  {
    serviceType: 'id_card',
    label: 'ID Card Production',
    pricePerUnit: 1500,
    unit: 'card',
    colorMultiplier: 1.0,
    doubleSidedDiscount: 0.0,
    isActive: true,
    basePrice: 1500,
    perPagePrice: 0
  }
];

async function seed() {
  console.log('Seeding printing config...');
  for (const config of DEFAULT_PRICING) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'pricing_config',
        ID.unique(),
        config
      );
      console.log(`Seeded pricing for ${config.serviceType}`);
    } catch (err: any) {
      console.error(`Failed to seed ${config.serviceType}:`, err.message);
    }
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
