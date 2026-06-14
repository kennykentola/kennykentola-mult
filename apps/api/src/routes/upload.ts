import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { storage } from '../services/appwrite';
import { ID, InputFile } from 'node-appwrite';
import fs from 'fs';
import path from 'path';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock'
});

const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'videos';

// Set up multer using disk storage
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'tmp_uploads');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: diskStorage, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB limit

router.post('/', authenticateJWT, upload.single('file'), async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Instructor' && req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Instructor access required.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  
  try {
    let videoUrl = '';
    
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'mock') {
        const result = await cloudinary.uploader.upload(filePath, {
          resource_type: 'video',
          folder: 'academy_lessons'
        });
        videoUrl = result.secure_url;
      } else {
        throw new Error('Cloudinary not configured');
      }
    } catch (cloudinaryErr: any) {
      console.warn(`[Upload API] Cloudinary upload failed (${cloudinaryErr.message}), falling back to Appwrite...`);
      
      const appwriteFile = await storage.createFile(
        APPWRITE_BUCKET_ID,
        ID.unique(),
        InputFile.fromPath(filePath, req.file.originalname)
      );
      
      const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
      const projectId = process.env.APPWRITE_PROJECT_ID || 'mock-project-id';
      videoUrl = `${endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${appwriteFile.$id}/view?project=${projectId}`;
    }

    try { fs.unlinkSync(filePath); } catch (e) {}

    res.status(200).json({ message: 'Upload successful', url: videoUrl });
  } catch (err: any) {
    try { fs.unlinkSync(filePath); } catch (e) {}
    console.error('[Upload API] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
