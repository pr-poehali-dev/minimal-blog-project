"""
Комментарии к постам блога. GET — список комментариев, POST — добавить новый.
"""
import json
import os
import psycopg2  # noqa: psycopg2-binary in requirements.txt


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

MAX_AUTHOR_LEN = 80
MAX_TEXT_LEN = 1000
BANNED_WORDS = ["http://", "https://", "<script", "viagra", "casino"]


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        params = event.get("queryStringParameters") or {}
        post_slug = params.get("post_slug", "")
        if not post_slug:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "post_slug required"})}

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, author, text, date FROM blog_comments WHERE post_slug = %s AND is_approved = TRUE ORDER BY date ASC",
            (post_slug,)
        )
        rows = cur.fetchall()
        conn.close()

        comments = [
            {"id": r[0], "author": r[1], "text": r[2], "date": r[3].isoformat()}
            for r in rows
        ]
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"comments": comments})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        post_slug = (body.get("post_slug") or "").strip()
        author = (body.get("author") or "").strip()[:MAX_AUTHOR_LEN]
        text = (body.get("text") or "").strip()[:MAX_TEXT_LEN]

        if not post_slug or not author or not text:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Заполните все поля"})}

        text_lower = text.lower()
        for word in BANNED_WORDS:
            if word in text_lower:
                return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Комментарий содержит недопустимое содержимое"})}

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO blog_comments (post_slug, author, text) VALUES (%s, %s, %s) RETURNING id",
            (post_slug, author, text)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True, "id": new_id})}

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}