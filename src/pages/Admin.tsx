import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchPosts, uploadMdFile, deletePost, Post } from "@/lib/api";
import Icon from "@/components/ui/icon";

const ADMIN_KEY_STORAGE = "blog_admin_key";

export default function Admin() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) || "");
  const [keyInput, setKeyInput] = useState("");
  const [authed, setAuthed] = useState(!!localStorage.getItem(ADMIN_KEY_STORAGE));

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ ok: boolean; slug?: string; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    const all = await fetchPosts();
    setPosts(all);
    setLoadingPosts(false);
  }, []);

  useEffect(() => {
    if (authed) loadPosts();
  }, [authed, loadPosts]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!keyInput.trim()) return;
    localStorage.setItem(ADMIN_KEY_STORAGE, keyInput.trim());
    setAdminKey(keyInput.trim());
    setAuthed(true);
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdminKey("");
    setAuthed(false);
    setPosts([]);
  }

  async function processFile(file: File) {
    if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
      setUploadResult({ ok: false, error: "Нужен файл с расширением .md" });
      return;
    }
    setUploading(true);
    setUploadResult(null);

    const text = await file.text();
    const b64 = btoa(unescape(encodeURIComponent(text)));
    const result = await uploadMdFile(b64, adminKey);
    setUploadResult(result);
    setUploading(false);

    if (result.ok) loadPosts();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  async function handleDelete(slug: string, title: string) {
    if (!window.confirm(`Удалить пост «${title}»?`)) return;
    const ok = await deletePost(slug, adminKey);
    if (ok) loadPosts();
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-8 transition-colors group">
            <Icon name="ArrowLeft" size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            На сайт
          </Link>
          <div className="text-2xl mb-1 font-display font-bold text-stone-900">Панель автора</div>
          <p className="text-stone-500 text-sm mb-8">Введите пароль администратора</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Пароль"
              autoFocus
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            <button
              type="submit"
              className="w-full bg-stone-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-amber-700 transition-colors"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-stone-400 hover:text-stone-700 transition-colors">
              <Icon name="ArrowLeft" size={18} />
            </Link>
            <span className="font-display font-bold text-stone-900">Панель автора</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 transition-colors"
          >
            <Icon name="LogOut" size={14} />
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Drag & Drop Upload */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-stone-900 text-lg mb-4">Опубликовать пост</h2>

          <div
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
              dragging
                ? "border-amber-400 bg-amber-50"
                : "border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown"
              onChange={handleFileChange}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Icon name="Loader2" size={36} className="text-amber-500 animate-spin" />
                <p className="text-stone-500 text-sm">Загружаю файл...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-amber-100" : "bg-stone-100"}`}>
                  <Icon name="FileUp" size={28} className={dragging ? "text-amber-600" : "text-stone-400"} />
                </div>
                <div>
                  <p className="font-medium text-stone-700 text-sm">
                    {dragging ? "Отпустите файл" : "Перетащите .md файл сюда"}
                  </p>
                  <p className="text-stone-400 text-xs mt-1">или нажмите, чтобы выбрать</p>
                </div>
              </div>
            )}
          </div>

          {/* Подсказка о фронтматтере */}
          <div className="mt-4 bg-stone-100 rounded-xl px-5 py-4 text-xs text-stone-500 font-mono leading-relaxed">
            <p className="text-stone-700 font-semibold mb-2 font-sans text-sm">Формат файла (необязательно):</p>
            <pre className="whitespace-pre-wrap">{`---
title: Название поста
category: Технологии
tags: тег1, тег2
author: Ваше имя
excerpt: Краткое описание
---

# Название поста

Текст в формате Markdown...`}</pre>
          </div>

          {uploadResult && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${uploadResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              <Icon name={uploadResult.ok ? "CheckCircle2" : "AlertCircle"} size={16} />
              {uploadResult.ok ? (
                <span>
                  Опубликовано!{" "}
                  <Link to={`/post/${uploadResult.slug}`} className="underline font-medium">
                    Открыть пост
                  </Link>
                </span>
              ) : (
                <span>{uploadResult.error}</span>
              )}
            </div>
          )}
        </div>

        {/* Posts list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-stone-900 text-lg">Все посты</h2>
            <button onClick={loadPosts} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
              <Icon name="RefreshCw" size={13} />
              Обновить
            </button>
          </div>

          {loadingPosts ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-stone-200 p-4 animate-pulse flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-1/2" />
                    <div className="h-3 bg-stone-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm">
              Постов нет. Загрузите первый .md файл!
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-stone-200 px-5 py-4 flex items-center justify-between gap-4 hover:border-stone-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-amber-600 font-medium">{post.category}</span>
                      <span className="text-stone-200">·</span>
                      <time className="text-xs text-stone-400">
                        {new Date(post.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                    </div>
                    <p className="font-medium text-stone-900 text-sm truncate">{post.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/post/${post.slug}`}
                      className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                      title="Просмотр"
                    >
                      <Icon name="ExternalLink" size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug, post.title)}
                      className="text-stone-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
