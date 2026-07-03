import { getSessionJwt } from '../../lib/sessionJwt';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function getPublicBlogPosts() {
  const res = await fetch(`${API_URL}/blog`);
  if (!res.ok) throw new Error('Failed to fetch blog posts');
  const data = await res.json();
  return data.posts;
}

export async function getPublicBlogPost(slug: string) {
  const res = await fetch(`${API_URL}/blog/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch blog post');
  const data = await res.json();
  return data.post;
}

export async function getAdminBlogPosts() {
  const token = await getSessionJwt();
  const res = await fetch(`${API_URL}/blog/all`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch admin blog posts');
  const data = await res.json();
  return data.posts;
}

export async function createBlogPost(postData: any) {
  const token = await getSessionJwt();
  const res = await fetch(`${API_URL}/blog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(postData)
  });
  if (!res.ok) throw new Error('Failed to create blog post');
  return await res.json();
}

export async function updateBlogPost(id: string, postData: any) {
  const token = await getSessionJwt();
  const res = await fetch(`${API_URL}/blog/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(postData)
  });
  if (!res.ok) throw new Error('Failed to update blog post');
  return await res.json();
}

export async function deleteBlogPost(id: string) {
  const token = await getSessionJwt();
  const res = await fetch(`${API_URL}/blog/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete blog post');
  return await res.json();
}
