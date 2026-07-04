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
        const doc = await databases.getDocument('multicompany', 'blog_posts', '6a494997000c0f36635a');
        console.log('Document fetched:', doc.$id);
        
        await databases.updateDocument('multicompany', 'blog_posts', '6a494997000c0f36635a', {
            title: (doc as any).title,
            slug: (doc as any).slug,
            excerpt: (doc as any).excerpt,
            content: (doc as any).content,
            category: (doc as any).category,
            coverImageId: (doc as any).coverImageId,
            authorName: (doc as any).authorName,
            isPublished: (doc as any).isPublished,
            publishedAt: (doc as any).publishedAt
        });
        console.log('Update successful');
    } catch (e) {
        console.error('Update failed:', e);
    }
}
run();
