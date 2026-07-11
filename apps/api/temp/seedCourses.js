require('dotenv').config({ path: '../.env' });
const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';

const courses = [
  {
    title: 'Full-Stack Web Development Bootcamp',
    description: 'Master React, Node.js, Next.js, and Databases in this comprehensive 12-week bootcamp designed to get you hired as a Software Engineer.',
    category: 'Programming',
    level: 'Beginner to Advanced',
    price: 35000,
    isPublished: true,
    aiVideoEnabled: true,
    summary: 'Master the MERN stack and Next.js. Build real-world projects including an e-commerce platform and a dashboard.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    lessons: [
      { title: 'Introduction to HTML, CSS & JS', content: 'In this lesson, we cover the fundamentals of the web...', videoUrl: 'https://www.youtube.com/watch?v=mU6anWqZJcc', order: 1 },
      { title: 'Building your first React App', content: 'Learn about components, state, and props...', videoUrl: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', order: 2 },
    ]
  },
  {
    title: 'AI Prompt Engineering & Tools',
    description: 'Learn how to use AI to 10x your productivity. We will cover ChatGPT, Midjourney, Cursor, and writing clean code with AI.',
    category: 'Artificial Intelligence',
    level: 'Beginner',
    price: 5000,
    isPublished: true,
    aiVideoEnabled: true,
    summary: 'Automate your workflow, generate stunning designs, and write code faster using the latest AI models.',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    lessons: [
      { title: 'What is Prompt Engineering?', content: 'Prompt engineering is the art of talking to AI...', videoUrl: 'https://www.youtube.com/watch?v=jC4v5AS4ART', order: 1 },
      { title: 'Using AI to write code', content: 'We will use Cursor and GitHub Copilot to write an app...', videoUrl: 'https://www.youtube.com/watch?v=fiPSz306c58', order: 2 },
    ]
  },
  {
    title: 'Graphic Design Basics (Free Course)',
    description: 'Learn the basics of Graphic Design, Color Theory, and Typography for digital and print media.',
    category: 'Design',
    level: 'Beginner',
    price: 0,
    isPublished: true,
    aiVideoEnabled: false, // Turn off AI video generator for this free course as requested!
    summary: 'A quick introduction to visual design principles for the modern web and print.',
    coverImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
    lessons: [
      { title: 'Color Theory', content: 'How to pick colors that look great together.', videoUrl: 'https://www.youtube.com/watch?v=_2LlSqsHLqk', order: 1 }
    ]
  }
];

async function seed() {
  console.log('Seeding courses...');
  try {
    for (const courseData of courses) {
      console.log(`Creating course: ${courseData.title}`);
      
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        instructorId: 'system', // or your admin ID
        instructorName: 'KennyKentola Academy',
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        isPublished: courseData.isPublished,
        aiVideoEnabled: courseData.aiVideoEnabled,
        summary: courseData.summary,
        coverImage: courseData.coverImage,
        lessonCount: courseData.lessons.length,
      };

      const course = await databases.createDocument(
        DATABASE_ID,
        'courses',
        ID.unique(),
        coursePayload
      );

      console.log(`Course created with ID: ${course.$id}. Creating lessons...`);

      for (const lessonData of courseData.lessons) {
        await databases.createDocument(
          DATABASE_ID,
          'lessons',
          ID.unique(),
          {
            courseId: course.$id,
            title: lessonData.title,
            content: lessonData.content,
            videoUrl: lessonData.videoUrl,
            order: lessonData.order,
            durationMinutes: 15,
            isPreview: false,
            isLocked: false
          }
        );
      }
    }
    console.log('Successfully seeded all courses and lessons!');
  } catch (err) {
    console.error('Failed to seed courses:', err);
  }
}

seed();
