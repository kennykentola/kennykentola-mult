export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Instructor'
  | 'Student'
  | 'Client'
  | 'Project Manager'
  | 'Developer'
  | 'Designer'
  | 'Electrician'
  | 'Printer Operator'
  | 'Support Staff';

export interface UserProfile {
  $id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Course {
  $id?: string;
  title: string;
  description: string;
  instructorId: string;
  coverImage?: string;
  price: number;
  isPublished: boolean;
  category?: string;
  summary?: string;
  level?: string;
}

export interface Lesson {
  $id?: string;
  courseId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  order: number;
}

export interface LiveClass {
  $id?: string;
  courseId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl: string;
  status: 'scheduled' | 'active' | 'completed';
}

export interface Assignment {
  $id?: string;
  courseId: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxPoints: number;
}

export interface Submission {
  $id?: string;
  assignmentId: string;
  studentId: string;
  fileUrls: string[];
  studentNote?: string;
  pointsAwarded?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface Project {
  $id?: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  status: 'requested' | 'estimation' | 'in-progress' | 'completed' | 'cancelled';
  pmId?: string;
  developers?: string[];
  designers?: string[];
}

export interface ProjectMilestone {
  $id?: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'completed';
  completedAt?: string;
}

export interface PrintOrder {
  $id?: string;
  userId: string;
  fileUrl: string;
  fileType: string;
  printingType: 'photocopy' | 'book-printing' | 'id-card' | 'flyer' | 'poster' | 'invoice-design';
  colorMode: 'mono' | 'color';
  paperSize: 'A4' | 'A3' | 'A5' | 'custom';
  doubleSided: boolean;
  quantity: number;
  coverType?: string;
  status: 'pending' | 'quoting' | 'paid' | 'printing' | 'completed' | 'delivered';
  quotePrice: number;
  shippingAddress?: string;
  paymentId?: string;
}

export interface StudentProject {
  $id?: string;
  studentId: string;
  title: string;
  description: string;
  universityName?: string;
  department?: string;
  degree?: string;
  level?: string;
  status: 'pending-proposal' | 'proposal-approved' | 'document-drafting' | 'code-development' | 'completed';
  assignedDeveloper?: string;
  price: number;
  proposalUrl?: string;
  documentationUrl?: string;
  sourceCodeUrl?: string;
  paymentId?: string;
}

export interface SolarJob {
  $id?: string;
  clientId: string;
  jobType: 'solar-installation' | 'electrical-repair' | 'home-wiring' | 'inverter-setup';
  description: string;
  status: 'pending-quote' | 'quoted' | 'paid' | 'in-progress' | 'completed' | 'cancelled';
  assignedTechnicians?: string[];
  quotePrice: number;
  scheduledDate?: string;
  address: string;
  paymentId?: string;
  siteImageUrls?: string[];
}

export interface BankAccount {
  $id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isActive: boolean;
}

export interface Payment {
  $id?: string;
  userId: string;
  type: 'course' | 'agency_project' | 'printing' | 'solar_job' | 'student_project' | 'maintenance';
  referenceId: string;
  bankAccountId: string;
  amount: number;
  receiptImage: string;
  referenceNumber: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectedReason?: string;
  submittedAt: string;
}

export interface Receipt {
  $id?: string;
  paymentId: string;
  receiptNumber: string;
  amount: number;
  paidBy: string;
  paymentMethod: string;
  date: string;
  pdfUrl: string;
}

export interface Certificate {
  $id?: string;
  studentId: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: string;
  pdfUrl: string;
}

export interface CommunityPost {
  $id?: string;
  userId: string;
  authorName: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  likes?: string[];
}

export interface CommunityComment {
  $id?: string;
  postId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Ticket {
  $id?: string;
  userId: string;
  projectOrContractId?: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
}

export interface MaintenanceContract {
  $id?: string;
  clientId: string;
  title: string;
  serviceType: 'IT Support' | 'Network Management' | 'Software Maintenance' | 'Hardware Servicing';
  frequency: 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate?: string;
  amount: number;
}
