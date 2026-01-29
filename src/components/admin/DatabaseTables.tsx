import { useState, useEffect } from 'react';
import { useLang } from './LanguageSwitcher';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mcmzdscpuoxwneuzsanu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oqeTkwpUNEhCWHIkCfhwpA_YmqUWWEx';

interface TableInfo {
  name: string;
  size: string;
  columns: number;
  description: string | null;
  category: string;
  recordsCount?: number;
}

export default function DatabaseTables() {
  const lang = useLang();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fallback данные (если API не доступен)
  const fallbackTablesData: TableInfo[] = [
    // TENANT SYSTEM (новая система для арендаторов)
    { name: 'tenants', size: '48 kB', columns: 7, description: 'Арендаторы - пользователи которые ищут жильё', category: 'tenant_system' },
    { name: 'saved_properties', size: '96 kB', columns: 40, description: 'Сохранённые объекты недвижимости арендаторов', category: 'tenant_system' },
    { name: 'access_attempts', size: '24 kB', columns: 5, description: 'Логи попыток доступа (Rate Limiting)', category: 'tenant_system' },
    
    // TELEGRAM LISTING SYSTEM (6 таблиц)
    { name: 'telegram_accounts', size: '80 kB', columns: 14, description: 'Telegram accounts for publishing', category: 'telegram_listing' },
    { name: 'telegram_groups', size: '112 kB', columns: 17, description: 'Telegram groups/channels', category: 'telegram_listing' },
    { name: 'property_listings', size: '152 kB', columns: 42, description: 'Property listings from clients', category: 'telegram_listing' },
    { name: 'listing_publications', size: '120 kB', columns: 14, description: 'Publications in Telegram groups', category: 'telegram_listing' },
    { name: 'landlord_responses', size: '128 kB', columns: 30, description: 'Landlord responses to listings', category: 'telegram_listing' },
    { name: 'temperature_change_log', size: '56 kB', columns: 9, description: 'Temperature change log', category: 'telegram_listing' },

    // SUPERBASE CRM SYSTEM (14 таблиц)
    { name: 'users', size: '64 kB', columns: 28, description: 'Extended user profiles with preferences and OAuth data', category: 'superbase_crm' },
    { name: 'landlords', size: '56 kB', columns: 30, description: 'Property owners with verification and subscription info', category: 'superbase_crm' },
    { name: 'properties', size: '120 kB', columns: 50, description: 'Rental properties with location, pricing, and amenities', category: 'superbase_crm' },
    { name: 'rental_requests', size: '104 kB', columns: 43, description: 'Client rental requests/needs', category: 'superbase_crm' },
    { name: 'offers', size: '64 kB', columns: 17, description: 'Connections between properties and rental requests', category: 'superbase_crm' },
    { name: 'messages', size: '64 kB', columns: 19, description: 'Direct messages between users', category: 'superbase_crm' },
    { name: 'client_maps', size: '48 kB', columns: 15, description: 'Personal maps for clients to view offers', category: 'superbase_crm' },
    { name: 'map_markers', size: '48 kB', columns: 13, description: 'Property markers on client maps', category: 'superbase_crm' },
    { name: 'subscriptions', size: '40 kB', columns: 17, description: 'Landlord subscription plans', category: 'superbase_crm' },
    { name: 'payments', size: '56 kB', columns: 16, description: 'Payment transaction history', category: 'superbase_crm' },
    { name: 'notifications', size: '40 kB', columns: 17, description: 'User notifications', category: 'superbase_crm' },
    { name: 'analytics_events', size: '48 kB', columns: 22, description: 'Analytics and tracking events', category: 'superbase_crm' },
    { name: 'reviews', size: '64 kB', columns: 20, description: 'Property and landlord reviews', category: 'superbase_crm' },
    { name: 'saved_properties', size: '40 kB', columns: 5, description: 'User favorite properties', category: 'superbase_crm' },

    // POI SYSTEM (1 таблица)
    { name: 'poi_locations', size: '4752 kB', columns: 20, description: 'Points of Interest - Tourist locations', category: 'poi', recordsCount: 6176 },

    // SYSTEM TABLES (3 таблицы)
    { name: 'system_config', size: '48 kB', columns: 6, description: 'System configuration (keep-alive)', category: 'system' },
    { name: 'schema_migrations', size: '32 kB', columns: 3, description: 'Database migration history', category: 'system' },
    { name: 'spatial_ref_sys', size: '7144 kB', columns: 5, description: 'PostGIS spatial reference systems', category: 'system' },
  ];

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    setLoading(true);
    try {
      // Запрашиваем список таблиц из API
      const response = await fetch('/api/admin/tables');
      const data = await response.json();
      
      if (data.tables && data.tables.length > 0) {
        // Маппим данные из API в формат TableInfo
        const mappedTables: TableInfo[] = data.tables.map((table: any) => ({
          name: table.name,
          size: table.size || 'Unknown',
          columns: table.columns || 0,
          description: table.description || null,
          category: table.category || categorizeTable(table.name),
          recordsCount: table.recordsCount,
        }));
        
        setTables(mappedTables);
      } else {
        // Используем fallback данные
        console.warn('API returned no tables, using fallback data');
        setTables(fallbackTablesData);
      }
    } catch (error) {
      console.error('Error loading tables from API:', error);
      // При ошибке используем fallback данные
      setTables(fallbackTablesData);
    } finally {
      setLoading(false);
    }
  }

  // Функция для автоматической категоризации таблицы по имени
  function categorizeTable(tableName: string): string {
    if (tableName.includes('telegram') || tableName.includes('listing') || tableName.includes('publication') || tableName.includes('landlord') || tableName.includes('temperature')) {
      return 'telegram_listing';
    } else if (tableName === 'poi_locations') {
      return 'poi';
    } else if (tableName === 'system_config' || tableName === 'schema_migrations' || tableName === 'spatial_ref_sys') {
      return 'system';
    } else {
      return 'superbase_crm';
    }
  }

  const categories = [
    { id: 'all', label: lang === 'ru' ? 'Все таблицы' : 'All Tables', icon: '🗄️' },
    { id: 'telegram_listing', label: lang === 'ru' ? 'Telegram Listing' : 'Telegram Listing', icon: '📱' },
    { id: 'superbase_crm', label: lang === 'ru' ? 'Superbase CRM' : 'Superbase CRM', icon: '🏢' },
    { id: 'poi', label: lang === 'ru' ? 'POI Locations' : 'POI Locations', icon: '📍' },
    { id: 'system', label: lang === 'ru' ? 'System Tables' : 'System Tables', icon: '⚙️' },
  ];

  const filteredTables = tables.filter(table => {
    const matchCategory = selectedCategory === 'all' || table.category === selectedCategory;
    const matchSearch = !searchTerm || 
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (table.description && table.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'telegram_listing': return '#7C3AED'; // Deep Violet (AI Status)
      case 'superbase_crm': return '#10B981'; // Success Green
      case 'poi': return '#F59E0B'; // Warning Orange
      case 'system': return '#6B7280'; // Gray
      default: return '#6B7280';
    }
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    categories.forEach(cat => {
      if (cat.id === 'all') {
        stats[cat.id] = tables.length;
      } else {
        stats[cat.id] = tables.filter(t => t.category === cat.id).length;
      }
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="database-tables">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>{lang === 'ru' ? '🗄️ База данных Supabase' : '🗄️ Supabase Database'}</h1>
          <p className="subtitle">
            {lang === 'ru' 
              ? `Всего таблиц: ${tables.length} | Проверено: 2026-01-28` 
              : `Total tables: ${tables.length} | Verified: 2026-01-28`}
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="category-pills">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              borderColor: selectedCategory === cat.id ? getCategoryColor(cat.id === 'all' ? 'telegram_listing' : cat.id) : '#E5E7EB',
              background: selectedCategory === cat.id 
                ? `linear-gradient(135deg, ${getCategoryColor(cat.id === 'all' ? 'telegram_listing' : cat.id)}10, ${getCategoryColor(cat.id === 'all' ? 'telegram_listing' : cat.id)}05)`
                : 'white',
            }}
          >
            <span className="pill-icon">{cat.icon}</span>
            <span className="pill-label">{cat.label}</span>
            <span 
              className="pill-badge"
              style={{ 
                backgroundColor: getCategoryColor(cat.id === 'all' ? 'telegram_listing' : cat.id),
                color: 'white' 
              }}
            >
              {categoryStats[cat.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder={lang === 'ru' ? '🔍 Поиск по названию или описанию...' : '🔍 Search by name or description...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tables Grid (Bento Layout) */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{lang === 'ru' ? 'Загрузка таблиц...' : 'Loading tables...'}</p>
        </div>
      ) : (
        <div className="tables-grid">
          {filteredTables.map(table => (
            <div 
              key={table.name}
              className="table-card"
              onClick={() => setSelectedTable(table)}
              style={{
                borderTop: `3px solid ${getCategoryColor(table.category)}`,
              }}
            >
              <div className="table-card-header">
                <h3 className="table-name">
                  <code>{table.name}</code>
                </h3>
                <span 
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(table.category) }}
                >
                  {categories.find(c => c.id === table.category)?.icon}
                </span>
              </div>

              <div className="table-stats">
                <div className="stat-item">
                  <span className="stat-icon">💾</span>
                  <span className="stat-value">{table.size}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📊</span>
                  <span className="stat-value">{table.columns} {lang === 'ru' ? 'колонок' : 'columns'}</span>
                </div>
                {table.recordsCount && (
                  <div className="stat-item">
                    <span className="stat-icon">📝</span>
                    <span className="stat-value">{table.recordsCount.toLocaleString()} {lang === 'ru' ? 'записей' : 'records'}</span>
                  </div>
                )}
              </div>

              {table.description && (
                <p className="table-description">{table.description}</p>
              )}

              <div className="table-card-footer">
                <button className="btn-ghost">
                  {lang === 'ru' ? 'Подробнее →' : 'Details →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTables.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>{lang === 'ru' ? 'Таблицы не найдены' : 'No tables found'}</p>
        </div>
      )}

      {/* Modal for Table Details */}
      {selectedTable && (
        <div className="modal-overlay" onClick={() => setSelectedTable(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <code>{selectedTable.name}</code>
              </h2>
              <button className="modal-close" onClick={() => setSelectedTable(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">{lang === 'ru' ? 'Категория:' : 'Category:'}</span>
                  <span 
                    className="detail-value category-badge"
                    style={{ backgroundColor: getCategoryColor(selectedTable.category) }}
                  >
                    {categories.find(c => c.id === selectedTable.category)?.label}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">{lang === 'ru' ? 'Размер:' : 'Size:'}</span>
                  <span className="detail-value">{selectedTable.size}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">{lang === 'ru' ? 'Колонок:' : 'Columns:'}</span>
                  <span className="detail-value">{selectedTable.columns}</span>
                </div>

                {selectedTable.recordsCount && (
                  <div className="detail-item">
                    <span className="detail-label">{lang === 'ru' ? 'Записей:' : 'Records:'}</span>
                    <span className="detail-value">{selectedTable.recordsCount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {selectedTable.description && (
                <div className="detail-section">
                  <h4>{lang === 'ru' ? 'Описание:' : 'Description:'}</h4>
                  <p>{selectedTable.description}</p>
                </div>
              )}

              <div className="modal-actions">
                <a 
                  href={`https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/editor/${selectedTable.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {lang === 'ru' ? 'Открыть в Supabase →' : 'Open in Supabase →'}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .database-tables {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #111827;
        }

        .subtitle {
          font-size: 14px;
          color: #6B7280;
        }

        /* Category Pills (Lumina Design) */
        .category-pills {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .category-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .category-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }

        .category-pill.active {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .pill-icon {
          font-size: 18px;
        }

        .pill-label {
          font-weight: 500;
          color: #374151;
        }

        .pill-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        /* Search Box */
        .search-box {
          margin-bottom: 32px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        /* Tables Grid (Bento Layout) */
        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        /* Table Card (Claymorphism) */
        .table-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .table-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        .table-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .table-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          font-family: 'JetBrains Mono', 'Source Code Pro', monospace;
        }

        .category-badge {
          padding: 4px 8px;
          border-radius: 8px;
          color: white;
          font-size: 14px;
        }

        .table-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #F9FAFB;
          border-radius: 8px;
          font-size: 13px;
        }

        .stat-icon {
          font-size: 16px;
        }

        .stat-value {
          font-weight: 500;
          color: #374151;
        }

        .table-description {
          font-size: 14px;
          color: #6B7280;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .table-card-footer {
          padding-top: 12px;
          border-top: 1px solid #E5E7EB;
        }

        .btn-ghost {
          background: none;
          border: none;
          color: #7C3AED;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .btn-ghost:hover {
          transform: translateX(4px);
        }

        /* Modal (Glassmorphism) */
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

        .modal-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: scaleUp 0.3s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #E5E7EB;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .modal-close {
          background: #F3F4F6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: #E5E7EB;
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 24px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 16px;
          color: #111827;
          font-weight: 500;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section h4 {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .detail-section p {
          font-size: 14px;
          color: #374151;
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 500;
          text-decoration: none;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7C3AED, #5B21B6);
          color: white;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state p {
          color: #6B7280;
          font-size: 16px;
        }

        /* Loading */
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

        /* Animations */
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

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .tables-grid {
            grid-template-columns: 1fr;
          }

          .category-pills {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 8px;
          }

          .modal-content {
            width: 95%;
            max-height: 90vh;
          }
        }
      `}</style>
    </div>
  );
}
