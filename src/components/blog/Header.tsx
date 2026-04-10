import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors">
            Журнал
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5"></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="nav-link text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Посты
          </Link>
          <Link to="/about" className="nav-link text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Об авторе
          </Link>
          <Link to="/contact" className="nav-link text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Контакты
          </Link>
          <a
            href="/rss"
            target="_blank"
            rel="noopener noreferrer"
            title="RSS-фид"
            className="text-stone-400 hover:text-amber-600 transition-colors"
          >
            <Icon name="Rss" size={18} />
          </a>
        </nav>

        <button
          className="md:hidden text-stone-600 hover:text-stone-900 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-6 py-4 flex flex-col gap-4 animate-fade-in">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-stone-700 hover:text-stone-900">
            Посты
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-stone-700 hover:text-stone-900">
            Об авторе
          </Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-stone-700 hover:text-stone-900">
            Контакты
          </Link>
          <a href="/rss" className="flex items-center gap-2 text-sm font-medium text-amber-600">
            <Icon name="Rss" size={16} />
            RSS-фид
          </a>
        </div>
      )}
    </header>
  );
}
