import { useState, useEffect, useRef } from 'react';
import { formatOpeningHours } from '../../utils/formatOpeningHours';
import VideoPlayer from '../VideoPlayer';

/**
 * Оптимизация URL изображения для быстрой загрузки
 * ОТКЛЮЧЕНО: Supabase Image Transformation может замедлять загрузку
 */
function optimizeImageUrl(url: string, width: number = 800, height: number = 600): string {
    // Возвращаем оригинальный URL без трансформации
    return url;
}

interface Property {
    id: string;
    title: string;
    price: string;
    pricePeriod?: 'night' | 'day' | 'week' | 'month'; // ✅ Добавлено
    description: string;
    images: string[];
    video_url?: string; // 🎬 file_id видео из Telegram
    video_thumbnail_url?: string; // 🎬 file_id thumbnail
    video_duration?: number; // 🎬 Длительность в секундах
    video_size?: number; // 🎬 Размер в байтах
    amenities?: string[];
    bathrooms?: number;
    beachDistance?: number;
    wifiSpeed?: number;
    area?: string;
    propertyType?: string;
    pool?: boolean;
    parking?: boolean;
    breakfast?: boolean;
    petFriendly?: boolean;
    security?: string;
}

interface PropertyDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    property?: Property | null;
    exchangeRate: number;
    onDelete?: (propertyId: string) => void;
    isCustomProperty?: boolean;
    userId?: string; // Telegram user ID для проверки владельца
    markerColor?: string; // Текущий цвет маркера
    onMarkerColorChange?: (color: string) => void; // Callback для изменения цвета
}

export default function PropertyDrawer({ isOpen, onClose, property, exchangeRate, onDelete, isCustomProperty, userId, markerColor = '#ef4444', onMarkerColorChange }: PropertyDrawerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);

    // Цвета для переключения
    const highlightColor = '#22c55e'; // зеленый для подсветки
    const defaultColor = '#ef4444'; // красный по умолчанию

    // Синхронизируем состояние с текущим цветом
    useEffect(() => {
        setIsHighlighted(markerColor === highlightColor);
    }, [markerColor]);

    // Переключение подсветки (только визуальное состояние кнопки, без изменения цвета маркера)
    const toggleHighlight = () => {
        setIsHighlighted(!isHighlighted);
        // НЕ вызываем onMarkerColorChange - кнопка только для визуального эффекта
    };

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const formatPriceLKR = (usdStr: string) => {
        const usdValue = parseInt(usdStr.replace(/[^0-9]/g, ''));
        if (isNaN(usdValue)) return '';
        const lkr = usdValue * exchangeRate;
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0
        }).format(lkr).replace('LKR', 'Rs');
    };

    // Универсальный пересчёт цены
    const calculatePrices = (usdStr: string, period: 'night' | 'day' | 'week' | 'month' = 'night') => {
        const usdValue = parseInt(usdStr.replace(/[^0-9]/g, ''));
        if (isNaN(usdValue)) return { daily: 0, weekly: 0, monthly: 0 };

        let dailyUsd = 0;
        let weeklyUsd = 0;
        let monthlyUsd = 0;

        // Определяем базовую цену в зависимости от периода
        if (period === 'month') {
            // Цена за месяц → пересчитываем день и неделю
            monthlyUsd = usdValue;
            dailyUsd = Math.round(usdValue / 30);
            weeklyUsd = Math.round(usdValue / 4);
        } else if (period === 'week') {
            // Цена за неделю → пересчитываем день и месяц
            weeklyUsd = usdValue;
            dailyUsd = Math.round(usdValue / 7);
            monthlyUsd = Math.round(usdValue * 4);
        } else {
            // Цена за день/ночь → пересчитываем неделю и месяц
            dailyUsd = usdValue;
            weeklyUsd = usdValue * 7;
            monthlyUsd = usdValue * 30;
        }

        return { daily: dailyUsd, weekly: weeklyUsd, monthly: monthlyUsd };
    };

    const formatPrice = (amount: number, currency: 'USD' | 'LKR') => {
        if (currency === 'USD') {
            return `$${amount}`;
        }

        const lkr = amount * exchangeRate;
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0
        }).format(lkr).replace('LKR', 'Rs');
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const width = current.clientWidth;
            const scrollWidth = current.scrollWidth;
            const currentScroll = current.scrollLeft;

            if (direction === 'left') {
                if (currentScroll <= 5) {
                    current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
                } else {
                    current.scrollBy({ left: -width, behavior: 'smooth' });
                }
            } else {
                if (currentScroll + width >= scrollWidth - 5) {
                    current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    current.scrollBy({ left: width, behavior: 'smooth' });
                }
            }
        }
    };

    return (
        <>
            {/* Drawer - No backdrop, map remains interactive */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-[-8px_0_32px_-8px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ zIndex: 9999 }}
            >
                {property ? (
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold">{property.title}</h2>
                                <p className="text-xs text-slate-500">{property.area} • {property.propertyType}</p>
                            </div>
                            <div className="flex gap-2">
                                {/* Highlight Button */}
                                <button 
                                    onClick={toggleHighlight}
                                    className="w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg active:scale-95"
                                    style={{ 
                                        backgroundColor: isHighlighted ? highlightColor : defaultColor,
                                    }}
                                    title={isHighlighted ? "Снять подсветку" : "Подсветить на карте"}
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="20" 
                                        height="20" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="white" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        className="transition-transform duration-300"
                                        style={{ transform: isHighlighted ? 'scale(1.1)' : 'scale(1)' }}
                                    >
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </button>
                                {isCustomProperty && onDelete && (
                                    <button 
                                        onClick={() => onDelete(property.id)}
                                        className="p-2 hover:bg-red-50 rounded-full text-red-600 transition-colors"
                                        title="Удалить объект"
                                    >
                                        🗑️
                                    </button>
                                )}
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto py-4">
                            {/* Gallery Carousel */}
                            <div className="relative group mb-6" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                                <div
                                    ref={scrollRef}
                                    className="flex gap-0 overflow-x-auto snap-x snap-mandatory pb-0 bg-slate-100 rounded-xl overflow-hidden"
                                    style={{ scrollbarWidth: 'none', height: '300px' }}
                                >
                                    {/* 🎬 Видео (если есть) */}
                                    {property.video_url && (
                                        <div className="flex-shrink-0 w-full h-full snap-center relative bg-black">
                                            <VideoPlayer
                                                fileId={property.video_url}
                                                thumbnailFileId={property.video_thumbnail_url}
                                                width={800}
                                                height={300}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Фотографии */}
                                    {(property.images || []).map((img, index) => (
                                        <div key={index} className="flex-shrink-0 w-full h-full snap-center relative">
                                            <img 
                                                src={optimizeImageUrl(img, 800, 600)} 
                                                alt={`${property.title} ${index + 1}`} 
                                                className="object-cover w-full h-full"
                                                loading={index === 0 ? "eager" : "lazy"}
                                                decoding="async"
                                            />
                                            {index === 0 && (() => {
                                                const prices = calculatePrices(property.price, property.pricePeriod);
                                                const isMonthly = property.pricePeriod === 'month';
                                                
                                                return (
                                                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-2.5 rounded-2xl shadow-xl border border-white flex flex-col gap-1.5 min-w-[140px]">
                                                        {/* За день */}
                                                        <div>
                                                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
                                                                Daily
                                                                {!isMonthly && <span className="text-[8px] text-green-600">●</span>}
                                                            </div>
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className={`${!isMonthly ? 'text-xl' : 'text-base'} font-black text-slate-900 leading-none`}>
                                                                    ${prices.daily}
                                                                </span>
                                                                <span className="text-[9px] font-bold text-slate-500">
                                                                    {formatPrice(prices.daily, 'LKR')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="h-[1px] bg-slate-100 w-full"></div>
                                                        
                                                        {/* За неделю */}
                                                        <div>
                                                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                                                                Weekly
                                                            </div>
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-sm font-black text-slate-800 leading-none">
                                                                    ${prices.weekly}
                                                                </span>
                                                                <span className="text-[9px] font-bold text-slate-500">
                                                                    {formatPrice(prices.weekly, 'LKR')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="h-[1px] bg-slate-100 w-full"></div>
                                                        
                                                        {/* За месяц */}
                                                        <div>
                                                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
                                                                Monthly
                                                                {isMonthly && <span className="text-[8px] text-green-600">●</span>}
                                                            </div>
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className={`${isMonthly ? 'text-xl' : 'text-sm'} font-black ${isMonthly ? 'text-slate-900' : 'text-slate-800'} leading-none`}>
                                                                    ${prices.monthly}
                                                                </span>
                                                                <span className="text-[9px] font-bold text-slate-500">
                                                                    {formatPrice(prices.monthly, 'LKR')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                                                {(property.video_url ? 1 : 0) + index + 1} / {(property.video_url ? 1 : 0) + (property.images || []).length}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {((property.video_url ? 1 : 0) + (property.images || []).length) > 1 && (
                                    <>
                                        <button
                                            onClick={() => scroll('left')}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-10 transition-colors opacity-0 group-hover:opacity-100"
                                            aria-label="Previous image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                        </button>
                                        <button
                                            onClick={() => scroll('right')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-10 transition-colors opacity-0 group-hover:opacity-100"
                                            aria-label="Next image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Quick Info Badges */}
                            <div className="grid grid-cols-3 gap-3 mb-8" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center">
                                    <span className="text-xl mb-1">🏖️</span>
                                    <span className="text-[10px] font-bold text-slate-800">{property.beachDistance}m</span>
                                    <span className="text-[8px] uppercase font-black tracking-tighter text-slate-400">To beach</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center">
                                    <span className="text-xl mb-1">🛁</span>
                                    <span className="text-[10px] font-bold text-slate-800">{property.bathrooms}</span>
                                    <span className="text-[8px] uppercase font-black tracking-tighter text-slate-400">Baths</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center">
                                    <span className="text-xl mb-1">📶</span>
                                    <span className="text-[10px] font-bold text-slate-800">{property.wifiSpeed} Mbps</span>
                                    <span className="text-[8px] uppercase font-black tracking-tighter text-slate-400">Speed</span>
                                </div>
                            </div>

                            <div className="space-y-6" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                                <div>
                                    <h3 className="text-lg font-bold mb-2 text-slate-800">Description</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{formatOpeningHours(property.description)}</p>
                                </div>

                                {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 text-slate-800">Amenities</h3>
                                        <div className="flex gap-2 flex-wrap">
                                            {property.amenities.map(item => (
                                                <span key={item} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="px-6 py-4 border-t bg-slate-50 space-y-3">
                            {isCustomProperty && userId ? (
                                showDeleteConfirm ? (
                                    // Confirmation state
                                    <div className="space-y-2">
                                        <p className="text-sm text-center text-slate-600 font-medium">
                                            Удалить этот объект?
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="py-2.5 rounded-xl font-semibold text-sm transition-all duration-300
                                                    bg-slate-100 text-slate-700 hover:bg-slate-200
                                                    border border-slate-200"
                                                disabled={isDeleting}
                                            >
                                                Отмена
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if (!property) return;
                                                    setIsDeleting(true);
                                                    try {
                                                        const response = await fetch(`/api/saved-properties/${property.id}?userId=${userId}`, {
                                                            method: 'DELETE'
                                                        });
                                                        
                                                        if (response.ok) {
                                                            // Закрываем drawer сразу для лучшего UX
                                                            onClose();
                                                            
                                                            // Вызываем callback для обновления списка
                                                            if (onDelete) {
                                                                // Небольшая задержка чтобы drawer успел закрыться
                                                                setTimeout(() => {
                                                                    onDelete(property.id);
                                                                }, 150);
                                                            }
                                                        } else {
                                                            const error = await response.json();
                                                            alert(`Ошибка: ${error.error || 'Не удалось удалить объект'}`);
                                                            setIsDeleting(false);
                                                            setShowDeleteConfirm(false);
                                                        }
                                                    } catch (err) {
                                                        console.error('Delete error:', err);
                                                        alert('Ошибка при удалении. Проверьте подключение к интернету.');
                                                        setIsDeleting(false);
                                                        setShowDeleteConfirm(false);
                                                    }
                                                }}
                                                className="py-2.5 rounded-xl font-semibold text-sm transition-all duration-300
                                                    bg-gradient-to-br from-red-500 to-red-600 text-white
                                                    hover:from-red-600 hover:to-red-700
                                                    shadow-[0_12px_24px_-8px_rgba(239,68,68,0.4)]
                                                    active:scale-95
                                                    disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? '⏳ Удаление...' : '🗑️ Удалить'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Default state
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300
                                            bg-gradient-to-br from-red-50 to-red-100 text-red-600
                                            hover:from-red-100 hover:to-red-200
                                            border border-red-200
                                            shadow-[0_12px_24px_-8px_rgba(239,68,68,0.15)]
                                            hover:shadow-[0_16px_32px_-8px_rgba(239,68,68,0.25)]
                                            active:scale-98
                                            flex items-center justify-center gap-2"
                                    >
                                        <span>🗑️</span>
                                        <span>Удалить объект</span>
                                    </button>
                                )
                            ) : (
                                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                                    Book Now
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4">Select a property</div>
                )}
            </div>
        </>
    );
}
