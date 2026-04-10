import { Link } from "react-router-dom";
import Header from "@/components/blog/Header";
import Icon from "@/components/ui/icon";

export default function About() {
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

        <div className="flex flex-col sm:flex-row items-start gap-8 mb-12">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-4xl shrink-0">
            ✍️
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Об авторе</h1>
            <p className="text-stone-500 text-base leading-relaxed">
              Привет! Я пишу этот блог.
            </p>
          </div>
        </div>

        <div className="prose prose-stone prose-lg max-w-none
          prose-headings:font-display prose-headings:font-bold
          prose-h2:text-xl
          prose-p:text-stone-600 prose-p:leading-relaxed
          prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-stone-900">

          <h2>Кто я</h2>
          <p>
            Здесь вы можете написать о себе — чем занимаетесь, что вас интересует, почему начали вести блог.
            Расскажите свою историю так, как считаете нужным.
          </p>

          <h2>О чём этот блог</h2>
          <p>
            Блог — это пространство для мыслей, которые хочется зафиксировать и поделиться.
            Здесь нет строгой темы: пишу о том, что кажется важным или интересным в данный момент.
          </p>

          <h2>Как со мной связаться</h2>
          <p>
            Лучший способ — через <Link to="/contact">страницу контактов</Link>.
            Я отвечаю на все осмысленные письма.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { icon: "BookOpen", label: "Постов написано", value: "3" },
            { icon: "Tag", label: "Тем и тегов", value: "9" },
            { icon: "Calendar", label: "Год старта", value: "2026" },
          ].map((stat) => (
            <div key={stat.label} className="bg-stone-50 rounded-2xl p-5 border border-stone-100 text-center">
              <Icon name={stat.icon} size={20} className="mx-auto mb-2 text-amber-500" fallback="Star" />
              <p className="font-display font-bold text-2xl text-stone-900">{stat.value}</p>
              <p className="text-xs text-stone-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}