import { useState } from 'react';

interface ShortUrlHelperProps {
  shortUrl: string;
  onExpanded: (fullUrl: string) => void;
  onClose: () => void;
}

export default function ShortUrlHelper({ shortUrl, onExpanded, onClose }: ShortUrlHelperProps) {
  const [manualUrl, setManualUrl] = useState('');

  const handleOpenInNewTab = () => {
    window.open(shortUrl, '_blank');
  };

  const handleSubmit = () => {
    if (manualUrl.trim()) {
      onExpanded(manualUrl.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[3500] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Короткая ссылка обнаружена
          </h2>
          <p className="text-slate-600 text-sm">
            Из-за ограничений безопасности браузера, короткие ссылки нужно развернуть вручную
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-slate-700 mb-2">Ваша ссылка:</p>
          <p className="text-sm font-mono text-slate-900 break-all">{shortUrl}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span>📝</span> Инструкция:
            </p>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Нажмите кнопку "Открыть в новой вкладке"</li>
              <li>Дождитесь загрузки Google Maps</li>
              <li>Скопируйте URL из адресной строки браузера</li>
              <li>Вставьте скопированный URL ниже</li>
            </ol>
          </div>

          <button
            onClick={handleOpenInNewTab}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Открыть в новой вкладке
          </button>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Вставьте полный URL:
            </label>
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://www.google.com/maps/@6.0135,80.2410,17z"
              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={!manualUrl.trim()}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Продолжить →
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-slate-500 text-center">
            💡 <strong>Совет:</strong> В будущем используйте полные URL из адресной строки Google Maps для более быстрого импорта
          </p>
        </div>
      </div>
    </div>
  );
}
