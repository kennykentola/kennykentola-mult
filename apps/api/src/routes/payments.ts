import { Router } from 'express';
import { ID, Query, InputFile } from 'node-appwrite';
import { databases, storage } from '../services/appwrite';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { SubmitPaymentValidation } from '@company/shared';
import { generateAndUploadReceipt, generateAndUploadInvoice } from '../services/pdfService';
import fs from 'fs';
import path from 'path';

const router = Router();
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

// Collection IDs
const BANK_ACCOUNTS_COLLECTION = 'bank_accounts';
const PAYMENTS_COLLECTION = 'payments';
const RECEIPTS_COLLECTION = 'receipts';
const COURSES_COLLECTION = 'courses';
const ENROLLMENTS_COLLECTION = 'course_enrollments';
const PRINT_ORDERS_COLLECTION = 'print_orders';
const PROFILES_COLLECTION = 'users_profile';

// Helper to get user profile
async function getProfileDoc(userId: string) {
  try {
    const profiles = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION, [
      Query.equal('userId', userId),
      Query.limit(1)
    ]);
    return profiles.documents[0] || null;
  } catch {
    return null;
  }
}

// Helper to get item name based on type and id — single lookup (used in verify)
async function getItemName(type: string, referenceId: string): Promise<string> {
  try {
    if (type === 'course') {
      const course = await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, referenceId);
      return `Academy Course: ${(course as any).title}`;
    } else if (type === 'printing') {
      const order = await databases.getDocument(DATABASE_ID, PRINT_ORDERS_COLLECTION, referenceId);
      return `Print Order: ${(order as any).title}`;
    }
    return `Service Settle: ${type} (${referenceId})`;
  } catch {
    return `Service Settle: ${type}`;
  }
}

// Helper: batch-fetch all unique reference items by type, returns a map id -> label
async function batchGetItemNames(payments: any[]): Promise<Map<string, string>> {
  const courseIds = [...new Set(payments.filter(p => p.type === 'course').map(p => p.referenceId))];
  const printIds  = [...new Set(payments.filter(p => p.type === 'printing').map(p => p.referenceId))];
  const nameMap = new Map<string, string>();

  // Batch fetch courses
  if (courseIds.length > 0) {
    try {
      const courses = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, [
        Query.equal('$id', courseIds),
        Query.limit(courseIds.length)
      ]);
      courses.documents.forEach((c: any) => nameMap.set(c.$id, `Academy Course: ${c.title}`));
    } catch {}
  }

  // Batch fetch print orders
  if (printIds.length > 0) {
    try {
      const orders = await databases.listDocuments(DATABASE_ID, PRINT_ORDERS_COLLECTION, [
        Query.equal('$id', printIds),
        Query.limit(printIds.length)
      ]);
      orders.documents.forEach((o: any) => nameMap.set(o.$id, `Print Order: ${o.title}`));
    } catch {}
  }

  return nameMap;
}

// Helper: batch-fetch all bank accounts, returns map bankAccountId -> bankName
async function batchGetBankNames(): Promise<Map<string, string>> {
  try {
    const banks = await databases.listDocuments(DATABASE_ID, BANK_ACCOUNTS_COLLECTION, [Query.limit(100)]);
    return new Map(banks.documents.map((b: any) => [b.$id, b.bankName as string]));
  } catch {
    return new Map();
  }
}

// ──────────────────────────────────────────────────
// GET: Fetch Active Bank Accounts
// ──────────────────────────────────────────────────
router.get('/banks', authenticateJWT, async (_req, res) => {
  try {
    const banks = await databases.listDocuments(DATABASE_ID, BANK_ACCOUNTS_COLLECTION, [
      Query.equal('isActive', true),
      Query.limit(50)
    ]);
    res.status(200).json({ bankAccounts: banks.documents });
  } catch (err: any) {
    console.error('[Payments] Error fetching bank accounts:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// GET: Fetch Unpaid Invoices
// ──────────────────────────────────────────────────
router.get('/unpaid', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  try {
    const unpaidInvoices: any[] = [];

    // 1. Unpaid Courses (price > 0 and student is not enrolled with active/completed status)
    const courses = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, [
      Query.equal('isPublished', true),
      Query.greaterThan('price', 0),
      Query.limit(100)
    ]);

    const enrollments = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
      Query.equal('userId', userId || ''),
      Query.limit(100)
    ]);

    const activeEnrollmentIds = new Set(
      enrollments.documents
        .filter((e: any) => e.status === 'active' || e.status === 'completed')
        .map((e: any) => e.courseId)
    );

    const pendingPaymentEnrollmentIds = new Set(
      enrollments.documents
        .filter((e: any) => e.status === 'pending-payment')
        .map((e: any) => e.courseId)
    );

    for (const courseDoc of courses.documents) {
      const course = courseDoc as any;
      if (!activeEnrollmentIds.has(course.$id)) {
        const hasPending = pendingPaymentEnrollmentIds.has(course.$id);
        unpaidInvoices.push({
          id: course.$id,
          type: 'course',
          desc: `Academy Course: ${course.title}`,
          amount: `N ${course.price.toLocaleString()}`,
          rawAmount: course.price,
          status: hasPending ? 'pending_verification' : 'unpaid',
          date: new Date(course.$createdAt).toLocaleDateString()
        });
      }
    }

    // 2. Unpaid Print Orders (status is 'quoting' and price > 0)
    const printOrders = await databases.listDocuments(DATABASE_ID, PRINT_ORDERS_COLLECTION, [
      Query.equal('userId', userId || ''),
      Query.equal('status', 'quoting'),
      Query.greaterThan('price', 0),
      Query.limit(100)
    ]);

    for (const orderDoc of printOrders.documents) {
      const order = orderDoc as any;
      unpaidInvoices.push({
        id: order.$id,
        type: 'printing',
        desc: `Print Order Quote: ${order.title}`,
        amount: `N ${order.price.toLocaleString()}`,
        rawAmount: order.price,
        status: 'unpaid',
        date: new Date(order.$createdAt).toLocaleDateString()
      });
    }

    res.status(200).json({ invoices: unpaidInvoices });
  } catch (err: any) {
    console.error('[Payments] Error fetching unpaid invoices:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// POST: Upload Receipt Screenshot (Base64)
// ──────────────────────────────────────────────────
router.post('/upload-receipt', authenticateJWT, async (req, res) => {
  const { file, filename } = req.body;

  if (!file || !filename) {
    return res.status(400).json({ error: 'File base64 content and filename are required.' });
  }

  try {
    const safeFilename = path.basename(String(filename)).replace(/[^a-zA-Z0-9._-]/g, '_');
    const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
    const fileExtension = path.extname(safeFilename).toLowerCase();

    if (!allowedExtensions.has(fileExtension)) {
      return res.status(400).json({ error: 'Only PNG, JPG, JPEG, and WEBP images are allowed.' });
    }

    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Receipt image must be 5MB or smaller.' });
    }
    const bucketId = 'certificates';

    // Save temporarily
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, `proof-${Date.now()}-${safeFilename}`);
    fs.writeFileSync(tempFilePath, buffer);

    // Upload to Appwrite
    const fileId = ID.unique();
    const fileUpload = await storage.createFile(
      bucketId,
      fileId,
      InputFile.fromPath(tempFilePath, safeFilename)
    );

    // Cleanup local temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (err) {
      console.warn('[Payments] Error unlinking temp file:', err);
    }

    const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
    const projectId = process.env.APPWRITE_PROJECT_ID || 'kennykentolamult';
    const publicUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileUpload.$id}/view?project=${projectId}`;

    res.status(200).json({ url: publicUrl });
  } catch (err: any) {
    console.error('[Payments] Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// POST: Submit a Bank Payment Slip
// ──────────────────────────────────────────────────
router.post('/submit', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  
  try {
    const payload = SubmitPaymentValidation.parse(req.body);

    // Create the Payment Document
    const payment = await databases.createDocument(
      DATABASE_ID,
      PAYMENTS_COLLECTION,
      ID.unique(),
      {
        userId,
        type: payload.type,
        referenceId: payload.referenceId,
        bankAccountId: payload.bankAccountId,
        amount: payload.amount,
        receiptImage: payload.receiptImage,
        referenceNumber: payload.referenceNumber,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    );

    // Post-Submit Actions
    if (payload.type === 'course') {
      // Create pending enrollment so course detail knows it's pending payment
      const existing = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
        Query.equal('userId', userId || ''),
        Query.equal('courseId', payload.referenceId),
        Query.limit(1)
      ]);

      if (existing.total === 0) {
        await databases.createDocument(DATABASE_ID, ENROLLMENTS_COLLECTION, ID.unique(), {
          userId,
          courseId: payload.referenceId,
          progress: 0,
          completedLessons: 0,
          lastLessonId: '',
          status: 'active',
          paymentStatus: 'verifying',
          enrolledAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await databases.updateDocument(DATABASE_ID, ENROLLMENTS_COLLECTION, existing.documents[0].$id, {
          paymentStatus: 'verifying',
          updatedAt: new Date().toISOString()
        });
      }
    } else if (payload.type === 'printing') {
      // Update print order status to quoting (but indicate payment sent or just keep track)
      // Actually, printing orders stay in 'quoting' or we can set status to 'quoting' with payment pending
      // The admin verification is what changes print order status to 'paid'.
    }

    res.status(201).json({
      message: 'Payment proof submitted successfully. Billing admin will review.',
      payment
    });
  } catch (err: any) {
    console.error('[Payments] Error submitting payment:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// GET: Fetch User Payment History
// ──────────────────────────────────────────────────
router.get('/history', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  try {
    const payments = await databases.listDocuments(DATABASE_ID, PAYMENTS_COLLECTION, [
      Query.equal('userId', userId || ''),
      Query.orderDesc('submittedAt'),
      Query.limit(50)
    ]);

    const payDocs = payments.documents as any[];

    // Batch pre-fetch banks and reference items to eliminate N+1 queries
    const [bankMap, itemMap] = await Promise.all([
      batchGetBankNames(),
      batchGetItemNames(payDocs)
    ]);

    // Batch fetch receipts for verified payments in one query
    const verifiedIds = payDocs.filter(p => p.status === 'verified').map(p => p.$id);
    const receiptMap = new Map<string, any>();
    if (verifiedIds.length > 0) {
      try {
        const receipts = await databases.listDocuments(DATABASE_ID, RECEIPTS_COLLECTION, [
          Query.equal('paymentId', verifiedIds),
          Query.limit(verifiedIds.length)
        ]);
        receipts.documents.forEach((r: any) => receiptMap.set(r.paymentId, r));
      } catch {}
    }

    const enriched = payDocs.map((payDoc: any) => ({
      id: payDoc.$id,
      type: payDoc.type,
      referenceId: payDoc.referenceId,
      bankName: bankMap.get(payDoc.bankAccountId) || 'Unknown Bank',
      amount: payDoc.amount,
      receiptImage: payDoc.receiptImage,
      referenceNumber: payDoc.referenceNumber,
      status: payDoc.status,
      submittedAt: payDoc.submittedAt || payDoc.$createdAt,
      rejectedReason: payDoc.rejectedReason || null,
      itemName: itemMap.get(payDoc.referenceId) || `Service Settle: ${payDoc.type}`,
      receiptPdfUrl: receiptMap.get(payDoc.$id)?.pdfUrl || null
    }));

    res.status(200).json({ payments: enriched });
  } catch (err: any) {
    console.error('[Payments] Error fetching history:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Fetch Pending Payments List
// ──────────────────────────────────────────────────
router.get('/admin/pending', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  try {
    const payments = await databases.listDocuments(DATABASE_ID, PAYMENTS_COLLECTION, [
      Query.equal('status', 'pending'),
      Query.orderDesc('submittedAt'),
      Query.limit(100)
    ]);

    const payDocs = payments.documents as any[];

    // Batch pre-fetch: user profiles, banks, and reference items
    const uniqueUserIds = [...new Set(payDocs.map(p => p.userId))];
    const [bankMap, itemMap] = await Promise.all([
      batchGetBankNames(),
      batchGetItemNames(payDocs)
    ]);

    // Batch fetch profiles
    const profileMap = new Map<string, any>();
    if (uniqueUserIds.length > 0) {
      try {
        const profiles = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION, [
          Query.equal('userId', uniqueUserIds),
          Query.limit(uniqueUserIds.length)
        ]);
        profiles.documents.forEach((p: any) => profileMap.set(p.userId, p));
      } catch {}
    }

    const enriched = payDocs.map((payDoc: any) => {
      const profile = profileMap.get(payDoc.userId);
      const clientName = profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown Client';
      const bankName = bankMap.get(payDoc.bankAccountId) || 'Unknown Bank';
      const itemName = itemMap.get(payDoc.referenceId) || `Service Settle: ${payDoc.type}`;
      return {
        id: payDoc.$id,
        invoiceId: payDoc.referenceId,
        clientName,
        amount: payDoc.amount,
        dateUploaded: new Date(payDoc.submittedAt || payDoc.$createdAt).toLocaleString(),
        details: `${bankName} Transfer Ref: ${payDoc.referenceNumber}`,
        receiptUrl: payDoc.receiptImage,
        type: payDoc.type
      };
    });

    res.status(200).json({ payments: enriched });
  } catch (err: any) {
    console.error('[Payments Admin] Error listing pending payments:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Verify a Manual Payment
// ──────────────────────────────────────────────────
router.post('/admin/:paymentId/verify', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { paymentId } = req.params;
  const adminId = req.user?.id || 'admin';

  try {
    const payment = (await databases.getDocument(DATABASE_ID, PAYMENTS_COLLECTION, paymentId)) as any;

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment is already processed.' });
    }

    // 1. Get Client Name
    const profile = await getProfileDoc(payment.userId);
    const clientName = profile ? `${(profile as any).firstName} ${(profile as any).lastName}` : 'Academy Student';

    // 2. Fetch Bank Account details
    let bankName = 'Bank Transfer';
    try {
      const bank = await databases.getDocument(DATABASE_ID, BANK_ACCOUNTS_COLLECTION, payment.bankAccountId);
      bankName = (bank as any).bankName;
    } catch {}

    const itemName = await getItemName(payment.type, payment.referenceId);

    // 3. Generate Receipt Number and Create Receipt
    const receiptNumber = `REC-${Date.now()}`;
    const dateString = new Date().toISOString().split('T')[0];

    // Generate Invoice PDF
    const pdfUrl = await generateAndUploadReceipt(
      receiptNumber,
      dateString,
      payment.amount,
      clientName,
      bankName,
      itemName
    );

    // Save Receipt Document
    await databases.createDocument(DATABASE_ID, RECEIPTS_COLLECTION, ID.unique(), {
      paymentId,
      receiptNumber,
      amount: payment.amount,
      paidBy: clientName,
      paymentMethod: bankName,
      date: new Date().toISOString(),
      pdfUrl
    });

    // 4. Update Payment Document status
    const updatedPayment = await databases.updateDocument(DATABASE_ID, PAYMENTS_COLLECTION, paymentId, {
      status: 'verified',
      verifiedBy: adminId,
      verifiedAt: new Date().toISOString()
    });

    // 5. Update Target Collection (Course Enrollment or Print Order)
    if (payment.type === 'course') {
      const enrollments = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
        Query.equal('userId', payment.userId),
        Query.equal('courseId', payment.referenceId),
        Query.limit(1)
      ]);

      if (enrollments.total > 0) {
        await databases.updateDocument(DATABASE_ID, ENROLLMENTS_COLLECTION, enrollments.documents[0].$id, {
          status: 'active',
          paymentStatus: 'paid',
          updatedAt: new Date().toISOString()
        });

        // Add to profile enrollments array
        if (profile) {
          const currentEnrolls = Array.isArray((profile as any).enrollments) ? (profile as any).enrollments : [];
          if (!currentEnrolls.includes(payment.referenceId)) {
            await databases.updateDocument(DATABASE_ID, PROFILES_COLLECTION, profile.$id, {
              enrollments: [...currentEnrolls, payment.referenceId]
            });
          }
        }
      }
    } else {
      // For all other dynamic modules (solar_jobs, print_orders, agency_projects, etc.)
      // the payment.type is the collection name itself!
      await databases.updateDocument(DATABASE_ID, payment.type, payment.referenceId, {
        status: 'paid',
        paymentId
      });
    }

    res.status(200).json({
      message: 'Payment verified successfully. Receipt generated.',
      payment: updatedPayment,
      pdfUrl
    });
  } catch (err: any) {
    console.error('[Payments Admin] Error verifying payment:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────
// ADMIN: Reject a Manual Payment
// ──────────────────────────────────────────────────
router.post('/admin/:paymentId/reject', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { paymentId } = req.params;
  const { reason = 'Transaction not found or invalid slip.' } = req.body;
  const adminId = req.user?.id || 'admin';

  try {
    const payment = (await databases.getDocument(DATABASE_ID, PAYMENTS_COLLECTION, paymentId)) as any;

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment is already processed.' });
    }

    // 1. Update Payment status
    const updatedPayment = await databases.updateDocument(DATABASE_ID, PAYMENTS_COLLECTION, paymentId, {
      status: 'rejected',
      rejectedReason: reason,
      verifiedBy: adminId,
      verifiedAt: new Date().toISOString()
    });

    // 2. Clear Pending Enrollments
    if (payment.type === 'course') {
      const enrollments = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION, [
        Query.equal('userId', payment.userId),
        Query.equal('courseId', payment.referenceId),
        Query.limit(1)
      ]);

      if (enrollments.total > 0) {
        // Delete pending enrollment
        await databases.deleteDocument(DATABASE_ID, ENROLLMENTS_COLLECTION, enrollments.documents[0].$id);
      }
    } else {
      // Revert status for dynamic modules
      await databases.updateDocument(DATABASE_ID, payment.type, payment.referenceId, {
        status: 'payment-failed'
      });
    }

    res.status(200).json({
      message: 'Payment rejected successfully.',
      payment: updatedPayment
    });
  } catch (err: any) {
    console.error('[Payments Admin] Error rejecting payment:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Generate Invoice Endpoint
router.post('/generate-invoice', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { customerName, customerEmail, items, dueDate } = req.body;
    if (!customerName || !customerEmail || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required invoice details' });
    }

    const totalAmount = items.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const invoiceNumber = `INV-${Math.floor(Date.now() / 1000)}`;
    const issueDate = new Date().toLocaleDateString();
    const finalDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();

    const invoiceUrl = await generateAndUploadInvoice(
      customerName,
      customerEmail,
      invoiceNumber,
      items,
      totalAmount,
      issueDate,
      finalDueDate
    );

    res.json({
      message: 'Invoice generated successfully',
      invoiceNumber,
      invoiceUrl,
      totalAmount
    });
  } catch (error: any) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate invoice' });
  }
});

export default router;
