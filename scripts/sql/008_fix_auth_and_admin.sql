-- Очищаем старые данные и пересоздаем таблицы с правильной структурой

-- Удаляем старые таблицы если они существуют
DROP TABLE IF EXISTS app_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS partner_notifications CASCADE;

-- Создаем таблицу пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу сессий
CREATE TABLE app_sessions (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу партнерских уведомлений
CREATE TABLE partner_notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для производительности
CREATE INDEX idx_app_sessions_token ON app_sessions(session_token);
CREATE INDEX idx_app_sessions_user_id ON app_sessions(user_id);
CREATE INDEX idx_app_sessions_expires_at ON app_sessions(expires_at);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_partner_notifications_active ON partner_notifications(is_active);

-- Вставляем тестового администратора
INSERT INTO users (username, password_hash, role) VALUES 
('admin', 'admin123', 'admin'),
('user', 'user123', 'user');

-- Вставляем тестовые партнерские уведомления
INSERT INTO partner_notifications (title, message, type, is_active) VALUES 
('Добро пожаловать!', 'Добро пожаловать в Thailand Travel Guide! Мы поможем вам спланировать идеальное путешествие.', 'success', true),
('Специальное предложение', 'Скидка 20% на все туры в Пхукет до конца месяца!', 'info', true),
('Важная информация', 'Обратите внимание на изменения в визовом режиме для российских туристов.', 'warning', true);

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_notifications_updated_at BEFORE UPDATE ON partner_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включаем RLS (Row Level Security) если нужно
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа (разрешаем все для сервисной роли)
CREATE POLICY "Enable all access for service role" ON users
    FOR ALL USING (true);

CREATE POLICY "Enable all access for service role" ON app_sessions
    FOR ALL USING (true);

CREATE POLICY "Enable all access for service role" ON partner_notifications
    FOR ALL USING (true);
