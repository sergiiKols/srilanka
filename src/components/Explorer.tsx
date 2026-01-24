import { useState, useEffect, useRef } from 'react';
import Map from './map/Map';
import PropertyDrawer from './property/PropertyDrawer';
import PropertyImporter from './PropertyImporter';
import PropertyImporterAI from './PropertyImporterAI';
import GeoPickerButton from './GeoPickerButton';

// Mock Data - In a real app this would come from an API or prop
// Mock Data
const PROPERTIES = [
    {
        id: '1',
        position: [6.0135, 80.2410] as [number, number],
        title: 'Villa Ceylon Avenue',
        price: '$425/night',
        rawPrice: 425,
        rooms: 3,
        bathrooms: 3,
        beachDistance: 50,
        area: 'Unawatuna',
        propertyType: 'villa',
        wifiSpeed: 50,
        pool: true,
        parking: true,
        breakfast: true,
        petFriendly: false,
        security: 'gated',
        type: 'stay',
        description: 'Premium villa with private pool and gated security. Just steps from the waves.',
        amenities: ['Air Conditioning', 'Pool', 'Breakfast', 'Garden', 'Kitchen', 'Wifi', 'Hot Water'],
        images: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
    },
    {
        id: '2',
        position: [6.1282, 80.1044] as [number, number],
        title: 'Hikka Beach Apartment',
        price: '$120/night',
        rawPrice: 120,
        rooms: 2,
        bathrooms: 1,
        beachDistance: 150,
        area: 'Hikkaduwa',
        propertyType: 'apartment',
        wifiSpeed: 25,
        pool: false,
        parking: true,
        breakfast: false,
        petFriendly: true,
        security: 'standard',
        type: 'stay',
        description: 'Modern beach apartment, perfect for digital nomads. Good WiFi and close to surf spots.',
        amenities: ['Air Conditioning', 'Kitchen', 'Wifi', 'Hot Water', 'Washing Machine'],
        images: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
    },
    {
        id: '3',
        position: [5.9450, 80.4600] as [number, number],
        title: 'Mirissa Budget Room',
        price: '$35/night',
        rawPrice: 35,
        rooms: 1,
        bathrooms: 1,
        beachDistance: 600,
        area: 'Mirissa',
        propertyType: 'room',
        wifiSpeed: 8,
        pool: false,
        parking: false,
        breakfast: true,
        petFriendly: false,
        security: 'standard',
        type: 'stay',
        description: 'Cozy room in a guest house. Quiet area, 10 min walk to the main beach.',
        amenities: ['Wifi', 'Hot Water', 'Garden', 'Air Conditioning'],
        images: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
    },
    {
        id: '4',
        position: [5.9735, 80.4385] as [number, number],
        title: 'Weligama Surf House',
        price: '$210/night',
        rawPrice: 210,
        rooms: 4,
        bathrooms: 2,
        beachDistance: 300,
        area: 'Weligama',
        propertyType: 'house',
        wifiSpeed: 35,
        pool: false,
        parking: true,
        breakfast: false,
        petFriendly: true,
        security: 'high',
        type: 'stay',
        description: 'Large family house with a garden. Safe, gated, and very close to Weligama surf bay.',
        amenities: ['Air Conditioning', 'Wifi', 'Garden', 'Kitchen', 'Washing Machine', 'Hot Water'],
        images: [
            'https://images.unsplash.com/photo-1540518614846-7eded433c457?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
    }
];

// Hardcoded POIs removed - all data now loaded from JSON files
const POIS: any[] = [];

export default function Explorer() {
    const mapRef = useRef<any>(null);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [selectedPropertyPos, setSelectedPropertyPos] = useState<[number, number] | null>(null);
    const [activeLayers, setActiveLayers] = useState<string[]>(['stay']); // Show only properties by default - user can enable other POIs via filters
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isImporterOpen, setIsImporterOpen] = useState(false);
    const [customProperties, setCustomProperties] = useState<any[]>(() => {
        // Загружаем сохраненные объекты из localStorage
        try {
            const saved = localStorage.getItem('customProperties');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Ошибка загрузки сохраненных объектов:', error);
            return [];
        }
    });

    // Advanced Filters State
    const [priceRange, setPriceRange] = useState<string>('all');
    const [minRooms, setMinRooms] = useState<number>(1);
    const [minBathrooms, setMinBathrooms] = useState<number>(1);
    const [selectedArea, setSelectedArea] = useState<string>('all');
    const [selectedBeachDist, setSelectedBeachDist] = useState<string>('all');
    const [selectedPropType, setSelectedPropType] = useState<string>('all');
    const [selectedWifiSpeed, setSelectedWifiSpeed] = useState<string>('all');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    // Tiers/Booleans
    const [mustHaves, setMustHaves] = useState({
        pool: false,
        parking: false,
        breakfast: false,
        pets: false,
        security: false
    });

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        main: true,
        important: true,
        amenities: true,
        extra: true
    });

    // Currency Conversion (USD to LKR)
    const [exchangeRate, setExchangeRate] = useState<number>(310); // Default fallback
    
    // Parsed POIs from Google Places API
    const [parsedPOIs, setParsedPOIs] = useState<any[]>([]);

    // Load parsed POI data
    useEffect(() => {
        const loadParsedPOIs = async () => {
            try {
                const response = await fetch('/SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json');
                const data = await response.json();
                const mapped = data.map((poi: any) => ({
                    id: poi.id,
                    position: [poi.coordinates.lat, poi.coordinates.lng] as [number, number],
                    title: poi.name,
                    type: poi.category,
                    description: poi.description || '',
                    address: poi.address || '',
                    phone: poi.phone || '',
                    website: poi.website || '',
                    hours: poi.hours || '',
                    image: poi.mainPhoto || '',
                    rating: poi.rating || 0,
                    reviews: poi.totalReviews || 0
                }));
                setParsedPOIs(mapped);
                console.log(`Loaded ${mapped.length} parsed POIs from Google Places API`);
            } catch (e) {
                console.warn('Failed to load parsed POI data:', e);
            }
        };
        loadParsedPOIs();
    }, []);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const cachedData = localStorage.getItem('lkr_exchange_rate');
                const now = Date.now();

                if (cachedData) {
                    const { rate, timestamp } = JSON.parse(cachedData);
                    // If less than 24 hours old - use cache
                    if (now - timestamp < 24 * 60 * 60 * 1000) {
                        setExchangeRate(rate);
                        return;
                    }
                }

                // Fetch new rate from ExchangeRate-API (Free tier, no key usually needed for some simple pair requests or public ones)
                // Using a standard public rate source
                const response = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await response.json();

                if (data && data.rates && data.rates.LKR) {
                    const newRate = data.rates.LKR;
                    setExchangeRate(newRate);
                    localStorage.setItem('lkr_exchange_rate', JSON.stringify({
                        rate: newRate,
                        timestamp: now
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch exchange rate:", err);
            }
        };

        fetchRate();
    }, []);

    const formatPriceLKR = (usd: number) => {
        const lkr = usd * exchangeRate;
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0
        }).format(lkr).replace('LKR', 'Rs');
    };

    const MAIN_LAYERS = [
        { id: 'stay', label: 'Supporting Point', icon: '🏠', status: 'ON 100%' },
        { id: 'food', label: 'Food & Restaurants', icon: '🍽️' },
        { id: 'beach', label: 'Beach & Water Sports', icon: '🏖️' }, // Объединяет beach + diving + surf
        { id: 'attraction', label: 'Attractions & Nightlife', icon: '⭐' }, // Объединяет attraction + nightlife
        { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
        { id: 'hospital', label: 'Hospital', icon: '🏥' },
        { id: 'supermarket', label: 'Supermarket & Liquor', icon: '🛒' }, // Объединяет supermarket + liquor
        { id: 'spa', label: 'Spa & Salon', icon: '💆' }, // Объединяет spa + salon (beauty salons)
        { id: 'atm', label: 'ATM & Exchange', icon: '🏧' },
        // { id: 'tuktuk', label: 'Tuk-tuk', icon: '🛺' }, // Hidden - not enough data
        { id: 'bus', label: 'Bus Stops', icon: '🚌' },
        // Culture объединена с Attraction
    ];

    const EXTRA_LAYERS: any[] = [
        // Удалены - все перенесены в MAIN_LAYERS как группы
    ];

    const ALL_CATEGORIES = [
        ...MAIN_LAYERS,
        ...EXTRA_LAYERS,
        { id: 'yoga', label: 'Yoga', icon: '🧘' },
        { id: 'diving', label: 'Diving', icon: '🤿' },
        { id: 'temple', label: 'Temples', icon: '🕍' }
    ];

    const handleMarkerClick = (id: string) => {
        // Ищем среди всех объектов (PROPERTIES + customProperties)
        const allProps = [...PROPERTIES, ...customProperties];
        const property = allProps.find(p => p.id === id);
        
        if (property) {
            setSelectedPropertyId(id);
            setSelectedPropertyPos(property.position);
        } else {
            // If it's a POI, clear the radius circle
            setSelectedPropertyPos(null);
        }
    };

    const handleClose = () => {
        setSelectedPropertyId(null);
        setSelectedPropertyPos(null);
    };

    const toggleLayer = (layer: string) => {
        setActiveLayers(prev =>
            prev.includes(layer)
                ? prev.filter(l => l !== layer)
                : [...prev, layer]
        );
    };

    const resetPOIFilters = () => {
        // Reset POI layers to default - only 'stay' active
        setActiveLayers(['stay']);
    };

    const resetPropertyFilters = () => {
        // Reset property filters only
        setPriceRange('all');
        setMinRooms(1);
        setMinBathrooms(1);
        setSelectedArea('all');
        setSelectedBeachDist('all');
        setSelectedPropType('all');
        setSelectedWifiSpeed('all');
        setSelectedAmenities([]);
        setMustHaves({
            pool: false,
            parking: false,
            breakfast: false,
            pets: false,
            security: false
        });
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleImportProperty = (newProperty: any) => {
        setCustomProperties(prev => {
            const updated = [...prev, newProperty];
            // Сохраняем в localStorage
            try {
                localStorage.setItem('customProperties', JSON.stringify(updated));
            } catch (error) {
                console.error('Ошибка сохранения объекта:', error);
            }
            return updated;
        });
        setIsImporterOpen(false);
        
        // Показываем уведомление
        console.log(`✅ Объект "${newProperty.title}" добавлен на карту!`);
    };

    const handleDeleteProperty = (propertyId: string) => {
        if (confirm('Вы уверены, что хотите удалить этот объект?')) {
            setCustomProperties(prev => {
                const updated = prev.filter(p => p.id !== propertyId);
                // Обновляем localStorage
                try {
                    localStorage.setItem('customProperties', JSON.stringify(updated));
                } catch (error) {
                    console.error('Ошибка удаления объекта:', error);
                }
                return updated;
            });
            
            // Закрываем drawer если был открыт удаленный объект
            if (selectedPropertyId === propertyId) {
                handleClose();
            }
            
            console.log('🗑️ Объект удален');
        }
    };

    // Filter Logic
    const allProperties = [...PROPERTIES, ...customProperties];
    const filteredProperties = allProperties.filter(p => {
        // Area
        if (selectedArea !== 'all' && p.area !== selectedArea) return false;

        // Price
        if (priceRange === 'low' && p.rawPrice > 50) return false;
        if (priceRange === 'medium' && (p.rawPrice < 50 || p.rawPrice > 150)) return false;
        if (priceRange === 'high' && p.rawPrice < 150) return false;

        // Beach Distance
        if (selectedBeachDist === 'front' && p.beachDistance > 50) return false;
        if (selectedBeachDist === 'close' && p.beachDistance > 200) return false;
        if (selectedBeachDist === 'near' && p.beachDistance > 500) return false;
        if (selectedBeachDist === 'walking' && p.beachDistance > 2000) return false;

        // Prop Type
        if (selectedPropType !== 'all' && p.propertyType !== selectedPropType) return false;

        // Essential
        if (p.rooms < minRooms) return false;
        if (p.bathrooms < minBathrooms) return false;

        // WiFi
        if (selectedWifiSpeed === 'good' && p.wifiSpeed < 10) return false;
        if (selectedWifiSpeed === 'excellent' && p.wifiSpeed < 30) return false;

        // Tiers
        if (mustHaves.pool && !p.pool) return false;
        if (mustHaves.parking && !p.parking) return false;
        if (mustHaves.breakfast && !p.breakfast) return false;
        if (mustHaves.pets && !p.petFriendly) return false;
        if (mustHaves.security && p.security === 'standard') return false;

        // Amenities
        return selectedAmenities.every(a => p.amenities.includes(a));
    });

    // Use only parsed POIs from JSON files (no hardcoded data)
    const allPOIs = parsedPOIs;
    
    const filteredPOIs = allPOIs.filter(poi => {
        if (activeLayers.includes(poi.type)) return true;

        // Grouped categories (10 групп)
        // 1. beach включает: beach, diving, surf
        if (activeLayers.includes('beach') && (poi.type === 'beach' || poi.type === 'diving' || poi.type === 'surf')) return true;
        
        // 2. attraction включает: attraction, nightlife
        if (activeLayers.includes('attraction') && (poi.type === 'attraction' || poi.type === 'nightlife')) return true;
        
        // 5. supermarket включает: supermarket, liquor
        if (activeLayers.includes('supermarket') && (poi.type === 'supermarket' || poi.type === 'liquor')) return true;
        
        // 6. spa включает: spa, yoga, salon
        if (activeLayers.includes('spa') && (poi.type === 'spa' || poi.type === 'yoga')) return true;
        
        // 7. attraction ТЕПЕРЬ ВКЛЮЧАЕТ culture и temple (объединено)
        if (activeLayers.includes('attraction') && (poi.type === 'culture' || poi.type === 'temple')) return true;

        return false;
    });

    // Ищем объект среди всех (встроенных + добавленных пользователем)
    const allProps = [...PROPERTIES, ...customProperties];
    const selectedProperty = allProps.find(p => p.id === selectedPropertyId);

    const allMarkers = [
        ...(activeLayers.includes('stay') ? filteredProperties.map(p => ({
            ...p,
            type: 'stay',
            priceLKR: formatPriceLKR(p.rawPrice)
        })) : []),
        ...filteredPOIs
    ];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* GEO Button in floating buttons */}
            <GeoPickerButton map={mapInstance} />
            
            {/* Filter Toggle Button */}
            <button
                onClick={() => setIsFilterOpen(true)}
                className="absolute top-6 left-6 z-[1000] bg-white text-slate-800 px-4 md:px-8 py-2 md:py-3 rounded-xl shadow-lg font-bold text-sm md:text-lg flex items-center justify-center gap-2 md:gap-3 hover:bg-slate-50 transition-all active:scale-95"
                style={{ zIndex: 1000, minWidth: '120px' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                <span>Filters</span>
            </button>

            {/* Import Button */}
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


            {/* Filter Drawer Sidebar */}
            <div
                className={`absolute top-0 left-0 h-full w-full md:w-96 bg-white shadow-[8px_0_32px_-8px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-in-out flex flex-col ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ zIndex: 2000, pointerEvents: 'auto' }}
            >
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
                    <button
                        onClick={resetPOIFilters}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                        Reset POI Layers
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* SECTION: Map Layers */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                            Map Layers
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {MAIN_LAYERS.map(l => (
                                <button
                                    key={l.id}
                                    onClick={() => toggleLayer(l.id)}
                                    className={`flex flex-col p-2 rounded-xl border transition-all ${activeLayers.includes(l.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-base">{l.icon}</span>
                                        <span className="text-[10px] font-black truncate">{(l as any).status || l.label}</span>
                                    </div>
                                    {(l as any).status && (
                                        <div className="text-[8px] font-bold text-slate-400 leading-none">Supporting Point</div>
                                    )}
                                    {!(l as any).status && (
                                        <div className="text-[8px] font-medium opacity-70 truncate">{l.label}</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="h-[1px] bg-slate-100 w-full"></div>

                    {/* SECTION: Basic Filters */}
                    <section>
                        <button
                            onClick={() => setOpenSections(prev => ({ ...prev, main: !prev.main }))}
                            className="w-full flex justify-between items-center mb-3 group"
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basic Filters</h3>
                            <svg className={`w-3 h-3 text-slate-400 transition-transform ${openSections.main ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>

                        {openSections.main && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-2 block">Neighborhood</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['all', 'Unawatuna', 'Weligama', 'Mirissa', 'Hikkaduwa'].map(area => (
                                            <button
                                                key={area}
                                                onClick={() => setSelectedArea(area)}
                                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${selectedArea === area ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                            >
                                                {area === 'all' ? 'All' : area}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-2 block">Beach</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { id: 'all', n: 'Any' },
                                            { id: 'front', n: 'Beachfront' },
                                            { id: 'close', n: '2-5 min' },
                                            { id: 'near', n: '5-10 min' }
                                        ].map(d => (
                                            <button
                                                key={d.id}
                                                onClick={() => setSelectedBeachDist(d.id)}
                                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${selectedBeachDist === d.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                            >
                                                {d.n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-2 block">Price per night</label>
                                    <div className="flex gap-1.5">
                                        {[
                                            { id: 'all', n: 'Any' },
                                            { id: 'low', n: '$0-50' },
                                            { id: 'medium', n: '$50-150' },
                                            { id: 'high', n: '$150+' }
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setPriceRange(p.id)}
                                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${priceRange === p.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                            >
                                                {p.n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* SECTION: Property Type */}
                    <section>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Property Type</h3>
                        <div className="grid grid-cols-3 gap-1.5">
                            {[
                                { id: 'all', n: 'All', i: '🏠' },
                                { id: 'room', n: 'Room', i: '🛏️' },
                                { id: 'apartment', n: 'Apartment', i: '🏢' },
                                { id: 'villa', n: 'Villa', i: '🏰' },
                                { id: 'house', n: 'House', i: '🏡' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedPropType(t.id)}
                                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all gap-1 ${selectedPropType === t.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100'}`}
                                >
                                    <span className="text-base">{t.i}</span>
                                    <span className="text-[9px] font-bold text-slate-700">{t.n}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* SECTION: Essential */}
                    <section>
                        <button
                            onClick={() => setOpenSections(prev => ({ ...prev, important: !prev.important }))}
                            className="w-full flex justify-between items-center mb-3 group"
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Essential</h3>
                            <svg className={`w-3 h-3 text-slate-400 transition-transform ${openSections.important ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>

                        {openSections.important && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-500 mb-2 block">Bedrooms</label>
                                        <div className="flex bg-slate-50 rounded-lg p-0.5">
                                            {[1, 2, 3, '4+'].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setMinRooms(typeof n === 'number' ? n : 4)}
                                                    className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${minRooms === (typeof n === 'number' ? n : 4) ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-500 mb-2 block">Bathrooms</label>
                                        <div className="flex bg-slate-50 rounded-lg p-0.5">
                                            {[1, 2, 3].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setMinBathrooms(n)}
                                                    className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${minBathrooms === n ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-2 block">WiFi Speed</label>
                                    <div className="flex gap-1.5">
                                        {[
                                            { id: 'all', n: 'Any' },
                                            { id: 'good', n: '10+ Mbps' },
                                            { id: 'excellent', n: '30+ Mbps' }
                                        ].map(w => (
                                            <button
                                                key={w.id}
                                                onClick={() => setSelectedWifiSpeed(w.id)}
                                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${selectedWifiSpeed === w.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                                            >
                                                {w.n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* SECTION: Amenities */}
                    <section>
                        <button
                            onClick={() => setOpenSections(prev => ({ ...prev, amenities: !prev.amenities }))}
                            className="w-full flex justify-between items-center mb-3 group"
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amenities</h3>
                            <svg className={`w-3 h-3 text-slate-400 transition-transform ${openSections.amenities ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>

                        {openSections.amenities && (
                            <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                {[
                                    { n: 'WiFi', i: '📶' },
                                    { n: 'Air Conditioning', i: '❄️' },
                                    { n: 'Kitchen', i: '🍳' },
                                    { n: 'Hot Water', i: '🛁' },
                                    { n: 'Washing Machine', i: '🧺' },
                                    { n: 'Garden', i: '🌳' }
                                ].map(a => (
                                    <button
                                        key={a.n}
                                        onClick={() => toggleAmenity(a.n)}
                                        className={`flex flex-col items-center p-2 rounded-lg border transition-all gap-1 ${selectedAmenities.includes(a.n) ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100'}`}
                                    >
                                        <span className="text-xs">{a.i}</span>
                                        <span className="text-[8px] font-bold text-slate-600 text-center leading-tight">{a.n}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* SECTION: Extra */}
                    <section>
                        <button
                            onClick={() => setOpenSections(prev => ({ ...prev, extra: !prev.extra }))}
                            className="w-full flex justify-between items-center mb-3 group"
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Extra</h3>
                            <svg className={`w-3 h-3 text-slate-400 transition-transform ${openSections.extra ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>

                        {openSections.extra && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                {[
                                    { id: 'pool', n: 'Pool', i: '🏊' },
                                    { id: 'parking', n: 'Parking', i: '🚗' },
                                    { id: 'breakfast', n: 'Breakfast', i: '🍳' },
                                    { id: 'pets', n: 'Pets allowed', i: '🐕' },
                                    { id: 'security', n: 'Security/Safe', i: '🔒' }
                                ].map(e => (
                                    <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{e.i}</span>
                                            <span className="text-[10px] font-bold text-slate-700">{e.n}</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={mustHaves[e.id as keyof typeof mustHaves]}
                                                onChange={() => setMustHaves(prev => ({ ...prev, [e.id]: !prev[e.id as keyof typeof mustHaves] }))}
                                                className="sr-only peer"
                                            />
                                            <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Reset Property Filters Button */}
                    <section className="pt-4">
                        <button
                            onClick={resetPropertyFilters}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors border border-red-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                            Reset Property Filters
                        </button>
                    </section>
                </div>

                <div className="p-5 border-t bg-white sticky bottom-0 z-10">
                    <button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full bg-slate-900 text-white p-3 rounded-xl transition-all shadow-lg hover:bg-slate-800 active:scale-95"
                    >
                        <div className="text-sm font-bold">Show {allMarkers.length} properties</div>
                    </button>
                </div>
            </div>


            {/* Map Component */}
            <Map
                ref={mapRef}
                markers={allMarkers as any}
                onMarkerClick={handleMarkerClick}
                selectedPropertyPos={selectedPropertyPos}
                onMapReady={setMapInstance}
            />
            <PropertyDrawer
                isOpen={!!selectedPropertyId}
                onClose={handleClose}
                property={selectedProperty}
                exchangeRate={exchangeRate}
                onDelete={handleDeleteProperty}
                isCustomProperty={customProperties.some(p => p.id === selectedPropertyId)}
            />

            {/* Property Importer Modal */}
            {isImporterOpen && (
                <PropertyImporterAI
                    onImport={handleImportProperty}
                    onClose={() => setIsImporterOpen(false)}
                />
            )}
        </div>
    );
}
