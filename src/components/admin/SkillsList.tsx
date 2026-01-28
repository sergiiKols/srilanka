import { useState, useEffect } from 'react';

interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  hasScripts: boolean;
  error?: boolean;
}

// Metadata для красивого отображения
const SKILL_METADATA: Record<string, { icon: string; desc: string; color: string; stage: string }> = {
  'publish-request-to-telegram': { icon: '📢', desc: 'Публикация заявки в Telegram группу landlords', color: '#3B82F6', stage: 'Клиент' },
  'parse-landlord-offer': { icon: '📝', desc: 'Парсинг предложения от landlord и создание property', color: '#8B5CF6', stage: 'Landlord' },
  'link-offer-to-client-map': { icon: '🗺️', desc: 'Подготовка и линковка данных для карты клиента', color: '#8B5CF6', stage: 'Валидация' },
  'store-property-photos': { icon: '📸', desc: 'Сжатие и загрузка фото в Supabase Storage', color: '#8B5CF6', stage: 'Landlord' },
  'render-personal-map': { icon: '🗺️', desc: 'Отрисовка интерактивной Leaflet карты с маркерами', color: '#3B82F6', stage: 'Карта' },
  'get-client-map-url': { icon: '🔗', desc: 'Генерация уникальной ссылки на персональную карту', color: '#8B5CF6', stage: 'Уведомление' },
  'notify-client-offer-received': { icon: '📬', desc: 'Отправка уведомления со ссылкой в Telegram DM', color: '#3B82F6', stage: 'Уведомление' },
  'cleanup-old-requests': { icon: '🧹', desc: 'Архивация заявок старше 30 дней и очистка БД', color: '#F59E0B', stage: 'Фон' },
  'notify-free-tier-cleanup': { icon: '⚠️', desc: 'Предупреждение за 1 день до удаления и Upsell', color: '#F59E0B', stage: 'Фон' },
  'validate-property-data': { icon: '✅', desc: 'Проверка корректности параметров (цена, спальни)', color: '#10B981', stage: 'Валидация' },
  'geocode-property-location': { icon: '🌍', desc: 'Проверка координат через Google Maps API', color: '#8B5CF6', stage: 'Валидация' },
  'track-offer-metrics': { icon: '📊', desc: 'Логирование воронки: created, viewed, contacted', color: '#8B5CF6', stage: 'Аналитика' },
  'generate-admin-dashboard-stats': { icon: '📈', desc: 'Генерация KPI и конверсии для админ-панели', color: '#10B981', stage: 'Аналитика' },
  'handle-user-contact-request': { icon: '💬', desc: 'Обработка запросов к объектам вне основной заявки', color: '#8B5CF6', stage: 'Будущее' },
  'rate-limit-actions': { icon: '🛡️', desc: 'Защита от спама и лимитирование действий в боте', color: '#10B981', stage: 'Будущее' }
};

export default function SkillsList() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/skills');
      const data = await response.json();
      
      if (response.ok) {
        setSkills(data.skills || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to load skills');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Вы уверены, что хотите удалить skill "${id}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/skills/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadSkills(); // Перезагружаем список
      } else {
        const data = await response.json();
        alert(`Ошибка: ${data.error}`);
      }
    } catch (err) {
      alert(`Ошибка: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MCP Skills</h1>
          <p className="mt-2 text-gray-600">
            Управление навыками для AI агента
          </p>
        </div>
        <a
          href="/admin/skills/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Создать Skill
        </a>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Нет созданных skills</h3>
          <p className="mt-1 text-sm text-gray-500">Начните с создания первого skill</p>
          <div className="mt-6">
            <a
              href="/admin/skills/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать первый Skill
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Group by stage */}
          {['Клиент', 'Landlord', 'Валидация', 'Уведомление', 'Карта', 'Аналитика', 'Фон', 'Будущее'].map(stage => {
            const stageSkills = skills.filter(s => SKILL_METADATA[s.id]?.stage === stage);
            if (stageSkills.length === 0) return null;
            
            return (
              <div key={stage}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="inline-block w-1 h-6 rounded-full" style={{ backgroundColor: SKILL_METADATA[stageSkills[0].id]?.color || '#6B7280' }}></span>
                  {stage}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stageSkills.map((skill, index) => {
                    const meta = SKILL_METADATA[skill.id] || { icon: '📄', desc: skill.description, color: '#6B7280', stage: 'Other' };
                    return (
            <div
              key={skill.id}
              className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border-l-4 ${
                skill.error ? 'border-red-500' : ''
              } hover:scale-105`}
              style={{ borderLeftColor: skill.error ? undefined : meta.color }}
            >
              {/* Header with icon and number */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                    style={{ backgroundColor: `${meta.color}15`, border: `2px solid ${meta.color}` }}
                  >
                    {meta.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      #{skills.indexOf(skill) + 1}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                      {skill.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {meta.desc}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {skill.hasScripts && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Scripts
                  </span>
                )}
                <span 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                >
                  {meta.stage}
                </span>
                {skill.error && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    ⚠️ Error
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`/admin/skills/${skill.id}`}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Открыть
                </a>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="inline-flex items-center justify-center px-4 py-2.5 border border-red-200 shadow-sm text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 hover:border-red-300 transition-all"
                  title="Удалить skill"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
