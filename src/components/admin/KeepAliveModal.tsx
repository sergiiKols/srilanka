import { useState, useEffect } from 'react';
import { useLang } from './LanguageSwitcher';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://mcmzdscpuoxwneuzsanu.supabase.co';
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

interface TableStatus {
  table_name: string;
  is_enabled: boolean;
  last_success_at: string | null;
  last_error: string | null;
  in_config: boolean;
}

interface TestResult {
  table_name: string;
  status: string;
  executionTime?: number;
  error?: string;
}

interface KeepAliveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeepAliveModal({ isOpen, onClose }: KeepAliveModalProps) {
  const lang = useLang();
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingAll, setTestingAll] = useState(false);
  const [testingTable, setTestingTable] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setShowResults(false); // Сбрасываем результаты при открытии
      setTestResults([]); // Очищаем предыдущие результаты
    }
  }, [isOpen]);

  async function loadData() {
    setLoading(true);
    try {
      // Загружаем конфигурацию таблиц
      const { data: configData } = await supabase
        .from('keep_alive_config')
        .select('*')
        .order('priority');

      // Загружаем все таблицы из базы
      const { data: allTablesData } = await fetch('/api/admin/tables').then(r => r.json());

      // Загружаем последнюю дату запуска
      const { data: lastLog } = await supabase
        .from('keep_alive_logs')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastLog) {
        setLastRunTime(lastLog.created_at);
      }

      const allTables: TableStatus[] = [];

      // Добавляем таблицы из конфигурации
      if (configData) {
        configData.forEach(config => {
          allTables.push({
            table_name: config.table_name,
            is_enabled: config.is_enabled,
            last_success_at: config.last_success_at,
            last_error: config.last_error,
            in_config: true,
          });
        });
      }

      // Добавляем таблицы НЕ из конфигурации (новые)
      if (allTablesData?.tables) {
        const configTableNames = configData?.map(c => c.table_name) || [];
        
        allTablesData.tables.forEach((table: any) => {
          if (!configTableNames.includes(table.name)) {
            allTables.push({
              table_name: table.name,
              is_enabled: false,
              last_success_at: null,
              last_error: null,
              in_config: false,
            });
          }
        });
      }

      setTables(allTables);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function testSingleTable(tableName: string) {
    console.log('[KeepAlive] Testing single table:', tableName);
    setTestingTable(tableName);
    setTestResults([]);
    setShowResults(true);

    try {
      const response = await fetch('/api/admin/keep-alive/test-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName }),
      });

      console.log('[KeepAlive] Response status:', response.status);
      const result = await response.json();
      console.log('[KeepAlive] Result:', result);

      setTestResults([{
        table_name: tableName,
        status: result.success ? 'SUCCESS' : 'ERROR',
        executionTime: result.executionTime,
        error: result.error,
      }]);

      await loadData(); // Обновляем данные
    } catch (error) {
      console.error('[KeepAlive] Error testing table:', error);
      setTestResults([{
        table_name: tableName,
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      }]);
    } finally {
      setTestingTable(null);
    }
  }

  async function testAllTables() {
    console.log('[KeepAlive] Testing all tables...');
    setTestingAll(true);
    setTestResults([]);
    setShowResults(true);

    try {
      const { data, error } = await supabase.rpc('keep_alive_test_records_v2');

      console.log('[KeepAlive] RPC result:', { data, error });

      if (!error && data) {
        const results: TestResult[] = data
          .filter((r: any) => r.table_name !== 'SUMMARY')
          .map((r: any) => ({
            table_name: r.table_name,
            status: r.status,
            executionTime: r.execution_time_ms,
            error: r.error_message,
          }));

        console.log('[KeepAlive] Processed results:', results);
        setTestResults(results);
        await loadData(); // Обновляем данные
      } else {
        console.error('[KeepAlive] RPC error:', error);
        alert(lang === 'ru' ? 'Ошибка: ' + error?.message : 'Error: ' + error?.message);
      }
    } catch (error) {
      console.error('[KeepAlive] Error testing all tables:', error);
      alert(lang === 'ru' ? 'Ошибка выполнения: ' + (error instanceof Error ? error.message : 'Unknown') : 'Execution error');
    } finally {
      setTestingAll(false);
    }
  }

  if (!isOpen) return null;

  const enabledCount = tables.filter(t => t.is_enabled && t.in_config).length;
  const newTablesCount = tables.filter(t => !t.in_config).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>🔄 Keep-Alive System</h2>
            <p className="modal-subtitle">
              {lang === 'ru' ? 'Управление тестовыми записями' : 'Test records management'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">{lang === 'ru' ? 'Всего таблиц:' : 'Total tables:'}</span>
            <span className="stat-value">{tables.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{lang === 'ru' ? 'В автоматике:' : 'In auto:'}</span>
            <span className="stat-value" style={{ color: '#10B981' }}>{enabledCount}</span>
          </div>
          {newTablesCount > 0 && (
            <div className="stat-item">
              <span className="stat-label">{lang === 'ru' ? 'Новые:' : 'New:'}</span>
              <span className="stat-value" style={{ color: '#F59E0B' }}>{newTablesCount}</span>
            </div>
          )}
          {lastRunTime && (
            <div className="stat-item">
              <span className="stat-label">{lang === 'ru' ? 'Последний запуск:' : 'Last run:'}</span>
              <span className="stat-value" style={{ fontSize: '13px' }}>
                {new Date(lastRunTime).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Test All Button */}
        <div className="action-section">
          <button 
            className="test-all-btn"
            onClick={testAllTables}
            disabled={testingAll || testingTable !== null}
          >
            <span className="btn-icon" style={{ 
              animation: testingAll ? 'spin 1s linear infinite' : 'none' 
            }}>
              🧪
            </span>
            <span>
              {testingAll 
                ? (lang === 'ru' ? 'Тестирование...' : 'Testing...') 
                : (lang === 'ru' ? 'Тест всех таблиц' : 'Test All Tables')}
            </span>
          </button>
        </div>

        {/* Results Panel */}
        {showResults && testResults.length > 0 && (
          <div className="results-panel">
            <div className="results-header">
              <span>{lang === 'ru' ? '📊 Результаты тестирования' : '📊 Test Results'}</span>
              <button onClick={() => setShowResults(false)}>✕</button>
            </div>
            <div className="results-list">
              {testResults.map(result => (
                <div key={result.table_name} className={`result-item ${result.status.toLowerCase()}`}>
                  <div className="result-name">
                    <span className="result-icon">
                      {result.status === 'SUCCESS' ? '✅' : result.status === 'ERROR' ? '❌' : '⏭️'}
                    </span>
                    <code>{result.table_name}</code>
                  </div>
                  <div className="result-details">
                    {result.status === 'SUCCESS' ? (
                      <span className="success-text">
                        {lang === 'ru' ? 'Успешно' : 'Success'}
                        {result.executionTime && ` (${result.executionTime}ms)`}
                      </span>
                    ) : (
                      <span className="error-text" title={result.error}>
                        {result.error?.substring(0, 60) || 'Error'}...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tables List */}
        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{lang === 'ru' ? 'Загрузка...' : 'Loading...'}</p>
            </div>
          ) : (
            <>
              {/* Enabled Tables */}
              <div className="tables-section">
                <h3 className="section-title">
                  ✅ {lang === 'ru' ? 'Автоматические таблицы' : 'Automatic Tables'} ({enabledCount})
                </h3>
                <div className="tables-list">
                  {tables.filter(t => t.in_config && t.is_enabled).map(table => (
                    <div key={table.table_name} className="table-row">
                      <div className="table-info">
                        <code className="table-name">{table.table_name}</code>
                        {table.last_success_at && (
                          <span className="table-time">
                            🕒 {new Date(table.last_success_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <button 
                        className="test-btn"
                        onClick={() => testSingleTable(table.table_name)}
                        disabled={testingTable === table.table_name || testingAll}
                      >
                        {testingTable === table.table_name ? '⏳' : '▶️'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disabled Tables */}
              {tables.filter(t => t.in_config && !t.is_enabled).length > 0 && (
                <div className="tables-section">
                  <h3 className="section-title">
                    ⏸️ {lang === 'ru' ? 'Отключённые таблицы' : 'Disabled Tables'}
                  </h3>
                  <div className="tables-list">
                    {tables.filter(t => t.in_config && !t.is_enabled).map(table => (
                      <div key={table.table_name} className="table-row disabled">
                        <div className="table-info">
                          <code className="table-name">{table.table_name}</code>
                          {table.last_error && (
                            <span className="table-error" title={table.last_error}>
                              ⚠️ {table.last_error.substring(0, 40)}...
                            </span>
                          )}
                        </div>
                        <button 
                          className="test-btn"
                          onClick={() => testSingleTable(table.table_name)}
                          disabled={testingTable === table.table_name || testingAll}
                        >
                          {testingTable === table.table_name ? '⏳' : '▶️'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Tables (not in config) */}
              {newTablesCount > 0 && (
                <div className="tables-section highlight">
                  <h3 className="section-title">
                    🆕 {lang === 'ru' ? 'Новые таблицы (не в автоматике)' : 'New Tables (not automated)'}
                  </h3>
                  <div className="tables-list">
                    {tables.filter(t => !t.in_config).map(table => (
                      <div key={table.table_name} className="table-row new">
                        <div className="table-info">
                          <code className="table-name">{table.table_name}</code>
                          <span className="new-badge">NEW</span>
                        </div>
                        <button 
                          className="test-btn"
                          onClick={() => testSingleTable(table.table_name)}
                          disabled={testingTable === table.table_name || testingAll}
                        >
                          {testingTable === table.table_name ? '⏳' : '▶️'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <a href="/admin/keep-alive" className="link-btn">
            {lang === 'ru' ? 'Полная панель управления →' : 'Full dashboard →'}
          </a>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
          }

          .modal-container {
            background: white;
            border-radius: 20px;
            max-width: 700px;
            width: 90%;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: scaleUp 0.3s ease;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 24px;
            border-bottom: 1px solid #E5E7EB;
          }

          .modal-header h2 {
            font-size: 22px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 4px 0;
          }

          .modal-subtitle {
            font-size: 14px;
            color: #6B7280;
            margin: 0;
          }

          .close-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: #F3F4F6;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
            color: #6B7280;
          }

          .close-btn:hover {
            background: #E5E7EB;
            transform: rotate(90deg);
          }

          .stats-bar {
            display: flex;
            gap: 20px;
            padding: 16px 24px;
            background: #F9FAFB;
            border-bottom: 1px solid #E5E7EB;
            flex-wrap: wrap;
          }

          .stat-item {
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .stat-label {
            font-size: 13px;
            color: #6B7280;
          }

          .stat-value {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
          }

          .action-section {
            padding: 20px 24px;
            border-bottom: 1px solid #E5E7EB;
          }

          .test-all-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px 24px;
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
          }

          .test-all-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
          }

          .test-all-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-icon {
            font-size: 20px;
          }

          .results-panel {
            margin: 0 24px 20px;
            background: #F9FAFB;
            border-radius: 12px;
            overflow: hidden;
          }

          .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: #EDE9FE;
            font-weight: 600;
            font-size: 14px;
            color: #5B21B6;
          }

          .results-header button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #6B7280;
          }

          .results-list {
            max-height: 200px;
            overflow-y: auto;
          }

          .result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 16px;
            border-bottom: 1px solid #E5E7EB;
          }

          .result-item:last-child {
            border-bottom: none;
          }

          .result-name {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .result-name code {
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
          }

          .result-details {
            font-size: 12px;
          }

          .success-text {
            color: #10B981;
            font-weight: 500;
          }

          .error-text {
            color: #EF4444;
          }

          .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
          }

          .tables-section {
            margin-bottom: 24px;
          }

          .tables-section.highlight {
            padding: 16px;
            background: #FEF3C7;
            border-radius: 12px;
          }

          .section-title {
            font-size: 15px;
            font-weight: 600;
            color: #374151;
            margin: 0 0 12px 0;
          }

          .tables-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .table-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 10px;
            transition: all 0.2s ease;
          }

          .table-row:hover {
            border-color: #7C3AED;
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
          }

          .table-row.disabled {
            opacity: 0.6;
          }

          .table-row.new {
            border: 2px solid #F59E0B;
          }

          .table-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
          }

          .table-name {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 600;
            color: #111827;
          }

          .table-time {
            font-size: 12px;
            color: #10B981;
          }

          .table-error {
            font-size: 12px;
            color: #EF4444;
          }

          .new-badge {
            display: inline-block;
            padding: 2px 8px;
            background: #F59E0B;
            color: white;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
          }

          .test-btn {
            padding: 8px 12px;
            background: #F3F4F6;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
          }

          .test-btn:hover:not(:disabled) {
            background: #7C3AED;
            transform: scale(1.1);
          }

          .test-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
          }

          .link-btn {
            color: #7C3AED;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
          }

          .link-btn:hover {
            text-decoration: underline;
          }

          .loading-state {
            text-align: center;
            padding: 40px 20px;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #E5E7EB;
            border-top-color: #7C3AED;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes scaleUp {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
