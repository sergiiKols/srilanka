import { useState, useRef } from 'react';
import { parseGoogleMapsURL, isValidSriLankaCoordinates, formatForLeaflet, generateGoogleMapsURL } from '../utils/googleMapsParser';
import { parseDescription, highlightFeatures } from '../utils/descriptionParser';

interface PropertyImporterProps {
  onImport: (property: any) => void;
  onClose: () => void;
}

export default function PropertyImporter({ onImport, onClose }: PropertyImporterProps) {
  const [googleMapsInput, setGoogleMapsInput] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Данные объекта недвижимости
  const [propertyData, setPropertyData] = useState({
    title: '',
    price: '',
    rooms: 1,
    bathrooms: 1,
    beachDistance: 50,
    area: 'Unawatuna',
    propertyType: 'villa',
    wifiSpeed: 50,
    pool: false,
    parking: true,
    breakfast: false,
    petFriendly: false,
    security: 'standard',
    description: '',
    amenities: [] as string[],
    images: [] as string[],
    imageUrls: [] as string[]
  });

  const handleParseCoordinates = async () => {
    setError('');
    
    if (!googleMapsInput.trim()) {
      setError('Пожалуйста, введите URL Google Maps или координаты');
      return;
    }

    try {
      const parsed = await parseGoogleMapsURL(googleMapsInput);
      
      if (!parsed) {
        setError('Не удалось распознать координаты. Проверьте формат ввода.');
        return;
      }

      if (!isValidSriLankaCoordinates(parsed.lat, parsed.lng)) {
        setError(`Координаты вне Шри-Ланки. Проверьте: ${parsed.lat}, ${parsed.lng}`);
        return;
      }

      const coords = formatForLeaflet(parsed);
      setCoordinates(coords);
      
      // Автозаполнение названия, если есть
      if (parsed.placeName) {
        setPropertyData(prev => ({ ...prev, title: parsed.placeName || '' }));
      }
    } catch (error: any) {
      setError(`Ошибка: ${error.message}`);
    }
  };

  const handleDescriptionChange = (description: string) => {
    setPropertyData(prev => ({ ...prev, description }));
    
    // Автоматический парсинг описания
    const parsed = parseDescription(description);
    
    setPropertyData(prev => ({
      ...prev,
      rooms: parsed.rooms || prev.rooms,
      bathrooms: parsed.bathrooms || prev.bathrooms,
      wifiSpeed: parsed.wifiSpeed || prev.wifiSpeed,
      propertyType: parsed.propertyType || prev.propertyType,
      pool: parsed.features.pool || prev.pool,
      parking: parsed.features.parking || prev.parking,
      breakfast: parsed.features.breakfast || prev.breakfast,
      petFriendly: parsed.features.petFriendly || prev.petFriendly,
      amenities: parsed.amenities.length > 0 ? parsed.amenities : prev.amenities
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          setPropertyData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    const url = prompt('Введите URL изображения:');
    if (url && url.trim()) {
      setPropertyData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, url.trim()]
      }));
    }
  };

  const handleRemoveImage = (index: number, type: 'local' | 'url') => {
    if (type === 'local') {
      setPropertyData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setPropertyData(prev => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = () => {
    if (!coordinates) {
      setError('Сначала введите ссылку из Google Maps');
      return;
    }
    
    if (!propertyData.title || !propertyData.price) {
      setError('Заполните название и цену');
      return;
    }

    // Собираем все изображения
    const allImages = [...propertyData.images, ...propertyData.imageUrls];
    const finalImages = allImages.length > 0 ? allImages : [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];

    const newProperty = {
      id: `prop_${Date.now()}`,
      position: coordinates,
      title: propertyData.title,
      price: `$${propertyData.price}/night`,
      rawPrice: parseInt(propertyData.price),
      rooms: propertyData.rooms,
      bathrooms: propertyData.bathrooms,
      beachDistance: propertyData.beachDistance,
      area: propertyData.area,
      propertyType: propertyData.propertyType,
      wifiSpeed: propertyData.wifiSpeed,
      pool: propertyData.pool,
      parking: propertyData.parking,
      breakfast: propertyData.breakfast,
      petFriendly: propertyData.petFriendly,
      security: propertyData.security,
      type: 'stay',
      description: propertyData.description || `${propertyData.propertyType} в районе ${propertyData.area}`,
      amenities: propertyData.amenities.length > 0 ? propertyData.amenities : ['Wifi', 'Hot Water'],
      images: finalImages
    };

    onImport(newProperty);
  };

  const highlightedDescription = propertyData.description 
    ? highlightFeatures(propertyData.description) 
    : [{text: '', highlighted: false}];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[3000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">📍 Импорт объекта</h2>
            <p className="text-sm text-slate-500 mt-1">
              {coordinates ? '✅ Координаты определены' : 'Вставьте ссылку из Google Maps'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Main Content - Single Page */}
        <div className="p-6 space-y-6">
          {/* Google Maps URL Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Google Maps URL или координаты
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={googleMapsInput}
                onChange={(e) => setGoogleMapsInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleParseCoordinates()}
                placeholder="https://www.google.com/maps/@6.0135,80.2410,17z"
                className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono text-sm"
              />
              <button
                onClick={handleParseCoordinates}
                className="px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                Определить
              </button>
            </div>
            {coordinates && (
              <div className="mt-2 text-xs text-green-600 font-mono">
                ✓ {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              ❌ {error}
            </div>
          )}

          <div className="border-t pt-6"></div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Название *</label>
              <input
                type="text"
                value={propertyData.title}
                onChange={(e) => setPropertyData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Villa Ceylon Avenue"
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Цена (USD/ночь) *</label>
              <input
                type="number"
                value={propertyData.price}
                onChange={(e) => setPropertyData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="425"
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Район</label>
              <select
                value={propertyData.area}
                onChange={(e) => setPropertyData(prev => ({ ...prev, area: e.target.value }))}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option value="Unawatuna">Unawatuna</option>
                <option value="Hikkaduwa">Hikkaduwa</option>
                <option value="Mirissa">Mirissa</option>
                <option value="Weligama">Weligama</option>
              </select>
            </div>
          </div>

          {/* Description with Auto-parsing */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Описание объекта 
              <span className="text-xs font-normal text-slate-500 ml-2">
                (характеристики определяются автоматически)
              </span>
            </label>
            <textarea
              value={propertyData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="3 bedroom villa with pool, parking, wifi 50mbps, air conditioning, breakfast included..."
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
              rows={4}
            />
            {propertyData.description && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm">
                <div className="font-bold text-slate-700 mb-1">Найденные характеристики:</div>
                <div className="space-y-1">
                  {highlightedDescription.map((part, idx) => (
                    <span 
                      key={idx} 
                      className={part.highlighted ? 'bg-yellow-200 font-semibold' : ''}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auto-detected properties */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Комнаты</label>
              <input
                type="number"
                value={propertyData.rooms}
                onChange={(e) => setPropertyData(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                min="1"
                className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Ванные</label>
              <input
                type="number"
                value={propertyData.bathrooms}
                onChange={(e) => setPropertyData(prev => ({ ...prev, bathrooms: parseInt(e.target.value) }))}
                min="1"
                className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">До пляжа (м)</label>
              <input
                type="number"
                value={propertyData.beachDistance}
                onChange={(e) => setPropertyData(prev => ({ ...prev, beachDistance: parseInt(e.target.value) }))}
                min="0"
                className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">WiFi (Mbps)</label>
              <input
                type="number"
                value={propertyData.wifiSpeed}
                onChange={(e) => setPropertyData(prev => ({ ...prev, wifiSpeed: parseInt(e.target.value) }))}
                min="0"
                className="w-full p-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Images Section */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Фотографии</label>
            
            <div className="flex gap-2 mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-slate-600 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Загрузить с диска
              </button>
              <button
                onClick={handleAddImageUrl}
                className="flex-1 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-slate-600 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                Добавить по ссылке
              </button>
            </div>

            {/* Image Preview */}
            {(propertyData.images.length > 0 || propertyData.imageUrls.length > 0) && (
              <div className="grid grid-cols-4 gap-3">
                {propertyData.images.map((img, idx) => (
                  <div key={`local-${idx}`} className="relative group">
                    <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => handleRemoveImage(idx, 'local')}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}
                {propertyData.imageUrls.map((url, idx) => (
                  <div key={`url-${idx}`} className="relative group">
                    <img src={url} alt={`URL ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => handleRemoveImage(idx, 'url')}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Добавить объект на карту ✓
          </button>
        </div>
      </div>
    </div>
  );
}
