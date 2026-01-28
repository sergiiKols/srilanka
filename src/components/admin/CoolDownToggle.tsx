import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface CoolDownStatus {
  enabled: boolean;
  lastRun: string | null;
  totalCooledDown: number;
}

interface CoolDownResult {
  listing_id: string;
  old_temp: string;
  new_temp: string;
  hours_elapsed: number;
}

export default function CoolDownToggle() {
  const [status, setStatus] = useState<CoolDownStatus>({
    enabled: false,
    lastRun: null,
    totalCooledDown: 0
  });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [recentResults, setRecentResults] = useState<CoolDownResult[]>([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      
      // Получаем статус из system_config
      const { data: configData, error: configError } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', 'cool_down_enabled')
        .maybeSingle();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      // Если записи нет, создаём её
      if (!configData) {
        await supabase
          .from('system_config')
          .insert({
            config_key: 'cool_down_enabled',
            config_value: true,
            description: 'Enable/disable automatic temperature cool-down every hour'
          });
        
        setStatus({ enabled: true, lastRun: null, totalCooledDown: 0 });
      } else {
        setStatus({
          enabled: configData.config_value,
          lastRun: null,
          totalCooledDown: 0
        });
      }

      // Получаем последние изменения температуры
      const { data: logData } = await supabase
        .from('temperature_change_log')
        .select('*')
        .eq('change_reason', 'auto_cooldown')
        .order('changed_at', { ascending: false })
        .limit(5);

      if (logData && logData.length > 0) {
        const results: CoolDownResult[] = logData.map(log => ({
          listing_id: log.listing_id,
          old_temp: log.old_temperature,
          new_temp: log.new_temperature,
          hours_elapsed: 0
        }));
        setRecentResults(results);
      }

    } catch (error) {
      console.error('Error loading cool-down status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCoolDown = async () => {
    try {
      setToggling(true);
      
      const newValue = !status.enabled;
      
      // Обновляем или создаём запись
      const { error } = await supabase
        .from('system_config')
        .upsert({ 
          config_key: 'cool_down_enabled',
          config_value: newValue,
          description: 'Enable/disable automatic temperature cool-down every hour',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setStatus(prev => ({ ...prev, enabled: newValue }));
      
      alert(newValue 
        ? '✅ Автоохлаждение включено! Объекты будут автоматически охлаждаться каждый час.'
        : '❌ Автоохлаждение выключено. Температура объектов не будет меняться автоматически.'
      );
    } catch (error) {
      console.error('Error toggling cool-down:', error);
      alert('Ошибка при изменении настройки');
    } finally {
      setToggling(false);
    }
  };

  const runManualCoolDown = async () => {
    if (!confirm('Запустить охлаждение объектов сейчас?')) return;
    
    try {
      setToggling(true);
      
      // Вызываем функцию напрямую через RPC
      const { data, error } = await supabase.rpc('cool_down_objects');
      
      if (error) throw error;
      
      console.log('Cool-down results:', data);
      
      if (data && data.length > 0) {
        setRecentResults(data);
        alert(`✅ Охлаждение завершено!\n\nОхлаждено объектов: ${data.length}\n\nПроверьте temperature_change_log для деталей.`);
      } else {
        alert('ℹ️ Нет объектов для охлаждения.\n\nВсе объекты уже имеют актуальную температуру.');
      }
      
      await loadStatus();
      
    } catch (error) {
      console.error('Error running manual cool-down:', error);
      alert('Ошибка при запуске охлаждения');
    } finally {
      setToggling(false);
    }
  };

  const getTemperatureEmoji = (temp: string) => {
    switch(temp) {
      case 'hot': return '🔴';
      case 'warm': return '🟠';
      case 'cool': return '🟡';
      case 'cold': return '🔵';
      default: return '⚪';
    }
  };

  const getTemperatureLabel = (temp: string) => {
    switch(temp) {
      case 'hot': return 'Горячий';
      case 'warm': return 'Тёплый';
      case 'cool': return 'Прохладный';
      case 'cold': return 'Холодный';
      default: return temp;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="lumina-toggle-card">
      {/* Заголовок */}
      <div className="lumina-toggle-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`lumina-status-indicator ${status.enabled ? 'lumina-status-active' : 'lumina-status-inactive'}`}></div>
            <div className="lumina-icon-3d-small">🌡️</div>
            <h3 className="lumina-toggle-title">
              Автоохлаждение Объектов
            </h3>
            <span className={`lumina-badge ${
              status.enabled 
                ? 'lumina-badge-green' 
                : 'lumina-badge-gray'
            }`}>
              {status.enabled ? 'Включено' : 'Выключено'}
            </span>
          </div>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="lumina-info-button"
          >
            {showInfo ? '▼ Скрыть информацию' : '▶ Показать информацию'}
          </button>
        </div>
      </div>

      {/* Информация */}
      {showInfo && (
        <div className="lumina-info-panel">
          <h4 className="lumina-info-panel-title">ℹ️ Что это такое?</h4>
          <div className="lumina-info-panel-text">
            <p>
              <strong>Автоохлаждение</strong> - автоматическая система изменения температуры (приоритета) объявлений о недвижимости по времени.
            </p>
            <p>
              <strong>Как работает система температуры:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>🔴 Горячий (HOT)</strong> - 0-24 часа - Приоритет 4 - Всегда видим</li>
              <li><strong>🟠 Тёплый (WARM)</strong> - 24-72 часа - Приоритет 3 - Всегда видим</li>
              <li><strong>🟡 Прохладный (COOL)</strong> - 72-120 часов - Приоритет 2 - С фильтрами</li>
              <li><strong>🔵 Холодный (COLD)</strong> - 120+ часов - Приоритет 1 - Только с фильтрами</li>
            </ul>
            <p className="mt-3">
              <strong>Зачем это нужно?</strong><br/>
              Новые объявления показываются с высоким приоритетом (🔴 горячие). 
              Со временем они автоматически "охлаждаются", давая место новым объявлениям.
              Это обеспечивает справедливую ротацию объявлений на карте.
            </p>
            <p className="mt-2">
              <strong>Частота:</strong> Функция запускается каждый час через Cron Job и автоматически понижает температуру объектов по времени.
            </p>
          </div>
        </div>
      )}

      {/* Управление */}
      <div className="lumina-toggle-controls">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="lumina-control-status">
              {status.enabled 
                ? '🟢 Автоматическое охлаждение активно. Температура объектов обновляется каждый час.'
                : '⚫ Автоматическое охлаждение отключено. Температура объектов не изменяется.'
              }
            </p>
            {status.enabled && (
              <p className="lumina-control-info">
                Следующий запуск: каждый час :00 минут (по расписанию Cron)
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            {/* Кнопка включения/выключения */}
            <button
              onClick={toggleCoolDown}
              disabled={toggling}
              className={`lumina-button ${
                status.enabled 
                  ? 'lumina-button-danger' 
                  : 'lumina-button-success'
              } ${toggling ? 'lumina-button-disabled' : ''}`}
            >
              {toggling ? '⏳ Сохранение...' : status.enabled ? '❌ Выключить' : '✅ Включить'}
            </button>
            
            {/* Кнопка ручного запуска */}
            <button
              onClick={runManualCoolDown}
              disabled={toggling || !status.enabled}
              className={`lumina-button lumina-button-primary ${
                (toggling || !status.enabled) ? 'lumina-button-disabled' : ''
              }`}
              title={!status.enabled ? 'Включите автоохлаждение для запуска' : 'Запустить охлаждение сейчас'}
            >
              ❄️ Охладить
            </button>
          </div>
        </div>
      </div>

      {/* Последние изменения */}
      {recentResults.length > 0 && (
        <div className="lumina-results-panel">
          <h4 className="lumina-results-title">📊 Последние изменения температуры</h4>
          <div className="space-y-2">
            {recentResults.map((result, index) => (
              <div key={index} className="lumina-result-item">
                <span className="lumina-result-id">{result.listing_id.substring(0, 8)}...</span>
                <span className="lumina-temp-display">
                  {getTemperatureEmoji(result.old_temp)} 
                  <span className="lumina-temp-label">{getTemperatureLabel(result.old_temp)}</span>
                </span>
                <span className="lumina-arrow">→</span>
                <span className="lumina-temp-display">
                  {getTemperatureEmoji(result.new_temp)} 
                  <span className="lumina-temp-label">{getTemperatureLabel(result.new_temp)}</span>
                </span>
                {result.hours_elapsed > 0 && (
                  <span className="lumina-result-time">
                    {result.hours_elapsed}ч назад
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Предупреждение */}
      {!status.enabled && (
        <div className="lumina-warning-panel">
          <p className="lumina-warning-text">
            ⚠️ <strong>Внимание:</strong> При отключённом автоохлаждении все объекты останутся с текущей температурой и не будут понижать приоритет со временем.
          </p>
        </div>
      )}
    </div>
  );
}

// LUMINA Design System Styles for CoolDown Component
const styles = `
.lumina-toggle-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.lumina-toggle-header {
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
}

.lumina-toggle-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.lumina-status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.lumina-status-active {
  background: #10B981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.lumina-status-inactive {
  background: #9CA3AF;
  box-shadow: 0 0 0 4px rgba(156, 163, 175, 0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.lumina-badge {
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
}

.lumina-badge-green {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.lumina-badge-gray {
  background: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}

.lumina-info-button {
  color: #2563EB;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.lumina-info-button:hover {
  color: #1D4ED8;
}

.lumina-info-panel {
  padding: 24px;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-bottom: 1px solid #BFDBFE;
}

.lumina-info-panel-title {
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 12px;
  font-size: 0.9375rem;
}

.lumina-info-panel-text {
  font-size: 0.875rem;
  color: #1E40AF;
  line-height: 1.6;
}

.lumina-info-panel-text p {
  margin-bottom: 12px;
}

.lumina-info-panel-text ul {
  margin-left: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.lumina-info-panel-text li {
  margin-bottom: 4px;
}

.lumina-toggle-controls {
  padding: 24px;
}

.lumina-control-status {
  font-size: 0.9375rem;
  color: #374151;
  margin-bottom: 8px;
  line-height: 1.5;
}

.lumina-control-info {
  font-size: 0.8125rem;
  color: #6B7280;
  line-height: 1.4;
}

.lumina-button {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lumina-button-primary {
  background: #2563EB;
  color: #FFFFFF;
  border-color: #1D4ED8;
}

.lumina-button-primary:hover:not(.lumina-button-disabled) {
  background: #1D4ED8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.lumina-button-success {
  background: #10B981;
  color: #FFFFFF;
  border-color: #059669;
}

.lumina-button-success:hover:not(.lumina-button-disabled) {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.lumina-button-danger {
  background: #EF4444;
  color: #FFFFFF;
  border-color: #DC2626;
}

.lumina-button-danger:hover:not(.lumina-button-disabled) {
  background: #DC2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.lumina-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lumina-results-panel {
  padding: 24px;
  border-top: 1px solid #E5E7EB;
  background: #FAFAFA;
}

.lumina-results-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  font-size: 0.9375rem;
}

.lumina-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
}

.lumina-result-id {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.75rem;
  color: #6B7280;
  background: #F3F4F6;
  padding: 4px 8px;
  border-radius: 4px;
}

.lumina-temp-display {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lumina-temp-label {
  color: #374151;
  font-weight: 500;
}

.lumina-arrow {
  color: #9CA3AF;
  font-weight: 300;
}

.lumina-result-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: #9CA3AF;
}

.lumina-warning-panel {
  padding: 16px 24px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-top: 1px solid #FCD34D;
}

.lumina-warning-text {
  font-size: 0.875rem;
  color: #78350F;
  line-height: 1.5;
}

.lumina-warning-text strong {
  font-weight: 600;
  color: #92400E;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'lumina-cooldown-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}
