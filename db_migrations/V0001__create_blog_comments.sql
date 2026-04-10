CREATE TABLE IF NOT EXISTS blog_comments (
    id SERIAL PRIMARY KEY,
    post_slug VARCHAR(255) NOT NULL,
    author VARCHAR(80) NOT NULL,
    text TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_slug ON blog_comments(post_slug);
