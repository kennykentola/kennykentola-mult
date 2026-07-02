import { 
  Users, Briefcase, GraduationCap, Code, FileText, 
  Target, Lightbulb, Copy, PlayCircle 
} from 'lucide-react';

export type FooterPageData = {
  title: string;
  subtitle: string;
  icon: any;
  content: {
    heading: string;
    body: string;
  }[];
  ctaText: string;
  ctaLink: string;
};

export const footerPagesData: Record<string, FooterPageData> = {
  // Company
  'our-experts': {
    title: 'Our Experts',
    subtitle: 'Meet the elite developers and academic mentors behind KennyKentola Digital.',
    icon: Users,
    content: [
      {
        heading: 'World-Class Mentorship',
        body: 'Our team consists of senior software engineers, UI/UX specialists, and experienced academic researchers who have guided thousands of students through their final year projects and technical careers.'
      },
      {
        heading: 'Industry Veterans',
        body: 'We don\'t just teach theory. Every mentor on our platform is actively building enterprise software, ensuring you learn the exact skills demanded by the modern tech industry.'
      }
    ],
    ctaText: 'Join the Academy',
    ctaLink: '/register?portal=academy'
  },
  'careers': {
    title: 'Careers',
    subtitle: 'Build the future of technical education and enterprise software with us.',
    icon: Briefcase,
    content: [
      {
        heading: 'Open Positions',
        body: 'We are constantly looking for talented Software Engineers, Technical Writers, and Academic Mentors to join our remote-first team.'
      },
      {
        heading: 'Why KennyKentola?',
        body: 'Work on high-impact projects ranging from Solar Infrastructure and E-Learning platforms to complex Academic Management systems. We offer competitive compensation and a culture of relentless excellence.'
      }
    ],
    ctaText: 'View Openings',
    ctaLink: '/careers'
  },

  // Services
  'academic-guidance': {
    title: 'Academic Guidance',
    subtitle: 'Expert support for your computer science final year project.',
    icon: GraduationCap,
    content: [
      {
        heading: 'From Topic to Defense',
        body: 'We provide end-to-end guidance. Whether you need help selecting a research-worthy topic, writing Chapter 1-5, or preparing for your Viva defense, our academic consultants ensure you understand every aspect of your work.'
      }
    ],
    ctaText: 'Request Guidance',
    ctaLink: '/academic'
  },
  'software-development': {
    title: 'Software Development',
    subtitle: 'Custom enterprise and academic software solutions.',
    icon: Code,
    content: [
      {
        heading: 'Full-Stack Engineering',
        body: 'We build robust web and mobile applications using React, Next.js, Node.js, Python, and Appwrite. From complex student portals to scalable e-commerce platforms, we engineer solutions designed to dominate.'
      }
    ],
    ctaText: 'Start a Project',
    ctaLink: '/projects'
  },
  'research-assistance': {
    title: 'Research Assistance',
    subtitle: 'Data analysis and literature review support.',
    icon: Target,
    content: [
      {
        heading: 'Elevate Your Research',
        body: 'Struggling with your methodology or literature review? We help you find peer-reviewed sources, analyze data, and properly structure your academic research to meet university standards.'
      }
    ],
    ctaText: 'Get Assistance',
    ctaLink: '/academic'
  },
  'documentation': {
    title: 'Technical Documentation',
    subtitle: 'Professional writing for software and academic systems.',
    icon: FileText,
    content: [
      {
        heading: 'Clear & Concise',
        body: 'We specialize in writing UML diagrams, ERDs, API documentation, and comprehensive Chapter Four implementations. Good software is nothing without excellent documentation.'
      }
    ],
    ctaText: 'Contact Us',
    ctaLink: '/contact'
  },
  'mentorship': {
    title: 'Mentorship',
    subtitle: '1-on-1 technical and career coaching.',
    icon: Users,
    content: [
      {
        heading: 'Accelerate Your Growth',
        body: 'Get paired with a senior engineer who will review your code, guide your learning path, and help you land your first role in tech.'
      }
    ],
    ctaText: 'Find a Mentor',
    ctaLink: '/register?portal=academy'
  },

  // Resources
  'project-ideas': {
    title: 'Project Ideas',
    subtitle: 'Curated list of final year project topics.',
    icon: Lightbulb,
    content: [
      {
        heading: 'Innovative Topics for 2026',
        body: 'AI-Powered Student Result Management Systems, Blockchain-based Voting Platforms, IoT Smart Campus Solutions, and more. Browse our updated list of approved project ideas.'
      }
    ],
    ctaText: 'Browse Topics',
    ctaLink: '/academic'
  },
  'templates': {
    title: 'Document Templates',
    subtitle: 'Standardized formats for proposals and documentation.',
    icon: Copy,
    content: [
      {
        heading: 'Save Time Formatting',
        body: 'Download our pre-formatted MS Word and LaTeX templates for project proposals, Chapter 1-5 documentation, and presentation slides. Compliant with standard university formatting guidelines.'
      }
    ],
    ctaText: 'View Templates',
    ctaLink: '/academic'
  },
  'tutorials': {
    title: 'Tutorials',
    subtitle: 'Step-by-step guides for modern tech stacks.',
    icon: PlayCircle,
    content: [
      {
        heading: 'Learn by Building',
        body: 'Access our library of free technical tutorials covering Next.js, Appwrite Database design, Authentication flows, and more.'
      }
    ],
    ctaText: 'Start Learning',
    ctaLink: '/academy'
  },
};
