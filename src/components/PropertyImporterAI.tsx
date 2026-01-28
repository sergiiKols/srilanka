import { useState, useRef } from 'react';
import { parseGoogleMapsURL, isValidSriLankaCoordinates, formatForLeaflet } from '../utils/googleMapsParser';
import { analyzePropertyWithGroqCached } from '../services/groqService';
import type { ImportState, PropertyData, Coordinates } from '../types/ai.types';
import POIValidator from './POIValidator';
import type { ValidationResult } from '../types/validation.types';

interface PropertyImporterAIProps {
  onImport: (property: PropertyData) => void;
  onClose: () => void;
}

export default function PropertyImporterAI({ onImport, onClose }: PropertyImporterAIProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<ImportState>({
    step: 1, // Теперь только 2 шага: 1.Фото → 2.Ссылка+Описание+AI
    coordinates: null,
    images: [],
    imageUrls: [],
    description: '',
    aiProcessing: false,
    aiResult: null,
    quickResult: null,
    error: null,
    sources: []
  });

  // Шаг 2: Google Maps URL + Описание
  const [googleMapsInput, setGoogleMapsInput] = useState('');
  
  // Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Новая упрощенная логика: отправляем всё в AI, он сам всё обработает
  const handleAnalyzeWithAI = async () => {
    if (!googleMapsInput.trim()) {
      setState(prev => ({ ...prev, error: 'Введите URL Google Maps или координаты' }));
      return;
    }

    if (!state.description.trim()) {
      setState(prev => ({ ...prev, error: 'Введите описание объекта' }));
      return;
    }

    // Переходим на шаг 3 с индикатором загрузки
    setState(prev => ({ ...prev, step: 3, aiProcessing: true, error: null }));

    try {
      console.log('🚀 Начинаем обработку...');
      console.log('📍 URL:', googleMapsInput);
      console.log('📝 Описание:', state.description.substring(0, 100) + '...');
      console.log('📸 Фотографий:', state.images.length + state.imageUrls.length);

      // Шаг 1: Парсим URL и извлекаем координаты
      // parseGoogleMapsURL автоматически использует Perplexity AI для коротких ссылок (Method 1)
      console.log('🔗 Обрабатываем URL (короткие ссылки разворачиваются через Perplexity AI)...');
      const parsedCoords = await parseGoogleMapsURL(googleMapsInput);
      
      if (!parsedCoords) {
        throw new Error('Не удалось извлечь координаты из URL');
      }
      
      console.log('✅ Координаты извлечены:', parsedCoords);
      
      // Шаг 3: Отправляем в AI для анализа описания
      console.log('🤖 Sending to AI for analysis...');
      const result = await analyzePropertyWithGroqCached(
        state.description,
        {
          lat: parsedCoords.lat,
          lng: parsedCoords.lng,
          placeName: parsedCoords.placeName
        },
        // Callback для быстрого результата
        (quickResult) => {
          console.log('⚡ Быстрый результат получен:', quickResult);
          setState(prev => ({ ...prev, quickResult }));
        }
      );
      
      // Добавляем координаты к результату AI
      (result as any).coordinates = {
        lat: parsedCoords.lat,
        lng: parsedCoords.lng,
        placeName: parsedCoords.placeName
      };

      console.log('✅ AI вернул результат:', result);

      // Проверяем что AI вернул координаты
      if (result.coordinates && result.coordinates.lat && result.coordinates.lng) {
        console.log('✅ Координаты получены от AI:', result.coordinates);
        
        const coordinates: Coordinates = {
          lat: result.coordinates.lat,
          lng: result.coordinates.lng,
          placeName: result.coordinates.placeName
        };
        
        setState(prev => ({
          ...prev,
          coordinates,
          aiResult: result,
          aiProcessing: false,
          step: 'complete'
        }));
        
        // Автоматически запускаем валидацию
        setShowValidation(true);
      } else {
        // AI не смог получить координаты
        console.error('❌ AI не вернул координаты');
        setState(prev => ({
          ...prev,
          error: googleMapsInput.includes('goo.gl')
            ? 'AI не смог развернуть короткую ссылку. Откройте её в браузере и скопируйте полный URL.'
            : 'AI не смог извлечь координаты из URL. Проверьте формат.',
          aiProcessing: false,
          step: 2 // Возвращаемся на шаг 2
        }));
      }

    } catch (error: any) {
      console.error('❌ Ошибка AI анализа:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Ошибка AI: ${error.message}`,
        aiProcessing: false,
        step: 2 // Возвращаемся на шаг 2
      }));
    }
  };

  // Шаг 2: Загрузка фотографий
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    let processed = 0;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        processed++;
        if (processed === files.length) {
          setState(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Обработка вставки из буфера обмена
  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const newImages: string[] = [];
    let processed = 0;
    let totalImages = 0;

    // Подсчитываем количество изображений
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        totalImages++;
      }
    }

    if (totalImages === 0) return;

    // Обрабатываем изображения
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newImages.push(reader.result as string);
            processed++;
            
            if (processed === totalImages) {
              setState(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
              }));
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleAddImageUrl = () => {
    const url = prompt('Введите URL изображения:');
    if (url && url.trim()) {
      setState(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, url.trim()]
      }));
    }
  };

  const handleRemoveImage = (index: number, type: 'local' | 'url') => {
    if (type === 'local') {
      setState(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setState(prev => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index)
      }));
    }
  };

  const handleNextToDescriptionStep = () => {
    // Переходим ко второму шагу (можно без фото)
    setState(prev => ({ ...prev, step: 2 }));
  };

  // Обработчики для шага 2
  const handleDescriptionChange = (description: string) => {
    setState(prev => ({ ...prev, description }));
  };

  const handleSourceToggle = (source: string) => {
    setState(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }));
  };

  // Обработчик результата валидации
  const handleValidationComplete = (result: ValidationResult) => {
    setValidationResult(result);
    
    // Если Google Maps предлагает более точные координаты, показываем предупреждение
    if (result.placeDetails && result.distanceFromInput > 50) {
      console.log('⚠️ Google Maps предлагает другие координаты');
    }
  };

  // Использовать координаты Google Maps
  const handleUseGoogleCoordinates = () => {
    if (validationResult?.placeDetails) {
      const newCoordinates: Coordinates = {
        lat: validationResult.placeDetails.geometry.location.lat,
        lng: validationResult.placeDetails.geometry.location.lng,
        placeName: validationResult.placeDetails.name
      };
      
      setState(prev => ({ ...prev, coordinates: newCoordinates }));
      
      // Обновляем название если оно более точное
      if (state.aiResult && validationResult.matchScore > 80) {
        setState(prev => ({
          ...prev,
          aiResult: prev.aiResult ? {
            ...prev.aiResult,
            title: validationResult.placeDetails!.name
          } : null
        }));
      }
    }
  };

  // Финальное сохранение
  const handleSaveProperty = () => {
    if (!state.coordinates || !state.aiResult) return;

    // Проверяем валидацию перед сохранением
    if (validationResult && !validationResult.isValid && validationResult.confidence < 0.5) {
      const confirmSave = confirm(
        `Валидация показала низкую точность (${Math.round(validationResult.confidence * 100)}%). Сохранить всё равно?`
      );
      if (!confirmSave) return;
    }

    const allImages = [...state.images, ...state.imageUrls];
    const finalImages = allImages.length > 0 ? allImages : [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];

    const newProperty: PropertyData = {
      id: `prop_${Date.now()}`,
      position: [state.coordinates.lat, state.coordinates.lng],
      title: state.aiResult.title,
      price: state.aiResult.price ? `$${state.aiResult.price}/night` : 'Price on request',
      rawPrice: state.aiResult.price || 0,
      rooms: state.aiResult.rooms,
      bathrooms: state.aiResult.bathrooms,
      beachDistance: state.aiResult.beachDistance,
      area: state.aiResult.area,
      propertyType: state.aiResult.propertyType,
      wifiSpeed: state.aiResult.wifiSpeed,
      pool: state.aiResult.features.pool,
      parking: state.aiResult.features.parking,
      breakfast: state.aiResult.features.breakfast,
      petFriendly: state.aiResult.features.petFriendly,
      security: state.aiResult.features.security,
      type: 'stay',
      description: state.aiResult.cleanDescription,
      amenities: state.aiResult.amenities,
      images: finalImages
    };

    onImport(newProperty);
  };


  const stepProgress = state.step === 'complete' ? 100 : (state.step / 2) * 100;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center z-[3000] p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* LUMINA HEADER with Progress */}
        <div className="sticky top-0 bg-white border-b border-slate-100 z-10">
          {/* Top Bar */}
          <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-[#111827] tracking-tight">
                🤖 AI Import
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
                {state.step === 1 && 'Step 1 of 2: Media Upload'}
                {state.step === 2 && 'Step 2 of 2: Location & Details'}
                {state.step === 'complete' && '✅ Analysis Complete'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-95 -mr-2"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Progress Bar - LUMINA STYLE */}
          <div className="h-1.5 bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] transition-all duration-500 ease-out"
              style={{ width: `${stepProgress}%` }}
            />
          </div>

          {/* Step Pills - Mobile Optimized */}
          <div className="flex items-center justify-center gap-2 py-3 px-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              state.step === 1 ? 'bg-[#2563EB] text-white shadow-md' : 
              state.step > 1 ? 'bg-[#10B981] text-white' : 
              'bg-slate-100 text-slate-400'
            }`}>
              {state.step > 1 ? '✓' : '1'}
              <span className="hidden sm:inline ml-0.5">Media</span>
            </div>
            <div className="h-px w-8 bg-slate-200" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              state.step === 2 ? 'bg-[#2563EB] text-white shadow-md' : 
              state.step === 'complete' ? 'bg-[#10B981] text-white' : 
              'bg-slate-100 text-slate-400'
            }`}>
              {state.step === 'complete' ? '✓' : '2'}
              <span className="hidden sm:inline ml-0.5">Details</span>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {/* Error Message */}
            {state.error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">
                ❌ {state.error}
              </div>
            )}

            {/* Step 1: Photos - LUMINA BENTO STYLE */}
            {state.step === 1 && (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-[#111827]">
                    📸 Media Upload
                  </label>
                  <span className="text-xs font-mono text-[#10B981] bg-green-50 px-2 py-1 rounded-full">
                    {state.images.length + state.imageUrls.length} files
                  </span>
                </div>
                
                {/* BENTO DROP ZONE - Центральный модуль */}
                <div className="relative bg-slate-50 border-2 border-dashed border-[#D1D5DB] rounded-2xl p-6 md:p-8 transition-all hover:border-[#2563EB] hover:bg-blue-50/30">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">Drop media here</p>
                      <p className="text-xs text-slate-500 mt-1">or choose from options below</p>
                    </div>
                  </div>
                </div>

                {/* 3D CLAYMORPHISM ACTION BUTTONS */}
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  
                  {/* Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex flex-col items-center gap-2 p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 active:shadow-sm"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
                    }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <span className="text-xs font-bold text-[#111827] text-center leading-tight">Upload</span>
                  </button>

                  {/* URL Button */}
                  <button
                    onClick={handleAddImageUrl}
                    className="group relative flex flex-col items-center gap-2 p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 active:shadow-sm"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
                    }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </div>
                    <span className="text-xs font-bold text-[#111827] text-center leading-tight">URL</span>
                  </button>

                  {/* Paste Button */}
                  <div
                    onPaste={handlePaste}
                    tabIndex={0}
                    className="group relative flex flex-col items-center gap-2 p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 active:shadow-sm cursor-pointer"
                    onClick={(e) => e.currentTarget.focus()}
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
                    }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                    </div>
                    <span className="text-xs font-bold text-[#111827] text-center leading-tight">Paste</span>
                    <span className="text-[10px] font-mono text-slate-400 absolute -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">⌘V</span>
                  </div>
                </div>
                
                {/* Hint - LUMINA GREEN */}
                <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-3">
                  <p className="text-xs text-[#059669] font-medium">
                    💡 <strong className="font-bold">Tip:</strong> Copy image (Ctrl+C) then click Paste and press Ctrl+V
                  </p>
                </div>

                {/* Image Preview - LUMINA Grid */}
                {(state.images.length > 0 || state.imageUrls.length > 0) && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                      Uploaded Media ({state.images.length + state.imageUrls.length})
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {state.images.map((img, idx) => (
                        <div key={`local-${idx}`} className="relative group aspect-square">
                          <img 
                            src={img} 
                            alt={`Photo ${idx + 1}`} 
                            className="w-full h-full object-cover rounded-xl border-2 border-slate-200 group-hover:border-[#2563EB] transition-all" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl" />
                          <button
                            onClick={() => handleRemoveImage(idx, 'local')}
                            className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 active:scale-90"
                            title="Remove"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                          <div className="absolute bottom-1.5 left-1.5 bg-[#111827]/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            #{idx + 1}
                          </div>
                        </div>
                      ))}
                      {state.imageUrls.map((url, idx) => (
                        <div key={`url-${idx}`} className="relative group aspect-square">
                          <img 
                            src={url} 
                            alt={`URL ${idx + 1}`} 
                            className="w-full h-full object-cover rounded-xl border-2 border-slate-200 group-hover:border-[#2563EB] transition-all" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl" />
                          <button
                            onClick={() => handleRemoveImage(idx, 'url')}
                            className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 active:scale-90"
                            title="Remove"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                          <div className="absolute bottom-1.5 left-1.5 bg-[#2563EB]/90 text-white text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            URL
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: URL + Description + AI */}
            {state.step === 2 && (
              <div className="space-y-4">
              {/* Google Maps URL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Google Maps URL или координаты
                </label>
                <input
                  type="text"
                  value={googleMapsInput}
                  onChange={(e) => setGoogleMapsInput(e.target.value)}
                  placeholder="https://www.google.com/maps/@6.0135,80.2410,17z или https://maps.app.goo.gl/xxx"
                  className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Описание объекта
                </label>
                <textarea
                  value={state.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Опишите объект... Можно вставить текст из Booking.com, Airbnb или любого другого источника. AI автоматически извлечет все характеристики."
                  className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
                  rows={8}
                />
                <p className="mt-2 text-xs text-slate-500">
                  AI определит: комнаты, удобства, цену, расстояние до пляжа и многое другое
                </p>
              </div>

              {/* Source Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Источник данных (опционально)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Google Maps', 'Airbnb', 'Booking.com', 'Agoda', 'Owner Description'].map(source => (
                    <button
                      key={source}
                      onClick={() => handleSourceToggle(source)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        state.sources.includes(source)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {state.sources.includes(source) && '✓ '}{source}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Result Preview */}
              {state.quickResult && !state.aiProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="animate-spin">⚡</div>
                    <span className="font-bold text-blue-900">Быстрый анализ (локальный):</span>
                  </div>
                  <div className="text-sm text-blue-800 space-y-1">
                    {state.quickResult.rooms && <div>🛏️ Комнат: {state.quickResult.rooms}</div>}
                    {state.quickResult.wifiSpeed && <div>📶 WiFi: {state.quickResult.wifiSpeed} Mbps</div>}
                    {state.quickResult.amenities && state.quickResult.amenities.length > 0 && (
                      <div>✨ Удобства: {state.quickResult.amenities.join(', ')}</div>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Ожидайте более точный AI анализ...</p>
                </div>
              )}

              {/* AI Processing Indicator */}
              {state.aiProcessing && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 text-center">
                  <div className="animate-pulse mb-3">
                    <div className="text-4xl">🤖</div>
                  </div>
                  <div className="font-bold text-indigo-900 mb-1">AI is analyzing data...</div>
                  <div className="text-sm text-indigo-600">This will take 1-3 seconds ⚡</div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setState(prev => ({ ...prev, step: 1 }))}
                  disabled={state.aiProcessing}
                  className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  ← Назад к фото
                </button>
                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={state.aiProcessing || !state.description.trim() || !googleMapsInput.trim()}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {state.aiProcessing ? '🤖 Analyzing...' : '🤖 Analyze with AI'}
                </button>
              </div>
            </div>
          )}

          {/* Step Complete: AI Results */}
          {state.step === 'complete' && state.aiResult && (
            <div className="space-y-6">
              {/* Google Maps Validation */}
              {showValidation && state.coordinates && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">🔍 Валидация с Google Maps</h3>
                    <button
                      onClick={() => setShowValidation(!showValidation)}
                      className="text-sm text-slate-600 hover:text-slate-900"
                    >
                      {showValidation ? 'Скрыть' : 'Показать'}
                    </button>
                  </div>
                  <POIValidator
                    coordinates={state.coordinates}
                    name={state.aiResult.title}
                    type="lodging"
                    autoValidate={true}
                    showDetails={true}
                    onValidationComplete={handleValidationComplete}
                  />
                  {validationResult?.placeDetails && validationResult.distanceFromInput > 50 && (
                    <button
                      onClick={handleUseGoogleCoordinates}
                      className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      📍 Использовать координаты Google Maps ({Math.round(validationResult.distanceFromInput)}м точнее)
                    </button>
                  )}
                </div>
              )}

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">✅</div>
                  <div>
                    <div className="font-bold text-green-900 text-lg">AI Analysis Complete!</div>
                    <div className="text-sm text-green-700">
                      Confidence: {Math.round(state.aiResult.confidence * 100)}%
                      {validationResult && (
                        <span className="ml-2">
                          | Validation: {Math.round(validationResult.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Results Preview */}
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-bold text-slate-700">Название:</span>
                      <div className="text-slate-900">{state.aiResult.title}</div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Тип:</span>
                      <div className="text-slate-900">{state.aiResult.propertyType}</div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Комнаты:</span>
                      <div className="text-slate-900">{state.aiResult.rooms} спальни, {state.aiResult.bathrooms} ванные</div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Цена:</span>
                      <div className="text-slate-900">
                        {state.aiResult.price ? `$${state.aiResult.price}/ночь` : 'По запросу'}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Район:</span>
                      <div className="text-slate-900">{state.aiResult.area}</div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">До пляжа:</span>
                      <div className="text-slate-900">{state.aiResult.beachDistance}м</div>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 text-sm">Удобства:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {state.aiResult.amenities.map((amenity, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 text-sm">Описание:</span>
                    <div className="text-sm text-slate-600 mt-1">{state.aiResult.cleanDescription}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setState(prev => ({ ...prev, step: 2, aiResult: null }))}
                  className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  ← Изменить данные
                </button>
                <button
                  onClick={handleSaveProperty}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                  ✓ Добавить на карту
                </button>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Bottom Actions - Sticky */}
        {state.step === 1 && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 md:p-6">
            <button
              onClick={handleNextToDescriptionStep}
              className="w-full bg-[#2563EB] text-white py-3.5 md:py-4 rounded-xl font-bold hover:bg-[#1D4ED8] transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
