import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchPost, Post } from "@/lib/api";
import Header from "@/components/blog/Header";
import Comments from "@/components/blog/Comments";
import Icon from "@/components/ui/icon";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchPost(slug).then(setPost).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-stone-100 rounded w-20" />
            <div className="h-8 bg-stone-100 rounded w-2/3" />
            <div className="h-4 bg-stone-100 rounded w-full" />
            <div className="h-4 bg-stone-100 rounded w-5/6" />
            <div className="h-4 bg-stone-100 rounded w-4/5" />
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Icon name="FileQuestion" size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 mb-4">Пост не найден.</p>
          <Link to="/" className="text-amber-600 hover:text-amber-800 text-sm font-medium">
            ← Вернуться к постам
          </Link>
        </main>
      </div>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-8 transition-colors group"
        >
          <Icon name="ArrowLeft" size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Все посты
        </Link>

        <article>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {post.category}
            </span>
            <span className="text-xs text-stone-400">{post.read_time} мин чтения</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900 leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 mb-10 pb-8 border-b border-stone-100">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
              {post.author[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">{post.author}</p>
              <time className="text-xs text-stone-400">{formattedDate}</time>
            </div>
          </div>

          <div className="prose prose-stone prose-lg max-w-none
            prose-headings:font-display prose-headings:font-bold
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
            prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-amber-400 prose-blockquote:bg-amber-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-0.5
            prose-code:bg-stone-100 prose-code:text-stone-800 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono
            prose-pre:bg-stone-900 prose-pre:rounded-2xl prose-pre:text-sm
            prose-img:rounded-2xl
            prose-strong:text-stone-900
            prose-li:text-stone-600
            prose-p:text-stone-600 prose-p:leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-stone-100">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/?tag=${tag}`}
                  className="text-xs text-stone-500 bg-stone-50 border border-stone-200 px-3 py-1 rounded-full hover:border-amber-300 hover:text-amber-700 transition-all"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        <Comments postSlug={post.slug} />
      </main>

      <footer className="border-t border-stone-100 mt-16 py-8">
        <div className="max-w-3xl mx-auto px-6 text-center text-xs text-stone-400">
          © 2026 Журнал
        </div>
      </footer>
    </div>
  );
}
