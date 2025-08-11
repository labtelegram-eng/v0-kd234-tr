-- Создание таблицы для виджетов новостей
CREATE TABLE IF NOT EXISTS news_widgets (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('time', 'safety', 'emergency', 'embassy', 'tourist-help', 'custom')),
    title VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_news_widgets_active ON news_widgets(is_active);
CREATE INDEX IF NOT EXISTS idx_news_widgets_order ON news_widgets(order_index);
CREATE INDEX IF NOT EXISTS idx_news_widgets_type ON news_widgets(type);

-- Вставка дефолтных виджетов
INSERT INTO news_widgets (type, title, is_active, order_index, settings) VALUES
('time', 'Время в Бангкоке', true, 1, '{"timezone": "Asia/Bangkok", "format": "24h", "icon": "Clock", "color": "blue"}'),
('safety', 'Безопасность', true, 2, '{"status": "safe", "level": "Безопасно", "reason": "Обычная туристическая активность", "color": "emerald"}'),
('emergency', 'Экстренные службы', true, 3, '{"phone": "191", "description": "Полиция", "icon": "Phone", "color": "red"}'),
('embassy', 'Посольство РФ', true, 4, '{"phone": "+66 2 234 0993", "description": "Бангкок", "icon": "MapPin", "color": "violet"}'),
('tourist-help', 'Помощь туристам', true, 5, '{"phone": "1672", "description": "Горячая линия", "icon": "Info", "color": "emerald"}')
ON CONFLICT DO NOTHING;

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_news_widgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_news_widgets_updated_at ON news_widgets;
CREATE TRIGGER trigger_update_news_widgets_updated_at
    BEFORE UPDATE ON news_widgets
    FOR EACH ROW
    EXECUTE FUNCTION update_news_widgets_updated_at();
