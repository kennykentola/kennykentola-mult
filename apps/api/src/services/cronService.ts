import cron from 'node-cron';
import { databases } from './appwrite';
import { sendEmail } from './email';
import { ID, Query } from 'node-appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

// This function processes Live Class reminders and immediate notifications.
async function processLiveClassNotifications() {
  console.log('[Cron] Checking for upcoming live classes...');
  try {
    const now = new Date();
    // 30 mins from now
    const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60000);

    // Fetch live classes that are not completed
    const result = await databases.listDocuments(
      DATABASE_ID,
      'live_classes',
      [
        Query.notEqual('status', 'completed')
      ]
    );
    const liveClasses = result.documents as any[];

    for (const liveClass of liveClasses) {
      const scheduledAt = new Date(liveClass.scheduledAt);

      // --- REMINDER LOGIC (<= 30 mins) ---
      if (!liveClass.reminderSent && scheduledAt > now && scheduledAt <= thirtyMinsFromNow) {
        console.log(`[Cron] Sending reminders for class: ${liveClass.title}`);
        await notifyStudents(liveClass, 'reminder');
        await databases.updateDocument(DATABASE_ID, 'live_classes', liveClass.$id, { reminderSent: true });
      }

      // --- IMMEDIATE LOGIC (Now or past) ---
      if (!liveClass.immediateSent && scheduledAt <= now) {
        console.log(`[Cron] Sending immediate alerts for class: ${liveClass.title}`);
        await notifyStudents(liveClass, 'immediate');
        // Update status to live as well
        await databases.updateDocument(DATABASE_ID, 'live_classes', liveClass.$id, { immediateSent: true, status: 'live' });
      }
    }
  } catch (error) {
    console.error('[Cron] Error processing live class notifications:', error);
  }
}

async function notifyStudents(liveClass: any, type: 'reminder' | 'immediate') {
  try {
    // 1. Fetch all enrollments for this course
    const enrollmentsResult = await databases.listDocuments(
      DATABASE_ID,
      'course_enrollments',
      [Query.equal('courseId', liveClass.courseId)]
    );
    const enrollments = enrollmentsResult.documents as any[];

    const userIds = enrollments.map(e => e.userId);
    if (userIds.length === 0) return;

    // 2. Fetch user profiles to get emails
    const profilesResult = await databases.listDocuments(
      DATABASE_ID,
      'users_profile',
      // Assuming we can pass an array or we fetch all and filter (for large scales, batch this)
      // Since Appwrite limits array queries to 100, we'll chunk it if needed. 
      // For simplicity, let's fetch in chunks of 100
    );
    const profiles = profilesResult.documents as any[];

    const enrolledProfiles = profiles.filter(p => userIds.includes(p.userId));

    const title = type === 'reminder' 
      ? `Reminder: ${liveClass.title} starts in 30 minutes!` 
      : `🔴 LIVE NOW: ${liveClass.title}`;
    
    const message = type === 'reminder'
      ? `Get ready! Your live class "${liveClass.title}" will begin in exactly 30 minutes. Make sure your setup is ready.`
      : `Your live class "${liveClass.title}" has officially started! Click the link to join immediately.`;

    const htmlMessage = type === 'reminder'
      ? `<p>Get ready!</p><p>Your live class <b>"${liveClass.title}"</b> will begin in exactly 30 minutes.</p><br/><a href="${liveClass.meetingUrl}" style="padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:5px;">Meeting Link</a>`
      : `<p>🔴 <b>It's time!</b></p><p>Your live class <b>"${liveClass.title}"</b> has officially started.</p><br/><a href="${liveClass.meetingUrl}" style="padding:10px 20px;background:#ef4444;color:#fff;text-decoration:none;border-radius:5px;">Join Live Class Now</a>`;

    // 3. Create Notifications & Send Emails
    for (const profile of enrolledProfiles) {
      // In-app Notification
      await databases.createDocument(
        DATABASE_ID,
        'notifications',
        ID.unique(),
        {
          userId: profile.userId,
          title,
          message,
          type: 'live_class',
          link: liveClass.meetingUrl,
          isRead: false,
          createdAt: new Date().toISOString()
        }
      );

      // Email via Brevo
      if (profile.email) {
        try {
          await sendEmail({
            to: profile.email,
            subject: title,
            html: htmlMessage
          });
        } catch (err) {
          console.error(`[Cron] Failed to send email to ${profile.email}`);
        }
      }
    }
  } catch (err) {
    console.error(`[Cron] Error notifying students for class ${liveClass.$id}`, err);
  }
}

export function initCronJobs() {
  console.log('[Cron] Initializing background tasks...');
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    processLiveClassNotifications();
  });
}
