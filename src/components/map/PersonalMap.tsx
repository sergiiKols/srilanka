/**
 * Personal Map Component
 * Загружает и отображает saved_properties конкретного пользователя
 */

import { useState, useEffect, useRef } from 'react';
import Map from './Map';
import PropertyDrawer from '../property/PropertyDrawer';

interface PersonalMapProps {
  userId: string;
  token: string;
}

export default function PersonalMap({ userId, token }: PersonalMapProps) {
  const mapRef = useRef<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedPropertyPos, setSelectedPropertyPos] = useState<[number, number] | null>(null);

  // Загрузка данных пользователя
  useEffect(() => {
    loadUserProperties();
  }, [userId, token]);

  const loadUserProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/saved-properties?userId=${userId}&token=${token}`);
      
      if (!response.ok) {
        throw new Error('Failed to load properties');
      }

      const { data } = await response.json();
      
      setProperties(data || []);
      console.log(`✅ Loaded ${data?.length || 0} properties for user ${userId}`);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load your properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Преобразование данных в формат маркеров
  const markers = properties.map(prop => ({
    id: `prop-${prop.id}`,
    position: [prop.latitude, prop.longitude] as [number, number],
    title: prop.title || prop.property_type || 'Property',
    type: 'stay' as const,
    price: prop.price ? `${prop.currency || 'USD'} ${prop.price}` : undefined,
    images: prop.photos || [],
    description: prop.description,
    address: prop.address || prop.forward_from_chat_title || 'Location',
    phone: prop.contact_phone,
  }));

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadUserProperties}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-6">
          <div className="text-slate-400 text-6xl mb-4">📍</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Properties Yet</h2>
          <p className="text-slate-600">
            Forward property listings to the bot to see them on your personal map!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Карта */}
      <Map
        ref={mapRef}
        markers={markers}
        onMarkerClick={(id) => {
          setSelectedPropertyId(id);
          const marker = markers.find(m => m.id === id);
          if (marker) {
            setSelectedPropertyPos(marker.position);
          }
        }}
        onMapReady={setMapInstance}
      />

      {/* Информационная панель */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h2 className="text-lg font-bold mb-2">🗺️ Your Properties</h2>
        <div className="text-sm text-slate-600">
          <div>📍 Total: {properties.length}</div>
          <button
            onClick={loadUserProperties}
            className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Property Drawer */}
      {selectedPropertyId && selectedPropertyPos && (
        <PropertyDrawer
          property={properties.find(p => `prop-${p.id}` === selectedPropertyId)}
          position={selectedPropertyPos}
          onClose={() => {
            setSelectedPropertyId(null);
            setSelectedPropertyPos(null);
          }}
        />
      )}
    </div>
  );
}
