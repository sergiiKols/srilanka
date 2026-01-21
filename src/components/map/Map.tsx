import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { LatLngTuple, IconOptions } from 'leaflet';
import L from 'leaflet';

// Fix for default Leaflet markers in React
// We need to manually point to the marker images or they won't show up in many build setups
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Center of Sri Lanka to show the whole island
const SRI_LANKA_CENTER: LatLngTuple = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;

interface MapProps {
    markers?: Array<{
        id: string;
        position: LatLngTuple;
        title: string;
        price?: string;
        priceLKR?: string;
        type?: 'stay' | 'beach' | 'food' | 'culture' | 'pharmacy' | 'atm' | 'supermarket' | 'tuktuk' | 'bus' | 'hospital' | 'petrol' | 'train' | 'surf' | 'liquor' | 'gym' | 'spa' | 'viewpoint' | 'parking' | 'school' | 'market' | 'police' | 'post' | 'temple' | 'coworking' | 'diving' | 'rental' | 'park' | 'hardware' | 'laundry' | 'bank' | 'bakery' | 'barber' | 'vet' | 'library' | 'cinema';
        images?: string[];
        image?: string;
        address?: string;
        description?: string;
        phone?: string;
        cuisine?: string;
        atmosphere?: string;
        price_level?: string;
        hours?: string;
        info?: string;
    }>;
    onMarkerClick?: (markerId: string) => void;
    selectedPropertyPos?: LatLngTuple | null;
}

// Custom icons using Emoji
const createIcon = (type: string, options?: { waves?: string, is247?: boolean }) => {
    const emojis: Record<string, string> = {
        stay: '🏠',
        beach: '🏖️',
        food: '🍽️',
        culture: '🏛️',
        pharmacy: '💊',
        atm: '🏧',
        supermarket: '🛒',
        tuktuk: '🛺',
        bus: '🚌',
        hospital: '🏥',
        surf: '🏄',
        yoga: '🧘',
        diving: '🤿',
        liquor: '🍷',
        gym: '💪',
        spa: '💆',
        barber: '✂️',
        laundry: '🧺',
        coworking: '💻',
        temple: '🕍'
    };

    let borderColor = 'transparent';
    if (type === 'beach' && options?.waves) {
        borderColor = options.waves === 'green' ? '#22c55e' : options.waves === 'yellow' ? '#eab308' : '#ef4444';
    }
    if (type === 'pharmacy' && options?.is247) {
        borderColor = '#4f46e5';
    }

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15); font-size: 20px; border: ${borderColor !== 'transparent' ? `3px solid ${borderColor}` : 'none'}; transition: transform 0.2s;">${emojis[type] || '📍'}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    });
};

export default function Map({ markers = [], onMarkerClick, selectedPropertyPos }: MapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                Loading Map...
            </div>
        );
    }

    const getThumbnail = (marker: any) => {
        if (marker.image) return marker.image; // POI specific
        if (marker.images && marker.images.length > 0) return marker.images[0]; // Property
        return null;
    };

    return (
        <MapContainer
            center={SRI_LANKA_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <ZoomControl position="bottomright" />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={marker.type ? createIcon(marker.type, { waves: (marker as any).waves, is247: (marker as any).is247 }) : DefaultIcon}
                    eventHandlers={{
                        click: () => !marker.type?.includes('food') && onMarkerClick?.(marker.id),
                    }}
                >
                    <Popup maxWidth={260} minWidth={220}>
                        <div className="flex flex-col gap-2 p-1">
                            {getThumbnail(marker) && (
                                <div
                                    className={`w-full h-32 rounded-lg overflow-hidden relative shadow-sm border border-slate-100 ${marker.type === 'stay' ? 'cursor-pointer' : ''}`}
                                    onClick={() => marker.type === 'stay' && onMarkerClick?.(marker.id)}
                                >
                                    <img
                                        src={getThumbnail(marker)}
                                        alt={marker.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    />
                                    {(marker.type === 'food' || marker.type === 'pharmacy' || marker.type === 'supermarket') && (
                                        <div className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 rounded-md text-[10px] font-black text-indigo-600 uppercase tracking-tight shadow-sm border border-indigo-100/50">
                                            Open
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-1">
                                <h3 className="text-base font-bold text-slate-900 leading-tight mb-0">{marker.title}</h3>
                                {marker.address && (
                                    <div className="flex items-center gap-1 mt-1 text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        <span className="text-[11px] leading-tight">{marker.address}</span>
                                    </div>
                                )}
                                {marker.type === 'food' && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {marker.cuisine && (
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">{marker.cuisine}</span>
                                        )}
                                        {marker.price_level && (
                                            <span className="text-emerald-600 text-[10px] font-bold tracking-widest">{marker.price_level}</span>
                                        )}
                                        {marker.atmosphere && (
                                            <span className="text-slate-400 text-[10px] italic">· {marker.atmosphere}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {marker.description && (
                                <p className="text-[12px] text-slate-600 leading-normal line-clamp-3 mt-1">
                                    {marker.description}
                                </p>
                            )}

                            {marker.hours && (
                                <div className="flex items-center gap-2 mt-2 p-1.5 bg-green-50 rounded-md text-[11px] text-green-700 font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <span>Hours: {marker.hours}</span>
                                </div>
                            )}

                            {marker.info && (
                                <div className="mt-2 p-1.5 bg-slate-50 rounded-md text-[11px] text-slate-600 border border-slate-100 italic leading-snug">
                                    {marker.info}
                                </div>
                            )}

                            {marker.phone && (
                                <a
                                    href={`tel:${marker.phone.replace(/\s/g, '')}`}
                                    className="flex items-center gap-2 mt-2 p-2 bg-slate-50 border border-slate-100 rounded-lg text-indigo-600 hover:bg-slate-100 transition-colors no-underline"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    <span className="text-[12px] font-bold">{marker.phone}</span>
                                </a>
                            )}

                            {!marker.type?.includes('culture') && !marker.type?.includes('beach') && !marker.phone && marker.price && (
                                <div className="mt-1">
                                    <div className="text-sm font-black text-indigo-600">{marker.price}</div>
                                    {marker.priceLKR && (
                                        <div className="text-[10px] font-bold text-slate-400 -mt-0.5">{marker.priceLKR}</div>
                                    )}
                                </div>
                            )}

                            {marker.type === 'stay' && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onMarkerClick?.(marker.id);
                                    }}
                                    className="w-full mt-3 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                                >
                                    View Details
                                </button>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
            {selectedPropertyPos && (
                <Circle
                    center={selectedPropertyPos}
                    radius={10000} // 10km in meters
                    pathOptions={{
                        color: '#4f46e5',
                        fillColor: '#4f46e5',
                        fillOpacity: 0.05,
                        dashArray: '5, 10',
                        weight: 2
                    }}
                />
            )}
        </MapContainer>
    );
}
