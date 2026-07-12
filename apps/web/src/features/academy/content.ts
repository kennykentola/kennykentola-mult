export type AcademyCourse = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  progress?: number;
  lessons: number;
  completedLessons?: number;
  activeLesson?: string;
  price?: string;
  coverColor: string;
  tag?: string;
};

export const academyOverview = {
  title: 'Programming Academy',
  description:
    'Learn full-stack web development, Python, mobile apps, and UI and UX design from industry professionals.',
  heroCopy:
    'Acquire real-world engineering skills through practical project construction.',
  dashboardSummary:
    'Your centralized KennyKentola digital hub. Track class schedules, project progress, payments, and support chats in one place.'
};

export const enrolledCourses: AcademyCourse[] = [
  {
    id: 'fullstack-nextjs',
    title: 'Full-Stack React and Next.js 15',
    description:
      'Master the App Router, Server Components, Server Actions, Suspense, and middleware with Appwrite integration.',
    instructor: 'Kenny Kentola',
    category: 'Frontend',
    progress: 68,
    lessons: 24,
    completedLessons: 16,
    activeLesson: 'Lesson 9: Server Components',
    coverColor: 'from-violet-600 to-indigo-600'
  },
  {
    id: 'python-django',
    title: 'Python and Django Backend Masterclass',
    description:
      'Build scalable APIs, configure Docker containers, and implement secure JWT authentication systems.',
    instructor: 'Sarah Jenkins',
    category: 'Backend',
    progress: 12,
    lessons: 32,
    completedLessons: 4,
    activeLesson: 'Lesson 3: Docker Env Setup',
    coverColor: 'from-blue-600 to-cyan-600'
  }
];

export const catalogCourses: AcademyCourse[] = [
  {
    id: 'mobile-expo',
    title: 'React Native and Expo Go Mobile Development',
    description:
      'Design native iOS and Android apps with shared code, offline storage, and push notifications.',
    instructor: 'Kenny Kentola',
    category: 'Mobile',
    lessons: 28,
    price: '$199',
    coverColor: 'from-emerald-600 to-teal-600',
    tag: 'New'
  },
  {
    id: 'ui-ux-glass',
    title: 'Modern UI and UX with Glassmorphism',
    description:
      'Create high-fidelity SaaS dashboards, motion systems, and responsive web apps with polish.',
    instructor: 'Alex Rivera',
    category: 'Design',
    lessons: 18,
    price: '$99',
    coverColor: 'from-rose-600 to-pink-600',
    tag: 'Trending'
  },
  {
    id: 'devops-aws',
    title: 'DevOps and AWS Cloud Infrastructure',
    description:
      'Automate deployments using GitHub Actions, configure Nginx reverse proxies, and provision VPCs.',
    instructor: 'David Miller',
    category: 'DevOps',
    lessons: 36,
    price: '$249',
    coverColor: 'from-amber-600 to-orange-600'
  }
];

export const academyStats = {
  enrolledCourses: enrolledCourses.length,
  studyHours: '14.5 hrs',
  completedLessons: enrolledCourses.reduce(
    (total, course) => total + (course.completedLessons || 0),
    0
  ),
  certificates: 0,
  activeCatalogCourses: catalogCourses.length
};
