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
        console.log('Adding coverImageUrl attribute...');
        await databases.createStringAttribute(
            process.env.APPWRITE_DATABASE_ID || 'multicompany',
            'blog_posts',
            'coverImageUrl',
            2048,
            false,
            ''
        );
        console.log('Successfully added coverImageUrl (size 2048).');
    } catch (e: any) {
        console.error('Failed to add attribute:', e.message);
    }
}
run();
