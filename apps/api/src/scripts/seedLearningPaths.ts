import { databases } from '../services/appwrite';
import { ID } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'multicompany';
const COLLECTION_ID = 'learning_paths';

const learningPathsData = [
  {
    slug: 'frontend-engineering',
    title: 'Frontend Engineering',
    description: 'Learn HTML, CSS, JavaScript, TypeScript, React, and Next.js to build modern websites.',
    iconName: 'Layout',
    color: 'from-blue-500/20 to-transparent',
    borderColor: 'hover:border-blue-500/50',
    duration: '12 Weeks',
    level: 'Beginner to Intermediate',
    prerequisites: 'Basic computer literacy.',
    technologies: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'React.js', 'Next.js', 'Tailwind CSS', 'Git & GitHub'],
    careerOutcomes: ['Frontend Developer', 'UI Developer', 'React Developer', 'Web Designer'],
    curriculum: JSON.stringify([
      { title: 'Web Fundamentals', description: 'Master the building blocks of the web.', duration: '2 Weeks', topics: ['HTML5 Semantic Elements', 'CSS3 Styling & Flexbox', 'CSS Grid', 'Responsive Design'] },
      { title: 'JavaScript Mastery', description: 'Add interactivity and logic to your websites.', duration: '3 Weeks', topics: ['Variables & Data Types', 'Functions & Scope', 'DOM Manipulation', 'Asynchronous JavaScript (Promises/Async-Await)'] },
      { title: 'Modern React & TypeScript', description: 'Build complex SPAs with React.', duration: '4 Weeks', topics: ['Components & Props', 'React Hooks (useState, useEffect)', 'State Management', 'TypeScript Interfaces & Types'] },
      { title: 'Next.js & Full-stack Basics', description: 'Server-side rendering and static site generation.', duration: '3 Weeks', topics: ['App Router Routing', 'Data Fetching', 'API Routes', 'Deploying on Vercel'] }
    ])
  },
  {
    slug: 'backend-engineering',
    title: 'Backend Engineering',
    description: 'Develop secure APIs and backend applications with Node.js, NestJS, Python, Django, Flask, PHP, and Laravel.',
    iconName: 'Server',
    color: 'from-emerald-500/20 to-transparent',
    borderColor: 'hover:border-emerald-500/50',
    duration: '14 Weeks',
    level: 'Intermediate',
    prerequisites: 'Basic understanding of programming logic.',
    technologies: ['Node.js', 'Express.js', 'NestJS', 'Python', 'Django', 'PostgreSQL', 'MongoDB', 'Docker'],
    careerOutcomes: ['Backend Developer', 'API Engineer', 'Software Engineer', 'Database Administrator'],
    curriculum: JSON.stringify([
      { title: 'Backend Foundations', description: 'Introduction to server-side programming.', duration: '2 Weeks', topics: ['HTTP & RESTful APIs', 'Node.js Basics', 'Package Managers (NPM/Yarn)', 'Express.js setup'] },
      { title: 'Databases & Data Modeling', description: 'Store and manage application data securely.', duration: '4 Weeks', topics: ['SQL vs NoSQL', 'PostgreSQL & Prisma', 'MongoDB & Mongoose', 'Database Normalization'] },
      { title: 'Advanced Frameworks (NestJS / Django)', description: 'Build enterprise-grade applications.', duration: '5 Weeks', topics: ['MVC Architecture', 'Dependency Injection', 'Authentication & Authorization (JWT)', 'Middleware & Guards'] },
      { title: 'Deployment & DevOps Basics', description: 'Ship your backend securely.', duration: '3 Weeks', topics: ['Docker Containerization', 'CI/CD Pipelines', 'AWS / DigitalOcean Deployment', 'Monitoring & Logging'] }
    ])
  },
  {
    slug: 'full-stack-development',
    title: 'Full Stack Development',
    description: 'Master both frontend and backend technologies to build complete web applications.',
    iconName: 'Blocks',
    color: 'from-purple-500/20 to-transparent',
    borderColor: 'hover:border-purple-500/50',
    duration: '24 Weeks',
    level: 'Beginner to Advanced',
    prerequisites: 'No prior experience required, but commitment is essential.',
    technologies: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Prisma', 'Docker'],
    careerOutcomes: ['Full Stack Developer', 'Software Engineer', 'Technical Lead', 'Startup Founder'],
    curriculum: JSON.stringify([
      { title: 'Frontend Foundations', description: 'Build interactive user interfaces.', duration: '6 Weeks', topics: ['HTML/CSS', 'JavaScript/TypeScript', 'React Fundamentals', 'Tailwind CSS'] },
      { title: 'Backend & APIs', description: 'Create robust server-side logic.', duration: '6 Weeks', topics: ['Node.js & Express', 'REST & GraphQL', 'Authentication', 'Error Handling'] },
      { title: 'Databases & Architecture', description: 'Design scalable data structures.', duration: '6 Weeks', topics: ['PostgreSQL', 'Prisma ORM', 'Caching with Redis', 'System Design Basics'] },
      { title: 'Capstone & Deployment', description: 'Build and ship a production-ready application.', duration: '6 Weeks', topics: ['Next.js App Router integration', 'End-to-End Testing', 'Docker & CI/CD', 'Final Portfolio Project'] }
    ])
  },
  {
    slug: 'python-development',
    title: 'Python Development',
    description: 'Learn Python for web development, automation, and Artificial Intelligence.',
    iconName: 'Code',
    color: 'from-yellow-500/20 to-transparent',
    borderColor: 'hover:border-yellow-500/50',
    duration: '10 Weeks',
    level: 'Beginner',
    prerequisites: 'None.',
    technologies: ['Python 3', 'Django', 'Flask', 'Pandas', 'NumPy', 'Pytest', 'Jupyter'],
    careerOutcomes: ['Python Developer', 'Data Analyst', 'Automation Engineer', 'Backend Developer'],
    curriculum: JSON.stringify([
      { title: 'Python Basics', description: 'Master Python syntax and concepts.', duration: '3 Weeks', topics: ['Variables & Types', 'Control Flow', 'Functions & Modules', 'Object-Oriented Programming (OOP)'] },
      { title: 'Data & Automation', description: 'Handle files and automate boring tasks.', duration: '2 Weeks', topics: ['File I/O', 'Web Scraping (BeautifulSoup)', 'Automation scripts', 'Working with APIs'] },
      { title: 'Web Development with Python', description: 'Build web applications using Flask and Django.', duration: '3 Weeks', topics: ['Flask Routing & Templates', 'Django ORM', 'Django Admin', 'Building REST APIs'] },
      { title: 'Intro to Data Science', description: 'Analyze data with Python.', duration: '2 Weeks', topics: ['Jupyter Notebooks', 'Pandas basics', 'NumPy arrays', 'Data Visualization (Matplotlib)'] }
    ])
  },
  {
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    description: 'Create modern cross-platform mobile applications.',
    iconName: 'MonitorSmartphone',
    color: 'from-cyan-500/20 to-transparent',
    borderColor: 'hover:border-cyan-500/50',
    duration: '14 Weeks',
    level: 'Intermediate',
    prerequisites: 'Basic JavaScript or object-oriented programming knowledge.',
    technologies: ['React Native', 'Expo', 'Flutter', 'Dart', 'Firebase', 'Redux'],
    careerOutcomes: ['Mobile App Developer', 'React Native Engineer', 'Flutter Developer', 'iOS/Android Developer'],
    curriculum: JSON.stringify([
      { title: 'Mobile App Fundamentals', description: 'Understand the mobile ecosystem.', duration: '2 Weeks', topics: ['iOS vs Android', 'Cross-platform concepts', 'React Native CLI vs Expo', 'Setting up Emulators'] },
      { title: 'Building UI & Navigation', description: 'Create fluid mobile interfaces.', duration: '4 Weeks', topics: ['Core Components', 'Styling in Mobile', 'React Navigation', 'Animations & Gestures'] },
      { title: 'State & Native Features', description: 'Manage data and device hardware.', duration: '4 Weeks', topics: ['State Management (Zustand/Redux)', 'Camera & Location API', 'Push Notifications', 'Offline Storage (AsyncStorage)'] },
      { title: 'Publishing & App Stores', description: 'Ship your app to the world.', duration: '4 Weeks', topics: ['App Store Connect', 'Google Play Console', 'Over-The-Air (OTA) Updates', 'App Store Optimization (ASO)'] }
    ])
  },
  {
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    description: 'Design intuitive and engaging digital experiences.',
    iconName: 'Brush',
    color: 'from-pink-500/20 to-transparent',
    borderColor: 'hover:border-pink-500/50',
    duration: '8 Weeks',
    level: 'Beginner',
    prerequisites: 'A creative mindset. No coding required.',
    technologies: ['Figma', 'Adobe XD', 'Miro', 'InVision', 'Prototyping Tools'],
    careerOutcomes: ['UI/UX Designer', 'Product Designer', 'Web Designer', 'UX Researcher'],
    curriculum: JSON.stringify([
      { title: 'UX Foundations', description: 'Understand user psychology and research.', duration: '2 Weeks', topics: ['User Research', 'User Personas', 'Information Architecture', 'Wireframing'] },
      { title: 'UI Design Principles', description: 'Create visually stunning interfaces.', duration: '2 Weeks', topics: ['Color Theory', 'Typography', 'Spacing & Layout', 'Accessibility (a11y)'] },
      { title: 'Figma Mastery', description: 'Become a pro at industry-standard tools.', duration: '2 Weeks', topics: ['Auto Layout', 'Components & Variants', 'Design Systems', 'Interactive Prototyping'] },
      { title: 'Portfolio & Hand-off', description: 'Prepare your work for developers and clients.', duration: '2 Weeks', topics: ['Developer Handoff', 'Creating Case Studies', 'Portfolio Building', 'Interview Prep'] }
    ])
  },
  {
    slug: 'ai-machine-learning',
    title: 'AI & Machine Learning',
    description: 'Build intelligent applications using Python and Machine Learning techniques.',
    iconName: 'BrainCircuit',
    color: 'from-indigo-500/20 to-transparent',
    borderColor: 'hover:border-indigo-500/50',
    duration: '16 Weeks',
    level: 'Advanced',
    prerequisites: 'Strong Python skills and basic linear algebra/statistics.',
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'OpenAI API', 'Hugging Face', 'Pandas'],
    careerOutcomes: ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Prompt Engineer'],
    curriculum: JSON.stringify([
      { title: 'Math & Data Preprocessing', description: 'The foundation of machine learning.', duration: '3 Weeks', topics: ['Linear Algebra & Calculus Basics', 'Statistics & Probability', 'Data Cleaning with Pandas', 'Feature Engineering'] },
      { title: 'Classical Machine Learning', description: 'Predictive modeling without neural networks.', duration: '4 Weeks', topics: ['Linear & Logistic Regression', 'Decision Trees & Random Forests', 'Clustering (K-Means)', 'Model Evaluation'] },
      { title: 'Deep Learning & Neural Networks', description: 'Build complex brain-inspired architectures.', duration: '5 Weeks', topics: ['Perceptrons & Feedforward Networks', 'Convolutional Neural Networks (CNN)', 'Recurrent Neural Networks (RNN)', 'TensorFlow / PyTorch basics'] },
      { title: 'Generative AI & LLMs', description: 'Work with cutting-edge AI models.', duration: '4 Weeks', topics: ['Transformers & Attention Mechanisms', 'Fine-tuning Hugging Face Models', 'Prompt Engineering', 'Building AI Agents (LangChain)'] }
    ])
  }
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  try {
    console.log(`Checking if collection ${COLLECTION_ID} exists...`);
    try {
      await databases.getCollection(DATABASE_ID, COLLECTION_ID);
      console.log('Collection exists.');
    } catch {
      console.log('Creating collection...');
      await databases.createCollection(DATABASE_ID, COLLECTION_ID, 'Learning Paths');
      console.log('Collection created. Adding attributes...');
      
      const attrs = [
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'slug', 100, true),
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'title', 255, true),
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'description', 1000, true),
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'iconName', 50, true),
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'color', 100, false, 'from-indigo-500/20 to-transparent'),
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'borderColor', 100, false, 'hover:border-indigo-500/50'),
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'duration', 50, true),
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'level', 50, true),
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'prerequisites', 500, true),
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'technologies', 100, false, undefined, true), // array
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'careerOutcomes', 150, false, undefined, true), // array
        databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'curriculum', 10000, false) // JSON string
      ];

      for (const attrPromise of attrs) {
        try {
          await attrPromise;
        } catch (e: any) {
          console.log('Attribute creation error (might already exist):', e.message);
        }
      }

      console.log('Waiting 5 seconds for attributes to be processed by Appwrite...');
      await sleep(5000);
    }

    console.log('Clearing existing data (if any) to prevent duplicates...');
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    for (const doc of existing.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
    }

    console.log('Seeding learning paths data...');
    for (const path of learningPathsData) {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), path);
      console.log(`- Inserted: ${path.title}`);
    }

    console.log('Learning paths seeded successfully!');
  } catch (error: any) {
    console.error('Migration Error:', error.message);
  }
}

run();
