import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('kennykentolamult')
    .setKey('standard_604d3a81985c442ffa6e9a9330f73763fb7b21265357f6dff6919b53b2c087eab50a70a4072074f6f29f80cb81c7a2d7eca001d7c07be1eb7576379808b340b558249138fa99e764a1f6b61d8679565d63950f076c62ed0f8a0e050c7fa939d019acbae57a051ba8f09b9087e8775b56f095d34635a2d1c0ac581a854dec0147');

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
