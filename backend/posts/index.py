"""
API для постов блога. GET список/один пост, POST загрузка MD-файла, PUT обновление, DELETE удаление.
"""
import json
import os
import re
import base64
import psycopg2
from datetime import datetime

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    "Content-Type": "application/json",
}

ADMIN_KEY = os.environ.get("BLOG_ADMIN_KEY", "")


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def check_admin(event: dict) -> bool:
    headers = event.get("headers") or {}
    key = headers.get("X-Admin-Key") or headers.get("x-admin-key") or ""
    return bool(ADMIN_KEY) and key == ADMIN_KEY


def slugify(text: str) -> str:
    translit = {
        "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"yo","ж":"zh","з":"z",
        "и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r",
        "с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"ts","ч":"ch","ш":"sh","щ":"sch",
        "ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya"
    }
    text = text.lower()
    result = ""
    for ch in text:
        result += translit.get(ch, ch)
    result = re.sub(r"[^a-z0-9]+", "-", result)
    return result.strip("-")[:80]


def parse_frontmatter(md_text: str) -> dict:
    """Парсит YAML-фронтматтер из MD файла. Поддерживает --- блок."""
    meta = {}
    content = md_text.strip()

    if content.startswith("---"):
        parts = content[3:].split("---", 1)
        if len(parts) == 2:
            fm_block, content = parts
            for line in fm_block.strip().splitlines():
                if ":" in line:
                    k, _, v = line.partition(":")
                    meta[k.strip()] = v.strip().strip('"').strip("'")
            content = content.strip()

    # Если нет фронтматтера — вытаскиваем заголовок из первого # heading
    if "title" not in meta:
        for line in content.splitlines():
            if line.startswith("# "):
                meta["title"] = line[2:].strip()
                break

    if "title" not in meta:
        meta["title"] = "Без названия"

    # excerpt — первый абзац после заголовка
    if "excerpt" not in meta:
        lines = [l for l in content.splitlines() if l.strip() and not l.startswith("#")]
        meta["excerpt"] = lines[0][:300] if lines else ""

    if "slug" not in meta:
        meta["slug"] = slugify(meta["title"])

    # Среднее время чтения: ~200 слов/мин
    word_count = len(content.split())
    meta.setdefault("read_time", str(max(1, round(word_count / 200))))
    meta.setdefault("category", "Без категории")
    meta.setdefault("tags", "")
    meta.setdefault("author", "Автор блога")

    meta["content"] = content
    return meta


def row_to_post(row) -> dict:
    return {
        "id": row[0],
        "slug": row[1],
        "title": row[2],
        "excerpt": row[3],
        "content": row[4],
        "category": row[5],
        "tags": [t.strip() for t in row[6].split(",") if t.strip()],
        "author": row[7],
        "read_time": row[8],
        "published": row[9],
        "date": row[10].strftime("%Y-%m-%d") if row[10] else "",
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    path = event.get("path", "/")

    # GET /posts или GET /posts?slug=xxx
    if method == "GET":
        slug = params.get("slug")
        conn = get_db()
        cur = conn.cursor()

        if slug:
            cur.execute(
                "SELECT id,slug,title,excerpt,content,category,tags,author,read_time,published,created_at FROM blog_posts WHERE slug=%s AND published=TRUE",
                (slug,)
            )
            row = cur.fetchone()
            conn.close()
            if not row:
                return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Пост не найден"})}
            return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"post": row_to_post(row)})}

        # Список постов с поиском и фильтрацией
        search = params.get("search", "").strip()
        category = params.get("category", "").strip()
        tag = params.get("tag", "").strip()

        query = "SELECT id,slug,title,excerpt,content,category,tags,author,read_time,published,created_at FROM blog_posts WHERE published=TRUE"
        args = []

        if search:
            query += " AND (title ILIKE %s OR excerpt ILIKE %s OR tags ILIKE %s)"
            args += [f"%{search}%", f"%{search}%", f"%{search}%"]
        if category:
            query += " AND category = %s"
            args.append(category)
        if tag:
            query += " AND tags ILIKE %s"
            args.append(f"%{tag}%")

        query += " ORDER BY created_at DESC"
        cur.execute(query, args)
        rows = cur.fetchall()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"posts": [row_to_post(r) for r in rows]})}

    # POST — загрузка MD-файла (base64) или JSON с данными поста
    if method == "POST":
        if not check_admin(event):
            return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет доступа"})}

        body = json.loads(event.get("body") or "{}")

        # Если передан base64 MD-файл
        if body.get("md_base64"):
            raw = base64.b64decode(body["md_base64"]).decode("utf-8")
            meta = parse_frontmatter(raw)
        else:
            meta = {
                "slug": body.get("slug", ""),
                "title": body.get("title", ""),
                "excerpt": body.get("excerpt", ""),
                "content": body.get("content", ""),
                "category": body.get("category", "Без категории"),
                "tags": body.get("tags", ""),
                "author": body.get("author", "Автор блога"),
                "read_time": str(body.get("read_time", 5)),
            }
            if not meta["slug"]:
                meta["slug"] = slugify(meta["title"])

        if not meta.get("title") or not meta.get("content"):
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нужны title и content"})}

        tags_str = meta["tags"] if isinstance(meta["tags"], str) else ",".join(meta["tags"])

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO blog_posts (slug,title,excerpt,content,category,tags,author,read_time)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
               ON CONFLICT (slug) DO UPDATE SET
                 title=EXCLUDED.title, excerpt=EXCLUDED.excerpt, content=EXCLUDED.content,
                 category=EXCLUDED.category, tags=EXCLUDED.tags, author=EXCLUDED.author,
                 read_time=EXCLUDED.read_time, updated_at=NOW()
               RETURNING id,slug""",
            (meta["slug"], meta["title"], meta["excerpt"], meta["content"],
             meta["category"], tags_str, meta["author"], int(meta.get("read_time", 5)))
        )
        new_id, new_slug = cur.fetchone()
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True, "id": new_id, "slug": new_slug})}

    # DELETE ?slug=xxx
    if method == "DELETE":
        if not check_admin(event):
            return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет доступа"})}

        slug = params.get("slug")
        if not slug:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "slug required"})}

        conn = get_db()
        cur = conn.cursor()
        cur.execute("DELETE FROM blog_posts WHERE slug=%s", (slug,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
