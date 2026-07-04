import express from 'express';
import { databases } from '../services/appwrite';
import { ID, Query } from 'node-appwrite';
import { authenticateJWT } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COLLECTION = 'blog_posts';

// Get all published blog posts (Public)
router.get('/', async (req, res) => {
  try {
    const posts = await databases.listDocuments(DATABASE_ID, COLLECTION, [
      Query.equal('isPublished', true),
      Query.orderDesc('publishedAt')
    ]);
    res.json({ success: true, posts: posts.documents });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all blog posts (Admin)
router.get('/all', authenticateJWT, async (req, res) => {
  try {
    const posts = await databases.listDocuments(DATABASE_ID, COLLECTION, [
      Query.orderDesc('$createdAt')
    ]);
    res.json({ success: true, posts: posts.documents });
  } catch (error: any) {
    console.error('Error fetching all blog posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get RSS Feed (Public)
router.get('/rss.xml', async (req, res) => {
  try {
    const posts = await databases.listDocuments(DATABASE_ID, COLLECTION, [
      Query.equal('isPublished', true),
      Query.orderDesc('publishedAt'),
      Query.limit(20)
    ]);

    const CLIENT_URL = process.env.CLIENT_URL || 'https://kennykentola.com';

    const items = posts.documents.map((post: any) => `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${CLIENT_URL}/blog/${post.slug}</link>
        <guid>${CLIENT_URL}/blog/${post.slug}</guid>
        <pubDate>${new Date(post.publishedAt || post.$createdAt).toUTCString()}</pubDate>
        <description><![CDATA[${post.excerpt || post.content.substring(0, 200)}]]></description>
      </item>
    `).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KennyKentola Blog</title>
    <link>${CLIENT_URL}/blog</link>
    <description>Latest updates, tutorials, and news from KennyKentola.</description>
    <language>en-us</language>
    <atom:link href="${CLIENT_URL}/api/v1/blog/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml');
    res.send(rss);
  } catch (error: any) {
    console.error('Error generating RSS feed:', error);
    res.status(500).send('Error generating RSS feed');
  }
});

// Get single blog post by slug (Public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const posts = await databases.listDocuments(DATABASE_ID, COLLECTION, [
      Query.equal('slug', slug),
      Query.limit(1)
    ]);
    
    if (posts.documents.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.json({ success: true, post: posts.documents[0] });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new blog post (Admin)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, coverImageId, authorName, isPublished } = req.body;
    
    const postData: any = {
      title,
      slug,
      excerpt,
      content,
      category: category || 'General',
      authorName,
      isPublished: !!isPublished
    };
    
    if (coverImageId) postData.coverImageId = coverImageId;
    if (isPublished) postData.publishedAt = new Date().toISOString();

    const post = await databases.createDocument(
      DATABASE_ID,
      COLLECTION,
      ID.unique(),
      postData
    );

    res.status(201).json({ success: true, post });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update blog post (Admin)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, category, coverImageId, authorName, isPublished } = req.body;
    
    const currentPost = await databases.getDocument(DATABASE_ID, COLLECTION, id);
    let publishedAt = (currentPost as any).publishedAt;
    
    if (isPublished && !(currentPost as any).isPublished) {
      publishedAt = new Date().toISOString();
    }

    const postData: any = {
      title,
      slug,
      excerpt,
      content,
      category,
      authorName,
      isPublished: !!isPublished
    };
    
    // Only include optional fields if they have truthy values or are explicitly set
    if (coverImageId) postData.coverImageId = coverImageId;
    if (publishedAt) postData.publishedAt = publishedAt;

    const post = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION,
      id,
      postData
    );

    res.json({ success: true, post });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete blog post (Admin)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    await databases.deleteDocument(DATABASE_ID, COLLECTION, id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload Image to Cloudinary (Admin)
router.post('/upload-image', authenticateJWT, async (req, res) => {
  try {
    const { file } = req.body; // base64 encoded string

    if (!file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: 'kennykentola/blog',
      resource_type: 'auto'
    });

    res.json({ success: true, url: result.secure_url });
  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload image' });
  }
});

export default router;
