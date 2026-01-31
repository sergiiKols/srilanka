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
      
      // saved_properties содержит ТОЛЬКО активные объекты
      // Удалённые объекты автоматически перемещаются в archived_properties
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
  const markers = properties.map(prop => {
    // Обработка photos - может быть массивом, строкой или null
    let images: string[] = [];
    if (Array.isArray(prop.photos)) {
      images = prop.photos;
    } else if (typeof prop.photos === 'string' && prop.photos) {
      // Если строка - разбиваем по пробелам или запятым
      images = prop.photos.split(/[\s,]+/).filter(url => url.trim());
    }

    return {
      id: `prop-${prop.id}`,
      position: [prop.latitude, prop.longitude] as [number, number],
      title: prop.title || prop.property_type || 'Property',
      type: 'stay' as const,
      price: prop.price ? `${prop.currency || 'USD'} ${prop.price}` : undefined,
      images: images,
      description: prop.description,
      address: prop.address || prop.forward_from_chat_title || 'Location',
      phone: prop.contact_phone,
    };
  });

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

  // Всегда показываем карту, даже если нет объектов

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

      {/* Empty state overlay - показываем если нет объектов */}
      {properties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
          <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-xl pointer-events-auto">
            <div className="text-slate-400 text-6xl mb-4">📍</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Properties Yet</h2>
            <p className="text-slate-600 mb-4">
              Forward property listings to the bot to see them on your personal map!
            </p>
            <button
              onClick={loadUserProperties}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}

      {/* Property Drawer */}
      {selectedPropertyId && selectedPropertyPos && (() => {
        const selectedProp = properties.find(p => `prop-${p.id}` === selectedPropertyId);
        if (!selectedProp) return null;

        // Обработка photos для PropertyDrawer
        let images: string[] = [];
        if (Array.isArray(selectedProp.photos)) {
          images = selectedProp.photos;
        } else if (typeof selectedProp.photos === 'string' && selectedProp.photos) {
          images = selectedProp.photos.split(/[\s,]+/).filter(url => url.trim());
        }

        // Преобразуем в формат PropertyDrawer
        const drawerProperty = {
          id: selectedProp.id, // UUID без префикса
          title: selectedProp.title || selectedProp.property_type || 'Property',
          price: selectedProp.price ? `${selectedProp.currency || 'USD'} ${selectedProp.price}` : 'Price on request',
          description: selectedProp.description || 'No description',
          images: images,
          amenities: selectedProp.amenities ? 
            (Array.isArray(selectedProp.amenities) ? selectedProp.amenities : []) : [],
          bathrooms: selectedProp.bathrooms || 0,
          beachDistance: 0,
          wifiSpeed: 0,
          area: selectedProp.address || 'Location',
          propertyType: selectedProp.property_type || 'Property',
        };

        return (
          <PropertyDrawer
            isOpen={true}
            property={drawerProperty}
            exchangeRate={400}
            isCustomProperty={true}
            userId={userId}
            onDelete={async (propertyId) => {
              console.log('🗑️ Deleting property:', propertyId);
              
              try {
                // Вызываем API для удаления/архивирования
                const response = await fetch(`/api/saved-properties/${propertyId}?userId=${userId}`, {
                  method: 'DELETE'
                });

                if (!response.ok) {
                  const error = await response.json();
                  console.error('❌ Failed to delete property:', error);
                  alert('Failed to delete property. Please try again.');
                  return;
                }

                const result = await response.json();
                console.log('✅ Property deleted from database:', result);
                
                // Удаляем из локального state
                setProperties(prev => prev.filter(p => p.id !== propertyId));
                setSelectedPropertyId(null);
                setSelectedPropertyPos(null);
                
                console.log('✅ Property removed from map');
              } catch (error) {
                console.error('❌ Error deleting property:', error);
                alert('Failed to delete property. Please try again.');
              }
            }}
            onClose={() => {
              setSelectedPropertyId(null);
              setSelectedPropertyPos(null);
            }}
          />
        );
      })()}
    </div>
  );
}
