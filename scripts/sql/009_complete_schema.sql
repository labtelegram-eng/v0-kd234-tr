-- Полная схема базы данных для Thailand Travel Guide

-- Пользователи и сессии
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  security_question TEXT NOT NULL,
  security_answer VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Направления
CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Настройки главной страницы
CREATE TABLE IF NOT EXISTS home_settings (
  id SERIAL PRIMARY KEY,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_button_text VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hero_slides (
  id SERIAL PRIMARY KEY,
  image TEXT NOT NULL,
  alt TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Музыкальные треки
CREATE TABLE IF NOT EXISTS music_tracks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  cover_image TEXT,
  youtube_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Культурное видео
CREATE TABLE IF NOT EXISTS culture_video (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  thumbnail TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Блог
CREATE TABLE IF NOT EXISTS blog_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  category VARCHAR(50) REFERENCES blog_categories(id),
  slug VARCHAR(500) UNIQUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_time INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Новости
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  category VARCHAR(100) DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Виджеты новостей
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

-- Партнерские уведомления
CREATE TABLE IF NOT EXISTS partner_notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  cta_text VARCHAR(255) NOT NULL,
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
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем админа если не существует
INSERT INTO users (username, password_hash, security_question, security_answer, role)
VALUES ('admin', 'admin123', 'Как звали вашего первого питомца?', 'админ', 'admin')
ON CONFLICT (username) DO UPDATE SET
  password_hash = 'admin123',
  role = 'admin';

-- Вставляем тестовые данные для направлений
INSERT INTO destinations (name, image, order_index, is_active) VALUES
('Пхукет', '/destinations/new-phuket.webp', 1, true),
('Бангкок', '/destinations/new-bangkok.webp', 2, true),
('Чиангмай', '/destinations/new-chiang-mai.webp', 3, true),
('Краби', '/destinations/new-krabi.webp', 4, true),
('Паттайя', '/destinations/new-pattaya.webp', 5, true),
('Ко Самуи', '/destinations/new-koh-samui.webp', 6, true)
ON CONFLICT DO NOTHING;

-- Настройки главной страницы
INSERT INTO home_settings (hero_title, hero_subtitle, hero_button_text) VALUES
('Откройте для себя чудеса Таиланда', 'Откройте для себя красоту, культуру и приключения, которые ждут вас в Стране Улыбок. Спланируйте свое идеальное путешествие с нашим подробным гидом.', 'Начать планирование')
ON CONFLICT DO NOTHING;

-- Слайды героя
INSERT INTO hero_slides (image, alt, order_index, is_active) VALUES
('/hero/thailand-rural-countryside.webp', 'Сельская местность Таиланда с рисовыми полями и традиционными домами', 1, true),
('/hero/luxury-resort-courtyard.webp', 'Роскошный курортный дворик с пальмами и восточной архитектурой', 2, true),
('/hero/tropical-islands-aerial.webp', 'Аэрофотосъемка тропических островов с бирюзовой водой', 3, true),
('/hero/thailand-flag-mountain-view.webp', 'Человек с флагом Таиланда на горной вершине', 4, true)
ON CONFLICT DO NOTHING;

-- Категории блога
INSERT INTO blog_categories (id, name, slug, is_active, order_index) VALUES
('culture', 'Культура', 'culture', true, 1),
('travel', 'Путешествия', 'travel', true, 2),
('food', 'Еда', 'food', true, 3),
('tips', 'Советы', 'tips', true, 4),
('history', 'История', 'history', true, 5),
('nature', 'Природа', 'nature', true, 6)
ON CONFLICT DO NOTHING;
