import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { storage } from './appwrite';
import { InputFile } from 'node-appwrite';

const BUCKET_ID = 'certificates';

/**
 * Ensure the certificates bucket exists in Appwrite.
 */
async function ensureCertificatesBucket() {
  try {
    await storage.getBucket(BUCKET_ID);
  } catch (err) {
    console.log(`[Storage] Bucket '${BUCKET_ID}' not found. Creating...`);
    try {
      await storage.createBucket(BUCKET_ID, 'Student Certificates');
    } catch (createErr) {
      console.warn(`[Storage] Failed to create bucket '${BUCKET_ID}' (might already exist):`, createErr);
    }
  }
}

/**
 * Generates a premium PDF Certificate and uploads it to Appwrite Storage.
 * @returns The public file view URL.
 */
export async function generateAndUploadCertificate(
  studentName: string,
  courseTitle: string,
  certificateNumber: string,
  issueDate: string
): Promise<string> {
  await ensureCertificatesBucket();

  // Create temporary directory if it doesn't exist
  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = path.join(tempDir, `cert-${certificateNumber}.pdf`);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
      });

      const writeStream = fs.createWriteStream(tempFilePath);
      doc.pipe(writeStream);

      const width = doc.page.width;
      const height = doc.page.height;

      // 1. Draw elegant dark background
      doc.rect(0, 0, width, height).fill('#030712');

      // 2. Beautiful decorative corner elements
      doc.save();
      doc.translate(0, 0);
      doc.path('M 0 0 L 120 0 L 0 120 Z').fill('#1e1b4b');
      doc.restore();

      doc.save();
      doc.translate(width, 0);
      doc.path('M 0 0 L -120 0 L 0 120 Z').fill('#1e1b4b');
      doc.restore();

      doc.save();
      doc.translate(0, height);
      doc.path('M 0 0 L 120 0 L 0 -120 Z').fill('#1e1b4b');
      doc.restore();

      doc.save();
      doc.translate(width, height);
      doc.path('M 0 0 L -120 0 L 0 -120 Z').fill('#1e1b4b');
      doc.restore();

      // 3. Double Gold Border
      doc.lineWidth(4);
      doc.strokeColor('#d97706'); // Gold
      doc.rect(40, 40, width - 80, height - 80).stroke();

      doc.lineWidth(1);
      doc.strokeColor('#b45309'); // Darker Gold
      doc.rect(46, 46, width - 92, height - 92).stroke();

      // 4. Header: Brand Logo / Name
      doc.fillColor('#e2e8f0');
      doc.font('Helvetica-Bold');
      doc.fontSize(24);
      doc.text('KENNYKENTOLA PROGRAMMING ACADEMY', 0, 100, {
        align: 'center',
        width: width,
      });

      doc.fillColor('#94a3b8');
      doc.font('Helvetica');
      doc.fontSize(10);
      doc.text('CERTIFICATE OF ACCOMPLISHMENT', 0, 135, {
        align: 'center',
        width: width,
        characterSpacing: 2,
      });

      // 5. Recipient Section
      doc.fillColor('#94a3b8');
      doc.fontSize(14);
      doc.text('This is proudly presented to', 0, 190, {
        align: 'center',
        width: width,
      });

      // Recipient Name (Large, Gold gradient simulation)
      doc.fillColor('#fbbf24'); // Bright Gold
      doc.font('Helvetica-Bold');
      doc.fontSize(42);
      doc.text(studentName.toUpperCase(), 0, 225, {
        align: 'center',
        width: width,
      });

      // Underline recipient
      doc.lineWidth(1.5);
      doc.strokeColor('#fbbf24');
      doc.moveTo(width / 2 - 180, 275).lineTo(width / 2 + 180, 275).stroke();

      // 6. Accomplishment Text
      doc.fillColor('#94a3b8');
      doc.font('Helvetica');
      doc.fontSize(14);
      doc.text('for successfully completing the course', 0, 300, {
        align: 'center',
        width: width,
      });

      // Course Title
      doc.fillColor('#ffffff');
      doc.font('Helvetica-Bold');
      doc.fontSize(28);
      doc.text(courseTitle, 0, 335, {
        align: 'center',
        width: width,
      });

      // 7. Signatures / Metadata Row
      const footerY = 440;

      // Left: Date
      doc.fillColor('#e2e8f0');
      doc.font('Helvetica-Bold');
      doc.fontSize(12);
      doc.text(issueDate, 100, footerY, { width: 200, align: 'center' });
      doc.lineWidth(1);
      doc.strokeColor('#475569');
      doc.moveTo(100, footerY + 20).lineTo(300, footerY + 20).stroke();
      doc.fillColor('#64748b');
      doc.font('Helvetica');
      doc.fontSize(10);
      doc.text('DATE OF ISSUANCE', 100, footerY + 26, { width: 200, align: 'center' });

      // Middle: Gold Seal
      doc.save();
      doc.fillColor('#fbbf24');
      doc.circle(width / 2, footerY + 15, 30).fill();
      doc.fillColor('#d97706');
      doc.font('Helvetica-Bold');
      doc.fontSize(10);
      doc.text('SEAL', width / 2 - 20, footerY + 11, { width: 40, align: 'center' });
      doc.restore();

      // Right: Instructor Signature
      doc.fillColor('#e2e8f0');
      doc.font('Times-Italic');
      doc.fontSize(16);
      doc.text('Kenny Kentola', width - 300, footerY - 5, { width: 200, align: 'center' });
      doc.lineWidth(1);
      doc.strokeColor('#475569');
      doc.moveTo(width - 300, footerY + 20).lineTo(width - 100, footerY + 20).stroke();
      doc.fillColor('#64748b');
      doc.font('Helvetica');
      doc.fontSize(10);
      doc.text('ACADEMY DIRECTOR', width - 300, footerY + 26, { width: 200, align: 'center' });

      // 8. Certificate ID at the bottom
      doc.fillColor('#475569');
      doc.font('Courier');
      doc.fontSize(8);
      doc.text(`VERIFICATION NUMBER: ${certificateNumber}`, 0, height - 35, {
        align: 'center',
        width: width,
      });

      // Finalize PDF
      doc.end();

      writeStream.on('finish', async () => {
        try {
          // Upload to Appwrite Storage
          const appwriteFileName = `certificate_${certificateNumber}.pdf`;
          const fileUpload = await storage.createFile(
            BUCKET_ID,
            certificateNumber,
            InputFile.fromPath(tempFilePath, appwriteFileName)
          );

          // Build view URL
          const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
          const projectId = process.env.APPWRITE_PROJECT_ID || 'kennykentolamult';
          const publicUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileUpload.$id}/view?project=${projectId}`;

          // Cleanup local file
          try {
            fs.unlinkSync(tempFilePath);
          } catch (unlinkErr) {
            console.warn('[PDF Service] Temp file cleanup error:', unlinkErr);
          }

          resolve(publicUrl);
        } catch (uploadErr) {
          console.error('[PDF Service] Upload to Appwrite failed:', uploadErr);
          reject(uploadErr);
        }
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates a premium PDF Payment Receipt and uploads it to Appwrite Storage.
 * @returns The public file view URL.
 */
export async function generateAndUploadReceipt(
  receiptNumber: string,
  issueDate: string,
  amount: number,
  clientName: string,
  paymentMethod: string,
  itemName: string
): Promise<string> {
  const receiptBucket = 'certificates';
  
  // Create temporary directory if it doesn't exist
  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = path.join(tempDir, `receipt-${receiptNumber}.pdf`);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      });

      const writeStream = fs.createWriteStream(tempFilePath);
      doc.pipe(writeStream);

      const width = doc.page.width;
      const height = doc.page.height;

      // 1. Draw elegant dark background
      doc.rect(0, 0, width, height).fill('#030712');

      // 2. Double Gold Border
      doc.lineWidth(2);
      doc.strokeColor('#d97706'); // Gold
      doc.rect(20, 20, width - 40, height - 40).stroke();

      doc.lineWidth(0.5);
      doc.strokeColor('#b45309'); // Darker Gold
      doc.rect(24, 24, width - 48, height - 48).stroke();

      // 3. Header: Brand Logo / Name
      doc.fillColor('#e2e8f0');
      doc.font('Helvetica-Bold');
      doc.fontSize(20);
      doc.text('KENNYKENTOLA DIGITAL LTD', 40, 50);

      doc.fillColor('#94a3b8');
      doc.font('Helvetica');
      doc.fontSize(9);
      doc.text('Academy • Software • Printing • Solar', 40, 75);

      // Top Right: Invoice Label
      doc.fillColor('#fbbf24'); // Bright Gold
      doc.font('Helvetica-Bold');
      doc.fontSize(24);
      doc.text('PAYMENT RECEIPT', width - 280, 50, { align: 'right', width: 240 });

      // Divider Line
      doc.lineWidth(1);
      doc.strokeColor('#334155');
      doc.moveTo(40, 100).lineTo(width - 40, 100).stroke();

      // 4. Receipt Metadata Info (Two columns)
      const infoY = 120;
      doc.fillColor('#94a3b8');
      doc.font('Helvetica-Bold');
      doc.fontSize(10);
      doc.text('Billed To:', 40, infoY);
      doc.fillColor('#ffffff');
      doc.font('Helvetica');
      doc.text(clientName, 40, infoY + 18);

      doc.fillColor('#94a3b8');
      doc.font('Helvetica-Bold');
      doc.text('Receipt Details:', width - 240, infoY);
      doc.fillColor('#ffffff');
      doc.font('Helvetica');
      doc.text(`Receipt No: ${receiptNumber}`, width - 240, infoY + 18);
      doc.text(`Date: ${issueDate}`, width - 240, infoY + 33);
      doc.text(`Payment Method: ${paymentMethod}`, width - 240, infoY + 48);

      // Divider Line
      doc.moveTo(40, 200).lineTo(width - 40, 200).stroke();

      // 5. Payment Breakdown Table
      const tableY = 220;
      // Table Header
      doc.fillColor('#d97706');
      doc.font('Helvetica-Bold');
      doc.fontSize(11);
      doc.text('Item Description', 40, tableY);
      doc.text('Qty', width - 180, tableY, { width: 40, align: 'center' });
      doc.text('Amount Paid', width - 120, tableY, { width: 80, align: 'right' });

      // Table Row Divider
      doc.lineWidth(0.5);
      doc.strokeColor('#475569');
      doc.moveTo(40, tableY + 18).lineTo(width - 40, tableY + 18).stroke();

      // Table Item Row
      doc.fillColor('#ffffff');
      doc.font('Helvetica');
      doc.fontSize(10);
      doc.text(itemName, 40, tableY + 30, { width: width - 240 });
      doc.text('1', width - 180, tableY + 30, { width: 40, align: 'center' });
      doc.text(`N ${amount.toLocaleString()}`, width - 120, tableY + 30, { width: 80, align: 'right' });

      // Divider Line
      doc.moveTo(40, tableY + 60).lineTo(width - 40, tableY + 60).stroke();

      // Total Section
      const totalY = tableY + 80;
      doc.fillColor('#94a3b8');
      doc.font('Helvetica-Bold');
      doc.fontSize(11);
      doc.text('Total Paid:', width - 200, totalY, { width: 80, align: 'right' });
      doc.fillColor('#fbbf24');
      doc.fontSize(16);
      doc.text(`N ${amount.toLocaleString()}`, width - 120, totalY - 4, { width: 80, align: 'right' });

      // 6. Paid Seal Graphic
      const sealY = totalY + 80;
      doc.save();
      // Draw a circular seal mimicking a "PAID" stamp
      doc.fillColor('#065f46'); // Dark green background for paid
      doc.circle(120, sealY + 20, 35).fill();
      doc.lineWidth(2);
      doc.strokeColor('#34d399'); // Mint outline
      doc.circle(120, sealY + 20, 31).stroke();
      
      doc.fillColor('#34d399');
      doc.font('Helvetica-Bold');
      doc.fontSize(14);
      doc.text('PAID', 95, sealY + 13, { width: 50, align: 'center' });
      doc.restore();

      // Footer Notes
      doc.fillColor('#64748b');
      doc.font('Helvetica');
      doc.fontSize(9);
      doc.text(
        'Thank you for your payment! This receipt validates that payment has been successfully received and processed. For billing inquiries, contact billing@kennykentola.com.',
        200,
        sealY,
        { width: width - 240, lineGap: 3 }
      );

      // 7. Signature / Stamp Row
      doc.fillColor('#e2e8f0');
      doc.font('Times-Italic');
      doc.fontSize(14);
      doc.text('Ademola Peter Kehinde', width - 220, sealY + 20, { width: 180, align: 'center' });
      doc.lineWidth(1);
      doc.strokeColor('#475569');
      doc.moveTo(width - 220, sealY + 40).lineTo(width - 40, sealY + 40).stroke();
      doc.fillColor('#64748b');
      doc.font('Helvetica');
      doc.fontSize(9);
      doc.text('AUTHORIZED BILLING OFFICER', width - 220, sealY + 45, { width: 180, align: 'center' });

      // Finalize PDF
      doc.end();

      writeStream.on('finish', async () => {
        try {
          // Upload to Appwrite Storage
          const appwriteFileName = `receipt_${receiptNumber}.pdf`;
          const fileUpload = await storage.createFile(
            receiptBucket,
            receiptNumber,
            InputFile.fromPath(tempFilePath, appwriteFileName)
          );

          // Build view URL
          const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
          const projectId = process.env.APPWRITE_PROJECT_ID || 'kennykentolamult';
          const publicUrl = `${endpoint}/storage/buckets/${receiptBucket}/files/${fileUpload.$id}/view?project=${projectId}`;

          // Cleanup local file
          try {
            fs.unlinkSync(tempFilePath);
          } catch (unlinkErr) {
            console.warn('[PDF Service] Temp receipt file cleanup error:', unlinkErr);
          }

          resolve(publicUrl);
        } catch (uploadErr) {
          console.error('[PDF Service] Receipt upload to Appwrite failed:', uploadErr);
          reject(uploadErr);
        }
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
