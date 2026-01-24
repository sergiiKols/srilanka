import { useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';

interface ZoomSliderProps {
    onZoomChange?: (zoom: number) => void;
}

export default function ZoomSlider({ onZoomChange }: ZoomSliderProps) {
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

    return (
        <div className="absolute bottom-6 left-6 z-[999] hidden md:block">
            {/* Кнопка с зумом */}
            <button
                onClick={() => {
                    // Cycle через zoom levels: 8 -> 12 -> 16 -> 8
                    const nextZoom = zoom < 12 ? 12 : zoom < 16 ? 16 : 8;
                    map.setZoom(nextZoom);
                }}
                className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center transition-all hover:bg-white hover:shadow-xl active:scale-95 border-2 border-slate-200"
                title="Zoom level (click to change)"
            >
                {/* Цифры */}
                <div className="text-slate-800 font-bold text-xl">{zoom}</div>
            </button>
        </div>
    );
}
