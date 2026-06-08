import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'Super Admin',
  'Admin',
  'Instructor',
  'Student',
  'Client',
  'Project Manager',
  'Developer',
  'Designer',
  'Electrician',
  'Printer Operator',
  'Support Staff'
]);

export const RegisterValidation = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(2, 'First name is required').trim(),
  lastName: z.string().min(2, 'Last name is required').trim(),
  phoneNumber: z.string().optional(),
  role: UserRoleSchema.default('Student')
});

export const LoginValidation = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
});

export const SubmitPaymentValidation = z.object({
  type: z.enum(['course', 'agency_project', 'printing', 'solar_job', 'student_project', 'maintenance']),
  referenceId: z.string().min(1, 'Reference target ID is required'),
  bankAccountId: z.string().min(1, 'Bank account ID selection is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  receiptImage: z.string().url('Invalid receipt image attachment URL'),
  referenceNumber: z.string().min(5, 'Bank transfer session reference number is required').trim()
});

export const SubmitPrintOrderValidation = z.object({
  fileUrl: z.string().url('Uploaded file is required'),
  fileType: z.string().min(1, 'File type details required'),
  printingType: z.enum(['photocopy', 'book-printing', 'id-card', 'flyer', 'poster', 'invoice-design']),
  colorMode: z.enum(['mono', 'color']).default('mono'),
  paperSize: z.enum(['A4', 'A3', 'A5', 'custom']).default('A4'),
  doubleSided: z.boolean().default(false),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  coverType: z.string().optional(),
  shippingAddress: z.string().optional()
});

export const SolarJobRequestValidation = z.object({
  jobType: z.enum(['solar-installation', 'electrical-repair', 'home-wiring', 'inverter-setup']),
  description: z.string().min(10, 'Please describe the installation or repair job in detail (min 10 characters)'),
  address: z.string().min(5, 'Delivery/Site address is required')
});

export const CourseCreateValidation = z.object({
  title: z.string().min(5, 'Course title must be at least 5 characters').trim(),
  description: z.string().min(20, 'Please write a comprehensive description').trim(),
  price: z.number().min(0, 'Price must be 0 (free) or positive'),
  isPublished: z.boolean().default(false)
});

export const CreatePostValidation = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(5000, 'Post content cannot exceed 5000 characters').trim()
});

export const CreateCommentValidation = z.object({
  content: z.string().min(1, 'Comment content cannot be empty').max(2000, 'Comment content cannot exceed 2000 characters').trim()
});
