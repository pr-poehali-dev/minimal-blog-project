import { useState, useMemo } from "react";
import { POSTS, CATEGORIES, searchPosts } from "@/data/posts";
import PostCard from "@/components/blog/PostCard";
import Header from "@/components/blog/Header";
import Icon from "@/components/ui/icon";
import { Link } from "react-router-dom";

export default function BlogHome() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    POSTS.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, []);

  const filtered = useMemo(() => {
    let posts = query ? searchPosts(query) : POSTS;
    if (activeCategory) posts = posts.filter((p) => p.category === activeCategory);
    if (activeTag) posts = posts.filter((p) => p.tags.includes(activeTag));
    return posts;
  }, [query, activeCategory, activeTag]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  function clearFilters() {
    setQuery("");
    setActiveCategory(null);
    setActiveTag(null);
  }

  const hasFilters = query || activeCategory || activeTag;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        {!hasFilters && (
          <div className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-3 leading-tight">
              Мысли<span className="text-amber-500">.</span>
            </h1>
            <p className="text-stone-500 text-lg">
              Личный блог о технологиях, дизайне и жизни.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по постам..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <Icon name="X" size={15} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              !activeCategory
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
            }`}
          >
            Все
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === cat
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-stone-600 border-stone-200 hover:border-amber-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tags */}
        {!query && (
          <div className="flex flex-wrap gap-1.5 mb-10">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                  activeTag === tag
                    ? "bg-amber-100 text-amber-700 font-medium"
                    : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        {hasFilters && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-stone-500">
              Найдено: <span className="font-semibold text-stone-900">{filtered.length}</span>
            </p>
            <button onClick={clearFilters} className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1">
              <Icon name="X" size={12} />
              Сбросить
            </button>
          </div>
        )}

        {/* Posts */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="SearchX" size={40} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-400 text-sm">Ничего не найдено. Попробуйте изменить запрос.</p>
          </div>
        ) : (
          <>
            {featured && <PostCard post={featured} featured />}
            {rest.length > 0 && (
              <div className="mt-8">
                {rest.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-stone-100 mt-16 py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <span>© 2026 Журнал</span>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-stone-600 transition-colors">Об авторе</Link>
            <Link to="/contact" className="hover:text-stone-600 transition-colors">Контакты</Link>
            <a href="/rss" className="hover:text-amber-600 transition-colors flex items-center gap-1">
              <Icon name="Rss" size={12} />
              RSS
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
