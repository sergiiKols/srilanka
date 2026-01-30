/**
 * ADMIN MASTER MAP
 * Показывает все объекты: POI + saved_properties от всех клиентов
 */

import { useState, useEffect, useRef } from 'react';
import Map from '../map/Map';
import PropertyDrawer from '../property/PropertyDrawer';
import PropertyImporterAI from '../PropertyImporterAI';
import GeoPickerButton from '../GeoPickerButton';
import { createClient } from '@supabase/supabase-js';

// Supabase клиент
const supabase = createClient(
    'https://mcmzdscpuoxwneuzsanu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw'
);

// Слои карты
const LAYERS = [
    { id: 'pois', label: '🔵 POI (Places)', color: '#3b82f6' },
    { id: 'client_properties', label: '🔴 Client Properties', color: '#ef4444' }
];

export default function AdminMasterMap() {
    const mapRef = useRef<any>(null);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [selectedPropertyPos, setSelectedPropertyPos] = useState<[number, number] | null>(null);
    
    // Слои
    const [activeLayers, setActiveLayers] = useState<string[]>(['pois', 'client_properties']);
    
    // Данные
    const [poisData, setPoisData] = useState<any[]>([]);
    const [clientProperties, setClientProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Фильтры
    const [heatmapMode, setHeatmapMode] = useState<'none' | 'time' | 'user' | 'price'>('none');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [showDeleted, setShowDeleted] = useState(false); // ✅ Показать удалённые объекты
    const [isImporterOpen, setIsImporterOpen] = useState(false); // ✅ Для Import модала
    
    // Статистика
    const [stats, setStats] = useState({
        totalPOIs: 0,
        totalClients: 0,
        totalProperties: 0,
        uniqueUsers: 0
    });


    // Загрузка POI данных
    useEffect(() => {
        loadPOIsData();
    }, []);

    // Загрузка клиентских объектов
    useEffect(() => {
        loadClientProperties();
        
        // Подписка на изменения в реальном времени
        const subscription = supabase
            .channel('saved_properties_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'saved_properties'
            }, (payload) => {
                console.log('🔄 Изменение в saved_properties:', payload);
                loadClientProperties();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [dateFilter, selectedUser, showDeleted]); // ✅ Добавили зависимость от showDeleted

    // Загрузка POI из Supabase (ОТКЛЮЧЕНО - таблица pois не существует)
    const loadPOIsData = async () => {
        console.log('ℹ️ POI loading disabled - table does not exist');
        setPoisData([]);
        setStats(prev => ({ ...prev, totalPOIs: 0 }));
        
        // TODO: Создать таблицу pois или использовать другой источник данных
        // Возможные варианты:
        // 1. Создать таблицу poi_locations в Supabase
        // 2. Загружать из JSON файлов (как раньше)
        // 3. Интеграция с Google Places API
    };

    // Загрузка клиентских объектов
    const loadClientProperties = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('saved_properties')
                .select('*')
                .order('created_at', { ascending: false });

            // Фильтр по дате
            if (dateFilter !== 'all') {
                const now = new Date();
                let startDate;

                switch (dateFilter) {
                    case 'today':
                        startDate = new Date(now.setHours(0, 0, 0, 0));
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                }

                if (startDate) {
                    query = query.gte('created_at', startDate.toISOString());
                }
            }

            // Фильтр по пользователю
            if (selectedUser !== 'all') {
                query = query.eq('telegram_user_id', parseInt(selectedUser));
            }

            // ✅ Фильтр по удалённым (по умолчанию показываем только активные)
            if (!showDeleted) {
                query = query.is('deleted_at', null);
                console.log('🔍 Фильтруем: только активные объекты (deleted_at IS NULL)');
            } else {
                console.log('🔍 Показываем ВСЕ объекты (включая удалённые)');
            }

            const { data, error } = await query;

            if (error) {
                console.error('Ошибка загрузки клиентских объектов:', error);
                return;
            }

            const mappedProperties = (data || []).map((prop: any) => {
                // Обработка photos - может быть массивом, строкой или null
                let photos: string[] = [];
                if (Array.isArray(prop.photos)) {
                    photos = prop.photos;
                } else if (typeof prop.photos === 'string' && prop.photos) {
                    photos = prop.photos.split(/[\s,]+/).filter((url: string) => url.trim());
                }

                return {
                    id: `client-${prop.id}`,
                    title: prop.title || prop.property_type || 'Property',
                    lat: prop.latitude,
                    lng: prop.longitude,
                    price: prop.price,
                    currency: prop.currency || 'USD',
                    type: 'client_property',
                    property_type: prop.property_type,
                    bedrooms: prop.bedrooms,
                    bathrooms: prop.bathrooms,
                    photos: photos,
                    source_type: prop.source_type,
                    forward_from: prop.forward_from_chat_title || prop.forward_from_username,
                    telegram_user_id: prop.telegram_user_id,
                    created_at: prop.created_at,
                    description: prop.description,
                    contact_phone: prop.contact_phone,
                    amenities: prop.amenities,
                    deleted_at: prop.deleted_at, // ✅ Метка удаления
                    isDeleted: !!prop.deleted_at // ✅ Флаг для отображения
                };
            });

            setClientProperties(mappedProperties);

            // Статистика
            const uniqueUsers = new Set(mappedProperties.map(p => p.telegram_user_id)).size;
            const activeCount = mappedProperties.filter(p => !p.isDeleted).length;
            const deletedCount = mappedProperties.filter(p => p.isDeleted).length;
            
            setStats(prev => ({
                ...prev,
                totalProperties: mappedProperties.length,
                uniqueUsers
            }));

            console.log(`✅ Загружено ${mappedProperties.length} клиентских объектов от ${uniqueUsers} пользователей`);
            console.log(`   📊 Активных: ${activeCount}, Удалённых: ${deletedCount}`);
        } catch (err) {
            console.error('Ошибка при загрузке клиентских объектов:', err);
        } finally {
            setLoading(false);
        }
    };

    // Получить цвет маркера для тепловой карты
    const getHeatmapColor = (property: any) => {
        // ✅ Удалённые объекты всегда красные
        if (property.isDeleted) {
            return '#dc2626'; // Тёмно-красный для удалённых
        }

        if (heatmapMode === 'none') {
            return property.type === 'poi' ? '#3b82f6' : '#ef4444';
        }

        if (property.type === 'poi') {
            return '#3b82f6'; // POI всегда синие
        }

        switch (heatmapMode) {
            case 'time':
                const hoursAgo = (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60);
                if (hoursAgo < 24) return '#ef4444'; // Красный - свежие
                if (hoursAgo < 168) return '#f97316'; // Оранжевый - неделя
                if (hoursAgo < 720) return '#eab308'; // Жёлтый - месяц
                return '#22c55e'; // Зелёный - старые

            case 'user':
                // По активности пользователя (будет реализовано)
                return '#a855f7'; // Фиолетовый

            case 'price':
                const price = property.price || 0;
                if (price > 1000) return '#ef4444'; // Дорогие
                if (price > 500) return '#f97316'; // Средние
                if (price > 200) return '#eab308'; // Доступные
                return '#22c55e'; // Бюджет

            default:
                return '#ef4444';
        }
    };

    // Фильтрация всех объектов
    const allMarkers = [
        ...((activeLayers.includes('pois')) ? poisData : []),
        ...(activeLayers.includes('client_properties') ? clientProperties.map(p => ({
            ...p,
            markerColor: getHeatmapColor(p)
        })) : [])
    ];

    return (
        <div className="relative w-full h-full">
            {/* GEO Button - справа вверху */}
            <GeoPickerButton map={mapInstance} />
            
            {/* Import Button - справа вверху */}
            <div className="absolute top-6 right-6 z-[1000] flex gap-3">
                <button
                    onClick={() => setIsImporterOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl shadow-lg font-bold text-sm md:text-lg flex items-center justify-center gap-2 md:gap-3 hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95"
                    style={{ minWidth: '120px' }}
                    title="AI импорт объектов"
                >
                    <span className="text-lg md:text-xl">🤖</span>
                    <span>Import</span>
                </button>
            </div>

            {/* Карта */}
            <Map
                ref={mapRef}
                markers={allMarkers.map(m => ({
                    id: m.id,
                    position: [m.lat, m.lng] as [number, number],
                    title: m.title,
                    type: 'stay',
                    price: m.price ? `${m.currency || 'USD'} ${m.price}` : undefined,
                    images: m.photos || [],
                    description: m.description,
                    address: m.forward_from || 'Forwarded property',
                    markerColor: m.isDeleted ? '#dc2626' : (m.markerColor || '#ef4444') // ✅ Красный цвет для удалённых
                }))}
                onMarkerClick={(id) => {
                    setSelectedPropertyId(id);
                    const marker = allMarkers.find(m => m.id === id);
                    if (marker) {
                        setSelectedPropertyPos([marker.lat, marker.lng]);
                    }
                }}
                onMapReady={setMapInstance}
            />

            {/* Панель управления */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-[1000] max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-3">🎛️ Admin Master Map</h2>

                {/* Статистика */}
                <div className="mb-4 p-3 bg-slate-50 rounded">
                    <div className="text-sm space-y-1">
                        <div>🔵 POI: {stats.totalPOIs}</div>
                        <div>🔴 Properties: {stats.totalProperties}</div>
                        <div>👤 Users: {stats.uniqueUsers}</div>
                    </div>
                </div>

                {/* Слои */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Layers:</h3>
                    {LAYERS.map(layer => (
                        <label key={layer.id} className="flex items-center mb-1 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={activeLayers.includes(layer.id)}
                                onChange={() => {
                                    setActiveLayers(prev =>
                                        prev.includes(layer.id)
                                            ? prev.filter(l => l !== layer.id)
                                            : [...prev, layer.id]
                                    );
                                }}
                                className="mr-2"
                            />
                            <span>{layer.label}</span>
                        </label>
                    ))}
                </div>

                {/* Тепловая карта */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Heatmap:</h3>
                    <select
                        value={heatmapMode}
                        onChange={(e) => setHeatmapMode(e.target.value as any)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="none">Off</option>
                        <option value="time">By Time</option>
                        <option value="price">By Price</option>
                        <option value="user">By User Activity</option>
                    </select>

                    {heatmapMode === 'time' && (
                        <div className="mt-2 text-xs">
                            <div>🔴 &lt;24h</div>
                            <div>🟠 1-7 days</div>
                            <div>🟡 7-30 days</div>
                            <div>🟢 &gt;30 days</div>
                        </div>
                    )}
                </div>

                {/* Фильтры */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Filters:</h3>
                    
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                    >
                        <option value="all">All time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 days</option>
                        <option value="month">Last 30 days</option>
                    </select>

                    {/* ✅ Чекбокс для показа удалённых */}
                    <label className="flex items-center mt-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                        <input
                            type="checkbox"
                            checked={showDeleted}
                            onChange={(e) => setShowDeleted(e.target.checked)}
                            className="mr-2"
                        />
                        <span className="text-sm">🔴 Show deleted objects</span>
                    </label>
                </div>

                {loading && (
                    <div className="text-center text-sm text-slate-500">
                        Loading...
                    </div>
                )}
            </div>

            {/* Property Drawer */}
            {selectedPropertyId && selectedPropertyPos && (
                <PropertyDrawer
                    property={allMarkers.find(p => p.id === selectedPropertyId)}
                    position={selectedPropertyPos}
                    onClose={() => {
                        setSelectedPropertyId(null);
                        setSelectedPropertyPos(null);
                    }}
                />
            )}

            {/* Property Importer Modal */}
            {isImporterOpen && (
                <PropertyImporterAI
                    onImport={(newProperty) => {
                        setIsImporterOpen(false);
                        loadClientProperties(); // Перезагружаем данные
                    }}
                    onClose={() => setIsImporterOpen(false)}
                />
            )}
        </div>
    );
}
