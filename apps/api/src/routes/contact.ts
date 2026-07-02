import { Router } from 'express';
import { z } from 'zod';
import { sendEmail } from '../services/email';

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
      to: process.env.DEFAULT_FROM_EMAIL || 'ademolapeter233@gmail.com',
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

export const contactRoutes = router;
