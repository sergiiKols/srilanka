-- ================================================
-- SUPABASE DATABASE SCHEMA (OPTIMIZED)
-- Только пользовательские объекты недвижимости
-- POIs остаются статическими в коде для быстрой загрузки
-- ================================================

-- Создаем таблицу user_properties (переименовали для ясности)
CREATE TABLE IF NOT EXISTS public.user_properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Основная информация
    title TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('villa', 'apartment', 'house', 'room', 'hostel', 'hotel')),
    area TEXT NOT NULL,
    
    -- Характеристики
    rooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2),
    beach_distance INTEGER NOT NULL,
    wifi_speed INTEGER NOT NULL DEFAULT 50,
    
    -- Удобства (amenities как массив текста)
    amenities TEXT[] DEFAULT '{}',
    
    -- Особенности (features как JSONB для гибкости)
    features JSONB NOT NULL DEFAULT '{
        "pool": false,
        "parking": false,
        "breakfast": false,
        "airConditioning": false,
        "kitchen": false,
        "petFriendly": false,
        "security": "none",
        "beachfront": false,
        "garden": false
    }'::jsonb,
    
    -- Описание и медиа
    clean_description TEXT,
    images TEXT[] DEFAULT '{}',
    
    -- Геолокация
    position POINT NOT NULL,  -- PostGIS point (lng, lat)
    google_maps_url TEXT NOT NULL,
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.user_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.user_properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.user_properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.user_properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.user_properties(created_at DESC);

-- Создаем GiST индекс для геопространственных запросов (если нужен поиск по радиусу)
CREATE INDEX IF NOT EXISTS idx_properties_position ON public.user_properties USING GIST(position);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- Защита данных: пользователь видит только свои объекты
-- ================================================

-- Включаем RLS для таблицы
ALTER TABLE public.user_properties ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователь может видеть только свои объекты
CREATE POLICY "Users can view own properties"
    ON public.user_properties
    FOR SELECT
    USING (auth.uid() = user_id);

-- Политика: Пользователь может создавать объекты
CREATE POLICY "Users can create own properties"
    ON public.user_properties
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Политика: Пользователь может обновлять только свои объекты
CREATE POLICY "Users can update own properties"
    ON public.user_properties
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Политика: Пользователь может удалять только свои объекты
CREATE POLICY "Users can delete own properties"
    ON public.user_properties
    FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- TRIGGERS
-- Автоматическое обновление updated_at
-- ================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_properties
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ================================================
-- REALTIME
-- Включаем real-time подписки для таблицы
-- ================================================

-- Включаем публикацию изменений
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_properties;

-- ================================================
-- STORAGE (опционально)
-- Для хранения фотографий объектов
-- ================================================

-- Создаем bucket для изображений (выполнить в Storage UI или через SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Политики для storage
CREATE POLICY "Public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'property-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'property-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'property-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ================================================
-- FUNCTIONS
-- Полезные функции для работы с данными
-- ================================================

-- Функция для поиска объектов в радиусе (км)
CREATE OR REPLACE FUNCTION public.user_properties_within_radius(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION
)
RETURNS SETOF public.user_properties AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.user_properties
    WHERE ST_DWithin(
        position::geography,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
        radius_km * 1000  -- конвертируем км в метры
    )
    AND user_id = auth.uid();  -- RLS все еще применяется
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для подсчета объектов пользователя
CREATE OR REPLACE FUNCTION public.count_user_properties()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.user_properties
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- SEED DATA (опционально)
-- Тестовые данные для разработки
-- ================================================

-- Раскомментируйте, если нужны тестовые данные
/*
INSERT INTO public.user_properties (
    user_id,
    title,
    property_type,
    area,
    rooms,
    bathrooms,
    price,
    beach_distance,
    wifi_speed,
    amenities,
    features,
    clean_description,
    images,
    position,
    google_maps_url
) VALUES (
    auth.uid(),  -- текущий пользователь
    'Test Villa',
    'villa',
    'Unawatuna',
    3,
    2,
    100.00,
    150,
    50,
    ARRAY['Pool', 'WiFi', 'Air Conditioning'],
    '{
        "pool": true,
        "parking": true,
        "breakfast": false,
        "airConditioning": true,
        "kitchen": true,
        "petFriendly": false,
        "security": "standard",
        "beachfront": false,
        "garden": true
    }'::jsonb,
    'Beautiful 3 bedroom villa near Unawatuna beach',
    ARRAY['https://example.com/image1.jpg'],
    POINT(80.2410, 6.0135),  -- lng, lat
    'https://www.google.com/maps/@6.0135,80.2410,17z'
);
*/

-- ================================================
-- GRANTS
-- Права доступа для authenticated пользователей
-- ================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_properties TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_properties_within_radius TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_user_properties TO authenticated;
