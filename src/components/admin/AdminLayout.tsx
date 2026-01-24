import { type ReactNode } from 'react';
import LanguageSwitcher, { useLang } from './LanguageSwitcher';
import { t } from '../../utils/translations';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
}

export default function AdminLayout({ 
  children, 
  title,
  subtitle,
  headerAction 
}: AdminLayoutProps) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const lang = useLang();

  const navItems = [
    { href: '/admin', icon: '📊', label: t('dashboard', lang) },
    { href: '/admin/api-settings', icon: '🔑', label: t('apiSettings', lang) },
    { href: '/admin/tools/url-expander', icon: '🔗', label: t('urlExpander', lang) },
    { href: '/admin/pois', icon: '📍', label: t('poiManagement', lang) },
    { href: '/admin/parsing', icon: '🔄', label: t('parsingSystem', lang) },
    { href: '/admin/users', icon: '👥', label: t('users', lang) },
    { href: '/admin/settings', icon: '⚙️', label: t('settings', lang) },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>⚙️ {t('adminPanel', lang)}</h2>
          <p className="version">v0.1.0</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-item ${currentPath === item.href ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a href="/map" className="nav-item">
            <span className="icon">🗺️</span>
            <span>{t('toMap', lang)}</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{title || t('adminPanel', lang)}</h1>
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>
          <div className="header-actions">
            <LanguageSwitcher />
            {headerAction}
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>

      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #f5f5f5;
        }

        .admin-sidebar {
          width: 260px;
          background: #1a1a1a;
          color: white;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
        }

        .version {
          margin: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
        }

        .sidebar-footer {
          padding: 20px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border-left: 3px solid #3b82f6;
        }

        .nav-item .icon {
          font-size: 18px;
        }

        .admin-main {
          flex: 1;
          margin-left: 260px;
        }

        .admin-header {
          background: white;
          padding: 30px 40px;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .admin-header h1 {
          margin: 0 0 5px 0;
          font-size: 28px;
          color: #1a1a1a;
        }

        .subtitle {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .admin-content {
          padding: 40px;
          max-width: 1200px;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .admin-sidebar {
            display: none;
          }
          
          .admin-main {
            margin-left: 0;
          }
          
          .admin-header {
            padding: 20px 16px;
          }
          
          .admin-header h1 {
            font-size: 22px;
          }
          
          .admin-content {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
}
