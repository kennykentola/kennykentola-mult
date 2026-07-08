import { Metadata } from 'next';
import { getPublicBlogPost } from '../../../features/blog/blogService';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const post = await getPublicBlogPost(resolvedParams.slug);
    
    if (!post) {
      return {
        title: 'Blog Post Not Found',
      };
    }

    const imageUrl = post.coverImageUrl || post.coverImageId;

    return {
      title: `${post.title} | KennyKentola Blog`,
      description: post.excerpt || post.description || 'Read this post on KennyKentola',
      openGraph: {
        title: post.title,
        description: post.excerpt || post.description || '',
        type: 'article',
        publishedTime: post.publishedAt || post.$createdAt,
        authors: [post.authorName || 'KennyKentola'],
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.description || '',
        images: imageUrl ? [imageUrl] : [],
      }
    };
  } catch (error) {
    return {
      title: 'Blog Post | KennyKentola',
    };
  }
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}
