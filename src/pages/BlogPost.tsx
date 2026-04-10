import { useParams, Link, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug } from "@/data/posts";
import Header from "@/components/blog/Header";
import Comments from "@/components/blog/Comments";
import Icon from "@/components/ui/icon";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/" replace />;

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
            <Link
              to={`/?category=${post.category}`}
              className="text-xs font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              {post.category}
            </Link>
            <span className="text-xs text-stone-400">{post.readTime} мин чтения</span>
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
