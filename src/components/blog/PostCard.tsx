import { Link } from "react-router-dom";
import { Post } from "@/data/posts";

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (featured) {
    return (
      <Link to={`/post/${post.slug}`} className="group block border border-stone-200 rounded-2xl p-8 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {post.category}
          </span>
          <span className="text-xs text-stone-400">{post.readTime} мин чтения</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-3 group-hover:text-amber-800 transition-colors leading-tight">
          {post.title}
        </h2>
        <p className="text-stone-500 leading-relaxed mb-5 text-base">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-stone-400 hover:text-stone-600">
                #{tag}
              </span>
            ))}
          </div>
          <time className="text-xs text-stone-400 shrink-0 ml-4">{formattedDate}</time>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/post/${post.slug}`} className="group block py-6 border-b border-stone-100 last:border-0 hover:bg-stone-50/50 -mx-4 px-4 rounded-xl transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-amber-600">{post.category}</span>
            <span className="text-stone-200">·</span>
            <span className="text-xs text-stone-400">{post.readTime} мин</span>
          </div>
          <h3 className="font-display text-lg font-semibold text-stone-900 group-hover:text-amber-800 transition-colors leading-snug mb-1.5">
            {post.title}
          </h3>
          <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
        </div>
        <time className="text-xs text-stone-400 shrink-0 mt-1 hidden sm:block">
          {new Date(post.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
        </time>
      </div>
    </Link>
  );
}
