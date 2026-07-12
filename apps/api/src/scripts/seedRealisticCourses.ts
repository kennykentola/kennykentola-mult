import { Client, Databases, Query, ID } from 'node-appwrite';

const client = new Client();

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || 'kennykentolamult';
const apiKey = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const COURSES_COLLECTION = 'courses';
const LESSONS_COLLECTION = 'lessons';

const REALISTIC_COURSES = [
  {
    id: 'react-native-expo',
    title: 'React Native and Expo Go Mobile Development',
    description: 'Learn how to build stunning cross-platform mobile apps for iOS and Android using React Native and Expo Go. Covers animations, navigation, push notifications, and app store deployment.',
    summary: 'Master cross-platform mobile dev with React Native & Expo.',
    instructorId: 'admin_1', // replace with generic admin id or user's ID later
    instructorName: 'Kenny Kentola',
    category: 'Mobile Development',
    level: 'Intermediate',
    price: 25000,
    isPublished: true,
    lessonCount: 4,
    aiVideoEnabled: false,
    slug: 'react-native-expo',
    coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'fullstack-nextjs',
    title: 'Fullstack Web Development with Next.js',
    description: 'From zero to production. Master Next.js, React, TailwindCSS, and Node.js backend integrations. Build scalable, SEO-friendly web applications that handle thousands of users.',
    summary: 'Build modern, fast, and SEO-friendly web apps using Next.js.',
    instructorId: 'admin_1',
    instructorName: 'Kenny Kentola',
    category: 'Web Development',
    level: 'Advanced',
    price: 30000,
    isPublished: true,
    lessonCount: 3,
    aiVideoEnabled: true,
    slug: 'fullstack-nextjs',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'ai-prompt-engineering',
    title: 'AI Prompt Engineering Masterclass',
    description: 'Learn how to communicate effectively with Large Language Models (LLMs). Master prompt design, chain-of-thought, and integrate AI into your daily workflows to 10x your productivity.',
    summary: 'Master the art of AI Prompting and boost your productivity.',
    instructorId: 'admin_1',
    instructorName: 'Kenny Kentola',
    category: 'Artificial Intelligence',
    level: 'Beginner',
    price: 15000,
    isPublished: true,
    lessonCount: 2,
    aiVideoEnabled: false,
    slug: 'ai-prompt-engineering',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000'
  }
];

const LESSONS_DATA = {
  'react-native-expo': [
    { title: 'Introduction to Expo Go', order: 1, isPreview: true, durationMinutes: 15, content: 'Welcome to React Native! In this lesson, we will set up Expo Go.' },
    { title: 'React Navigation 6X', order: 2, isPreview: false, durationMinutes: 45, content: 'Setting up Stack and Tab Navigators.' },
    { title: 'State Management with Zustand', order: 3, isPreview: false, durationMinutes: 30, content: 'Managing global state in your React Native app.' },
    { title: 'Push Notifications', order: 4, isPreview: false, durationMinutes: 60, content: 'Implementing remote push notifications.' }
  ],
  'fullstack-nextjs': [
    { title: 'Next.js App Router Basics', order: 1, isPreview: true, durationMinutes: 20, content: 'Understanding the new App Router architecture.' },
    { title: 'Server Components vs Client Components', order: 2, isPreview: false, durationMinutes: 35, content: 'When to use Server components and when to use Client components.' },
    { title: 'Database Integration (Appwrite)', order: 3, isPreview: false, durationMinutes: 50, content: 'Connecting Next.js to Appwrite.' }
  ],
  'ai-prompt-engineering': [
    { title: 'The Anatomy of a Prompt', order: 1, isPreview: true, durationMinutes: 25, content: 'How LLMs interpret your text and the best way to structure it.' },
    { title: 'Chain of Thought & Few-Shot', order: 2, isPreview: false, durationMinutes: 40, content: 'Advanced prompting techniques.' }
  ]
};

async function seedCourses() {
  console.log('Starting seed process...');
  
  try {
    // 1. Delete placeholder courses
    const existing = await databases.listDocuments(DATABASE_ID, COURSES_COLLECTION, [Query.limit(100)]);
    for (const d of existing.documents) {
      const doc = d as any;
      if (doc.title.includes('Lorem') || doc.title.includes('Test Course') || doc.$id === 'test-course-1') {
        console.log(`Deleting placeholder course: ${doc.title} (${doc.$id})`);
        await databases.deleteDocument(DATABASE_ID, COURSES_COLLECTION, doc.$id);
      }
    }

    // 2. Insert new realistic courses
    for (const course of REALISTIC_COURSES) {
      try {
        await databases.getDocument(DATABASE_ID, COURSES_COLLECTION, course.id);
        console.log(`Course ${course.id} already exists, skipping creation.`);
      } catch {
        console.log(`Creating course: ${course.title}...`);
        await databases.createDocument(DATABASE_ID, COURSES_COLLECTION, course.id, {
          title: course.title,
          description: course.description,
          summary: course.summary,
          instructorId: course.instructorId,
          instructorName: course.instructorName,
          category: course.category,
          level: course.level,
          price: course.price,
          isPublished: course.isPublished,
          lessonCount: course.lessonCount,
          aiVideoEnabled: course.aiVideoEnabled,
          slug: course.slug,
          coverImage: course.coverImage
        });

        const lessons = LESSONS_DATA[course.id as keyof typeof LESSONS_DATA];
        for (const lesson of lessons) {
          console.log(`  Adding lesson: ${lesson.title}`);
          await databases.createDocument(DATABASE_ID, LESSONS_COLLECTION, ID.unique(), {
            courseId: course.id,
            title: lesson.title,
            order: lesson.order,
            isPreview: lesson.isPreview,
            durationMinutes: lesson.durationMinutes,
            content: lesson.content,
            videoUrl: ''
          });
        }
      }
    }
    
    console.log('Seeding completed successfully!');
  } catch (err: any) {
    console.error('Error seeding courses:', err.message);
  }
}

seedCourses();
