import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

async function run() {
    try {
        console.log('Updating coverImageId attribute size...');
        await databases.updateStringAttribute(
            process.env.APPWRITE_DATABASE_ID || 'multicompany',
            'blog_posts',
            'coverImageId',
            false,
            '',
            2048
        );
        console.log('Successfully increased coverImageId size to 2048.');
    } catch (e: any) {
        console.error('Failed to update attribute:', e.message);
    }
}
run();
