/**
 * VIDEO PLAYER COMPONENT
 * Воспроизведение видео из Telegram Storage
 */

import { useEffect, useState } from 'react';

interface VideoPlayerProps {
  fileId: string;
  thumbnailFileId?: string;
  width?: number;
  height?: number;
  className?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  fileId,
  thumbnailFileId,
  width = 640,
  height = 360,
  className = '',
  autoPlay = false
}: VideoPlayerProps) {
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadVideoUrl();
  }, [fileId]);
  
  async function loadVideoUrl() {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем URL видео
      const response = await fetch(`/api/video-url?fileId=${fileId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load video');
      }
      
      setVideoUrl(data.url);
      
      // Загружаем thumbnail если есть
      if (thumbnailFileId) {
        console.log('🎬 Loading thumbnail:', thumbnailFileId);
        const thumbResponse = await fetch(`/api/video-url?fileId=${thumbnailFileId}&type=thumbnail`);
        const thumbData = await thumbResponse.json();
        
        console.log('🎬 Thumbnail response:', thumbData);
        
        if (thumbData.success) {
          setThumbnailUrl(thumbData.url);
          console.log('✅ Thumbnail loaded:', thumbData.url);
        } else {
          console.error('❌ Thumbnail failed:', thumbData.error);
        }
      } else {
        console.log('⚠️ No thumbnailFileId provided');
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('Error loading video:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }
  
  // Обработка истечения URL (через 1 час)
  useEffect(() => {
    if (!videoUrl) return;
    
    // Обновляем URL каждые 50 минут
    const timer = setTimeout(() => {
      loadVideoUrl();
    }, 50 * 60 * 1000);
    
    return () => clearTimeout(timer);
  }, [videoUrl]);
  
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Загрузка видео...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-red-50 rounded ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">❌ Ошибка загрузки видео</p>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={loadVideoUrl}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  
  if (!videoUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ width, height }}
      >
        <p className="text-gray-600">Видео недоступно</p>
      </div>
    );
  }
  
  return (
    <div className={className} style={{ position: 'relative', width, height }}>
      <video
        width={width}
        height={height}
        controls
        autoPlay={autoPlay}
        poster={thumbnailUrl || undefined}
        className="rounded shadow-lg"
        style={{ 
          width: '100%', 
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#000'
        }}
        preload="metadata"
        onError={() => {
          console.error('Video playback error');
          setError('Ошибка воспроизведения видео');
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Ваш браузер не поддерживает воспроизведение видео.
      </video>
      
      {/* Показываем иконку Play если видео не играет */}
      {!autoPlay && thumbnailUrl && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '25px solid white',
            borderTop: '15px solid transparent',
            borderBottom: '15px solid transparent',
            marginLeft: '8px'
          }} />
        </div>
      )}
    </div>
  );
}
