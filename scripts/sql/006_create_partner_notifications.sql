-- Создание таблицы партнерских уведомлений
CREATE TABLE IF NOT EXISTS partner_notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  cta_text VARCHAR(100) NOT NULL,
  cta_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  show_after_seconds INTEGER DEFAULT 30,
  show_on_pages JSONB DEFAULT '{"home": true, "blog": true, "news": true, "destinations": true}',
  limit_shows BOOLEAN DEFAULT false,
  max_shows_per_session INTEGER DEFAULT 1,
  show_randomly BOOLEAN DEFAULT false,
  target_scope VARCHAR(20) DEFAULT 'pages',
  targeted_news_ids INTEGER[] DEFAULT '{}',
  targeted_blog_ids INTEGER[] DEFAULT '{}',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_partner_notifications_active ON partner_notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_created_at ON partner_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_target_scope ON partner_notifications(target_scope);

-- Добавление RLS политик (если используется Row Level Security)
-- ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все могут читать активные уведомления)
-- CREATE POLICY "Anyone can read active notifications" ON partner_notifications
--   FOR SELECT USING (is_active = true);

-- Политика для админов (полный доступ)
-- CREATE POLICY "Admins can manage notifications" ON partner_notifications
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );
