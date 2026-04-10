import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/blog/Header";
import Icon from "@/components/ui/icon";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-10 transition-colors group"
        >
          <Icon name="ArrowLeft" size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Все посты
        </Link>

        <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Контакты</h1>
        <p className="text-stone-500 mb-10">Напишите мне — отвечаю на все осмысленные письма.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: "Mail", label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
            { icon: "MessageSquare", label: "Telegram", value: "@username", href: "https://t.me/username" },
            { icon: "Rss", label: "RSS-фид", value: "Подписаться", href: "/rss" },
          ].map((contact) => (
            <a
              key={contact.label}
              href={contact.href}
              target={contact.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-2xl p-4 hover:border-amber-300 hover:bg-amber-50/30 transition-all group"
            >
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-stone-200 group-hover:border-amber-200 transition-colors shrink-0">
                <Icon name={contact.icon} size={16} className="text-amber-500" fallback="Link" />
              </div>
              <div>
                <p className="text-xs text-stone-400">{contact.label}</p>
                <p className="text-sm font-medium text-stone-800">{contact.value}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle2" size={28} className="text-green-600" />
              </div>
              <h3 className="font-display font-semibold text-stone-900 text-lg mb-2">Сообщение отправлено!</h3>
              <p className="text-stone-500 text-sm">Постараюсь ответить в течение нескольких дней.</p>
            </div>
          ) : (
            <>
              <h2 className="font-display font-semibold text-stone-900 mb-6 text-lg">Написать сообщение</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">Имя</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Ваше имя"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">Сообщение</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Напишите что-нибудь..."
                    rows={5}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-amber-700 transition-colors duration-200"
                >
                  <Icon name="Send" size={15} />
                  Отправить
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
