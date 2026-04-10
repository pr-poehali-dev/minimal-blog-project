const POSTS_URL = "https://functions.poehali.dev/325b3433-6afb-4854-906a-87acbdc1a689";

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  read_time: number;
  published: boolean;
  date: string;
}

export interface PostsFilter {
  search?: string;
  category?: string;
  tag?: string;
}

export async function fetchPosts(filter: PostsFilter = {}): Promise<Post[]> {
  const params = new URLSearchParams();
  if (filter.search) params.set("search", filter.search);
  if (filter.category) params.set("category", filter.category);
  if (filter.tag) params.set("tag", filter.tag);
  const res = await fetch(`${POSTS_URL}?${params}`);
  const data = await res.json();
  return data.posts || [];
}

export async function fetchPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${POSTS_URL}?slug=${slug}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.post || null;
}

export async function uploadMdFile(base64: string, adminKey: string): Promise<{ ok: boolean; slug?: string; error?: string }> {
  const res = await fetch(POSTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
    body: JSON.stringify({ md_base64: base64 }),
  });
  return res.json();
}

export async function deletePost(slug: string, adminKey: string): Promise<boolean> {
  const res = await fetch(`${POSTS_URL}?slug=${slug}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": adminKey },
  });
  const data = await res.json();
  return data.ok === true;
}
