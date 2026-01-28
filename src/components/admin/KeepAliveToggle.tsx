import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface KeepAliveStatus {
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
}

export default function KeepAliveToggle() {
  const [status, setStatus] = useState<KeepAliveStatus>({
    enabled: false,
    lastRun: null,
    nextRun: null
  });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Загрузка текущего статуса
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      
      // Получаем статус из system_config
      const { data, error } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', 'keep_alive_enabled')
        .single();

      if (error) throw error;

      setStatus({
        enabled: data.config_value,
        lastRun: null, // TODO: можно добавить таблицу для логов
        nextRun: null
      });
    } catch (error) {
      console.error('Error loading keep-alive status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleKeepAlive = async () => {
    try {
      setToggling(true);
      
      const newValue = !status.enabled;
      
      // Обновляем статус в БД
      const { error } = await supabase
        .from('system_config')
        .update({ 
          config_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('config_key', 'keep_alive_enabled');

      if (error) throw error;

      setStatus(prev => ({ ...prev, enabled: newValue }));
      
      // Показываем уведомление
      alert(newValue 
        ? '✅ Keep-Alive включен! Тестовые записи будут создаваться каждые 3 дня.'
        : '❌ Keep-Alive выключен. Автоматические тестовые записи остановлены.'
      );
    } catch (error) {
      console.error('Error toggling keep-alive:', error);
      alert('Ошибка при изменении настройки');
    } finally {
      setToggling(false);
    }
  };

  const runManualTest = async () => {
    if (!confirm('Запустить тестовое создание записей сейчас?')) return;
    
    try {
      setToggling(true);
      
      // Вызываем функцию напрямую через RPC
      const { data, error } = await supabase.rpc('keep_alive_test_records');
      
      if (error) throw error;
      
      console.log('Keep-alive test results:', data);
      
      const successCount = data?.filter((r: any) => r.status === 'SUCCESS').length || 0;
      
      alert(`✅ Тест завершён!\n\nУспешно создано записей: ${successCount}\n\nПроверьте таблицы в Database Editor.`);
      
    } catch (error) {
      console.error('Error running manual test:', error);
      alert('Ошибка при запуске теста');
    } finally {
      setToggling(false);
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
            <div className="lumina-icon-3d-small">🔄</div>
            <h3 className="lumina-toggle-title">
              Keep-Alive System
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
              <strong>Keep-Alive</strong> - автоматическая система для поддержания активности базы данных Supabase на бесплатном тарифе.
            </p>
            <p>
              <strong>Как работает:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Каждые 3 дня создаются тестовые записи во всех таблицах</li>
              <li>Все записи помечены как <code className="bg-blue-100 px-1 rounded">test</code> и неактивны</li>
              <li>Записи старше 30 дней автоматически удаляются</li>
              <li>Не влияет на работу приложения</li>
            </ul>
            <p className="mt-3">
              <strong>Зачем это нужно?</strong><br/>
              Supabase паузирует бесплатные проекты после 7 дней неактивности. 
              Keep-Alive предотвращает паузу, создавая минимальную активность в базе данных.
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
                ? '🟢 Автоматические тестовые записи активны. Создаются каждые 3 дня в 3:00.'
                : '⚫ Автоматические тестовые записи отключены.'
              }
            </p>
            {status.enabled && (
              <p className="lumina-control-info">
                Следующий запуск: каждые 3 дня (по расписанию Cron)
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            {/* Кнопка включения/выключения */}
            <button
              onClick={toggleKeepAlive}
              disabled={toggling}
              className={`lumina-button ${
                status.enabled 
                  ? 'lumina-button-danger' 
                  : 'lumina-button-success'
              } ${toggling ? 'lumina-button-disabled' : ''}`}
            >
              {toggling ? '⏳ Сохранение...' : status.enabled ? '❌ Выключить' : '✅ Включить'}
            </button>
            
            {/* Кнопка ручного теста */}
            <button
              onClick={runManualTest}
              disabled={toggling || !status.enabled}
              className={`lumina-button lumina-button-primary ${
                (toggling || !status.enabled) ? 'lumina-button-disabled' : ''
              }`}
              title={!status.enabled ? 'Включите Keep-Alive для запуска теста' : 'Запустить тест сейчас'}
            >
              🧪 Тест
            </button>
          </div>
        </div>
      </div>

      {/* Предупреждение */}
      {!status.enabled && (
        <div className="lumina-warning-panel">
          <p className="lumina-warning-text">
            ⚠️ <strong>Внимание:</strong> При отключённом Keep-Alive проект может быть приостановлен через 7 дней неактивности на бесплатном тарифе Supabase.
          </p>
        </div>
      )}
    </div>
  );
}

// LUMINA Design System Styles for Toggle Components
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

.lumina-info-panel-text code {
  background: #DBEAFE;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.8125rem;
  border: 1px solid #BFDBFE;
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
  const styleId = 'lumina-keep-alive-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}
