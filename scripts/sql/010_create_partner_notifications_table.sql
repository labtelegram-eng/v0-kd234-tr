-- Удаляем таблицу если она существует
DROP TABLE IF EXISTS partner_notifications CASCADE;

-- Создаем таблицу партнерских уведомлений
CREATE TABLE partner_notifications (
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
    target_scope VARCHAR(20) DEFAULT 'pages' CHECK (target_scope IN ('pages', 'specific')),
    targeted_news_ids INTEGER[] DEFAULT '{}',
    targeted_blog_ids INTEGER[] DEFAULT '{}',
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX idx_partner_notifications_active ON partner_notifications(is_active);
CREATE INDEX idx_partner_notifications_created_at ON partner_notifications(created_at DESC);
CREATE INDEX idx_partner_notifications_target_scope ON partner_notifications(target_scope);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_partner_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_partner_notifications_updated_at ON partner_notifications;
CREATE TRIGGER trigger_update_partner_notifications_updated_at
    BEFORE UPDATE ON partner_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_notifications_updated_at();

-- Вставка тестовых данных
INSERT INTO partner_notifications (
    title, 
    content, 
    cta_text, 
    cta_url, 
    show_after_seconds, 
    show_on_pages,
    limit_shows,
    max_shows_per_session,
    show_randomly,
    target_scope
) VALUES 
(
    '🎉 Специальное предложение от нашего партнера!',
    'Получите скидку 25% на туры по Таиланду. Ограниченное предложение только для посетителей нашего сайта.',
    'Узнать больше',
    'https://example.com/partner-offer',
    20,
    '{"home": true, "blog": true, "news": false, "destinations": true}'::jsonb,
    true,
    1,
    false,
    'pages'
),
(
    '🏛️ Эксклюзивные туры по храмам Таиланда',
    'Откройте для себя духовную сторону Таиланда с нашими гидами-экспертами. Скидка 15% на первое бронирование.',
    'Забронировать тур',
    'https://example.com/temple-tours',
    25,
    '{"home": false, "blog": true, "news": true, "destinations": false}'::jsonb,
    true,
    3,
    true,
    'pages'
),
(
    '🍜 Кулинарные мастер-классы в Бангкоке',
    'Научитесь готовить настоящие тайские блюда! Групповые и индивидуальные занятия с профессиональными поварами.',
    'Записаться на мастер-класс',
    'https://example.com/cooking-classes',
    30,
    '{"home": true, "blog": false, "news": false, "destinations": true}'::jsonb,
    false,
    1,
    false,
    'pages'
);
