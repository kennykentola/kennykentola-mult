import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || 'kennykentolamult')
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

async function run() {
    try {
        const doc: any = await databases.getDocument('multicompany', 'blog_posts', '6a494997000c0f36635a');
        console.log('Doc title:', doc.title);
        
        await databases.updateDocument('multicompany', 'blog_posts', '6a494997000c0f36635a', {
            title: doc.title,
            slug: doc.slug,
            excerpt: doc.excerpt,
            content: doc.content,
            category: doc.category,
            coverImageId: doc.coverImageId,
            authorName: doc.authorName,
            isPublished: doc.isPublished,
            publishedAt: doc.publishedAt
        });
        console.log('Update successful');
    } catch (e: any) {
        console.error('Update failed:', e.message);
    }
}
run();
