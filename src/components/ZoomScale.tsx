import { useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';

interface ZoomScaleProps {
    onZoomChange?: (zoom: number) => void;
}

export default function ZoomScale({ onZoomChange }: ZoomScaleProps) {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const handleZoom = () => {
            const newZoom = map.getZoom();
            setZoom(newZoom);
            onZoomChange?.(newZoom);
        };

        map.on('zoomend', handleZoom);
        return () => {
            map.off('zoomend', handleZoom);
        };
    }, [map, onZoomChange]);

    // Определяем текущий уровень и описание
    const getZoomLevel = (z: number) => {
        if (z < 9) return { level: 1, desc: 'Far' };
        if (z < 11) return { level: 2, desc: 'Far-Medium' };
        if (z < 13) return { level: 3, desc: 'Medium' };
        if (z < 15) return { level: 4, desc: 'Medium-Close' };
        return { level: 5, desc: 'Close' };
    };

    const currentLevel = getZoomLevel(zoom);
    const levels = [
        { num: 1, symbol: '🌍', desc: 'Far (< 9)', range: '0-8' },
        { num: 2, symbol: '🗺️', desc: 'Far-Medium (9-10)', range: '9-10' },
        { num: 3, symbol: '🏞️', desc: 'Medium (11-12)', range: '11-12' },
        { num: 4, symbol: '🏘️', desc: 'Medium-Close (13-14)', range: '13-14' },
        { num: 5, symbol: '🏠', desc: 'Close (15+)', range: '15+' }
    ];

    const handleZoomTo = (level: number) => {
        const zoomMap: Record<number, number> = {
            1: 8,
            2: 10,
            3: 12,
            4: 14,
            5: 16
        };
        map.setZoom(zoomMap[level]);
    };

    return (
        <div className="absolute top-32 right-6 z-[1000] bg-white rounded-xl shadow-lg p-4 max-w-xs">
            {/* Заголовок */}
            <div className="mb-3 pb-3 border-b">
                <div className="text-sm font-bold text-slate-800">Zoom Level</div>
                <div className="text-xs text-slate-500 mt-1">
                    Current: <span className="font-bold text-indigo-600">{zoom}</span> ({currentLevel.desc})
                </div>
            </div>

            {/* Шкала с градациями */}
            <div className="space-y-2">
                {levels.map((level) => (
                    <button
                        key={level.num}
                        onClick={() => handleZoomTo(level.num)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                            currentLevel.level === level.num
                                ? 'bg-indigo-100 border-2 border-indigo-500 shadow-sm'
                                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        {/* Символ */}
                        <div className="text-2xl">{level.symbol}</div>

                        {/* Информация */}
                        <div className="flex-1 text-left">
                            <div className="text-sm font-bold text-slate-700">
                                Level {level.num}: {level.desc}
                            </div>
                            <div className="text-xs text-slate-500">{level.range}</div>
                        </div>

                        {/* Индикатор текущего */}
                        {currentLevel.level === level.num && (
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Visual progress bar */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <div className="text-xs font-bold text-slate-600 mb-2">Visual Scale:</div>
                <div className="flex gap-1">
                    {levels.map((level) => (
                        <div
                            key={level.num}
                            className={`flex-1 h-8 rounded transition-all flex items-center justify-center text-[10px] font-bold ${
                                currentLevel.level === level.num
                                    ? 'bg-indigo-500 text-white scale-y-125'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title={level.desc}
                        >
                            {level.num}
                        </div>
                    ))}
                </div>
            </div>

            {/* Подсказка */}
            <div className="mt-3 p-2 bg-blue-50 rounded text-[11px] text-blue-700 border border-blue-100">
                💡 Click any level to jump to that zoom or use mouse wheel/trackpad to zoom
            </div>
        </div>
    );
}
