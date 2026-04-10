import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
}

interface CommentsProps {
  postSlug: string;
}

const FUNC_URL = "https://functions.poehali.dev/6aa556ec-93b4-4783-a3e5-9cee692e4609";

export default function Comments({ postSlug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ author: "", text: "" });
  const [mathQ, setMathQ] = useState({ a: 0, b: 0, answer: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function generateMath() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setMathQ({ a, b, answer: "" });
  }

  useEffect(() => {
    generateMath();
    fetchComments();
  }, [postSlug]);

  async function fetchComments() {
    setLoading(true);
    try {
      const res = await fetch(`${FUNC_URL}?post_slug=${postSlug}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.author.trim() || !form.text.trim()) {
      setError("Заполните имя и текст комментария.");
      return;
    }

    if (parseInt(mathQ.answer) !== mathQ.a + mathQ.b) {
      setError(`Неверный ответ на задачу. Попробуйте ещё раз.`);
      generateMath();
      setMathQ((q) => ({ ...q, answer: "" }));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(FUNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_slug: postSlug,
          author: form.author.trim(),
          text: form.text.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Комментарий добавлен!");
        setForm({ author: "", text: "" });
        generateMath();
        fetchComments();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка при отправке.");
      }
    } catch {
      setError("Не удалось отправить комментарий. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 pt-12 border-t border-stone-200">
      <h2 className="font-display text-xl font-bold text-stone-900 mb-8 flex items-center gap-2">
        <Icon name="MessageCircle" size={20} />
        Комментарии
        {comments.length > 0 && (
          <span className="text-sm font-normal text-stone-400 ml-1">({comments.length})</span>
        )}
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-stone-400 text-sm py-6">
          <Icon name="Loader2" size={16} className="animate-spin" />
          Загрузка...
        </div>
      ) : comments.length === 0 ? (
        <p className="text-stone-400 text-sm py-4">Комментариев пока нет. Будьте первым!</p>
      ) : (
        <div className="space-y-6 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 font-bold text-sm">
                {c.author[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-semibold text-stone-900 text-sm">{c.author}</span>
                  <time className="text-xs text-stone-400">
                    {new Date(c.date).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
        <h3 className="font-display font-semibold text-stone-900 mb-5 text-base">Оставить комментарий</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Имя</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              placeholder="Ваше имя"
              maxLength={80}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">Сообщение</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              placeholder="Напишите что-нибудь..."
              maxLength={1000}
              rows={4}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Защита от ботов: сколько будет {mathQ.a} + {mathQ.b}?
            </label>
            <input
              type="number"
              value={mathQ.answer}
              onChange={(e) => setMathQ((q) => ({ ...q, answer: e.target.value }))}
              placeholder="Ответ"
              className="w-32 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs flex items-center gap-1.5">
              <Icon name="AlertCircle" size={14} />
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-xs flex items-center gap-1.5">
              <Icon name="CheckCircle2" size={14} />
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {submitting ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Send" size={15} />}
            {submitting ? "Отправка..." : "Опубликовать"}
          </button>
        </form>
      </div>
    </section>
  );
}