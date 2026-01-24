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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[3000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Progress */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">🤖 AI-импорт объекта</h2>
              <p className="text-sm text-slate-500 mt-1">
                {state.step === 1 && 'Шаг 1: Загрузка фотографий (опционально)'}
                {state.step === 2 && 'Шаг 2: Google Maps ссылка + Описание'}
                {state.step === 'complete' && '✅ AI анализ завершен'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${stepProgress}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-4 py-4 px-6">
            <StepIndicator number={1} active={state.step === 1} complete={state.step > 1} label="Фото" />
            <div className="h-px w-16 bg-slate-300" />
            <StepIndicator number={2} active={state.step === 2} complete={state.step === 'complete'} label="Ссылка + AI" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {state.error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              ❌ {state.error}
            </div>
          )}

          {/* Step 1: Photos */}
          {state.step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-slate-700">
                    Фотографии объекта
                  </label>
                  <span className="text-xs text-slate-500">
                    {state.images.length + state.imageUrls.length} загружено
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
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
                    className="p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2 text-slate-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span className="font-medium text-sm">Загрузить с диска</span>
                  </button>
                  <button
                    onClick={handleAddImageUrl}
                    className="p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2 text-slate-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    <span className="font-medium text-sm">Добавить по URL</span>
                  </button>
                  <div
                    onPaste={handlePaste}
                    tabIndex={0}
                    className="p-6 border-2 border-dashed border-purple-300 bg-purple-50 rounded-xl hover:border-purple-500 hover:bg-purple-100 transition-all flex flex-col items-center justify-center gap-2 text-purple-700 cursor-pointer group"
                    onClick={(e) => e.currentTarget.focus()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                    <span className="font-medium text-sm text-center">Вставить из буфера</span>
                    <span className="text-xs opacity-70 group-hover:opacity-100">Ctrl+V</span>
                  </div>
                </div>
                
                {/* Подсказка */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Совет:</strong> Скопируйте изображение (Ctrl+C) и нажмите на зону "Вставить из буфера", затем Ctrl+V
                  </p>
                </div>

                {/* Image Preview - Improved with thumbnails */}
                {(state.images.length > 0 || state.imageUrls.length > 0) && (
                  <div>
                    <div className="text-sm font-bold text-slate-700 mb-2">
                      Загруженные фотографии ({state.images.length + state.imageUrls.length})
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {state.images.map((img, idx) => (
                        <div key={`local-${idx}`} className="relative group">
                          <img 
                            src={img} 
                            alt={`Фото ${idx + 1}`} 
                            className="w-full h-24 object-cover rounded-lg border-2 border-slate-200 group-hover:border-indigo-400 transition-all shadow-sm" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg" />
                          <button
                            onClick={() => handleRemoveImage(idx, 'local')}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            title="Удалить"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            #{idx + 1}
                          </div>
                        </div>
                      ))}
                      {state.imageUrls.map((url, idx) => (
                        <div key={`url-${idx}`} className="relative group">
                          <img 
                            src={url} 
                            alt={`URL ${idx + 1}`} 
                            className="w-full h-24 object-cover rounded-lg border-2 border-slate-200 group-hover:border-indigo-400 transition-all shadow-sm" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg" />
                          <button
                            onClick={() => handleRemoveImage(idx, 'url')}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            title="Удалить"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                          <div className="absolute bottom-1 left-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            URL #{idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextToDescriptionStep}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
              >
                Далее →
              </button>
            </div>
          )}

          {/* Step 2: URL + Description + AI */}
          {state.step === 2 && (
            <div className="space-y-6">
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
    </div>
  );
}

// Step Indicator Component
function StepIndicator({ number, active, complete, label }: { number: number; active: boolean; complete: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
        complete ? 'bg-green-500 text-white' :
        active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
        'bg-slate-200 text-slate-500'
      }`}>
        {complete ? '✓' : number}
      </div>
      <div className={`text-xs font-medium ${
        active ? 'text-indigo-600' : complete ? 'text-green-600' : 'text-slate-500'
      }`}>
        {label}
      </div>
    </div>
  );
}
