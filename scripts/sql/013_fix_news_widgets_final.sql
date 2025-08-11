-- Финальный фикс для таблицы news_widgets
-- Удаляем старую таблицу если она существует
DROP TABLE IF EXISTS news_widgets CASCADE;

-- Создаем таблицу заново с правильной структурой
CREATE TABLE news_widgets (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем дефолтные виджеты с правильными типами
INSERT INTO news_widgets (type, title, is_active, order_index, settings) VALUES
('thailand-time', 'Время в Таиланде', true, 1, '{"timezone": "Asia/Bangkok", "format": "24h"}'),
('safety-status', 'Статус безопасности', true, 2, '{"status": "safe", "level": "Низкий", "reason": "Обстановка спокойная"}'),
('emergency-contacts', 'Экстренные службы', true, 3, '{"contacts": [{"name": "Полиция Таиланда", "phone": "191"}, {"name": "Скорая помощь", "phone": "1669"}]}'),
('embassy-info', 'Посольство РФ', true, 4, '{"phone": "+66-2-234-2012", "address": "Бангкок, ул. Кикерн, 78", "description": "Консульский отдел"}'),
('tourist-hotline', 'Помощь туристам', true, 5, '{"phone": "1155", "description": "Горячая линия для туристов 24/7"}'),
('weather-info', 'Погода', true, 6, '{"location": "Bangkok", "showForecast": true}');

-- Создание индексов для оптимизации
CREATE INDEX idx_news_widgets_active ON news_widgets(is_active);
CREATE INDEX idx_news_widgets_order ON news_widgets(order_index);
CREATE INDEX idx_news_widgets_type ON news_widgets(type);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_news_widgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER trigger_update_news_widgets_updated_at
    BEFORE UPDATE ON news_widgets
    FOR EACH ROW
    EXECUTE FUNCTION update_news_widgets_updated_at();

-- Проверяем что данные добавились
SELECT 'Создано виджетов: ' || COUNT(*) as result FROM news_widgets;
</sql>
