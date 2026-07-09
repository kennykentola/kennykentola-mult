import { Router } from 'express';
import { z } from 'zod';
import { sendEmail } from '../services/email';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { storage, databases } from '../services/appwrite';
import { ID, InputFile } from 'node-appwrite';
import fs from 'fs';
import path from 'path';
import os from 'os';

const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'project_files';

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: diskStorage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit


const router = Router();

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10)
});

router.post('/', async (req, res) => {
  try {
    const data = contactSchema.parse(req.body);

    const htmlContent = `
      <h3>New Contact Request from ${data.name}</h3>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <hr />
      <p>${data.message.replace(/\n/g, '<br />')}</p>
    `;

    await sendEmail({
      // Send to the primary admin email
      to: [
        'peterkehindeademola9@gmail.com',
        'peterkehindeademola@gmail.com',
        'ademolapeter233@gmail.com'
      ],
      replyTo: data.email, // Allows replying directly to the user
      subject: `[Contact Form] ${data.subject}`,
      html: htmlContent
    });

    res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact Form Error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Invalid form data.', errors: error.errors });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
  }
});

const designQuoteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  jobType: z.string().min(2),
  details: z.string().min(5)
});

router.post('/design-quote', upload.single('file'), async (req, res) => {
  try {
    const data = designQuoteSchema.parse(req.body);

    let fileUrl = '';
    let fileUploadError = '';
    if (req.file) {
      const filePath = req.file.path;
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'mock') {
          const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
            folder: 'design_quotes'
          });
          fileUrl = result.secure_url;
        } else {
          throw new Error('Cloudinary not configured');
        }
      } catch (cloudinaryErr: any) {
        console.warn('Cloudinary upload failed, falling back to Appwrite...');
        try {
          const appwriteFile = await storage.createFile(
            APPWRITE_BUCKET_ID,
            ID.unique(),
            InputFile.fromPath(filePath, req.file.originalname)
          );
          const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
          const projectId = process.env.APPWRITE_PROJECT_ID || 'mock-project-id';
          fileUrl = `${endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${appwriteFile.$id}/view?project=${projectId}`;
        } catch (appwriteErr: any) {
          console.error('Appwrite upload failed too:', appwriteErr);
          fileUploadError = 'File could not be uploaded due to a server configuration issue.';
        }
      }
      try { fs.unlinkSync(filePath); } catch (e) {}
    }

    const htmlContent = `
      <h3>New Design Quote Request from ${data.name}</h3>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Job Type:</strong> ${data.jobType}</p>
      ${fileUrl ? `<p><strong>Attached File:</strong> <a href="${fileUrl}">Download / View File</a></p>` : ''}
      ${fileUploadError ? `<p style="color:red;"><strong>Note:</strong> ${fileUploadError}</p>` : ''}
      <hr />
      <p><strong>Project Details:</strong><br/>${data.details.replace(/\n/g, '<br />')}</p>
    `;

    await sendEmail({
      to: [
        'peterkehindeademola9@gmail.com',
        'peterkehindeademola@gmail.com',
        'ademolapeter233@gmail.com'
      ],
      replyTo: data.email,
      subject: `[Design Quote] ${data.jobType} Request from ${data.name}`,
      html: htmlContent
    });

    // Save to database so it appears in the Admin Dashboard
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
    try {
      await databases.createDocument(
        DATABASE_ID,
        'agency_projects',
        ID.unique(),
        {
          clientId: 'guest', // Mark as guest since it's from the public form
          title: `[Design Quote] ${data.jobType}`,
          description: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n\nDetails:\n${data.details}`,
          projectType: data.jobType,
          status: 'pending-quote',
          budget: 0,
          quotePrice: 0
        }
      );
    } catch (dbErr) {
      console.error('Failed to save design quote to database:', dbErr);
    }

    res.status(200).json({ success: true, message: 'Request sent successfully.' });
  } catch (error: any) {
    console.error('Design Quote Error:', error);
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Invalid form data.', errors: error.errors });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send request.', error: error.message, stack: error.stack });
    }
  }
});

export const contactRoutes = router;
