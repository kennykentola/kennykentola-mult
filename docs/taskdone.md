# Task Done Log

This file is a handoff note for the KennyKentola multi-company project. It captures what has already been completed so another developer can continue without re-discovering the same context.

## Completed So Far

### Phase 1: Academy UI Foundation
- Created a shared academy content module at `apps/web/src/features/academy/content.ts`.
- Centralized academy course data, catalog data, and dashboard stats into one source of truth.
- Refactored the dashboard home page to read from shared academy content instead of duplicate hardcoded arrays.
- Refactored the academy courses page to reuse the same shared academy data.
- Updated the landing page academy card to use the same academy copy as the dashboard.
- Fixed the `purpose` type in auth context to support `print`.
- Fixed the `AuthProvider` component typing so the web build passes cleanly.

### Phase 2: Academy Backend Integration
- Added a new academy API router at `apps/api/src/routes/academy.ts`.
- Added public course catalog and course detail endpoints backed by Appwrite.
- Added authenticated academy progress and enrollment endpoints.
- Added a course enrollments collection to the Appwrite init schema.
- Seeded three default academy courses and preview lessons into Appwrite during initialization.
- Updated the auth middleware to hydrate the authenticated user role from the profile document.
- Refactored the dashboard academy overview to load live progress from the academy API.
- Refactored the course catalog page to load published courses and support direct enrollment.
- Added a shared web academy API helper at `apps/web/src/features/academy/api.ts`.

### Phase 3: Course Detail and Lesson Progress
- Added a dynamic course detail page at `apps/web/src/app/dashboard/courses/[courseId]/page.tsx`.
- Added lesson playback, lesson queue selection, and progress summary UI.
- Added lesson completion tracking that updates academy progress through the backend API.
- Added a backend course detail response for course + lesson data reuse.
- Linked academy course cards to the new course detail page.

### Phase 4: Assignments and Live Classes
- Added academy assignment collections, live class collections, and submission timestamps to the Appwrite seed script.
- Seeded sample assignments and live classes for the academy courses.
- Added academy API endpoints for course assignments, user assignment submissions, and live classes.
- Extended the shared web academy API helper with assignment and live class fetch/submit functions.
- Turned the course detail page into a tabbed workspace for lessons, assignments, and live classes.
- Added assignment submission UI with file URL capture, instructor notes, and submission status feedback.
- Added live class scheduling cards with join links and session metadata.

### Phase 5: Assignment Review and Grading
- Added admin academy review endpoints for listing submissions and saving grades.
- Added admin assignment review inbox at `apps/web/src/app/admin/assignments/page.tsx`.
- Added assignment filters, scoring inputs, and feedback controls for reviewers.
- Added the academy review entry to the admin navigation.

### Validation
- `npm run build --workspace web` passes successfully.
- `npm run build --workspace api` passes successfully.

### Phase 6: Portal Split and Appwrite Bootstrapping
- Added a root-level `npm run init:appwrite` command that delegates to the API workspace initializer.
- Added an API workspace `init:appwrite` script so Appwrite schema/bootstrap can be run directly.
- Wired Appwrite database initialization into API startup so missing collections and seed records are created before the server listens.
- Added clearer student portal entry points on the landing page for Academy, Printing, and Project / App Build requests.
- Added portal-aware registration preselection using `?portal=academy`, `?portal=printing`, and `?portal=projects`.
- Updated the dashboard home and sidebar labels to make Academy, Printing, and Project / App Build access feel separated instead of blended.

### Phase 6 Validation
- `npm run build --workspace web` passes successfully.
- `npm run build --workspace api` passes successfully.

### Phase 7: Student Portal Route Split
- Added a dedicated `/student` route layer that reuses the current dashboard UI.
- Added student portal entry pages for dashboard, courses, course detail, messages, payments, profile, printing, and project requests.
- Updated login to route Academy users into `/student/dashboard` after sign-in.
- Made dashboard links aware of whether they are running under `/dashboard` or `/student`.
- Updated the public Academy entry point to send visitors to the student portal path.
- Fixed Appwrite bootstrap so required attributes no longer receive unsupported default values during initialization.

### Phase 7 Validation
- `npm run build --workspace web` passes successfully.
- `npm run build --workspace api` passes successfully.

## Notes

- The user referenced `docs/academy-plan.md`, but that file does not exist in this checkout.
- The closest matching documentation currently available is `docs/features.md`.
- The academy now uses backend/Appwrite data for courses, lessons, progress, assignments, and live class scheduling.
- The admin terminal now includes an academy review desk for grading submissions.
- The portal split is currently implemented as separate entry points and UI grouping, not yet as fully separate top-level apps or subdomains.
- The student portal is now live at `/student/dashboard` and uses aliases for the existing Academy screens.
- The Appwrite init script now handles required attributes without defaults so startup can complete cleanly on fresh environments.

## Current Academy Structure

- Dashboard overview: `apps/web/src/app/dashboard/page.tsx`
- Course catalog UI: `apps/web/src/app/dashboard/courses/page.tsx`
- Course workspace UI: `apps/web/src/app/dashboard/courses/[courseId]/page.tsx`
- Shared academy data: `apps/web/src/features/academy/content.ts`
- Shared academy API helper: `apps/web/src/features/academy/api.ts`
- Admin review desk: `apps/web/src/app/admin/assignments/page.tsx`
- Landing page academy card: `apps/web/src/app/page.tsx`
- Portal-aware registration: `apps/web/src/app/register/page.tsx`
- Dashboard layout labels: `apps/web/src/app/dashboard/layout.tsx`
- Student route layer: `apps/web/src/app/student/`
- Auth profile type: `apps/web/src/features/auth/AuthContext.tsx`

## Phase 7 Recommended Next Steps

1. Split the remaining project and printing experiences into their own dedicated route groups if you want full hard separation.
2. Add student-only route shells for assignments, certificates, community, and settings.
3. Add instructor-facing assignment analytics and export.
4. Show learner-side submission history and grading status.
5. Add live class RSVP/attendance tracking if required.
6. Attach real video URLs to lesson and live class content.
7. Add notifications for upcoming live classes and due assignments.

## Implementation Reminder

- Keep new fields optional or provide defaults so older profiles and records do not break.
- Prefer versioned API changes if the payload shape needs to change.
- Reuse the shared academy content module for labels and fallback UI where helpful.
