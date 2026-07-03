'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BlogEditor } from '../../../../../components/blog/BlogEditor';
import { getAdminBlogPosts } from '../../../../../features/blog/blogService';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const posts = await getAdminBlogPosts();
        const post = posts.find((p: any) => p.$id === params?.id);
        if (post) {
          setInitialData(post);
        } else {
          toast.error('Post not found');
          router.push('/admin/blog');
        }
      } catch (err) {
        toast.error('Failed to load post');
        router.push('/admin/blog');
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) {
      fetchPost();
    }
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <BlogEditor isEdit={true} initialData={initialData} />;
}
