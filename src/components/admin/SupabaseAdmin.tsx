import { useState, useEffect } from 'react';
import { useLang } from './LanguageSwitcher';
import { createClient } from '@supabase/supabase-js';
import KeepAliveModal from './KeepAliveModal';

const SUPABASE_URL = 'https://mcmzdscpuoxwneuzsanu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oqeTkwpUNEhCWHIkCfhwpA_YmqUWWEx';
const SERVICE_ROLE_KEY = 'sb_secret_3M8nfMu6ZdYVvg_8Jh0JGw_ONxcbcc9';

interface POI {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  total_reviews: number;
  lat: number;
  lng: number;
  main_photo: string;
}

interface Stats {
  total: number;
  withPhotos: number;
  withRating: number;
  categories: Record<string, number>;
  locations: Record<string, number>;
}

export default function SupabaseAdmin() {
  const lang = useLang();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'connection' | 'stats' | 'data' | 'map'>('connection');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const itemsPerPage = 20;

  // Новые state для динамических таблиц
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('poi_locations');
  const [currentTableData, setCurrentTableData] = useState<any>({
    columns: [],
    recordsCount: 0,
    tableSize: 'Unknown',
    sampleData: [],
    statistics: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  
  // State для модалки Keep-Alive
  const [showKeepAliveModal, setShowKeepAliveModal] = useState(false);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  useEffect(() => {
    loadAvailableTables();
    checkConnection();
    loadPOIData();
  }, []);

  useEffect(() => {
    // При смене таблицы загружаем новые данные
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  // Загрузка списка доступных таблиц
  async function loadAvailableTables() {
    try {
      const response = await fetch('/api/admin/tables');
      const data = await response.json();
      
      if (data.tables) {
        setAvailableTables(data.tables);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  }

  // Загрузка данных конкретной таблицы
  async function loadTableData(tableName: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tables/${tableName}`);
      const data = await response.json();
      
      if (data.tableName) {
        setCurrentTableData({
          columns: data.columns || [],
          recordsCount: data.recordsCount || 0,
          tableSize: data.tableSize || 'Unknown',
          sampleData: data.sampleData || [],
          statistics: data.statistics || null,
        });

        // Если это poi_locations, обновляем старые state для совместимости
        if (tableName === 'poi_locations' && data.sampleData) {
          setPoiData(data.sampleData);
          setFilteredData(data.sampleData);
          
          // Формируем статистику
          if (data.statistics) {
            setStats({
              total: data.recordsCount,
              withPhotos: data.sampleData.filter((p: any) => p.main_photo).length,
              withRating: data.sampleData.filter((p: any) => p.rating && p.rating > 0).length,
              categories: data.statistics.byCategory?.length || 0,
              byCategory: data.statistics.byCategory || [],
              byLocation: data.statistics.byLocation || [],
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error loading table ${tableName}:`, error);
    } finally {
      setLoading(false);
    }
  }

  // Функция обновления (refresh)
  async function handleRefresh() {
    setRefreshing(true);
    await loadAvailableTables();
    await loadTableData(selectedTable);
    setRefreshing(false);
  }

  async function checkConnection() {
    try {
      const { error } = await supabase
        .from('poi_locations')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Connection error:', err);
      setConnectionStatus('error');
    }
  }

  async function loadPOIData() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('poi_locations')
        .select('*')
        .order('rating', { ascending: false, nullsLast: true });

      if (error) throw error;

      const total = data.length;
      const withPhotos = data.filter(item => item.main_photo).length;
      const withRating = data.filter(item => item.rating).length;
      
      const categories: Record<string, number> = {};
      const locations: Record<string, number> = {};
      
      data.forEach(item => {
        const cat = item.category || 'Unknown';
        const loc = item.location || 'Unknown';
        categories[cat] = (categories[cat] || 0) + 1;
        locations[loc] = (locations[loc] || 0) + 1;
      });

      setStats({ total, withPhotos, withRating, categories, locations });
      setPois(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  }

  const filteredPois = pois.filter(poi => {
    const matchSearch = !searchTerm || poi.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || poi.category === filterCategory;
    const matchLocation = !filterLocation || poi.location === filterLocation;
    return matchSearch && matchCategory && matchLocation;
  });

  const totalPages = Math.ceil(filteredPois.length / itemsPerPage);
  const paginatedPois = filteredPois.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard supabase-admin-lumina">
      {/* Header with Button */}
      <div className="page-header-lumina">
        <div className="header-content">
          <h1 className="header-title">🗄️ {lang === 'ru' ? 'База данных Supabase' : 'Supabase Database'}</h1>
          <p className="header-subtitle">
            {lang === 'ru' ? 'Управление данными проекта Шри-Ланка' : 'Manage Sri Lanka Project Data'}
          </p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowKeepAliveModal(true)}
            className="btn-keep-alive"
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-text">{lang === 'ru' ? 'Keep-Alive' : 'Keep-Alive'}</span>
          </button>

          <a href="/admin/database" className="btn-all-databases">
            <span className="btn-icon">🗄️</span>
            <span className="btn-text">{lang === 'ru' ? 'Все базы' : 'All Databases'}</span>
            <span className="btn-badge">{availableTables.length || 24}</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'connection' ? 'active' : ''}`}
          onClick={() => setActiveTab('connection')}
        >
          🔌 {lang === 'ru' ? 'Подключение' : 'Connection'}
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 {lang === 'ru' ? 'Статистика' : 'Statistics'}
        </button>
        <button 
          className={`tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          📋 {lang === 'ru' ? 'Данные' : 'Data'}
        </button>
        <button 
          className={`tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🗺️ {lang === 'ru' ? 'Карта' : 'Map'}
        </button>
      </div>

      {/* Connection Tab */}
      {activeTab === 'connection' && (
        <div className="tab-content">
          {/* Two Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Left Column - POI Locations Table */}
            <div className="card">
              <h3>📍 {lang === 'ru' ? 'Туристические объекты (POI)' : 'Tourist POI Objects'}</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                {lang === 'ru' ? 'Таблица: poi_locations' : 'Table: poi_locations'}
              </p>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'URL проекта:' : 'Project URL:'}</strong></label>
                <input type="text" className="input" value={SUPABASE_URL} readOnly style={{ background: '#f5f5f5' }} />
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Название таблицы:' : 'Table Name:'}</strong></label>
                <input type="text" className="input" value="poi_locations" readOnly style={{ background: '#f5f5f5' }} />
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Публичный ключ API:' : 'Public API Key:'}</strong></label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type={showPublicKey ? "text" : "password"} 
                    className="input" 
                    value={SUPABASE_KEY} 
                    readOnly 
                    style={{ background: '#f5f5f5', flex: 1 }} 
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowPublicKey(!showPublicKey)}
                    style={{ minWidth: '100px' }}
                  >
                    {showPublicKey ? '🙈 ' : '👁️ '} 
                    {lang === 'ru' ? (showPublicKey ? 'Скрыть' : 'Показать') : (showPublicKey ? 'Hide' : 'Show')}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Сервисный ключ:' : 'Service Role Key:'}</strong></label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type={showServiceKey ? "text" : "password"} 
                    className="input" 
                    value={SERVICE_ROLE_KEY} 
                    readOnly 
                    style={{ background: '#f5f5f5', flex: 1 }} 
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowServiceKey(!showServiceKey)}
                    style={{ minWidth: '100px' }}
                  >
                    {showServiceKey ? '🙈 ' : '👁️ '} 
                    {lang === 'ru' ? (showServiceKey ? 'Скрыть' : 'Показать') : (showServiceKey ? 'Hide' : 'Show')}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Статус подключения:' : 'Connection Status:'}</strong></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  {connectionStatus === 'checking' && (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                      <span>{lang === 'ru' ? 'Проверка...' : 'Checking...'}</span>
                    </>
                  )}
                  {connectionStatus === 'connected' && (
                    <>
                      <span style={{ fontSize: '24px' }}>✅</span>
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                        {lang === 'ru' ? 'Подключено успешно' : 'Connected Successfully'}
                      </span>
                    </>
                  )}
                  {connectionStatus === 'error' && (
                    <>
                      <span style={{ fontSize: '24px' }}>❌</span>
                      <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                        {lang === 'ru' ? 'Ошибка подключения' : 'Connection Error'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Всего записей:' : 'Total Records:'}</strong></label>
                <input 
                  type="text" 
                  className="input" 
                  value={stats?.total.toLocaleString() || '...'} 
                  readOnly 
                  style={{ background: '#e8f5e9', fontWeight: 'bold', fontSize: '18px' }} 
                />
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Регион:' : 'Region:'}</strong></label>
                <input type="text" className="input" value="Southwest Coast (Negombo → Tangalle)" readOnly style={{ background: '#f5f5f5' }} />
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Источник данных:' : 'Data Source:'}</strong></label>
                <input type="text" className="input" value="Google Places API" readOnly style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            {/* Right Column - User Objects Table */}
            <div className="card">
              <h3>👥 {lang === 'ru' ? 'Объекты пользователей' : 'User Objects'}</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                {lang === 'ru' ? 'Таблица: user_objects (не создана)' : 'Table: user_objects (not created)'}
              </p>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'URL проекта:' : 'Project URL:'}</strong></label>
                <input type="text" className="input" value={SUPABASE_URL} readOnly style={{ background: '#f5f5f5' }} />
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Название таблицы:' : 'Table Name:'}</strong></label>
                <input type="text" className="input" value="user_objects" readOnly style={{ background: '#fff3cd', border: '1px solid #ffc107' }} />
                <small style={{ color: '#856404', display: 'block', marginTop: '5px' }}>
                  ⚠️ {lang === 'ru' ? 'Таблица еще не создана' : 'Table not created yet'}
                </small>
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Публичный ключ API:' : 'Public API Key:'}</strong></label>
                <input type="password" className="input" value={SUPABASE_KEY} readOnly style={{ background: '#f5f5f5' }} />
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  {lang === 'ru' ? 'Используется тот же ключ' : 'Same key as POI table'}
                </small>
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Статус подключения:' : 'Connection Status:'}</strong></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '24px' }}>⚪</span>
                  <span style={{ color: '#6c757d', fontWeight: 'bold' }}>
                    {lang === 'ru' ? 'Не настроено' : 'Not Configured'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Всего записей:' : 'Total Records:'}</strong></label>
                <input 
                  type="text" 
                  className="input" 
                  value="0" 
                  readOnly 
                  style={{ background: '#f8d7da', color: '#721c24', fontWeight: 'bold', fontSize: '18px' }} 
                />
              </div>

              <div className="form-group">
                <label><strong>{lang === 'ru' ? 'Назначение:' : 'Purpose:'}</strong></label>
                <input 
                  type="text" 
                  className="input" 
                  value={lang === 'ru' ? 'Пользовательские объекты' : 'User-generated objects'} 
                  readOnly 
                  style={{ background: '#f5f5f5' }} 
                />
              </div>

              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px' }}
                  onClick={() => alert(lang === 'ru' ? 'Функция создания таблицы в разработке' : 'Table creation feature in development')}
                >
                  + {lang === 'ru' ? 'Создать таблицу' : 'Create Table'}
                </button>
              </div>
            </div>
          </div>

          {/* Table Structure Section - ДИНАМИЧЕСКАЯ */}
          <div className="card" style={{ marginTop: '20px' }}>
            {/* Заголовок с dropdown выбора таблицы */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <h3 style={{ margin: 0 }}>{lang === 'ru' ? 'Структура таблицы:' : 'Table Structure:'}</h3>
                <select 
                  className="table-selector-dropdown"
                  style={{ maxWidth: '400px' }}
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  {availableTables.length > 0 ? (
                    availableTables.map(table => (
                      <option key={table.name} value={table.name}>
                        {table.name}
                      </option>
                    ))
                  ) : (
                    <option value="poi_locations">poi_locations</option>
                  )}
                </select>
              </div>
              <button 
                className="btn-refresh"
                onClick={handleRefresh}
                disabled={refreshing}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                <span className="refresh-icon" style={{ 
                  display: 'inline-block',
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  fontSize: '16px'
                }}>
                  🔄
                </span>
              </button>
            </div>

            {/* Информация о таблице */}
            <div style={{ marginBottom: '16px', padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <strong>{lang === 'ru' ? 'Колонок:' : 'Columns:'}</strong> {currentTableData.columns.length || 0}
                </div>
                <div>
                  <strong>{lang === 'ru' ? 'Записей:' : 'Records:'}</strong> {currentTableData.recordsCount?.toLocaleString() || 0}
                </div>
                <div>
                  <strong>{lang === 'ru' ? 'Размер:' : 'Size:'}</strong> {currentTableData.tableSize || 'Unknown'}
                </div>
              </div>
            </div>

            {/* Динамическая таблица структуры */}
            <div className="table-container">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner" style={{ width: '30px', height: '30px', borderWidth: '3px' }}></div>
                  <p>{lang === 'ru' ? 'Загрузка структуры...' : 'Loading structure...'}</p>
                </div>
              ) : currentTableData.columns.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{lang === 'ru' ? 'Поле' : 'Field'}</th>
                      <th>{lang === 'ru' ? 'Тип' : 'Type'}</th>
                      <th>{lang === 'ru' ? 'Nullable' : 'Nullable'}</th>
                      <th>{lang === 'ru' ? 'По умолчанию' : 'Default'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTableData.columns.map((col: any, idx: number) => (
                      <tr key={idx}>
                        <td><code>{col.column_name}</code></td>
                        <td><span className="badge">{col.data_type}</span></td>
                        <td>{col.is_nullable === 'YES' ? '✅' : '❌'}</td>
                        <td><small>{col.column_default || '-'}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                  {lang === 'ru' ? 'Нет данных о структуре таблицы' : 'No table structure data available'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="tab-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>{lang === 'ru' ? 'Загрузка статистики...' : 'Loading statistics...'}</p>
            </div>
          ) : stats && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📍</div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.total.toLocaleString()}</div>
                    <div className="stat-label">{lang === 'ru' ? 'Всего объектов' : 'Total Objects'}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📸</div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.withPhotos.toLocaleString()}</div>
                    <div className="stat-label">{lang === 'ru' ? 'С фотографиями' : 'With Photos'}</div>
                    <div className="stat-change">
                      {((stats.withPhotos / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.withRating.toLocaleString()}</div>
                    <div className="stat-label">{lang === 'ru' ? 'С рейтингом' : 'With Rating'}</div>
                    <div className="stat-change">
                      {((stats.withRating / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🏷️</div>
                  <div className="stat-content">
                    <div className="stat-value">{Object.keys(stats.categories).length}</div>
                    <div className="stat-label">{lang === 'ru' ? 'Категорий' : 'Categories'}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>{lang === 'ru' ? 'По категориям' : 'By Categories'}</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{lang === 'ru' ? 'Категория' : 'Category'}</th>
                        <th>{lang === 'ru' ? 'Количество' : 'Count'}</th>
                        <th>{lang === 'ru' ? 'Процент' : 'Percent'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.categories)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([category, count]) => (
                          <tr key={category}>
                            <td><span className="badge">{category}</span></td>
                            <td><strong>{count}</strong></td>
                            <td>{((count / stats.total) * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h3>{lang === 'ru' ? 'По локациям' : 'By Locations'}</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{lang === 'ru' ? 'Локация' : 'Location'}</th>
                        <th>{lang === 'ru' ? 'Количество' : 'Count'}</th>
                        <th>{lang === 'ru' ? 'Процент' : 'Percent'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.locations)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([location, count]) => (
                          <tr key={location}>
                            <td><strong>{location}</strong></td>
                            <td><strong>{count}</strong></td>
                            <td>{((count / stats.total) * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="tab-content">
          {loading && pois.length === 0 ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>{lang === 'ru' ? 'Загрузка данных...' : 'Loading data...'}</p>
            </div>
          ) : (
            <>
              <div className="filters">
                <input
                  type="text"
                  className="input"
                  placeholder={lang === 'ru' ? 'Поиск по названию...' : 'Search by name...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">{lang === 'ru' ? 'Все категории' : 'All categories'}</option>
                  {stats && Object.keys(stats.categories).sort().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  className="select"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <option value="">{lang === 'ru' ? 'Все локации' : 'All locations'}</option>
                  {stats && Object.keys(stats.locations).sort().map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="card">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{lang === 'ru' ? 'Название' : 'Name'}</th>
                        <th>{lang === 'ru' ? 'Категория' : 'Category'}</th>
                        <th>{lang === 'ru' ? 'Локация' : 'Location'}</th>
                        <th>{lang === 'ru' ? 'Рейтинг' : 'Rating'}</th>
                        <th>{lang === 'ru' ? 'Отзывы' : 'Reviews'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPois.length > 0 ? paginatedPois.map(poi => (
                        <tr key={poi.id}>
                          <td><strong>{poi.name}</strong></td>
                          <td><span className="badge">{poi.category || '-'}</span></td>
                          <td>{poi.location || '-'}</td>
                          <td>{poi.rating ? `${poi.rating} ⭐` : '-'}</td>
                          <td>{poi.total_reviews || 0}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                          {lang === 'ru' ? 'Нет данных' : 'No data'}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>
                  <span className="pagination-info">
                    {lang === 'ru' ? 'Страница' : 'Page'} {currentPage} {lang === 'ru' ? 'из' : 'of'} {totalPages || 1}
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Map Tab */}
      {activeTab === 'map' && (
        <div className="tab-content">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <iframe
              src="/map"
              style={{ width: '100%', height: '700px', border: 'none' }}
              title="POI Map"
            />
          </div>
        </div>
      )}

      {/* Keep-Alive Modal */}
      <KeepAliveModal 
        isOpen={showKeepAliveModal}
        onClose={() => setShowKeepAliveModal(false)}
      />

      {/* Lumina Design Styles */}
      <style>{`
        /* Lumina Design System for Supabase Admin */
        .supabase-admin-lumina {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Header with Button - Lumina Style */
        .page-header-lumina {
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

        .header-content {
          flex: 1;
        }

        .header-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #111827;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          font-size: 16px;
          color: #6B7280;
          margin: 0;
          font-weight: 400;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        /* "All Databases" Button - Lumina Claymorphism */
        /* Keep-Alive Button - Green Theme */
        .btn-keep-alive {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          text-decoration: none;
          border: none;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 
            0 4px 16px rgba(16, 185, 129, 0.3),
            inset 0 -2px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 8px rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-keep-alive::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-keep-alive:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 8px 24px rgba(16, 185, 129, 0.4),
            inset 0 -2px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 8px rgba(255, 255, 255, 0.2);
        }

        .btn-keep-alive:hover::before {
          opacity: 1;
        }

        .btn-keep-alive:active {
          transform: translateY(-1px) scale(0.98);
          box-shadow: 
            0 4px 12px rgba(16, 185, 129, 0.35),
            inset 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* All Databases Button - Purple Theme */
        .btn-all-databases {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
          color: white;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 
            0 4px 16px rgba(124, 58, 237, 0.3),
            inset 0 -2px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 8px rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-all-databases::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-all-databases:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 8px 24px rgba(124, 58, 237, 0.4),
            inset 0 -2px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 8px rgba(255, 255, 255, 0.2);
        }

        .btn-all-databases:hover::before {
          opacity: 1;
        }

        .btn-all-databases:active {
          transform: translateY(-1px) scale(0.98);
          box-shadow: 
            0 4px 12px rgba(124, 58, 237, 0.35),
            inset 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .btn-all-databases .btn-icon {
          font-size: 20px;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .btn-all-databases .btn-text {
          font-weight: 600;
          letter-spacing: 0.3px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        .btn-all-databases .btn-badge {
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        /* Tabs Enhancement - Lumina Style */
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

        .tab:hover {
          background: rgba(124, 58, 237, 0.08);
          color: #7C3AED;
        }

        .tab.active {
          background: white;
          color: #7C3AED;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        /* Card Enhancement - Lumina Claymorphism */
        .card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.06),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #E5E7EB;
          transition: all 0.3s ease;
        }

        .card:hover {
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05);
        }

        .card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px 0;
        }

        /* Stats Grid Enhancement */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #E5E7EB;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 36px;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }

        .stat-change {
          font-size: 13px;
          color: #10B981;
          font-weight: 600;
          margin-top: 4px;
        }

        /* Input & Select Enhancement */
        .input, .select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: white;
        }

        .input:focus, .select:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        /* Button Enhancement */
        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
        }

        .btn-secondary {
          background: #F3F4F6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #E5E7EB;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Badge Enhancement */
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: #EDE9FE;
          color: #7C3AED;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        /* Table Enhancement */
        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .data-table thead {
          background: #F9FAFB;
        }

        .data-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #E5E7EB;
        }

        .data-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
          color: #374151;
        }

        .data-table tbody tr {
          transition: all 0.2s ease;
        }

        .data-table tbody tr:hover {
          background: #F9FAFB;
        }

        /* Pagination Enhancement */
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }

        .pagination-info {
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }

        /* Loading Enhancement */
        .loading-container {
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

        /* Table Selector Dropdown (в секции Structure) */
        .table-selector-dropdown {
          padding: 10px 14px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #111827;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', 'Source Code Pro', monospace;
        }

        .table-selector-dropdown:hover {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .table-selector-dropdown:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.15);
        }

        /* Refresh Button - Lumina Style */
        .btn-refresh {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          white-space: nowrap;
        }

        .btn-refresh:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        .btn-refresh:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .btn-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .refresh-icon {
          font-size: 18px;
          line-height: 1;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-header-lumina {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header-actions {
            width: 100%;
          }

          .btn-all-databases {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}