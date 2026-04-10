"""
RSS 2.0 фид для блога. Возвращает XML со списком последних постов.
"""

POSTS = [
    {
        "slug": "how-internet-works",
        "title": "Как работает интернет (на самом деле)",
        "excerpt": "Что происходит за долю секунды между нажатием Enter и появлением страницы на экране.",
        "date": "2026-04-08",
        "category": "Технологии",
    },
    {
        "slug": "minimalism-in-design",
        "title": "Минимализм: меньше значит больше",
        "excerpt": "Почему лучшие дизайнеры убирают, а не добавляют, и как этот принцип применить в жизни.",
        "date": "2026-04-05",
        "category": "Дизайн",
    },
    {
        "slug": "welcome-to-the-blog",
        "title": "Добро пожаловать в блог",
        "excerpt": "Первый пост о том, зачем я начал писать и о чём буду рассказывать в этом пространстве.",
        "date": "2026-04-01",
        "category": "Жизнь",
    },
]

BLOG_URL = "https://your-blog.poehali.dev"


def escape_xml(text: str) -> str:
    return (text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;"))


def handler(event: dict, context) -> dict:
    items = ""
    for p in POSTS:
        items += f"""
    <item>
      <title>{escape_xml(p["title"])}</title>
      <link>{BLOG_URL}/post/{p["slug"]}</link>
      <description>{escape_xml(p["excerpt"])}</description>
      <pubDate>{p["date"]}</pubDate>
      <category>{escape_xml(p["category"])}</category>
      <guid>{BLOG_URL}/post/{p["slug"]}</guid>
    </item>"""

    rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Журнал</title>
    <link>{BLOG_URL}</link>
    <description>Личный блог о технологиях, дизайне и жизни</description>
    <language>ru</language>
    <atom:link href="{BLOG_URL}/rss" rel="self" type="application/rss+xml"/>
    {items}
  </channel>
</rss>"""

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
        },
        "body": rss,
    }
