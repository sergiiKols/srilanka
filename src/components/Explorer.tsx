import { useState, useEffect } from 'react';
import Map from './map/Map';
import PropertyDrawer from './property/PropertyDrawer';

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

const POIS = [
    // Culture & Temples (Galle, Unawatuna, Hikkaduwa, Mirissa)
    { id: 'c1', position: [6.0247, 80.2185] as [number, number], title: 'Galle Fort Lighthouse', type: 'culture', hours: '24/7', description: 'Iconic white lighthouse at the southern tip of Galle Fort.' },
    { id: 'c2', position: [6.0307, 80.2137] as [number, number], title: 'Galle Fort Clock Tower', type: 'culture', hours: '24/7', description: 'Historic colonial clock tower overlooking the cricket stadium.' },
    { id: 'c3', position: [6.0261, 80.2168] as [number, number], title: 'Sudharmalaya Temple', type: 'temple', hours: '06:00 - 20:00', description: 'Beautiful white Buddhist temple within the Galle Fort ramparts.' },
    { id: 'c4', position: [6.0268, 80.2173] as [number, number], title: 'All Saints Church', type: 'culture', hours: '08:30 - 17:30', description: 'Victorian Gothic revival church in the heart of the Fort.' },
    { id: 'c5', position: [6.0272, 80.2163] as [number, number], title: 'Dutch Reformed Church', type: 'temple', hours: '09:00 - 17:00', description: 'One of the oldest Protestant churches in Sri Lanka (1755).' },
    { id: 'c6', position: [6.0254, 80.2181] as [number, number], title: 'Meera Mosque', type: 'culture', hours: '24/7', description: 'Stunning mosque with Baroque and Islamic architecture.' },
    { id: 'c7', position: [6.0142, 80.2394] as [number, number], title: 'Japanese Peace Pagoda', type: 'temple', hours: '07:00 - 19:00', description: 'Large white stupa on Rumassala hill with panoramic ocean views.' },
    { id: 'c8', position: [6.0156, 80.2644] as [number, number], title: 'Yatagala Raja Maha Viharaya', type: 'temple', hours: '06:00 - 20:00', description: 'Ancient rock temple set among giant boulders near Unawatuna.' },
    { id: 'c9', position: [6.1517, 80.0934] as [number, number], title: 'Seenigama Vihara', type: 'temple', hours: '06:00 - 19:00', description: 'Unique temple on a small island off Hikkaduwa.' },
    { id: 'c10', position: [5.9436, 80.4627] as [number, number], title: 'Coconut Tree Hill', type: 'culture', hours: '24/7', description: 'Famous spot in Mirissa with a grove of palms on a red cliff.' },

    // Beaches
    { id: 'b1', position: [6.0097, 80.2474] as [number, number], title: 'Unawatuna Beach', type: 'beach', waves: 'green', info: 'Safe for swimming', description: 'Horseshoe-shaped bay with calm waters and many cafes.' },
    { id: 'b2', position: [6.0167, 80.2500] as [number, number], title: 'Jungle Beach', type: 'beach', waves: 'green', info: 'Safe for snorkeling', description: 'Hidden bay near Rumassala, popular for snorkeling.' },
    { id: 'b3', position: [5.9990, 80.2670] as [number, number], title: 'Dalawella Beach', type: 'beach', waves: 'green', info: 'Instagram Swing', description: 'Famous for the Instagram palm tree swing and natural lagoon.' },
    { id: 'b4', position: [5.9995, 80.2680] as [number, number], title: 'Wijaya Beach', type: 'beach', waves: 'green', info: 'Sea Turtles', description: 'Great spot for swimming with wild sea turtles.' },
    { id: 'b5', position: [5.970861, 80.426226] as [number, number], title: 'Weligama Beach', type: 'beach', waves: 'green', info: 'Beginners Surf', description: 'Long sandy bay, perfect for beginner surf lessons.' },
    { id: 'b6', position: [5.944834, 80.459148] as [number, number], title: 'Mirissa Beach', type: 'beach', waves: 'yellow', info: 'Whale Watching', description: 'Lively beach known for whale watching and nightlife.' },
    { id: 'b7', position: [5.94355, 80.45026] as [number, number], title: 'Secret Beach Mirissa', type: 'beach', waves: 'green', description: 'Tucked away behind a hill, offering three small coves.' },
    { id: 'b8', position: [5.9800, 80.4000] as [number, number], title: 'Midigama Beach', type: 'beach', waves: 'red', info: 'Advanced Surf', description: 'Surf hub known for "Coconut" and "Plantations" breaks.' },
    { id: 'b9', position: [6.139468, 80.106285] as [number, number], title: 'Hikkaduwa Beach', type: 'beach', waves: 'yellow', description: 'Classic surf and party beach with a marine sanctuary.' },

    // Restaurants
    { id: 'f1', position: [6.028624, 80.216797] as [number, number], title: 'The Bungalow', type: 'food', image: 'https://images.unsplash.com/photo-1517248135467-4c7ed9d421bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', phone: '+94 91 224 5092', hours: '11:00 - 22:30', description: 'Upscale dining and cocktails in a colonial building.' },
    { id: 'f2', position: [6.028624, 80.216797] as [number, number], title: 'Pedlar\'s Inn Cafe', type: 'food', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', phone: '+94 91 222 5333', hours: '08:00 - 22:00', description: 'Historic cafe in Galle Fort, famous for gelato.' },
    { id: 'f3', position: [6.0150, 80.2370] as [number, number], title: 'Sea Waves Restaurant', type: 'food', phone: '+94 77 644 6500', hours: '12:00 - 21:00', description: 'Authentic Sri Lankan home-cooked curries.' },
    { id: 'f4', position: [5.9750, 80.4297] as [number, number], title: 'The Cliff Weligama', type: 'food', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', phone: '+94 41 225 0101', hours: '11:00 - 23:00', description: 'Fine dining with dramatic ocean views.' },
    { id: 'f5', position: [5.947182, 80.46179] as [number, number], title: 'No. 1 Dewmini Roti Shop', type: 'food', phone: '+94 77 341 0495', hours: '10:00 - 22:00', description: 'Famous family-run spot for diverse roti.' },
    { id: 'f6', position: [5.948262, 80.471588] as [number, number], title: 'Shady Lane Mirissa', type: 'food', hours: '08:00 - 15:30', description: 'Trendy cafe serving smoothie bowls.' },
    { id: 'f7', position: [5.948262, 80.471588] as [number, number], title: 'Petti Petti Mirissa', type: 'food', image: 'https://images.unsplash.com/photo-1536964541071-6c2438692790?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', phone: '+94 76 498 7000', hours: '11:00 - 23:00', description: 'Vibrant restaurant made of shipping containers.' },

    // Water Sports
    { id: 's1', position: [5.9715, 80.4280] as [number, number], title: 'Lucky\'s Surf Camp', type: 'surf', image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', phone: '+94 77 901 0212', hours: '07:00 - 18:00', description: 'High-rated surf school on Weligama beach.' },
    { id: 's2', position: [5.9725, 80.4265] as [number, number], title: 'Freedom Surf School', type: 'surf', phone: '+94 77 561 7088', hours: '07:00 - 18:00', description: 'Long-standing surf school focused on progress.' },

    // Spa & Wellness
    { id: 'sp1', position: [6.0110, 80.2515] as [number, number], title: 'Santon Spa Unawatuna', type: 'spa', phone: '+94 77 782 5815', hours: '09:00 - 21:00', description: 'Professional Ayurvedic massage center.' },
    { id: 'sp2', position: [5.9468, 80.4552] as [number, number], title: 'Badora Spa Mirissa', type: 'spa', phone: '+94 77 339 6351', hours: '09:00 - 21:30', description: 'Popular spa offering herbal treatments.' },

    // Pharmacies
    { id: 'ph1', position: [5.9730, 80.4250] as [number, number], title: 'Western Pharmacy', type: 'pharmacy', phone: '+94 77 300 5333', hours: '06:00 - 22:00', description: 'Reliable pharmacy in Weligama.' },
    { id: 'ph2', position: [6.0350, 80.2150] as [number, number], title: 'Rajya Osusala Galle', type: 'pharmacy', phone: '+94 91 223 4726', hours: '08:30 - 20:00', description: 'State pharmaceutical outlet in Galle.' },

    // Supermarkets
    { id: 'sm1', position: [5.9735, 80.4245] as [number, number], title: 'Cargills Food City', type: 'supermarket', phone: '+94 41 225 1022', hours: '08:00 - 22:00', description: 'Convenient supermarket in Weligama.' },
    { id: 'sm2', position: [6.0400, 80.2200] as [number, number], title: 'Keells Super Galle', type: 'supermarket', phone: '+94 41 222 3456', hours: '08:00 - 22:00', description: 'Modern supermarket with fresh produce.' },

    // Hospitals
    { id: 'h1', position: [6.0355, 80.2120] as [number, number], title: 'Asiri Hospital Galle', type: 'hospital', phone: '+94 91 464 0640', hours: '24/7', description: 'Leading private hospital with emergency care.' },
    { id: 'h2', position: [6.0594, 80.2306] as [number, number], title: 'Karapitiya Hospital', type: 'hospital', phone: '+94 91 223 2250', hours: '24/7', description: 'Largest teaching hospital in Southern Province.' },
    { id: 'h3', position: [5.9480, 80.4520] as [number, number], title: 'IMC Mirissa', type: 'hospital', phone: '+94 77 310 3333', hours: '08:30 - 21:00', description: 'International Medical Center for tourists.' },

    // ATMs & Exchange
    { id: 'a1', position: [5.9475, 80.4515] as [number, number], title: 'Seylan ATM Mirissa', type: 'atm', hours: '24/7', description: 'Convenient ATM near Mirissa beach.' },
    { id: 'a2', position: [5.9732, 80.4240] as [number, number], title: 'Commercial Bank ATM', type: 'atm', hours: '24/7', description: 'Central ATM in Weligama.' },
    { id: 'a3', position: [6.0275, 80.2160] as [number, number], title: 'Galle Money Exchange', type: 'atm', phone: '+94 76 635 5333', hours: '09:00 - 18:30', description: 'Trusted currency exchange inside Galle Fort.' },

    // Transport
    { id: 't1', position: [6.0325, 80.2145] as [number, number], title: 'Galle Central Bus Stand', type: 'bus', hours: '24/7', description: 'Hub for express and local buses.' },
    { id: 't2', position: [5.9738, 80.4235] as [number, number], title: 'Weligama Bus Stand', type: 'bus', hours: '24/7', description: 'Main terminal for Matara and Galle.' },
    { id: 't3', position: [5.9485, 80.4545] as [number, number], title: 'Mirissa Bus Stop', type: 'bus', hours: '24/7', description: 'Central stop near primary beach road.' },
    { id: 't4', position: [6.1360, 80.1030] as [number, number], title: 'Hikkaduwa Bus Stop', type: 'bus', hours: '24/7', description: 'Major stop on Galle Road.' },
    { id: 't5', position: [5.9735, 80.4240] as [number, number], title: 'Tuk-Tuk Stand Weligama', type: 'tuktuk', hours: '24/7', description: 'Reliable three-wheeler pick-up point.' }
];

export default function Explorer() {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [selectedPropertyPos, setSelectedPropertyPos] = useState<[number, number] | null>(null);
    const [activeLayers, setActiveLayers] = useState<string[]>(['stay']); // Only 'stay' active by default
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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
        { id: 'beach', label: 'Beach', icon: '🏖️' },
        { id: 'food', label: 'Restaurants', icon: '🍽️' },
        { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
        { id: 'atm', label: 'ATM & Exchange', icon: '🏧' },
        { id: 'supermarket', label: 'Supermarket', icon: '🛒' },
        { id: 'tuktuk', label: 'Tuk-tuk', icon: '🛺' },
        { id: 'bus', label: 'Bus Stops', icon: '🚌' },
        { id: 'spa', label: 'Spa & Wellness', icon: '💆' },
        { id: 'surf', label: 'Water Sports', icon: '🏄' },
        { id: 'hospital', label: 'Hospitals', icon: '🏥' },
        { id: 'culture', label: 'Culture & Temples', icon: '🕍' }
    ];

    const EXTRA_LAYERS = [
        { id: 'liquor', label: 'Liquor Stores', icon: '🍷' },
        { id: 'gym', label: 'Gym & Fitness', icon: '💪' },
        { id: 'barber', label: 'Barber & Salon', icon: '✂️' },
        { id: 'laundry', label: 'Laundry', icon: '🧺' },
        { id: 'coworking', label: 'Coworking', icon: '💻' },
        { id: 'yoga', label: 'Yoga', icon: '🧘' }
    ];

    const ALL_CATEGORIES = [
        ...MAIN_LAYERS,
        ...EXTRA_LAYERS,
        { id: 'yoga', label: 'Yoga', icon: '🧘' },
        { id: 'diving', label: 'Diving', icon: '🤿' },
        { id: 'temple', label: 'Temples', icon: '🕍' }
    ];

    const handleMarkerClick = (id: string) => {
        const property = PROPERTIES.find(p => p.id === id);
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

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    // Filter Logic
    const filteredProperties = PROPERTIES.filter(p => {
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

    const filteredPOIs = POIS.filter(poi => {
        if (activeLayers.includes(poi.type)) return true;

        // Grouped/Aliased types
        if (activeLayers.includes('surf') && (poi.type === 'surf' || poi.type === 'diving' || poi.type === 'yoga')) return true;
        if (activeLayers.includes('culture') && (poi.type === 'culture' || poi.type === 'temple')) return true;

        return false;
    });

    const selectedProperty = PROPERTIES.find(p => p.id === selectedPropertyId);

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
            {/* Filter Toggle Button */}
            <button
                onClick={() => setIsFilterOpen(true)}
                className="absolute top-6 left-6 z-[1000] bg-white text-slate-800 px-6 py-3 rounded-xl shadow-lg font-bold text-lg flex items-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                style={{ zIndex: 1000 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                Filters
            </button>


            {/* Filter Drawer Sidebar */}
            <div
                className={`absolute top-0 left-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ zIndex: 2000 }}
            >
                <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
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
                markers={allMarkers as any}
                onMarkerClick={handleMarkerClick}
                selectedPropertyPos={selectedPropertyPos}
            />
            <PropertyDrawer
                isOpen={!!selectedPropertyId}
                onClose={handleClose}
                property={selectedProperty}
                exchangeRate={exchangeRate}
            />
        </div>
    );
}
