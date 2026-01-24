import { useState, useEffect } from 'react';
import type { Map as LeafletMap } from 'leaflet';

interface GeoPickerToolProps {
  map: LeafletMap | null;
}

interface PickedCoordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

export default function GeoPickerTool({ map }: GeoPickerToolProps) {
  const [isActive, setIsActive] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<PickedCoordinate | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Check if map is ready
  useEffect(() => {
    console.log('🎯 GeoPickerTool useEffect - map:', map);
    
    if (map) {
      console.log('✅ Map is ready for GeoPickerTool', map);
      setMapReady(true);
    } else {
      console.log('⏳ Map not ready yet...', map);
      setMapReady(false);
    }
  }, [map]);

  const toggleGeoPicker = () => {
    console.log('🎯 GEO button clicked, map:', map);
    
    if (!map) {
      console.error('❌ Map is null! Cannot activate GEO picker.');
      alert('⚠️ Map not ready yet. Please wait a moment and try again.');
      return;
    }

    const newState = !isActive;
    setIsActive(newState);

    if (newState) {
      // Включаем режим выбора координат
      map.getContainer().style.cursor = 'crosshair';
      
      // Добавляем обработчик клика
      const handleMapClick = (e: any) => {
        const { lat, lng } = e.latlng;
        const coords = {
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6)),
          timestamp: Date.now()
        };
        
        setPickedCoords(coords);
        setShowPopup(true);
        
        console.log('🎯 Координаты выбраны:', coords);
      };

      // Сохраняем обработчик для последующего удаления
      (map as any)._geoPickerHandler = handleMapClick;
      map.on('click', handleMapClick);
    } else {
      // Выключаем режим выбора координат
      map.getContainer().style.cursor = '';
      
      // Удаляем обработчик клика
      if ((map as any)._geoPickerHandler) {
        map.off('click', (map as any)._geoPickerHandler);
        delete (map as any)._geoPickerHandler;
      }
      
      setShowPopup(false);
    }
  };

  const copyCoordinates = () => {
    if (!pickedCoords) return;

    const coordText = `${pickedCoords.lat}, ${pickedCoords.lng}`;
    navigator.clipboard.writeText(coordText);
    
    // Показываем уведомление
    alert(`✅ Координаты скопированы:\n${coordText}`);
  };

  const copyAsObject = () => {
    if (!pickedCoords) return;

    const coordText = `{ lat: ${pickedCoords.lat}, lng: ${pickedCoords.lng} }`;
    navigator.clipboard.writeText(coordText);
    
    alert(`✅ Координаты скопированы (объект):\n${coordText}`);
  };

  const copyAsBounds = () => {
    if (!pickedCoords) return;

    const coordText = `Lat: ${pickedCoords.lat}\nLng: ${pickedCoords.lng}`;
    navigator.clipboard.writeText(coordText);
    
    alert(`✅ Координаты скопированы (текст):\n${coordText}`);
  };

  return (
    <div className="geo-picker-tool">
      {/* Кнопка GEO */}
      <button
        onClick={toggleGeoPicker}
        className={`geo-picker-button ${isActive ? 'active' : ''}`}
        title={mapReady ? "GEO Coordinate Picker" : "Map not ready yet..."}
        disabled={!mapReady}
        style={{
          padding: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(8px)',
          color: '#666',
          border: 'none',
          borderRadius: '8px',
          cursor: mapReady ? 'pointer' : 'not-allowed',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          opacity: mapReady ? 0.6 : 0.3,
          width: '36px',
          height: '36px',
        }}
      >
        🎯
      </button>

      {/* Попап с координатами */}
      {showPopup && pickedCoords && (
        <div
          className="geo-picker-popup"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: 10000,
            minWidth: '400px',
            border: '2px solid #3b82f6',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' }}>
              🎯 Координаты выбраны
            </h3>
            
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Latitude:</strong> {pickedCoords.lat}
              </div>
              <div>
                <strong>Longitude:</strong> {pickedCoords.lng}
              </div>
            </div>

            <div style={{
              backgroundColor: '#eff6ff',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#1e40af',
              marginBottom: '16px'
            }}>
              💡 Выберите формат для копирования
            </div>
          </div>

          {/* Кнопки копирования */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={copyCoordinates}
              style={{
                padding: '10px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              📋 Копировать: {pickedCoords.lat}, {pickedCoords.lng}
            </button>

            <button
              onClick={copyAsObject}
              style={{
                padding: '10px 16px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              📋 Копировать как объект: {`{ lat: ${pickedCoords.lat}, lng: ${pickedCoords.lng} }`}
            </button>

            <button
              onClick={copyAsBounds}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              📋 Копировать текстом
            </button>

            <button
              onClick={() => setShowPopup(false)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '8px',
              }}
            >
              ✕ Закрыть
            </button>
          </div>

          {/* История выборов */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            ⏱️ Время выбора: {new Date(pickedCoords.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Индикатор активного режима */}
      {isActive && !showPopup && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🎯 Режим выбора координат активен - кликните на карту
        </div>
      )}

      <style>{`
        .geo-picker-button:hover {
          opacity: 1 !important;
          background: rgba(255, 255, 255, 0.5) !important;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .geo-picker-button:active {
          transform: scale(0.98);
        }

        .geo-picker-button.active {
          animation: pulse 2s ease-in-out infinite;
          background: rgba(239, 68, 68, 0.4) !important;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .geo-picker-popup button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
