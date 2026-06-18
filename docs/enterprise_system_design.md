# Enterprise System Design & Architecture
*A Unified Ecosystem for Kennykentola Multi-Company (Designed for 1,000,000+ Users)*

---

## 1. Academy Module (LMS Architecture)
*Role: EdTech Product Manager & Senior LMS Architect*

### User Roles
- **Student**: Registers, buys courses, tracks progress, submits assignments.
- **Instructor**: Creates courses, uploads videos, grades submissions, mentors.
- **Admin**: Oversees revenue, manages instructors, handles disputes.

### Database Design (Appwrite / Future Mongo)
- `Courses`: `[id, title, instructorId, price, syllabus, status]`
- `Lessons`: `[id, courseId, title, videoUrl, resources (array), orderIndex]`
- `Enrollments`: `[id, studentId, courseId, progress, purchaseDate]`
- `Assignments`: `[id, lessonId, instructions, dueDate]`
- `Submissions`: `[id, assignmentId, studentId, fileUrl, grade, feedback]`

### Screens & Web/Mobile Design
- **Web App**: React/Next.js dashboard. Heavy emphasis on distraction-free video player UI (like Udemy/Coursera).
- **Mobile App**: Native offline video caching (Expo FileSystem), push notifications for assignment deadlines.
- **Screens**: Course Catalogue (Grid view with filters), Student Profile (Badges/Certificates), Video Player Panel (Sidebar syllabus, main video, Q&A tab below).

### User Flows & API Design
1. **Enrollment**: `POST /api/academy/enroll` -> Verifies wallet balance -> Creates `Enrollment` record -> Unlocks `Lessons`.
2. **Progress**: `PATCH /api/academy/progress` -> Triggers when video ends -> Updates `Enrollments.progress` -> Checks if 100% -> Mints Certificate.

### Security & Monetisation
- **Security**: Video DRM or signed expiring URLs (via Appwrite Storage or AWS S3) to prevent piracy. Rate-limited quiz submissions.
- **Monetisation**: Subscription tier ($X/month for all access) + A la carte (buy single course). Certificate verification fees.

---

## 2. Printing Management System
*Role: Printing & Branding Product Manager*

### Complete Workflow & Order Lifecycle
1. **Upload**: Customer uploads design (PDF/TIFF) & selects specs (paper, color, quantity).
2. **Quoting**: System auto-calculates price. If custom, Admin manual review -> sends quote.
3. **Payment**: Customer approves and pays. Status -> `Production`.
4. **Queue**: Staff dashboard sees prioritized queue. 
5. **Dispatch**: Order printed -> packed -> status `Delivered`.

### Database Design
- `PrintOrders`: `[id, customerId, fileAssetId, specs (JSON), status, quotePrice, shippingAddress]`
- `Inventory`: `[id, itemName, stockLevel, alertThreshold, unitCost]`

### Dashboard Design & Mobile Features
- **Staff Board**: Kanban style (New -> Pre-Press -> Printing -> QC -> Shipped).
- **Customer Mobile App**: Push notifications for order state changes ("Your ID Cards are printing!"). Live tracking integration.

### Pricing System & Security
- **Pricing**: Formula-based edge function: `(Base Paper Cost + Color Multiplier) * Quantity + Margin`.
- **Security**: Uploaded files scanned for malware. Secure expiring URLs for staff to download pre-press files.

---

## 3. Software Agency Operations
*Role: Software Agency Operations Architect*

### Project Workflow
- **Lead** -> **Consultation** -> **Proposal/Quote** -> **Contract Signed** -> **Sprint 1 (Design)** -> **Sprint 2 (Dev)** -> **UAT** -> **Delivery**.

### Database Structure
- `AgencyProjects`: `[id, clientId, title, budget, status, contractUrl]`
- `Milestones`: `[id, projectId, title, amountDue, status, dueDate]`
- `TimeEntries`: `[id, developerId, projectId, hours, date]`

### Dashboard Structure
- **Client Portal**: View active milestones, download staging APKs, approve designs, pay invoices.
- **PM Dashboard**: Gantt charts, resource allocation (who is free?), sprint velocity tracking.

### Communication & Contract System
- **Contracts**: Integration with DocuSign API or internal digital signature mapping.
- **Comms**: Appwrite real-time websockets linked to `AgencyProjects` for dedicated client-agency chat channels.

---

## 4. Application Maintenance (SaaS Support)
*Role: SaaS Support Platform Architect*

### Ticket Lifecycle
1. `New` -> 2. `Triage (Assign Priority)` -> 3. `In Progress (Assigned to Engineer)` -> 4. `Pending Client Verification` -> 5. `Resolved`.

### Dashboards & Database Design
- `SupportTickets`: `[id, clientId, projectId, priority (Low/Med/High/Critical), issue, status, assignedEngineerId]`
- `SLALogs`: `[id, ticketId, responseTimeMinutes, breachStatus]`
- **Engineer Dashboard**: Split pane view. Left: Queue ordered by SLA breach risk. Right: Ticket details, GitHub integration (create PR from ticket).

### Notification System
- Webhook to Slack/Discord for `Critical` priority tickets. SMS alerts to on-call engineers.

---

## 5. Academic & Research Services
*Role: Academic Product Architect*

### System Design & Workflow
- Connects university students needing final year project help with verified Technical Experts.
- **Workflow**: Student posts brief -> Experts bid or Admin assigns -> Escrow Payment -> Phased Delivery (Chapter 1, Code, Chapter 2) -> Final Approval.

### Database Design
- `AcademicProjects`: `[id, studentId, expertId, topic, status, university, deadline]`
- `Deliverables`: `[id, projectId, phase, documentUrl, status]`

### Mobile Application Features
- Anonymous chat between Student and Expert (preventing off-platform deals). Push notifications for file uploads.

---

## 6. Solar and Electrical Service Platform
*Role: Service Marketplace Architect*

### Booking Workflow & Pricing Engine
- **Workflow**: Customer selects service (e.g., Inverter Repair) -> Chooses Date -> Map API calculates distance -> Price quoted (Base + Distance + Parts) -> Technician dispatched.
- **Pricing Engine**: `Base Callout Fee + (Distance * Rate) + Hourly Labor`.

### Database Structure
- `SolarJobs`: `[id, customerId, technicianId, lat, lng, jobType, status, scheduledTime]`
- `TechnicianLocations`: `[id, technicianId, lat, lng, lastUpdated]`

### Technician App Features
- **Offline-First**: Must use local database (WatermelonDB) to check off job tasks and take photos in basements/remote areas without 4G. Syncs to Appwrite when online.
- **Route Tracking**: Google Maps integration for optimal routing between daily jobs.

---

## 7. Chief Enterprise Architecture (Unified Design for 1,000,000+ Users)
*Role: Chief Enterprise Architect*

### Unified Architecture Overview
A single Monorepo (Next.js Web, Expo Mobile, Node.js API) acting as a **Modular Monolith**. 
- **Authentication**: Single Sign-On (SSO) via Appwrite. A user registers once and can buy a course, order printing, and request solar maintenance from the same Unified Dashboard.
- **Unified Dashboard**: Widget-based UI. If user has active Solar Job, show Solar Widget. If enrolled in Course, show Academy Widget.
- **Global Search**: Elasticsearch (or Typesense) indexing all collections. A user typing "React" sees Academy Courses AND Agency Portfolio apps in one dropdown.

### Permission System (RBAC)
- **Appwrite Teams**: `team_admin`, `team_instructors`, `team_technicians`. 
- **Document Level Security (DLS)**: A `PrintOrder` document grants `read/write` to `user:ABC` (the creator) and `team:printing_staff`. All other users are strictly blocked at the database level.

### Scalability Strategy (1,000,000+ Users)
To handle 1M users, the infrastructure must decouple state from compute.
1. **Edge Caching**: Next.js deployed on Vercel/Cloudflare Edge. Static pages (Course Catalogs, Agency Portfolio) hit cache, never touching the DB.
2. **Stateless APIs**: Express/Node servers horizontally scaled via Kubernetes or AWS ECS. Session state in Redis.
3. **Queue-Based Processing**: High-CPU tasks (Video transcoding for Academy, PDF generation for Printing, Route calculation for Solar) pushed to BullMQ/Redis workers.

### Microservice Migration Plan
As load increases past 1M users, the Modular Monolith will be broken out by subdomain:
1. **Phase 1 (Current)**: Monolith API.
2. **Phase 2 (Strangler Fig)**: Extract the `Video Streaming` and `Printing File Uploads` into separate Go or Rust microservices (to handle high I/O efficiency).
3. **Phase 3**: Event-Driven Architecture. Services communicate via Apache Kafka or AWS EventBridge (e.g., `PrintingService` emits `OrderComplete` event -> `NotificationService` catches it and sends SMS).

### Appwrite Implementation Plan -> Future MongoDB Migration
1. **Current Appwrite Setup**: Appwrite handles Auth, DB, and Storage. Deploy Appwrite on a robust AWS EC2 cluster with highly provisioned EBS volumes.
2. **The Bottleneck**: At 1M users, Appwrite's MariaDB backend doing complex analytical joins (e.g., "Find all Solar users who also bought Python courses") will degrade performance.
3. **MongoDB Migration**:
   - Deploy MongoDB Atlas cluster.
   - Run a dual-write system: API writes to both Appwrite and MongoDB.
   - Migrate complex read queries (Dashboards, Analytics) to MongoDB utilizing embedded documents (e.g., embedding `Milestones` inside `AgencyProjects` to eliminate joins).
   - Finally, phase out Appwrite DB entirely, retaining Appwrite only for Authentication and Storage.
