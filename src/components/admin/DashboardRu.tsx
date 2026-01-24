import { useLang } from './LanguageSwitcher';
import { t } from '../../utils/translations';

export default function DashboardRu() {
  const lang = useLang();

  return (
    <div className="dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <div className="stat-value">1,234</div>
            <div className="stat-label">{t('totalPOIs', lang)}</div>
            <div className="stat-change positive">+45 {t('thisWeek', lang)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">892</div>
            <div className="stat-label">{t('validatedPOIs', lang)}</div>
            <div className="stat-change">72% {t('validationRate', lang)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <div className="stat-value">156</div>
            <div className="stat-label">{t('properties', lang)}</div>
            <div className="stat-change positive">+12 {t('today', lang)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">23</div>
            <div className="stat-label">{t('totalUsers', lang)}</div>
            <div className="stat-change">5 {t('activeToday', lang)}</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="section">
        <h2>🚦 {t('systemStatus', lang)}</h2>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-indicator active"></div>
            <div className="status-content">
              <div className="status-name">Supabase Database</div>
              <div className="status-info">{t('connected', lang)} • {t('lastPing', lang)}: 2s {t('ago', lang)}</div>
            </div>
            <div className="status-action">
              <button className="btn-icon">🔄</button>
            </div>
          </div>

          <div className="status-item">
            <div className="status-indicator active"></div>
            <div className="status-content">
              <div className="status-name">Google Maps API</div>
              <div className="status-info">{t('active', lang)} • {t('quota', lang)}: 1,234/5,000 {t('today', lang)}</div>
            </div>
            <div className="status-action">
              <a href="/admin/api-settings" className="btn-icon">⚙️</a>
            </div>
          </div>

          <div className="status-item">
            <div className="status-indicator active"></div>
            <div className="status-content">
              <div className="status-name">Groq AI (Парсинг)</div>
              <div className="status-info">{t('active', lang)} • 45K/100K {t('tokensUsed', lang)}</div>
            </div>
            <div className="status-action">
              <a href="/admin/api-settings" className="btn-icon">⚙️</a>
            </div>
          </div>

          <div className="status-item">
            <div className="status-indicator active"></div>
            <div className="status-content">
              <div className="status-name">Perplexity API</div>
              <div className="status-info">{t('active', lang)} • 12/50 {t('requestsToday', lang)}</div>
            </div>
            <div className="status-action">
              <a href="/admin/tools/url-expander" className="btn-icon">🔗</a>
            </div>
          </div>

          <div className="status-item">
            <div className="status-indicator idle"></div>
            <div className="status-content">
              <div className="status-name">{t('parsingSystem', lang)}</div>
              <div className="status-info">{t('idle', lang)} • {t('lastRun', lang)}: 2 {t('hours', lang)} {t('ago', lang)}</div>
            </div>
            <div className="status-action">
              <a href="/admin/parsing" className="btn-icon">▶️</a>
            </div>
          </div>

          <div className="status-item">
            <div className="status-indicator inactive"></div>
            <div className="status-content">
              <div className="status-name">Telegram Bot</div>
              <div className="status-info">{t('notConfigured', lang)} • {t('comingSoon', lang)}</div>
            </div>
            <div className="status-action">
              <a href="/admin/tools/url-expander" className="btn-icon">⚙️</a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section">
        <h2>📋 {t('recentActivity', lang)}</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <div className="activity-title">{t('poiValidated', lang)}</div>
              <div className="activity-description">"Unawatuna Beach Hotel" проверен администратором</div>
              <div className="activity-time">5 {t('minutesAgo', lang)}</div>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">📍</div>
            <div className="activity-content">
              <div className="activity-title">{t('newPOICreated', lang)}</div>
              <div className="activity-description">"Sunset Bar & Grill" добавлен в регион Негомбо</div>
              <div className="activity-time">23 {t('minutesAgo', lang)}</div>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">🏠</div>
            <div className="activity-content">
              <div className="activity-title">{t('propertyImported', lang)}</div>
              <div className="activity-description">3 новых объекта импортировано через AI инструмент</div>
              <div className="activity-time">1 {t('hour', lang)} {t('ago', lang)}</div>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">🔄</div>
            <div className="activity-content">
              <div className="activity-title">{t('parsingCompleted', lang)}</div>
              <div className="activity-description">Pass 1: 127/150 POI обработано успешно</div>
              <div className="activity-time">2 {t('hours', lang)} {t('ago', lang)}</div>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <div className="activity-title">{t('newUserRegistered', lang)}</div>
              <div className="activity-description">user@example.com присоединился к платформе</div>
              <div className="activity-time">3 {t('hours', lang)} {t('ago', lang)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2>⚡ {t('quickActions', lang)}</h2>
        <div className="actions-grid">
          <a href="/admin/tools/url-expander" className="action-card">
            <div className="action-icon">🔗</div>
            <div className="action-title">{t('expandShortURL', lang)}</div>
            <div className="action-description">{t('convertShortURLs', lang)}</div>
          </a>

          <a href="/admin/pois" className="action-card">
            <div className="action-icon">📍</div>
            <div className="action-title">{t('browsePOIs', lang)}</div>
            <div className="action-description">{t('viewManagePOIs', lang)}</div>
          </a>

          <a href="/admin/parsing" className="action-card">
            <div className="action-icon">🔄</div>
            <div className="action-title">{t('startParsing', lang)}</div>
            <div className="action-description">{t('parseNewPOIs', lang)}</div>
          </a>

          <a href="/admin/api-settings" className="action-card">
            <div className="action-icon">🔑</div>
            <div className="action-title">{t('apiSettingsAction', lang)}</div>
            <div className="action-description">{t('manageAPIKeys', lang)}</div>
          </a>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .stat-icon {
          font-size: 32px;
          line-height: 1;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .stat-change {
          font-size: 12px;
          color: #6b7280;
        }

        .stat-change.positive {
          color: #10b981;
          font-weight: 500;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #1a1a1a;
        }

        .status-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .status-item:hover {
          background: #f3f4f6;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-indicator.active {
          background: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }

        .status-indicator.idle {
          background: #f59e0b;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
        }

        .status-indicator.inactive {
          background: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
        }

        .status-content {
          flex: 1;
        }

        .status-name {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .status-info {
          font-size: 13px;
          color: #6b7280;
        }

        .status-action {
          flex-shrink: 0;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .activity-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .activity-description {
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 4px;
        }

        .activity-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .action-card:nth-child(2) {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .action-card:nth-child(3) {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .action-card:nth-child(4) {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .action-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .action-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .action-description {
          font-size: 13px;
          opacity: 0.9;
        }

        .btn-icon {
          padding: 8px 12px;
          background: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-icon:hover {
          background: #f3f4f6;
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
          
          .stat-card {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
