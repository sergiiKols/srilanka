import { useState, useEffect, useRef } from 'react';
import { formatOpeningHours } from '../../utils/formatOpeningHours';

interface Property {
    id: string;
    title: string;
    price: string;
    description: string;
    images: string[];
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
}

export default function PropertyDrawer({ isOpen, onClose, property, exchangeRate, onDelete, isCustomProperty }: PropertyDrawerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const formatPriceWeekly = (usdStr: string, currency: 'USD' | 'LKR') => {
        const usdValue = parseInt(usdStr.replace(/[^0-9]/g, ''));
        if (isNaN(usdValue)) return '';
        const weeklyUsd = usdValue * 7;

        if (currency === 'USD') {
            return `$${weeklyUsd}`;
        }

        const weeklyLkr = weeklyUsd * exchangeRate;
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            maximumFractionDigits: 0
        }).format(weeklyLkr).replace('LKR', 'Rs');
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
                        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold">{property.title}</h2>
                                <p className="text-xs text-slate-500">{property.area} • {property.propertyType}</p>
                            </div>
                            <div className="flex gap-2">
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
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Gallery Carousel */}
                            <div className="relative group mb-6">
                                <div
                                    ref={scrollRef}
                                    className="flex gap-0 overflow-x-auto snap-x snap-mandatory pb-0 bg-slate-100 rounded-xl overflow-hidden"
                                    style={{ scrollbarWidth: 'none', height: '300px' }}
                                >
                                    {property.images.map((img, index) => (
                                        <div key={index} className="flex-shrink-0 w-full h-full snap-center relative">
                                            <img src={img} alt={`${property.title} ${index + 1}`} className="object-cover w-full h-full" />
                                            {index === 0 && (
                                                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-white flex flex-col gap-2 min-w-[140px]">
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Daily</div>
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-xl font-black text-slate-900 leading-none">{property.price}</span>
                                                            <span className="text-[10px] font-bold text-slate-500">{formatPriceLKR(property.price)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-[1px] bg-slate-100 w-full"></div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Weekly</div>
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-sm font-black text-slate-800 leading-none">{formatPriceWeekly(property.price, 'USD')}</span>
                                                            <span className="text-[10px] font-bold text-slate-500">{formatPriceWeekly(property.price, 'LKR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                                                {index + 1} / {property.images.length}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {property.images.length > 1 && (
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
                            <div className="grid grid-cols-3 gap-3 mb-8">
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

                            <div className="prose max-w-none">
                                <h3 className="text-lg font-bold mb-2 text-slate-800">Description</h3>
                                <p className="text-slate-600 leading-relaxed text-sm mb-8 whitespace-pre-line">{formatOpeningHours(property.description)}</p>

                                {property.amenities && (
                                    <div className="mt-8">
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
                        <div className="p-4 border-t bg-slate-50">
                            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                                Book Now
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4">Select a property</div>
                )}
            </div>
        </>
    );
}
