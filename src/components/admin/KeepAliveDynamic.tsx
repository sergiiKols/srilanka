import { useState, useEffect } from 'react';
import { useLang } from './LanguageSwitcher';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://mcmzdscpuoxwneuzsanu.supabase.co';
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

interface TableConfig {
  id: string;
  table_name: string;
  is_enabled: boolean;
  priority: number;
  success_count: number;
  error_count: number;
  last_success_at: string | null;
  last_error: string | null;
  logs_last_7days: number;
  errors_last_7days: number;
}

interface LogEntry {
  id: string;
  table_name: string;
  status: string;
  record_id: string | null;
  error_message: string | null;
  execution_time_ms: number;
  created_at: string;
}

export default function KeepAliveDynamic() {
  const lang = useLang();
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'tables' | 'logs'>('tables');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Проверяем существует ли view keep_alive_stats
      const { data: statsData, error: statsError } = await supabase
        .from('keep_alive_stats')
        .select('*')
        .order('priority', { ascending: true });

      if (!statsError && statsData) {
        setTables(statsData);
      } else if (statsError) {
        console.warn('keep_alive_stats view not found, using fallback:', statsError);
        // Fallback: показываем сообщение что нужно установить SQL
        setTables([]);
      }

      // Загружаем последние логи
      const { data: logsData, error: logsError } = await supabase
        .from('keep_alive_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!logsError && logsData) {
        setLogs(logsData);
      }

      // Загружаем статус системы
      const { data: configData } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', 'keep_alive_enabled')
        .single();

      if (configData) {
        setSystemEnabled(configData.config_value);
      }
    } catch (error) {
      console.error('Error loading keep-alive data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSystemEnabled() {
    console.log('[KeepAlive] Toggling ALL tables from', systemEnabled, 'to', !systemEnabled);
    
    const confirmed = confirm(
      systemEnabled
        ? (lang === 'ru' 
            ? 'Вы уверены что хотите ВЫКЛЮЧИТЬ все таблицы?\n\nЭто отключит автоматическое создание тестовых записей для всех 24 таблиц.' 
            : 'Are you sure you want to DISABLE all tables?\n\nThis will stop automatic test records creation for all 24 tables.')
        : (lang === 'ru'
            ? 'Вы уверены что хотите ВКЛЮЧИТЬ все таблицы?\n\nЭто включит автоматическое создание тестовых записей для всех enabled таблиц.'
            : 'Are you sure you want to ENABLE all tables?\n\nThis will start automatic test records creation for all enabled tables.')
    );
    
    if (!confirmed) {
      console.log('[KeepAlive] User cancelled system toggle');
      return;
    }
    
    try {
      const newValue = !systemEnabled;
      
      // 1. Обновляем глобальный флаг в system_config
      const { data: configData, error: configError } = await supabase
        .from('system_config')
        .update({ config_value: newValue, updated_at: new Date().toISOString() })
        .eq('config_key', 'keep_alive_enabled')
        .select();

      console.log('[KeepAlive] System config update:', { configData, configError });

      if (configError) {
        console.error('[KeepAlive] System toggle error:', configError);
        alert(`Error: ${configError.message}\n\nNote: You may need SERVICE_ROLE_KEY permissions to modify system_config`);
        return;
      }

      // 2. Включаем/выключаем ВСЕ таблицы
      const { data: tablesData, error: tablesError } = await supabase
        .from('keep_alive_config')
        .update({ is_enabled: newValue, updated_at: new Date().toISOString() })
        .neq('table_name', 'spatial_ref_sys') // Не трогаем PostGIS системную
        .select();

      console.log('[KeepAlive] All tables toggle result:', { count: tablesData?.length, error: tablesError });

      if (!tablesError) {
        console.log('[KeepAlive] Successfully toggled all tables');
        setSystemEnabled(newValue);
        await loadData(); // Перезагружаем данные
        
        alert(
          lang === 'ru'
            ? `✅ Успешно! ${newValue ? 'Включено' : 'Выключено'} ${tablesData?.length || 0} таблиц.`
            : `✅ Success! ${newValue ? 'Enabled' : 'Disabled'} ${tablesData?.length || 0} tables.`
        );
      } else {
        console.error('[KeepAlive] Tables toggle error:', tablesError);
        alert(`Error toggling tables: ${tablesError.message}`);
      }
    } catch (error) {
      console.error('[KeepAlive] Exception toggling system:', error);
      alert('Error toggling system: ' + (error instanceof Error ? error.message : 'Unknown'));
    }
  }

  async function toggleTable(tableName: string, currentValue: boolean) {
    console.log('[KeepAlive] Toggling table:', tableName, 'from', currentValue, 'to', !currentValue);
    try {
      const { data, error } = await supabase
        .from('keep_alive_config')
        .update({ is_enabled: !currentValue, updated_at: new Date().toISOString() })
        .eq('table_name', tableName)
        .select();

      console.log('[KeepAlive] Toggle result:', { data, error });

      if (!error) {
        console.log('[KeepAlive] Successfully toggled, reloading data...');
        await loadData();
      } else {
        console.error('[KeepAlive] Toggle error:', error);
        alert(`Error: ${error.message}\n\nNote: You may need SERVICE_ROLE_KEY permissions to modify keep_alive_config`);
      }
    } catch (error) {
      console.error('[KeepAlive] Exception toggling table:', error);
      alert('Error toggling table: ' + (error instanceof Error ? error.message : 'Unknown'));
    }
  }

  async function runKeepAlive() {
    setRunning(true);
    try {
      const { data, error } = await supabase.rpc('keep_alive_test_records_v2');
      
      if (!error) {
        alert(lang === 'ru' 
          ? `Готово! Обработано ${data?.length || 0} таблиц` 
          : `Done! Processed ${data?.length || 0} tables`);
        await loadData();
      } else {
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error running keep-alive:', error);
      alert('Execution error');
    } finally {
      setRunning(false);
    }
  }

  const enabledCount = tables.filter(t => t.is_enabled).length;
  const successRate = tables.length > 0
    ? Math.round((tables.filter(t => t.success_count > 0).length / tables.length) * 100)
    : 0;

  return (
    <div className="keep-alive-dynamic">
      {/* Header */}
      <div className="header">
        <div>
          <h1>🔄 Keep-Alive System v2.0</h1>
          <p className="subtitle">
            Dynamic keep-alive for all Supabase tables
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className={`toggle-btn ${systemEnabled ? 'active' : ''}`}
            onClick={toggleSystemEnabled}
          >
            <span className="toggle-icon">{systemEnabled ? '✅' : '⏸️'}</span>
            <span>{systemEnabled 
              ? (lang === 'ru' ? 'Включено' : 'Enabled')
              : (lang === 'ru' ? 'Выключено' : 'Disabled')
            }</span>
          </button>

          <button 
            className="run-btn"
            onClick={runKeepAlive}
            disabled={running || !systemEnabled}
          >
            <span className="run-icon" style={{ 
              animation: running ? 'spin 1s linear infinite' : 'none' 
            }}>
              ▶️
            </span>
            <span>{running 
              ? (lang === 'ru' ? 'Запуск...' : 'Running...') 
              : (lang === 'ru' ? 'Запустить сейчас' : 'Run Now')
            }</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{tables.length}</div>
          <div className="stat-label">Total Tables</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10B981' }}>{enabledCount}</div>
          <div className="stat-label">Enabled</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#7C3AED' }}>{successRate}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#F59E0B' }}>
            {logs.filter(l => l.created_at > new Date(Date.now() - 7*24*60*60*1000).toISOString()).length}
          </div>
          <div className="stat-label">Logs (7 days)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${selectedTab === 'tables' ? 'active' : ''}`}
          onClick={() => setSelectedTab('tables')}
        >
          📊 Tables ({tables.length})
        </button>
        <button 
          className={`tab ${selectedTab === 'logs' ? 'active' : ''}`}
          onClick={() => setSelectedTab('logs')}
        >
          📋 Logs ({logs.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : tables.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Keep-Alive system not installed</h3>
          <p className="empty-description">
            {lang === 'ru' 
              ? 'Необходимо выполнить SQL скрипт установки в Supabase' 
              : 'You need to execute the installation SQL script in Supabase'}
          </p>
          <div className="install-steps">
            <h4>{lang === 'ru' ? '📋 Инструкция по установке:' : '📋 Installation steps:'}</h4>
            <ol>
              <li>{lang === 'ru' ? 'Откройте Supabase Dashboard → SQL Editor' : 'Open Supabase Dashboard → SQL Editor'}</li>
              <li>{lang === 'ru' ? 'Скопируйте содержимое файла' : 'Copy contents of file'} <code>supabase_keep_alive_DYNAMIC.sql</code></li>
              <li>{lang === 'ru' ? 'Выполните скрипт (Execute/Run)' : 'Execute the script (Execute/Run)'}</li>
              <li>{lang === 'ru' ? 'Обновите эту страницу' : 'Refresh this page'}</li>
            </ol>
          </div>
          <div className="install-info">
            <p><strong>{lang === 'ru' ? 'Что создаётся:' : 'What will be created:'}</strong></p>
            <ul>
              <li>📊 Таблица <code>keep_alive_config</code> (22 записи)</li>
              <li>📋 Таблица <code>keep_alive_logs</code></li>
              <li>⚙️ Функция <code>keep_alive_test_records_v2()</code></li>
              <li>🔧 Функция <code>replace_placeholders()</code></li>
              <li>➕ Функция <code>add_table_to_keepalive()</code></li>
              <li>🗑️ Функция <code>cleanup_keepalive_records_v2()</code></li>
              <li>📈 View <code>keep_alive_stats</code></li>
            </ul>
          </div>
          <a 
            href="https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/sql/new" 
            target="_blank"
            rel="noopener noreferrer"
            className="btn-install"
          >
            {lang === 'ru' ? '🚀 Открыть SQL Editor в Supabase' : '🚀 Open SQL Editor in Supabase'}
          </a>
        </div>
      ) : selectedTab === 'tables' ? (
        <div className="tables-grid">
          {tables.map((table, index) => (
            <div key={table.id || `table-${index}`} className={`table-card ${!table.is_enabled ? 'disabled' : ''}`}>
              <div className="table-card-header">
                <div className="table-name">
                  <code>{table.table_name}</code>
                  {table.priority <= 10 && <span className="badge priority">P{table.priority}</span>}
                </div>
                <button 
                  className={`toggle-switch ${table.is_enabled ? 'on' : 'off'}`}
                  onClick={() => toggleTable(table.table_name, table.is_enabled)}
                  title={table.is_enabled ? 'Click to disable' : 'Click to enable'}
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>

              <div className="table-stats">
                <div className="stat-row">
                  <span className="stat-label">✅ {lang === 'ru' ? 'Успешно:' : 'Success:'}</span>
                  <span className="stat-value">{table.success_count}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">❌ {lang === 'ru' ? 'Ошибок:' : 'Errors:'}</span>
                  <span className="stat-value">{table.error_count}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">📊 {lang === 'ru' ? 'За 7 дней:' : '7 days:'}</span>
                  <span className="stat-value">{table.logs_last_7days}</span>
                </div>
              </div>

              {table.last_success_at && (
                <div className="last-success">
                  🕒 {new Date(table.last_success_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')}
                </div>
              )}

              {table.last_error && (
                <div className="error-message">
                  ⚠️ {table.last_error.substring(0, 60)}...
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="logs-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Table</th>
                <th>Status</th>
                <th>Exec Time</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id || `log-${index}`}>
                  <td>{new Date(log.created_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                  <td><code>{log.table_name}</code></td>
                  <td>
                    <span className={`status-badge ${log.status.toLowerCase()}`}>
                      {log.status === 'SUCCESS' ? '✅' : log.status === 'ERROR' ? '❌' : '⏭️'}
                      {' '}{log.status}
                    </span>
                  </td>
                  <td>{log.execution_time_ms}ms</td>
                  <td className="error-cell">
                    {log.error_message ? (
                      <span className="error-text" title={log.error_message}>
                        {log.error_message.substring(0, 50)}...
                      </span>
                    ) : (
                      <span className="success-text">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .keep-alive-dynamic {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding: 24px;
          background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          border: 1px solid #E5E7EB;
        }

        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #111827;
        }

        .subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          border-color: #10B981;
        }

        .toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .run-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .run-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
        }

        .run-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #E5E7EB;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #6B7280;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          padding: 6px;
          background: #F9FAFB;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
        }

        .tab {
          flex: 1;
          padding: 12px 24px;
          background: transparent;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab.active {
          background: white;
          color: #7C3AED;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .table-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #E5E7EB;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .table-card.disabled {
          opacity: 0.6;
          border-color: #F3F4F6;
        }

        .table-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .table-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .table-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .table-name code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .badge {
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
        }

        .badge.priority {
          background: #7C3AED;
          color: white;
        }

        .toggle-switch {
          width: 50px;
          height: 26px;
          background: #E5E7EB;
          border-radius: 13px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
        }

        .toggle-switch.on {
          background: #10B981;
        }

        .toggle-slider {
          position: absolute;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.on .toggle-slider {
          left: 27px;
        }

        .table-stats {
          margin-bottom: 12px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #F3F4F6;
          font-size: 13px;
        }

        .stat-row:last-child {
          border-bottom: none;
        }

        .last-success {
          font-size: 12px;
          color: #10B981;
          padding: 8px;
          background: #F0FDF4;
          border-radius: 8px;
          margin-top: 12px;
        }

        .error-message {
          font-size: 12px;
          color: #EF4444;
          padding: 8px;
          background: #FEF2F2;
          border-radius: 8px;
          margin-top: 8px;
        }

        .logs-container {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          overflow-x: auto;
        }

        .logs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .logs-table th {
          text-align: left;
          padding: 12px;
          background: #F9FAFB;
          font-weight: 600;
          font-size: 13px;
          color: #6B7280;
          border-bottom: 2px solid #E5E7EB;
        }

        .logs-table td {
          padding: 12px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
        }

        .logs-table tbody tr:hover {
          background: #F9FAFB;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.success {
          background: #D1FAE5;
          color: #065F46;
        }

        .status-badge.error {
          background: #FEE2E2;
          color: #991B1B;
        }

        .status-badge.skipped {
          background: #FEF3C7;
          color: #92400E;
        }

        .error-cell {
          max-width: 300px;
        }

        .error-text {
          color: #EF4444;
          font-size: 12px;
        }

        .success-text {
          color: #10B981;
          font-weight: 500;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #E5E7EB;
          border-top-color: #7C3AED;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 12px 0;
        }

        .empty-description {
          font-size: 16px;
          color: #6B7280;
          margin-bottom: 32px;
        }

        .install-steps {
          background: #F9FAFB;
          border-radius: 16px;
          padding: 24px;
          text-align: left;
          margin-bottom: 24px;
        }

        .install-steps h4 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .install-steps ol {
          margin: 0;
          padding-left: 24px;
        }

        .install-steps li {
          margin-bottom: 12px;
          font-size: 14px;
          color: #374151;
          line-height: 1.6;
        }

        .install-steps code {
          background: #EDE9FE;
          color: #5B21B6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .install-info {
          background: #EEF2FF;
          border-radius: 16px;
          padding: 20px;
          text-align: left;
          margin-bottom: 32px;
        }

        .install-info p {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #374151;
        }

        .install-info ul {
          margin: 0;
          padding-left: 24px;
          list-style: none;
        }

        .install-info li {
          margin-bottom: 8px;
          font-size: 13px;
          color: #6B7280;
          line-height: 1.5;
        }

        .install-info code {
          background: white;
          color: #5B21B6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        .btn-install {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .btn-install:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .toggle-btn, .run-btn {
            width: 100%;
            justify-content: center;
          }

          .tables-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
