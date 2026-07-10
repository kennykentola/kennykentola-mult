import { databases, storage } from '../services/appwrite';
import { AppwriteException, Permission, Role, Query, ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const DATABASE_NAME = 'KennyKentola Multi-Company Database';

interface AttributeDef {
  key: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime';
  size?: number; // Required for strings
  required: boolean;
  defaultValue?: any;
  array?: boolean;
}

interface CollectionDef {
  id: string;
  name: string;
  attributes: AttributeDef[];
}

const defaultSiteSettings = [
  { key: 'price_pro_student', value: '5,000' },
  { key: 'price_bootcamp', value: '35,000' },
  { key: 'price_print_bw', value: '30' },
  { key: 'price_print_color', value: '80' },
  { key: 'price_binding', value: '500' },
  { key: 'price_id_card', value: '2,000' },
  { key: 'price_mvp', value: '150,000' },
  { key: 'price_website', value: '80,000' },
];

async function seedSiteSettingsData() {
  try {
    for (const setting of defaultSiteSettings) {
      const existing = await databases.listDocuments(DATABASE_ID, 'site_settings', [
        Query.equal('key', setting.key)
      ]);
      if (existing.documents.length === 0) {
        await databases.createDocument(DATABASE_ID, 'site_settings', ID.unique(), setting);
      }
    }
  } catch (e: any) {
    console.warn(`[Seed] Failed to seed site settings: ${e.message}`);
  }
}

const collections: CollectionDef[] = [
  {
    id: 'users_profile',
    name: 'Users Profile',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'email', type: 'string', size: 255, required: false },
      { key: 'firstName', type: 'string', size: 100, required: true },
      { key: 'lastName', type: 'string', size: 100, required: true },
      { key: 'phoneNumber', type: 'string', size: 30, required: false },
      { key: 'role', type: 'string', size: 50, required: true, defaultValue: 'Student' },
      { key: 'avatarUrl', type: 'string', size: 500, required: false },
      { key: 'purpose', type: 'string', size: 50, required: false, defaultValue: 'learn' },
      { key: 'emailNotifications', type: 'boolean', required: false, defaultValue: true },
      { key: 'smsNotifications', type: 'boolean', required: false, defaultValue: false },
      { key: 'enrollments', type: 'string', size: 50, required: false, array: true },
      { key: 'activeProjects', type: 'string', size: 50, required: false, array: true },
      { key: 'printOrders', type: 'string', size: 50, required: false, array: true },
      { key: 'clientType', type: 'string', size: 50, required: false, defaultValue: 'commercial' }
    ]
  },
  {
    id: 'courses',
    name: 'Courses',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'instructorId', type: 'string', size: 50, required: true },
      { key: 'instructorName', type: 'string', size: 100, required: false },
      { key: 'slug', type: 'string', size: 120, required: false },
      { key: 'category', type: 'string', size: 100, required: false },
      { key: 'level', type: 'string', size: 50, required: false },
      { key: 'summary', type: 'string', size: 1000, required: false },
      { key: 'coverImage', type: 'string', size: 500, required: false },
      { key: 'price', type: 'float', required: true, defaultValue: 0 },
      { key: 'isPublished', type: 'boolean', required: true, defaultValue: false },
      { key: 'lessonCount', type: 'integer', required: false, defaultValue: 0 }
    ]
  },
  {
    id: 'modules',
    name: 'Modules',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'order', type: 'integer', required: true, defaultValue: 1 },
      { key: 'isPublished', type: 'boolean', required: true, defaultValue: false }
    ]
  },
  {
    id: 'lessons',
    name: 'Lessons',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'moduleId', type: 'string', size: 50, required: false },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 10000, required: false },
      { key: 'videoUrl', type: 'string', size: 500, required: false },
      { key: 'order', type: 'integer', required: true },
      { key: 'durationMinutes', type: 'integer', required: false, defaultValue: 0 },
      { key: 'isPreview', type: 'boolean', required: false, defaultValue: false }
    ]
  },
  {
    id: 'course_enrollments',
    name: 'Course Enrollments',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'progress', type: 'integer', required: false, defaultValue: 0 },
      { key: 'completedLessons', type: 'integer', required: false, defaultValue: 0 },
      { key: 'lastLessonId', type: 'string', size: 50, required: false },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'active' },
      { key: 'paymentStatus', type: 'string', size: 50, required: true, defaultValue: 'free' },
      { key: 'enrolledAt', type: 'datetime', required: false },
      { key: 'updatedAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'live_classes',
    name: 'Live Classes',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'scheduledAt', type: 'datetime', required: true },
      { key: 'durationMinutes', type: 'integer', required: true },
      { key: 'meetingUrl', type: 'string', size: 1000, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'scheduled' },
      { key: 'reminderSent', type: 'boolean', required: false, defaultValue: false },
      { key: 'immediateSent', type: 'boolean', required: false, defaultValue: false }
    ]
  },
  {
    id: 'notifications',
    name: 'Notifications',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 2000, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'link', type: 'string', size: 1000, required: false },
      { key: 'isRead', type: 'boolean', required: true, defaultValue: false },
      { key: 'createdAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'assignments',
    name: 'Assignments',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'instructions', type: 'string', size: 5000, required: true },
      { key: 'dueDate', type: 'datetime', required: true },
      { key: 'maxPoints', type: 'integer', required: true, defaultValue: 100 }
    ]
  },
  {
    id: 'submissions',
    name: 'Submissions',
    attributes: [
      { key: 'assignmentId', type: 'string', size: 50, required: true },
      { key: 'studentId', type: 'string', size: 50, required: true },
      { key: 'fileUrls', type: 'string', size: 500, required: true, array: true },
      { key: 'studentNote', type: 'string', size: 1000, required: false },
      { key: 'pointsAwarded', type: 'integer', required: false },
      { key: 'feedback', type: 'string', size: 2000, required: false },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending' },
      { key: 'submittedAt', type: 'datetime', required: false },
      { key: 'updatedAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'print_orders',
    name: 'Print Orders',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'serviceType', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending' },
      { key: 'price', type: 'float', required: false, defaultValue: 0 },
      { key: 'quantity', type: 'integer', required: false, defaultValue: 1 },
      { key: 'paperSize', type: 'string', size: 20, required: false, defaultValue: 'A4' },
      { key: 'colorMode', type: 'string', size: 20, required: false, defaultValue: 'bw' },
      { key: 'sides', type: 'string', size: 20, required: false, defaultValue: 'single' },
      { key: 'bindingType', type: 'string', size: 50, required: false },
      { key: 'specialInstructions', type: 'string', size: 2000, required: false },
      { key: 'fileUrls', type: 'string', size: 500, required: false, array: true },
      { key: 'deliveryMethod', type: 'string', size: 50, required: false, defaultValue: 'pickup' },
      { key: 'estimatedReadyAt', type: 'datetime', required: false },
      { key: 'completedAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'print_messages',
    name: 'Print Messages',
    attributes: [
      { key: 'orderId', type: 'string', size: 50, required: true },
      { key: 'senderId', type: 'string', size: 50, required: true },
      { key: 'senderName', type: 'string', size: 150, required: true },
      { key: 'content', type: 'string', size: 5000, required: true },
      { key: 'fileUrl', type: 'string', size: 500, required: false },
      { key: 'timestamp', type: 'datetime', required: true }
    ]
  },
  {
    id: 'pod_catalog',
    name: 'Print-on-Demand Catalog',
    attributes: [
      { key: 'title', type: 'string', size: 150, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'imageUrl', type: 'string', size: 500, required: false },
      { key: 'category', type: 'string', size: 50, required: true },
      { key: 'basePrice', type: 'float', required: true },
      { key: 'status', type: 'string', size: 20, required: true, defaultValue: 'active' },
      { key: 'createdAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'pricing_config',
    name: 'Pricing Config',
    attributes: [
      { key: 'serviceType', type: 'string', size: 50, required: true },
      { key: 'label', type: 'string', size: 100, required: true },
      { key: 'pricePerUnit', type: 'float', required: true },
      { key: 'unit', type: 'string', size: 50, required: true, defaultValue: 'page' },
      { key: 'colorMultiplier', type: 'float', required: false, defaultValue: 1.5 },
      { key: 'doubleSidedDiscount', type: 'float', required: false, defaultValue: 0.8 },
      { key: 'isActive', type: 'boolean', required: true, defaultValue: true }
    ]
  },
  {
    id: 'certificates',
    name: 'Certificates',
    attributes: [
      { key: 'studentId', type: 'string', size: 50, required: true },
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'certificateNumber', type: 'string', size: 100, required: true },
      { key: 'issuedAt', type: 'datetime', required: true },
      { key: 'pdfUrl', type: 'string', size: 500, required: true }
    ]
  },
  {
    id: 'community_posts',
    name: 'Community Posts',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'authorName', type: 'string', size: 150, required: true },
      { key: 'content', type: 'string', size: 5000, required: true },
      { key: 'likesCount', type: 'integer', required: false, defaultValue: 0 },
      { key: 'commentsCount', type: 'integer', required: false, defaultValue: 0 },
      { key: 'createdAt', type: 'datetime', required: true },
      { key: 'likes', type: 'string', size: 50, required: false, array: true }
    ]
  },
  {
    id: 'student_workspaces',
    name: 'Student Workspaces',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'lessonId', type: 'string', size: 50, required: true },
      { key: 'language', type: 'string', size: 50, required: true },
      { key: 'code', type: 'string', size: 65535, required: false }
    ]
  },
  {
    id: 'community_comments',
    name: 'Community Comments',
    attributes: [
      { key: 'postId', type: 'string', size: 50, required: true },
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'authorName', type: 'string', size: 150, required: true },
      { key: 'content', type: 'string', size: 2000, required: true },
      { key: 'createdAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'solar_projects',
    name: 'Solar Projects',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'size', type: 'string', size: 255, required: true },
      { key: 'location', type: 'string', size: 255, required: true },
      { key: 'type', type: 'string', size: 100, required: true },
      { key: 'savings', type: 'string', size: 255, required: true },
      { key: 'image', type: 'string', size: 500, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'roi', type: 'string', size: 100, required: false },
      { key: 'co2Offset', type: 'string', size: 100, required: false },
      { key: 'gridIndependence', type: 'string', size: 100, required: false },
      { key: 'uptime', type: 'string', size: 100, required: false },
      { key: 'equipment', type: 'string', size: 255, required: false, array: true },
      { key: 'timeline', type: 'string', size: 255, required: false }
    ]
  },
  {
    id: 'bank_accounts',
    name: 'Bank Accounts',
    attributes: [
      { key: 'bankName', type: 'string', size: 100, required: true },
      { key: 'accountName', type: 'string', size: 100, required: true },
      { key: 'accountNumber', type: 'string', size: 50, required: true },
      { key: 'isActive', type: 'boolean', required: true, defaultValue: true }
    ]
  },
  {
    id: 'bank_accounts',
    name: 'Bank Accounts',
    attributes: [
      { key: 'bankName', type: 'string', size: 100, required: true },
      { key: 'accountName', type: 'string', size: 255, required: true },
      { key: 'accountNumber', type: 'string', size: 50, required: true },
      { key: 'isActive', type: 'boolean', required: true, defaultValue: true }
    ]
  },
  {
    id: 'payments',
    name: 'Payments',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'referenceId', type: 'string', size: 50, required: true },
      { key: 'bankAccountId', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'receiptImage', type: 'string', size: 500, required: true },
      { key: 'referenceNumber', type: 'string', size: 100, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending' },
      { key: 'verifiedBy', type: 'string', size: 50, required: false },
      { key: 'verifiedAt', type: 'datetime', required: false },
      { key: 'rejectedReason', type: 'string', size: 1000, required: false },
      { key: 'submittedAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'receipts',
    name: 'Receipts',
    attributes: [
      { key: 'paymentId', type: 'string', size: 50, required: true },
      { key: 'receiptNumber', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'paidBy', type: 'string', size: 255, required: true },
      { key: 'paymentMethod', type: 'string', size: 50, required: true, defaultValue: 'Bank Transfer' },
      { key: 'date', type: 'datetime', required: false },
      { key: 'pdfUrl', type: 'string', size: 500, required: true }
    ]
  },
  {
    id: 'projects',
    name: 'Projects',
    attributes: [
      { key: 'clientId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'budget', type: 'float', required: false, defaultValue: 0 },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'requested' },
      { key: 'pmId', type: 'string', size: 50, required: false },
      { key: 'pmName', type: 'string', size: 255, required: false },
      { key: 'developers', type: 'string', size: 50, required: false, array: true },
      { key: 'designers', type: 'string', size: 50, required: false, array: true }
    ]
  },
  {
    id: 'project_messages',
    name: 'Project Messages',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'senderId', type: 'string', size: 50, required: true },
      { key: 'senderName', type: 'string', size: 150, required: true },
      { key: 'content', type: 'string', size: 5000, required: true },
      { key: 'fileUrl', type: 'string', size: 500, required: false },
      { key: 'createdAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'project_assets',
    name: 'Project Assets',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'uploadedBy', type: 'string', size: 50, required: true },
      { key: 'uploaderName', type: 'string', size: 150, required: true },
      { key: 'fileName', type: 'string', size: 255, required: true },
      { key: 'fileUrl', type: 'string', size: 1000, required: true },
      { key: 'fileType', type: 'string', size: 50, required: false },
      { key: 'createdAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'project_milestones',
    name: 'Project Milestones',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'dueDate', type: 'datetime', required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending' },
      { key: 'completedAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'tickets',
    name: 'Tickets',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'projectOrContractId', type: 'string', size: 50, required: false },
      { key: 'subject', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'priority', type: 'string', size: 50, required: true, defaultValue: 'medium' },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'open' },
      { key: 'assignedTo', type: 'string', size: 50, required: false }
    ]
  },
  {
    id: 'chat_rooms',
    name: 'Chat Rooms',
    attributes: [
      { key: 'type', type: 'string', size: 50, required: true, defaultValue: 'direct' },
      { key: 'participants', type: 'string', size: 50, required: true, array: true },
      { key: 'lastMessageId', type: 'string', size: 50, required: false },
      { key: 'lastMessageText', type: 'string', size: 500, required: false },
      { key: 'lastMessageTime', type: 'datetime', required: false }
    ]
  },
  {
    id: 'chat_messages',
    name: 'Chat Messages',
    attributes: [
      { key: 'roomId', type: 'string', size: 50, required: true },
      { key: 'senderId', type: 'string', size: 50, required: true },
      { key: 'type', type: 'string', size: 50, required: true, defaultValue: 'text' },
      { key: 'content', type: 'string', size: 5000, required: true },
      { key: 'fileId', type: 'string', size: 100, required: false },
      { key: 'readBy', type: 'string', size: 50, required: false, array: true }
    ]
  },
  {
    id: 'lesson_progress',
    name: 'Lesson Progress',
    attributes: [
      { key: 'studentId', type: 'string', size: 50, required: true },
      { key: 'lessonId', type: 'string', size: 50, required: true },
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'isCompleted', type: 'boolean', required: true, defaultValue: false },
      { key: 'lastPosition', type: 'integer', required: false, defaultValue: 0 },
      { key: 'completedAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'quizzes',
    name: 'Quizzes',
    attributes: [
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
      { key: 'passingScore', type: 'integer', required: true, defaultValue: 70 },
      { key: 'order', type: 'integer', required: false, defaultValue: 1 },
      { key: 'isPublished', type: 'boolean', required: true, defaultValue: false }
    ]
  },
  {
    id: 'quiz_questions',
    name: 'Quiz Questions',
    attributes: [
      { key: 'quizId', type: 'string', size: 50, required: true },
      { key: 'question', type: 'string', size: 2000, required: true },
      { key: 'optionA', type: 'string', size: 500, required: true },
      { key: 'optionB', type: 'string', size: 500, required: true },
      { key: 'optionC', type: 'string', size: 500, required: false },
      { key: 'optionD', type: 'string', size: 500, required: false },
      { key: 'correctOption', type: 'string', size: 1, required: true },
      { key: 'points', type: 'integer', required: false, defaultValue: 1 },
      { key: 'order', type: 'integer', required: false, defaultValue: 1 }
    ]
  },
  {
    id: 'quiz_attempts',
    name: 'Quiz Attempts',
    attributes: [
      { key: 'quizId', type: 'string', size: 50, required: true },
      { key: 'studentId', type: 'string', size: 50, required: true },
      { key: 'courseId', type: 'string', size: 50, required: true },
      { key: 'score', type: 'integer', required: true, defaultValue: 0 },
      { key: 'maxScore', type: 'integer', required: true, defaultValue: 0 },
      { key: 'passed', type: 'boolean', required: true, defaultValue: false },
      { key: 'answersJson', type: 'string', size: 10000, required: false },
      { key: 'completedAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'authorName', type: 'string', size: 150, required: true },
      { key: 'courseId', type: 'string', size: 50, required: false },
      { key: 'content', type: 'string', size: 2000, required: true },
      { key: 'rating', type: 'integer', required: true, defaultValue: 5 },
      { key: 'isApproved', type: 'boolean', required: true, defaultValue: false },
      { key: 'createdAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'user_activity_logs',
    name: 'User Activity Logs',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'action', type: 'string', size: 100, required: true },
      { key: 'resourceType', type: 'string', size: 50, required: false },
      { key: 'resourceId', type: 'string', size: 50, required: false },
      { key: 'timestamp', type: 'datetime', required: true }
    ]
  },
  {
    id: 'academic_ideas',
    name: 'Academic Ideas',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'category', type: 'string', size: 100, required: false, defaultValue: 'General' },
      { key: 'status', type: 'string', size: 50, required: false, defaultValue: 'active' },
      { key: 'retentionPeriod', type: 'string', size: 50, required: false, defaultValue: '1 year' },
      { key: 'createdAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'instructor_payouts',
    name: 'Instructor Payouts',
    attributes: [
      { key: 'instructorId', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending' },
    ]
  },
  {
    id: 'newsletter_subscribers',
    name: 'Newsletter Subscribers',
    attributes: [
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'subscribedAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'media_providers',
    name: 'Media Providers',
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'type', type: 'string', size: 50, required: true }, // 'text' or 'image'
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'active' }, // 'active', 'dead', 'cooldown'
      { key: 'priority', type: 'integer', required: true, defaultValue: 10 },
      { key: 'maxRequests', type: 'integer', required: true, defaultValue: 5 },
      { key: 'currentRequests', type: 'integer', required: true, defaultValue: 0 },
    ]
  },
  {
    id: 'media_api_keys',
    name: 'Media API Keys',
    attributes: [
      { key: 'providerId', type: 'string', size: 50, required: true },
      { key: 'encryptedKey', type: 'string', size: 2000, required: true }
    ]
  },
  {
    id: 'ai_generated_assets',
    name: 'AI Generated Assets',
    attributes: [
      { key: 'imageUrl', type: 'string', size: 1000, required: false },
      { key: 'contentText', type: 'string', size: 10000, required: false },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'preview' }, // preview, published, deleted
      { key: 'providerUsed', type: 'string', size: 100, required: false },
      { key: 'createdAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'solar_jobs',
    name: 'Solar Jobs',
    attributes: [
      { key: 'clientId', type: 'string', size: 50, required: true },
      { key: 'jobType', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending-quote' },
      { key: 'assignedTechnicians', type: 'string', size: 50, required: false, array: true },
      { key: 'quotePrice', type: 'float', required: false, defaultValue: 0 },
      { key: 'scheduledDate', type: 'datetime', required: false },
      { key: 'address', type: 'string', size: 1000, required: true },
      { key: 'paymentId', type: 'string', size: 50, required: false },
      { key: 'siteImageUrls', type: 'string', size: 1000, required: false, array: true }
    ]
  },
  {
    id: 'student_projects',
    name: 'Student Projects',
    attributes: [
      { key: 'studentId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'universityName', type: 'string', size: 255, required: false },
      { key: 'department', type: 'string', size: 255, required: false },
      { key: 'degree', type: 'string', size: 100, required: false },
      { key: 'level', type: 'string', size: 50, required: false },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending-proposal' },
      { key: 'assignedDeveloper', type: 'string', size: 50, required: false },
      { key: 'price', type: 'float', required: true, defaultValue: 0 },
      { key: 'proposalUrl', type: 'string', size: 500, required: false },
      { key: 'documentationUrl', type: 'string', size: 500, required: false },
      { key: 'sourceCodeUrl', type: 'string', size: 500, required: false },
      { key: 'paymentId', type: 'string', size: 50, required: false },
      { key: 'serviceScope', type: 'string', size: 100, required: false, defaultValue: 'Full Process' },
      { key: 'initialDocumentUrl', type: 'string', size: 1000, required: false }
    ]
  },
  {
    id: 'maintenance_contracts',
    name: 'Maintenance Contracts',
    attributes: [
      { key: 'clientId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'serviceType', type: 'string', size: 100, required: true },
      { key: 'frequency', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending' },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: false },
      { key: 'amount', type: 'float', required: true }
    ]
  },
  {
    id: 'agency_projects',
    name: 'Software Agency Projects',
    attributes: [
      { key: 'clientId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'projectType', type: 'string', size: 100, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending-quote' },
      { key: 'budget', type: 'float', required: false },
      { key: 'quotePrice', type: 'float', required: false },
      { key: 'deadline', type: 'datetime', required: false },
      { key: 'paymentId', type: 'string', size: 50, required: false },
      { key: 'pipelineStage', type: 'string', size: 50, required: false, defaultValue: 'Lead' },
      { key: 'pmId', type: 'string', size: 50, required: false },
      { key: 'assignedTeam', type: 'string', size: 50, required: false, array: true }
    ]
  },
  {
    id: 'agency_contracts',
    name: 'Agency Contracts',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'clientId', type: 'string', size: 50, required: true },
      { key: 'contentUrl', type: 'string', size: 500, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'pending' },
      { key: 'signedAt', type: 'datetime', required: false },
      { key: 'amount', type: 'float', required: false }
    ]
  },
  {
    id: 'agency_invoices',
    name: 'Agency Invoices',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'clientId', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'dueDate', type: 'datetime', required: false },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'unpaid' },
      { key: 'paymentId', type: 'string', size: 50, required: false }
    ]
  },
  {
    id: 'team_sprints',
    name: 'Team Sprints',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'startDate', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'active' }
    ]
  },
  {
    id: 'team_tasks',
    name: 'Team Tasks',
    attributes: [
      { key: 'projectId', type: 'string', size: 50, required: true },
      { key: 'sprintId', type: 'string', size: 50, required: false },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: false },
      { key: 'assigneeId', type: 'string', size: 50, required: false },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'todo' },
      { key: 'priority', type: 'string', size: 50, required: false, defaultValue: 'medium' },
      { key: 'storyPoints', type: 'integer', required: false, defaultValue: 0 }
    ]
  },
  {
    id: 'newsletter_subscribers',
    name: 'Newsletter Subscribers',
    attributes: [
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'segment', type: 'string', size: 50, required: false, defaultValue: 'general' },
      { key: 'subscribedAt', type: 'datetime', required: true }
    ]
  },
  {
    id: 'project_portfolio',
    name: 'Project Portfolio',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: false },
      { key: 'url', type: 'string', size: 500, required: false },
      { key: 'imageUrl', type: 'string', size: 500, required: false },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'active' },
      { key: 'createdAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'thesis_samples',
    name: 'Thesis Samples',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 65535, required: true },
      { key: 'category', type: 'string', size: 100, required: false },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'active' },
      { key: 'createdAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'design_portfolio',
    name: 'Design Portfolio',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'subtitle', type: 'string', size: 255, required: false },
      { key: 'imageUrl', type: 'string', size: 500, required: true },
      { key: 'status', type: 'string', size: 50, required: true, defaultValue: 'active' },
      { key: 'createdAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'blog_posts',
    name: 'Blog Posts',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'slug', type: 'string', size: 120, required: true },
      { key: 'excerpt', type: 'string', size: 500, required: false },
      { key: 'content', type: 'string', size: 65535, required: true },
      { key: 'category', type: 'string', size: 100, required: false, defaultValue: 'General' },
      { key: 'coverImageId', type: 'string', size: 100, required: false },
      { key: 'authorName', type: 'string', size: 100, required: true },
      { key: 'isPublished', type: 'boolean', required: true, defaultValue: false },
      { key: 'publishedAt', type: 'datetime', required: false }
    ]
  },
  {
    id: 'site_settings',
    name: 'Site Settings',
    attributes: [
      { key: 'key', type: 'string', size: 100, required: true },
      { key: 'value', type: 'string', size: 10000, required: true }
    ]
  }
];

// Sleep Helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const academySeedCourses = [
  {
    id: 'nextjs-15',
    title: 'Full-Stack React and Next.js 15',
    description:
      'Master the App Router, Server Components, Server Actions, Suspense, and middleware with Appwrite integration.',
    instructorId: 'kenny-kentola',
    instructorName: 'Kenny Kentola',
    slug: 'full-stack-react-nextjs-15',
    category: 'Frontend',
    level: 'Intermediate',
    summary: 'Build modern production React applications with the App Router and Appwrite-backed workflows.',
    coverImage: '',
    price: 0,
    isPublished: true,
    lessonCount: 3
  },
  {
    id: 'python-django',
    title: 'Python and Django Backend Masterclass',
    description:
      'Build scalable APIs, configure Docker containers, and implement secure JWT authentication systems.',
    instructorId: 'sarah-jenkins',
    instructorName: 'Sarah Jenkins',
    slug: 'python-django-backend-masterclass',
    category: 'Backend',
    level: 'Intermediate',
    summary: 'Learn API architecture, authentication, and deployment-friendly backend patterns.',
    coverImage: '',
    price: 15000,
    isPublished: true,
    lessonCount: 3
  },
  {
    id: 'mobile-expo',
    title: 'React Native and Expo Go Mobile Development',
    description:
      'Design native iOS and Android apps with shared code, offline storage, and push notifications.',
    instructorId: 'kenny-kentola',
    instructorName: 'Kenny Kentola',
    slug: 'react-native-expo-go-mobile-development',
    category: 'Mobile',
    level: 'Beginner',
    summary: 'Create polished cross-platform mobile apps with Expo and React Native.',
    coverImage: '',
    price: 199,
    isPublished: true,
    lessonCount: 3
  }
];

const academySeedLessons = [
  {
    id: 'nextjs-15-lesson-1',
    courseId: 'nextjs-15',
    title: 'App Router Foundation and Project Setup',
    content: 'Set up the project structure, app routing layout, and shared workspace patterns.',
    videoUrl: 'https://www.youtube.com/embed/843nec-IvW0',
    order: 1,
    durationMinutes: 32,
    isPreview: true
  },
  {
    id: 'nextjs-15-lesson-2',
    courseId: 'nextjs-15',
    title: 'Server Components and Data Fetching',
    content: 'Understand server components, async data fetching, and rendering patterns.',
    videoUrl: 'https://www.youtube.com/embed/843nec-IvW0',
    order: 2,
    durationMinutes: 38,
    isPreview: false
  },
  {
    id: 'nextjs-15-lesson-3',
    courseId: 'nextjs-15',
    title: 'Server Actions and Mutations',
    content: 'Wire form submissions and mutations through server actions and Appwrite.',
    videoUrl: 'https://www.youtube.com/embed/843nec-IvW0',
    order: 3,
    durationMinutes: 41,
    isPreview: false
  },
  {
    id: 'python-django-lesson-1',
    courseId: 'python-django',
    title: 'Backend Planning and Environment Setup',
    content: 'Define the backend architecture, install dependencies, and configure Docker.',
    videoUrl: 'https://www.youtube.com/embed/F5mRW0jo-U4',
    order: 1,
    durationMinutes: 30,
    isPreview: true
  },
  {
    id: 'python-django-lesson-2',
    courseId: 'python-django',
    title: 'Building REST APIs with Django',
    content: 'Create reusable serializers, routers, and secure API endpoints.',
    videoUrl: 'https://www.youtube.com/embed/F5mRW0jo-U4',
    order: 2,
    durationMinutes: 36,
    isPreview: false
  },
  {
    id: 'python-django-lesson-3',
    courseId: 'python-django',
    title: 'JWT Authentication and Deployment',
    content: 'Implement JWT login flows and prep the service for deployment.',
    videoUrl: 'https://www.youtube.com/embed/F5mRW0jo-U4',
    order: 3,
    durationMinutes: 44,
    isPreview: false
  },
  {
    id: 'mobile-expo-lesson-1',
    courseId: 'mobile-expo',
    title: 'Expo Project Foundation',
    content: 'Set up a cross-platform workspace and mobile navigation structure.',
    videoUrl: 'https://www.youtube.com/embed/ZBCUegTZF7M',
    order: 1,
    durationMinutes: 28,
    isPreview: true
  },
  {
    id: 'mobile-expo-lesson-2',
    courseId: 'mobile-expo',
    title: 'Shared UI Components and State',
    content: 'Build reusable mobile screens, state containers, and form patterns.',
    videoUrl: 'https://www.youtube.com/embed/ZBCUegTZF7M',
    order: 2,
    durationMinutes: 34,
    isPreview: false
  },
  {
    id: 'mobile-expo-lesson-3',
    courseId: 'mobile-expo',
    title: 'Offline Storage and Push Notifications',
    content: 'Wire up offline persistence and notification hooks for production apps.',
    videoUrl: 'https://www.youtube.com/embed/ZBCUegTZF7M',
    order: 3,
    durationMinutes: 40,
    isPreview: false
  }
];

const academySeedAssignments = [
  {
    id: 'nextjs-15-assignment-1',
    courseId: 'nextjs-15',
    title: 'Build a Student Dashboard',
    instructions:
      'Create a dashboard that includes profile details, progress cards, and a responsive lesson sidebar. Focus on accessibility and component reuse.',
    dueDate: '2026-06-12T18:00:00.000Z',
    maxPoints: 100
  },
  {
    id: 'python-django-assignment-1',
    courseId: 'python-django',
    title: 'Design a Secure API Auth Flow',
    instructions:
      'Implement login, JWT refresh handling, and protected routes for a Django REST API. Document the request/response flow.',
    dueDate: '2026-06-14T18:00:00.000Z',
    maxPoints: 100
  },
  {
    id: 'mobile-expo-assignment-1',
    courseId: 'mobile-expo',
    title: 'Create a Mobile Lesson Player',
    instructions:
      'Build a simple mobile lesson player with tabs for lesson notes, progress tracking, and offline-ready UI states.',
    dueDate: '2026-06-15T18:00:00.000Z',
    maxPoints: 100
  }
];

const academySeedLiveClasses = [
  {
    id: 'nextjs-15-live-1',
    courseId: 'nextjs-15',
    title: 'Next.js App Router Live Review',
    scheduledAt: '2026-06-09T16:00:00.000Z',
    durationMinutes: 90,
    meetingUrl: 'https://meet.google.com/nextjs-15-review',
    status: 'scheduled'
  },
  {
    id: 'python-django-live-1',
    courseId: 'python-django',
    title: 'Django API Debug Lab',
    scheduledAt: '2026-06-11T16:00:00.000Z',
    durationMinutes: 75,
    meetingUrl: 'https://meet.google.com/python-django-lab',
    status: 'scheduled'
  },
  {
    id: 'mobile-expo-live-1',
    courseId: 'mobile-expo',
    title: 'Mobile UI Build Along',
    scheduledAt: '2026-06-13T16:00:00.000Z',
    durationMinutes: 80,
    meetingUrl: 'https://meet.google.com/mobile-expo-build',
    status: 'scheduled'
  }
];

async function ensureDocument(collectionId: string, documentId: string, payload: Record<string, any>) {
  try {
    await databases.getDocument(DATABASE_ID, collectionId, documentId);
  } catch (err) {
    const { id, ...data } = payload;
    try {
      await databases.createDocument(DATABASE_ID, collectionId, documentId, data);
    } catch (createErr: any) {
      console.warn(`[Seed] Failed to create document ${documentId} in ${collectionId}. Ignoring. Error: ${createErr.message}`);
    }
  }
  await sleep(200);
}

async function seedAcademyContent() {
  for (const course of academySeedCourses) {
    await ensureDocument('courses', course.id, course);
  }

  for (const lesson of academySeedLessons) {
    await ensureDocument('lessons', lesson.id, lesson);
  }

  for (const assignment of academySeedAssignments) {
    await ensureDocument('assignments', assignment.id, assignment);
  }

  for (const liveClass of academySeedLiveClasses) {
    await ensureDocument('live_classes', liveClass.id, liveClass);
  }
}

const seedBankAccounts = [
  {
    id: 'uba-bank',
    bankName: 'UBA Bank Nigeria',
    accountName: 'Ademola Peter Kehinde',
    accountNumber: '2241496332',
    isActive: true
  },
  {
    id: 'wema-bank',
    bankName: 'Wema Bank Nigeria',
    accountName: 'Ademola Peter Kehinde',
    accountNumber: '04000538337',
    isActive: true
  }
];

async function seedBankAccountsData() {
  for (const bank of seedBankAccounts) {
    await ensureDocument('bank_accounts', bank.id, bank);
  }
}

const seedSolarProjectsData = [
  {
    id: '1',
    title: 'Lekki Tech Hub',
    size: '150kW Solar + 200kWh Storage',
    location: 'Lagos, NG',
    type: 'Commercial',
    savings: '₦4.5M/mo',
    image: '/images/solar/project-lekki.jpg',
    description: 'A complete commercial energy overhaul for one of Lagos fastest growing technology hubs. The client required absolute zero-downtime to support their server infrastructure and 24/7 co-working operations.',
    roi: '18 Months',
    co2Offset: '125 Tons/Year',
    gridIndependence: '92%',
    uptime: '99.99%',
    equipment: [
      '300x 500W Tier-1 Monocrystalline Panels',
      '4x 50kW Hybrid Inverters',
      '200kWh LiFePO4 Battery Rack',
      'Smart Telemetry Gateway'
    ],
    timeline: 'Completed in 3 Weeks'
  },
  {
    id: '2',
    title: 'Manufacturing Plant',
    size: '500kW Industrial Array',
    location: 'Ibadan, NG',
    type: 'Industrial',
    savings: '₦12M/mo',
    image: '/images/solar/project-factory.jpg',
    description: 'A massive industrial deployment designed to significantly reduce the operational expenditure (OPEX) of a heavy manufacturing facility reliant on diesel generators.',
    roi: '24 Months',
    co2Offset: '450 Tons/Year',
    gridIndependence: '75%',
    uptime: '99.9%',
    equipment: [
      '1000x 500W Tier-1 Monocrystalline Panels',
      '10x 50kW Industrial String Inverters',
      'Synchronized Diesel Generator Controller',
      'Heavy-duty DC Cabling & Switchgear'
    ],
    timeline: 'Completed in 6 Weeks'
  },
  {
    id: '3',
    title: 'Private Estate',
    size: '50kW Hybrid System',
    location: 'Abuja, NG',
    type: 'Residential',
    savings: '₦1.2M/mo',
    image: '/images/solar/project-estate.jpg',
    description: 'Premium residential deployment for a luxury multi-unit estate. The system operates autonomously, switching seamlessly between solar, battery, and grid power without flickering.',
    roi: '36 Months',
    co2Offset: '45 Tons/Year',
    gridIndependence: '95%',
    uptime: '100%',
    equipment: [
      '100x 500W Premium All-Black Panels',
      '2x 25kW Hybrid Inverters',
      '100kWh Stackable Battery Modules',
      'Mobile App Monitoring'
    ],
    timeline: 'Completed in 2 Weeks'
  }
];

async function seedSolarProjects() {
  for (const project of seedSolarProjectsData) {
    await ensureDocument('solar_projects', project.id, project);
  }
}

async function ensureBucket(bucketId: string, bucketName: string, permissions?: string[]) {
  try {
    await storage.getBucket(bucketId);
    console.log(`[Storage] Bucket '${bucketId}' found.`);
  } catch (err) {
    console.log(`[Storage] Bucket '${bucketId}' not found. Creating...`);
    try {
      await storage.createBucket(bucketId, bucketName, permissions);
    } catch (createErr: any) {
      console.warn(`[Storage] Failed to create bucket '${bucketId}':`, createErr.message);
    }
  }
}

async function waitForAttribute(collectionId: string, attributeKey: string) {
  let attempts = 0;
  while (attempts < 30) {
    try {
      const attr = await databases.getAttribute(DATABASE_ID, collectionId, attributeKey);
      if (attr.status === 'available') {
        return;
      }
      if (attr.status === 'failed') {
        throw new Error(`Attribute '${attributeKey}' in '${collectionId}' failed initialization.`);
      }
    } catch (err: any) {
      // appwrite is registering schema
    }
    await sleep(800);
    attempts++;
  }
  throw new Error(`Timed out waiting for attribute '${attributeKey}' in collection '${collectionId}'`);
}

function getAttributeDefaultValue(attr: AttributeDef) {
  return attr.required ? undefined : attr.defaultValue;
}

export async function initializeDatabase() {
  console.log('[Appwrite Init] Starting initialization sequence...');
  
  // 1. Create Database if missing
  try {
    await databases.get(DATABASE_ID);
    console.log(`[Appwrite Init] Database '${DATABASE_ID}' found.`);
  } catch (err: any) {
    if (err.code === 404) {
      console.log(`[Appwrite Init] Database '${DATABASE_ID}' not found. Creating...`);
      await databases.create(DATABASE_ID, DATABASE_NAME);
      await sleep(1000);
    } else {
      console.warn(`[Appwrite Init] Failed to fetch database. Ignoring to prevent crash. Error: ${err.message}`);
    }
  }

  // 2. Build collections and attributes
  for (const colDef of collections) {
    console.log(`\n--------------------------------------------\n[Collection] Initializing: ${colDef.name} (${colDef.id})`);
    
    let exists = false;
    try {
      await databases.getCollection(DATABASE_ID, colDef.id);
      exists = true;
      console.log(`[Collection] Collection "${colDef.id}" already exists. Skipping creation.`);
    } catch (err: any) {
      if (err.code !== 404) {
        console.warn(`[Collection] Failed to fetch collection "${colDef.id}". Skipping. Error: ${err.message}`);
        continue;
      }
    }

    if (!exists) {
      await databases.createCollection(DATABASE_ID, colDef.id, colDef.name, [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]);
      await sleep(500);
    } else {
      // Update permissions for existing collections
      try {
        await databases.updateCollection(DATABASE_ID, colDef.id, colDef.name, [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]);
      } catch (e: any) {
        console.warn(`[Collection] Failed to update permissions for "${colDef.id}". Ignoring. Error: ${e.message}`);
      }
      await sleep(500);
    }

    for (const attr of colDef.attributes) {
      try {
        await databases.getAttribute(DATABASE_ID, colDef.id, attr.key);
        console.log(`  [Attribute] "${attr.key}" already exists. Skipping.`);
      } catch (err: any) {
        if (err.code !== 404) {
          console.warn(`  [Attribute] Failed to fetch attribute "${attr.key}". Skipping to prevent crash. Error: ${err.message}`);
          continue;
        }

        console.log(`  [Attribute] Creating "${attr.key}" (Type: ${attr.type}, Array: ${!!attr.array})...`);
        try {
          if (attr.type === 'string') {
            await databases.createStringAttribute(DATABASE_ID, colDef.id, attr.key, attr.size || 255, attr.required, getAttributeDefaultValue(attr), attr.array);
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(DATABASE_ID, colDef.id, attr.key, attr.required, undefined, undefined, getAttributeDefaultValue(attr), attr.array);
          } else if (attr.type === 'float') {
            await databases.createFloatAttribute(DATABASE_ID, colDef.id, attr.key, attr.required, undefined, undefined, getAttributeDefaultValue(attr), attr.array);
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(DATABASE_ID, colDef.id, attr.key, attr.required, getAttributeDefaultValue(attr), attr.array);
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(DATABASE_ID, colDef.id, attr.key, attr.required, getAttributeDefaultValue(attr), attr.array);
          }
          await waitForAttribute(colDef.id, attr.key);
        } catch (createErr: any) {
          if (
            createErr.code === 409 ||
            createErr.message?.includes('already exists') ||
            createErr.type?.includes('already_exists')
          ) {
            console.log(`  [Attribute] "${attr.key}" already exists or is being created. Skipping.`);
          } else if (
            createErr.code === 400 &&
            (createErr.type === 'attribute_limit_exceeded' || createErr.message?.includes('maximum number or size of attributes'))
          ) {
            console.warn(`  [Attribute] "${attr.key}" skipped because collection '${colDef.id}' reached Appwrite's attribute limit.`);
          } else {
            throw createErr;
          }
        }
      }
      
      // Throttle attribute checking to prevent overwhelming the Appwrite API
      await sleep(50);
    }
    console.log(`[Collection] "${colDef.id}" processing completed.`);
  }

  await seedAcademyContent();
  console.log('[Appwrite Init] Academy seed content ensured.');

  await seedBankAccountsData();
  console.log('[Appwrite Init] Bank accounts seed content ensured.');

  await seedSiteSettingsData();
  console.log('[Appwrite Init] Site settings seed content ensured.');

  await seedSolarProjects();
  console.log('[Appwrite Init] Solar projects seed content ensured.');

  await ensureBucket('certificates', 'Student Certificates', [
    Permission.read(Role.any())
  ]);
  console.log('[Appwrite Init] Certificates storage bucket verified/created.');

  // We are using Cloudinary for additional file uploads to bypass Appwrite's 3-bucket limit.
  // The 'certificates' bucket is still created above.
}

if (require.main === module) {
  initializeDatabase()
    .then(() => console.log('\n[Appwrite Init] Database setup finished.'))
    .catch((err) => console.error('[Appwrite Init] Failed:', err));
}
