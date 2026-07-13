export interface CourseModule {
  title: string;
  items: string[];
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  price: string;
  effort: string;
  format: string;
  cohortSize: string;
  image: string;
  skills: string[];
  modules: CourseModule[];
  careers: string[];
  targetAudience: string[];
}

export const COURSES: Course[] = [
  {
    slug: 'ai-and-automation',
    title: 'AI & Automation',
    description: 'Discover how to leverage Artificial Intelligence and automation tools to streamline workflows, eliminate repetitive tasks, and improve productivity.',
    category: 'AI',
    level: 'Beginner',
    duration: '8 weeks',
    price: '₦80,000',
    effort: '5-7 hrs / week',
    format: 'Live Cohort',
    cohortSize: '20-30 Students',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
    skills: ['Workflow Automation', 'Zapier Integration', 'AI Scripting', 'Task Management'],
    modules: [
      { title: 'Introduction to AI', items: ['History of AI', 'Types of Automation'] },
      { title: 'No-Code Automation', items: ['Zapier', 'Make', 'n8n'] },
      { title: 'Custom Workflows', items: ['Building custom scripts', 'API integrations'] },
      { title: 'Capstone Project', items: ['Automate a full business process'] }
    ],
    careers: ['Automation Specialist', 'Operations Manager', 'AI Consultant'],
    targetAudience: ['Business Owners', 'Operations Teams', 'Freelancers']
  },
  {
    slug: 'ai-prompt-engineering',
    title: 'AI Prompt Engineering',
    description: 'Master the art of communicating with AI. Learn advanced prompting techniques to generate high-quality content, automate workflows, solve complex problems.',
    category: 'AI',
    level: 'Beginner',
    duration: '6 weeks',
    price: '₦70,000',
    effort: '4-6 hrs / week',
    format: 'Live Cohort',
    cohortSize: '20-40 Students',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
    skills: ['Prompt Design', 'LLM Tuning', 'Content Generation', 'Few-shot Prompting'],
    modules: [
      { title: 'Basics of LLMs', items: ['How language models work', 'Tokens and Context'] },
      { title: 'Prompting Techniques', items: ['Zero-shot', 'Few-shot', 'Chain of Thought'] },
      { title: 'Advanced Scenarios', items: ['Code generation', 'Data analysis prompting'] },
      { title: 'Capstone Project', items: ['Build a robust prompt library'] }
    ],
    careers: ['Prompt Engineer', 'Content Strategist', 'AI Specialist'],
    targetAudience: ['Writers', 'Marketers', 'Developers']
  },
  {
    slug: 'ai-in-development',
    title: 'AI for Software Development',
    description: 'Learn how to use AI to accelerate software development. From code generation and debugging to documentation, testing, and deployment.',
    category: 'Development',
    level: 'Intermediate',
    duration: '6 weeks',
    price: '₦90,000',
    effort: '8-10 hrs / week',
    format: 'Live Cohort',
    cohortSize: '15-25 Students',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    skills: ['GitHub Copilot', 'Code Refactoring', 'Automated Testing', 'AI Debugging'],
    modules: [
      { title: 'AI Code Assistants', items: ['Copilot', 'Cursor', 'Codeium'] },
      { title: 'Refactoring with AI', items: ['Legacy code migration', 'Code optimization'] },
      { title: 'Testing & QA', items: ['Generating unit tests', 'Automated QA'] },
      { title: 'Capstone Project', items: ['Build and deploy an app using only AI assistance'] }
    ],
    careers: ['Software Engineer', 'Technical Lead', 'QA Automation Engineer'],
    targetAudience: ['Developers', 'Engineering Managers', 'QA Engineers']
  },
  {
    slug: 'ai-in-design',
    title: 'AI in Design',
    description: 'Learn how to use AI to enhance your creative workflow. Discover how professional designers leverage AI for ideation, UI design, branding, and content creation.',
    category: 'Design',
    level: 'Intermediate',
    duration: '6 weeks',
    price: '₦75,000',
    effort: '6-8 hrs / week',
    format: 'Live Cohort',
    cohortSize: '20-40 Students',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1200',
    skills: [
      'AI-Assisted UI/UX Design',
      'AI Image Generation',
      'Branding with AI',
      'AI Design Workflows',
      'Creative Prompt Engineering',
      'Design Productivity'
    ],
    modules: [
      { title: 'Introduction to AI for Designers', items: ['Understanding Generative AI', 'AI Ethics', 'Design Opportunities'] },
      { title: 'AI Design Tools', items: ['ChatGPT', 'Midjourney', 'Adobe Firefly', 'Figma AI'] },
      { title: 'Branding & Visual Design', items: ['Logo concepts', 'Moodboards', 'Style exploration', 'Marketing assets'] },
      { title: 'UI/UX with AI', items: ['Wireframes', 'User flows', 'Components', 'Prototyping'] },
      { title: 'Building AI Design Workflows', items: ['Automation', 'Asset generation', 'Collaboration'] },
      { title: 'Capstone Project', items: ['Design a complete AI-assisted digital product and present a professional case study'] }
    ],
    careers: ['AI Design Specialist', 'Product Designer', 'Brand Designer', 'Creative Designer'],
    targetAudience: ['Designers', 'Creative Professionals', 'Content Creators']
  },
  {
    slug: 'web-development',
    title: 'Full-Stack Web Development',
    description: 'Master modern web development by building real-world applications using React, Next.js, and Node.js.',
    category: 'Development',
    level: 'Beginner',
    duration: '12 weeks',
    price: '₦120,000',
    effort: '10-12 hrs / week',
    format: 'Live Cohort',
    cohortSize: '20-30 Students',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200',
    skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    modules: [
      { title: 'Frontend Fundamentals', items: ['HTML', 'CSS', 'JavaScript'] },
      { title: 'React & Next.js', items: ['Components', 'State Management', 'App Router'] },
      { title: 'Backend with Node.js', items: ['Express', 'REST APIs', 'Authentication'] },
      { title: 'Database Design', items: ['SQL', 'Prisma ORM', 'Database Optimization'] },
      { title: 'Deployment', items: ['Vercel', 'AWS', 'CI/CD'] },
      { title: 'Capstone Project', items: ['Build a full-stack SaaS application'] }
    ],
    careers: ['Frontend Developer', 'Backend Developer', 'Full-Stack Engineer'],
    targetAudience: ['Aspiring Developers', 'Students', 'Tech Enthusiasts']
  },
];
