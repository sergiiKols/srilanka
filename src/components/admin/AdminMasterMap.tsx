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
    const [isImporterOpen, setIsImporterOpen] = useState(false); // ✅ Для Import модала
    // Filter Drawer state (скопировано из Explorer)
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isObjectsOpen, setIsObjectsOpen] = useState(false); // POI фильтры
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [isUserListOpen, setIsUserListOpen] = useState(false); // ✅ Состояние для выпадающего списка пользователей
    const [allUsers, setAllUsers] = useState<number[]>([]); // ✅ Список всех User ID
    
    // Advanced Filters State (расширенные)
    const [priceRange, setPriceRange] = useState<string>('all');
    const [minBedrooms, setMinBedrooms] = useState<number>(1);
    const [minBathrooms, setMinBathrooms] = useState<number>(1);
    const [selectedArea, setSelectedArea] = useState<string>('all');
    const [beachDistance, setBeachDistance] = useState<string>('all');
    const [selectedPropType, setSelectedPropType] = useState<string>('all');
    const [wifiSpeed, setWifiSpeed] = useState<string>('all');
    const [guestCapacity, setGuestCapacity] = useState<number>(1);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    
    // Additional amenities checkboxes
    const [amenities, setAmenities] = useState({
        airConditioning: false,
        kitchen: false,
        washingMachine: false,
        workFriendly: false,
        gym: false,
        yoga: false,
        bbq: false,
        garden: false
    });
    
    // Must-haves checkboxes
    const [mustHaves, setMustHaves] = useState({
        pool: false,
        parking: false,
        breakfast: false,
        pets: false,
        security: false
    });
    
    // Collapsible sections
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        main: true,
        important: true,
        amenities: true,
        extra: true
    });
    
    // POI Filters State
    const [selectedPOICategories, setSelectedPOICategories] = useState<string[]>([]);
    const [poiSearchQuery, setPoiSearchQuery] = useState('');
    const [poiDistance, setPoiDistance] = useState<string>('all');
    const [minRating, setMinRating] = useState<number>(0);
    const [showOpenOnly, setShowOpenOnly] = useState(false);
    
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
    }, [dateFilter, selectedUser]);

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

            // saved_properties содержит только активные объекты
            // Удалённые объекты перемещаются в archived_properties
            console.log('🔍 Загружаем активные объекты из saved_properties');

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

                // 🐞 DEBUG: Логирование фото для каждого объекта
                if (photos.length > 0) {
                    console.log(`📸 Property ${prop.id} (${prop.title}): ${photos.length} photos`, photos);
                } else {
                    console.log(`❌ Property ${prop.id} (${prop.title}): NO PHOTOS (raw:`, prop.photos, ')');
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
                    isDeleted: false // Все объекты в saved_properties активные
                };
            });

            setClientProperties(mappedProperties);

            // Статистика и список пользователей
            const uniqueUsersSet = new Set(mappedProperties.map(p => p.telegram_user_id).filter(id => id));
            const uniqueUsers = uniqueUsersSet.size;
            const activeCount = mappedProperties.filter(p => !p.isDeleted).length;
            const deletedCount = mappedProperties.filter(p => p.isDeleted).length;
            
            // ✅ Сохраняем список всех User ID
            setAllUsers(Array.from(uniqueUsersSet).sort((a, b) => a - b));
            
            setStats(prev => ({
                ...prev,
                totalProperties: mappedProperties.length,
                uniqueUsers
            }));

            console.log(`✅ Загружено ${mappedProperties.length} активных объектов от ${uniqueUsers} пользователей`);
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
            console.log(`🔴 Deleted property: ${property.title}, type: ${property.type}, isDeleted: ${property.isDeleted}`);
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
        ...(activeLayers.includes('client_properties') ? clientProperties.map(p => {
            const color = getHeatmapColor(p);
            if (p.isDeleted) {
                console.log(`🎨 Mapping deleted property: ${p.title}, color: ${color}, isDeleted: ${p.isDeleted}`);
            }
            return {
                ...p,
                markerColor: color
            };
        }) : [])
    ];
    
    // ⚡ ОПТИМИЗАЦИЯ: Ограничиваем количество маркеров для производительности
    // На низком zoom показываем меньше маркеров
    const MAX_MARKERS = 100; // Максимум маркеров на карте
    const visibleMarkers = allMarkers.length > MAX_MARKERS 
        ? allMarkers.slice(0, MAX_MARKERS) 
        : allMarkers;

    return (
        <div className="relative w-full h-full">
            {/* Left Buttons - Filters и Objects */}
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
                {/* Filters Button - Property Filters */}
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="bg-white text-slate-800 px-4 md:px-8 py-2 md:py-3 rounded-xl shadow-lg font-bold text-sm md:text-lg flex items-center justify-center gap-2 md:gap-3 hover:bg-slate-50 transition-all active:scale-95"
                    style={{ minWidth: '120px' }}
                    title="Property Filters"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                    <span>Filters</span>
                </button>

                {/* Objects Button - POI Filters */}
                <button
                    onClick={() => setIsObjectsOpen(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg font-bold text-sm md:text-lg flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-700 transition-all active:scale-95"
                    style={{ minWidth: '120px' }}
                    title="POI & Objects Filters"
                >
                    <span>🗺️</span>
                    <span>Objects</span>
                </button>
            </div>

            {/* Floating Buttons - справа вверху */}
            <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
                {/* Import Button */}
                <button
                    onClick={() => setIsImporterOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl shadow-lg font-bold text-sm md:text-lg flex items-center justify-center gap-2 md:gap-3 hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95"
                    style={{ minWidth: '120px' }}
                    title="AI импорт объектов"
                >
                    <span className="text-lg md:text-xl">🤖</span>
                    <span>Import</span>
                </button>

                {/* Admin Panel Button */}
                <button
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="bg-slate-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg font-bold text-sm md:text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                    style={{ minWidth: '120px' }}
                    title="Admin Panel"
                >
                    <span>⚙️</span>
                    <span>Admin</span>
                </button>

                {/* GeoPickerButton container */}
                <div id="floating-buttons-container" className="flex justify-end"></div>
            </div>
            
            {/* GeoPickerButton (uses portal) */}
            <GeoPickerButton map={mapInstance} />

            {/* Карта */}
            <Map
                ref={mapRef}
                markers={visibleMarkers.map(m => ({
                    id: m.id,
                    position: [m.lat, m.lng] as [number, number],
                    title: m.title,
                    type: 'stay',
                    price: m.price ? `${m.currency || 'USD'} ${m.price}` : undefined,
                    images: m.photos && m.photos.length > 0 ? [m.photos[0]] : [], // Только первое фото для попапа
                    description: m.description,
                    address: m.forward_from || 'Forwarded property',
                    markerColor: m.markerColor || '#ef4444' // ✅ Цвет уже установлен в getHeatmapColor
                }))}
                onMarkerClick={(id) => {
                    setSelectedPropertyId(id);
                    const marker = visibleMarkers.find(m => m.id === id);
                    if (marker) {
                        setSelectedPropertyPos([marker.lat, marker.lng]);
                    }
                }}
                onMapReady={setMapInstance}
            />


            {/* Filter Drawer (полная копия из Explorer) */}
            <div
                className={`absolute top-0 left-0 h-full w-full md:w-96 bg-white shadow-[8px_0_32px_-8px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-in-out flex flex-col ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ zIndex: 2000, pointerEvents: 'auto' }}
            >
                {/* Header */}
                <div className="p-5 border-b bg-white sticky top-0 z-10">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Filters</h2>
                            <p className="text-xs text-slate-500">Customize your map view</p>
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    
                    {/* Show Results Button */}
                    <button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Show {clientProperties.filter(p => !p.isDeleted).length} properties
                    </button>
                </div>

                {/* Filter Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-5 space-y-6">
                        {/* Price Range Section */}
                        <div>
                            <button
                                onClick={() => setOpenSections(prev => ({ ...prev, main: !prev.main }))}
                                className="w-full flex justify-between items-center mb-3"
                            >
                                <h3 className="font-semibold text-slate-800">💰 Price Range</h3>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className={`transform transition-transform ${openSections.main ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            
                            {openSections.main && (
                                <div className="space-y-2">
                                    {['all', '0-500', '500-1000', '1000-2000', '2000+'].map(range => (
                                        <label key={range} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="price"
                                                checked={priceRange === range}
                                                onChange={() => setPriceRange(range)}
                                                className="text-indigo-600"
                                            />
                                            <span className="text-sm text-slate-700">
                                                {range === 'all' ? 'Any price' : `$${range.replace('-', ' - $').replace('+', '+')}`}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Property Type */}
                        <div>
                            <button
                                onClick={() => setOpenSections(prev => ({ ...prev, important: !prev.important }))}
                                className="w-full flex justify-between items-center mb-3"
                            >
                                <h3 className="font-semibold text-slate-800">🏠 Property Type</h3>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className={`transform transition-transform ${openSections.important ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            
                            {openSections.important && (
                                <div className="space-y-2">
                                    {['all', 'house', 'apartment', 'villa', 'room', 'studio'].map(type => (
                                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="propType"
                                                checked={selectedPropType === type}
                                                onChange={() => setSelectedPropType(type)}
                                                className="text-indigo-600"
                                            />
                                            <span className="text-sm text-slate-700 capitalize">{type === 'all' ? 'Any type' : type}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bedrooms & Bathrooms */}
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-3">🛏️ Bedrooms & Bathrooms</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-slate-600 mb-1 block">Min Bedrooms: {minBedrooms}</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={minBedrooms}
                                        onChange={(e) => setMinBedrooms(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-600 mb-1 block">Min Bathrooms: {minBathrooms}</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={minBathrooms}
                                        onChange={(e) => setMinBathrooms(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Beach Distance */}
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-3">🏖️ Beach Distance</h3>
                            <div className="space-y-2">
                                {[
                                    { value: 'all', label: 'Any distance' },
                                    { value: '0-100', label: '0-100m (Beachfront)' },
                                    { value: '100-300', label: '100-300m (Very close)' },
                                    { value: '300-500', label: '300-500m (Close)' },
                                    { value: '500-1000', label: '500m-1km (Walking)' },
                                    { value: '1000+', label: '1km+ (Not important)' }
                                ].map(option => (
                                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="beachDist"
                                            checked={beachDistance === option.value}
                                            onChange={() => setBeachDistance(option.value)}
                                            className="text-indigo-600"
                                        />
                                        <span className="text-sm text-slate-700">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* WiFi Speed */}
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-3">📶 WiFi Speed</h3>
                            <div className="space-y-2">
                                {[
                                    { value: 'all', label: 'Any speed' },
                                    { value: 'basic', label: 'Basic (up to 10 Mbps)' },
                                    { value: 'good', label: 'Good (10-50 Mbps)' },
                                    { value: 'fast', label: 'Fast (50-100 Mbps)' },
                                    { value: 'ultra', label: 'Ultra Fast (100+ Mbps)' }
                                ].map(option => (
                                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="wifi"
                                            checked={wifiSpeed === option.value}
                                            onChange={() => setWifiSpeed(option.value)}
                                            className="text-indigo-600"
                                        />
                                        <span className="text-sm text-slate-700">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Must-Haves */}
                        <div>
                            <button
                                onClick={() => setOpenSections(prev => ({ ...prev, amenities: !prev.amenities }))}
                                className="w-full flex justify-between items-center mb-3"
                            >
                                <h3 className="font-semibold text-slate-800">✨ Must-Haves (Basic)</h3>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className={`transform transition-transform ${openSections.amenities ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            
                            {openSections.amenities && (
                                <div className="space-y-2">
                                    {Object.entries(mustHaves).map(([key, value]) => (
                                        <label key={key} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={(e) => setMustHaves(prev => ({ ...prev, [key]: e.target.checked }))}
                                                className="text-indigo-600 rounded"
                                            />
                                            <span className="text-sm text-slate-700 capitalize">{key}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Additional Amenities */}
                        <div>
                            <button
                                onClick={() => setOpenSections(prev => ({ ...prev, extra: !prev.extra }))}
                                className="w-full flex justify-between items-center mb-3"
                            >
                                <h3 className="font-semibold text-slate-800">🎨 Additional Amenities</h3>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    className={`transform transition-transform ${openSections.extra ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            
                            {openSections.extra && (
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={amenities.airConditioning}
                                            onChange={(e) => setAmenities(prev => ({ ...prev, airConditioning: e.target.checked }))}
                                            className="text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700">❄️ Air Conditioning</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={amenities.kitchen}
                                            onChange={(e) => setAmenities(prev => ({ ...prev, kitchen: e.target.checked }))}
                                            className="text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700">🍽️ Kitchen</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={amenities.washingMachine}
                                            onChange={(e) => setAmenities(prev => ({ ...prev, washingMachine: e.target.checked }))}
                                            className="text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700">🧺 Washing Machine</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={amenities.workFriendly}
                                            onChange={(e) => setAmenities(prev => ({ ...prev, workFriendly: e.target.checked }))}
                                            className="text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700">💼 Work-Friendly</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={amenities.gym}
                                            onChange={(e) => setAmenities(prev => ({ ...prev, gym: e.target.checked }))}
                                            className="text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700">🏋️ Gym</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={amenities.yoga}
                                            onChange={(e) => setAmenities(prev => ({ ...prev, yoga: e.target.checked }))}
                                            className="text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700">🧘 Yoga Space</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={amenities.bbq}
                                            onChange={(e) => setAmenities(prev => ({ ...prev, bbq: e.target.checked }))}
                                            className="text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700">🔥 BBQ</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={amenities.garden}
                                            onChange={(e) => setAmenities(prev => ({ ...prev, garden: e.target.checked }))}
                                            className="text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700">🌳 Garden</span>
                                    </label>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Objects Drawer - POI Filters */}
            <div
                className={`absolute top-0 left-0 h-full w-full md:w-96 bg-white shadow-[8px_0_32px_-8px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-in-out flex flex-col ${isObjectsOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ zIndex: 2000, pointerEvents: 'auto' }}
            >
                {/* Header */}
                <div className="p-5 border-b bg-gradient-to-r from-emerald-500 to-teal-600 sticky top-0 z-10">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h2 className="text-lg font-bold text-white">🗺️ Objects & POI</h2>
                            <p className="text-xs text-emerald-100">Places, shops, restaurants...</p>
                        </div>
                        <button
                            onClick={() => setIsObjectsOpen(false)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search places..."
                        value={poiSearchQuery}
                        onChange={(e) => setPoiSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg text-slate-800 placeholder:text-slate-400"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Main Categories */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Main Categories</h3>
                        
                        <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                            <input
                                type="checkbox"
                                checked={selectedPOICategories.includes('food')}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedPOICategories(prev => [...prev, 'food']);
                                    } else {
                                        setSelectedPOICategories(prev => prev.filter(c => c !== 'food'));
                                    }
                                }}
                                className="text-emerald-600 rounded"
                            />
                            <span className="text-sm text-slate-700">🍽️ Food & Dining</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                            <input
                                type="checkbox"
                                checked={selectedPOICategories.includes('shopping')}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedPOICategories(prev => [...prev, 'shopping']);
                                    } else {
                                        setSelectedPOICategories(prev => prev.filter(c => c !== 'shopping'));
                                    }
                                }}
                                className="text-emerald-600 rounded"
                            />
                            <span className="text-sm text-slate-700">🏪 Shopping</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                            <input
                                type="checkbox"
                                checked={selectedPOICategories.includes('health')}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedPOICategories(prev => [...prev, 'health']);
                                    } else {
                                        setSelectedPOICategories(prev => prev.filter(c => c !== 'health'));
                                    }
                                }}
                                className="text-emerald-600 rounded"
                            />
                            <span className="text-sm text-slate-700">🏥 Health</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                            <input
                                type="checkbox"
                                checked={selectedPOICategories.includes('transport')}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedPOICategories(prev => [...prev, 'transport']);
                                    } else {
                                        setSelectedPOICategories(prev => prev.filter(c => c !== 'transport'));
                                    }
                                }}
                                className="text-emerald-600 rounded"
                            />
                            <span className="text-sm text-slate-700">🚌 Transport</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                            <input
                                type="checkbox"
                                checked={selectedPOICategories.includes('entertainment')}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedPOICategories(prev => [...prev, 'entertainment']);
                                    } else {
                                        setSelectedPOICategories(prev => prev.filter(c => c !== 'entertainment'));
                                    }
                                }}
                                className="text-emerald-600 rounded"
                            />
                            <span className="text-sm text-slate-700">🎭 Entertainment</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                            <input
                                type="checkbox"
                                checked={selectedPOICategories.includes('tourism')}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedPOICategories(prev => [...prev, 'tourism']);
                                    } else {
                                        setSelectedPOICategories(prev => prev.filter(c => c !== 'tourism'));
                                    }
                                }}
                                className="text-emerald-600 rounded"
                            />
                            <span className="text-sm text-slate-700">🏖️ Tourism</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                            <input
                                type="checkbox"
                                checked={selectedPOICategories.includes('wellness')}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedPOICategories(prev => [...prev, 'wellness']);
                                    } else {
                                        setSelectedPOICategories(prev => prev.filter(c => c !== 'wellness'));
                                    }
                                }}
                                className="text-emerald-600 rounded"
                            />
                            <span className="text-sm text-slate-700">💆 Wellness</span>
                        </label>
                    </div>

                    {/* Additional Options */}
                    <div className="pt-4 border-t space-y-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOpenOnly}
                                onChange={(e) => setShowOpenOnly(e.target.checked)}
                                className="text-emerald-600 rounded"
                            />
                            <span className="text-sm font-medium text-emerald-600">🕒 Open now only</span>
                        </label>
                    </div>

                    {/* Apply Button */}
                    <button
                        onClick={() => setIsObjectsOpen(false)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg mt-4"
                    >
                        Show {selectedPOICategories.length > 0 ? selectedPOICategories.length + ' categories' : 'All POI'}
                    </button>
                </div>
            </div>

            {/* Admin Panel */}
            <div 
                className={`absolute top-0 right-0 h-full w-full md:w-96 bg-white shadow-[-8px_0_32px_-8px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-in-out flex flex-col z-[2000] ${isAdminPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ pointerEvents: 'auto' }}
            >
                <div className="p-5 border-b bg-white sticky top-0 z-10">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold">🎛️ Admin Panel</h2>
                        <button
                            onClick={() => setIsAdminPanelOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Статистика */}
                <div className="mb-4 p-3 bg-slate-50 rounded">
                    <div className="text-sm space-y-1">
                        <div>🔵 POI: {stats.totalPOIs}</div>
                        <div>🔴 Properties: {stats.totalProperties}</div>
                        <div>👤 Users: {stats.uniqueUsers}</div>
                    </div>
                </div>

                {/* Выпадающий список User ID */}
                <div className="mb-4">
                    <button
                        onClick={() => setIsUserListOpen(!isUserListOpen)}
                        className="w-full flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <span className="font-semibold text-slate-800">👤 All User IDs ({allUsers.length})</span>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`transform transition-transform ${isUserListOpen ? 'rotate-180' : ''}`}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    
                    {isUserListOpen && (
                        <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
                            {allUsers.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-2">No users found</p>
                            ) : (
                                <div className="space-y-1">
                                    {allUsers.map((userId) => (
                                        <div 
                                            key={userId}
                                            className="text-sm text-slate-700 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                                            onClick={() => {
                                                setSelectedUser(userId.toString());
                                                setIsUserListOpen(false);
                                            }}
                                        >
                                            <span className="font-mono">{userId}</span>
                                            {selectedUser === userId.toString() && (
                                                <span className="ml-2 text-indigo-600">✓</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
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

                    {/* Удалённые объекты перемещаются в archived_properties */}
                </div>

                {loading && (
                    <div className="text-center text-sm text-slate-500">
                        Loading...
                    </div>
                )}
                </div>
            </div>

            {/* Property Drawer */}
            {selectedPropertyId && selectedPropertyPos && (() => {
                const selectedProp = clientProperties.find(p => p.id === selectedPropertyId);
                if (!selectedProp) return null;

                // Преобразуем в формат PropertyDrawer
                const drawerProperty = {
                    id: selectedProp.id.replace('client-', ''), // Убираем префикс
                    title: selectedProp.title || selectedProp.property_type || 'Property',
                    price: selectedProp.price ? `${selectedProp.currency || 'USD'} ${selectedProp.price}` : 'Price on request',
                    description: selectedProp.description || 'No description',
                    images: selectedProp.photos || [],
                    amenities: selectedProp.amenities ? 
                        (Array.isArray(selectedProp.amenities) ? selectedProp.amenities : []) : [],
                    bathrooms: selectedProp.bathrooms || 0,
                    beachDistance: 0,
                    wifiSpeed: 0,
                    area: selectedProp.forward_from || 'Location',
                    propertyType: selectedProp.property_type || 'Property',
                };

                return (
                    <PropertyDrawer
                        isOpen={true}
                        property={drawerProperty}
                        exchangeRate={400}
                        isCustomProperty={true}
                        userId={selectedProp.telegram_user_id?.toString()}
                        onDelete={(propertyId) => {
                            console.log('🗑️ Deleting property:', propertyId);
                            // Перезагружаем список после удаления
                            loadClientProperties();
                            setSelectedPropertyId(null);
                            setSelectedPropertyPos(null);
                            console.log('✅ Property deleted and list reloaded');
                        }}
                        onClose={() => {
                            setSelectedPropertyId(null);
                            setSelectedPropertyPos(null);
                        }}
                    />
                );
            })()}

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
