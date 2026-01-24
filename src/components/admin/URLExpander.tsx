import { useState } from 'react';

export default function URLExpander() {
  const [shortUrl, setShortUrl] = useState('');
  const [expandedUrl, setExpandedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandTime, setExpandTime] = useState(0);

  const handleExpand = async () => {
    if (!shortUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setExpandedUrl('');
    const startTime = Date.now();

    try {
      const response = await fetch('/api/expand-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: shortUrl }),
      });

      const data = await response.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      setExpandTime(parseFloat(elapsed));

      if (data.error) {
        setError(data.error);
      } else {
        setExpandedUrl(data.expandedUrl || data.url);
      }
    } catch (err) {
      setError('Failed to expand URL. Please check your API settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setShortUrl('');
    setExpandedUrl('');
    setError('');
    setExpandTime(0);
  };

  const handleCopyExpanded = () => {
    if (expandedUrl) {
      navigator.clipboard.writeText(expandedUrl);
      alert('Expanded URL copied to clipboard!');
    }
  };

  return (
    <div className="url-expander">
      <div className="tool-card">
        <h3>🔗 URL Expander</h3>
        <p className="description">
          Expand short URLs (bit.ly, goo.gl, t.co, etc.) to their full destination
        </p>

        <div className="input-section">
          <label htmlFor="short-url">Short URL</label>
          <div className="input-group">
            <input
              type="text"
              id="short-url"
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              placeholder="https://bit.ly/abc123"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleExpand()}
            />
            <button
              onClick={handleExpand}
              disabled={loading || !shortUrl.trim()}
              className="btn-primary"
            >
              {loading ? '⏳ Expanding...' : '🔗 Expand URL'}
            </button>
          </div>
          {error && <p className="error-message">❌ {error}</p>}
        </div>

        {expandedUrl && (
          <div className="result-section success">
            <div className="result-header">
              <h4>✅ Expanded URL</h4>
              <div className="result-meta">
                <span className="badge">Time: {expandTime}s</span>
                <span className="badge">Perplexity API</span>
              </div>
            </div>
            <div className="result-url">
              <code>{expandedUrl}</code>
              <button onClick={handleCopyExpanded} className="btn-icon" title="Copy">
                📋
              </button>
            </div>
            <div className="result-actions">
              <a href={expandedUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                🌐 Open in New Tab
              </a>
              <button onClick={handleClear} className="btn-ghost">
                🔄 Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Examples Section */}
      <div className="tool-card">
        <h3>📚 Example URLs</h3>
        <p className="description">Click to test with example short URLs:</p>
        <div className="examples">
          {[
            'https://bit.ly/3example',
            'https://goo.gl/maps/test',
            'https://t.co/abcd1234',
            'https://tinyurl.com/test123',
          ].map((url) => (
            <button
              key={url}
              onClick={() => setShortUrl(url)}
              className="example-btn"
              disabled={loading}
            >
              {url}
            </button>
          ))}
        </div>
      </div>

      {/* Telegram API Settings (Future) */}
      <div className="tool-card disabled-section">
        <div className="section-header">
          <h3>📱 Telegram Integration Settings</h3>
          <span className="status-badge inactive">Coming Soon</span>
        </div>
        <div className="future-notice">
          <p>🚧 <strong>Future Feature</strong> - Telegram bot and client API integration will be available soon</p>
        </div>

        <div className="settings-grid">
          {/* Bot Settings */}
          <div className="settings-group">
            <h4 className="subsection-title">🤖 Bot Configuration</h4>
            
            <div className="form-group">
              <label htmlFor="tg-bot-token">Bot Token</label>
              <div className="input-with-icon">
                <input
                  type="password"
                  id="tg-bot-token"
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  disabled
                />
                <button className="btn-icon" disabled title="Show/Hide">👁️</button>
              </div>
              <small className="help-text">Get from <a href="https://t.me/BotFather" target="_blank">@BotFather</a></small>
            </div>

            <div className="form-group">
              <label htmlFor="tg-bot-username">Bot Username</label>
              <input
                type="text"
                id="tg-bot-username"
                placeholder="@YourPropertyBot"
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="tg-webhook-url">Webhook URL (Optional)</label>
              <input
                type="text"
                id="tg-webhook-url"
                placeholder="https://yoursite.com/api/telegram/webhook"
                disabled
              />
            </div>
          </div>

          {/* Client API Settings */}
          <div className="settings-group">
            <h4 className="subsection-title">👤 User Client API</h4>
            
            <div className="form-group">
              <label htmlFor="tg-api-id">API ID</label>
              <input
                type="text"
                id="tg-api-id"
                placeholder="12345678"
                disabled
              />
              <small className="help-text">Get from <a href="https://my.telegram.org/apps" target="_blank">my.telegram.org</a></small>
            </div>

            <div className="form-group">
              <label htmlFor="tg-api-hash">API Hash</label>
              <div className="input-with-icon">
                <input
                  type="password"
                  id="tg-api-hash"
                  placeholder="abcdef1234567890abcdef1234567890"
                  disabled
                />
                <button className="btn-icon" disabled title="Show/Hide">👁️</button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tg-phone">Phone Number</label>
              <input
                type="tel"
                id="tg-phone"
                placeholder="+1234567890"
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="tg-session">Session String</label>
              <textarea
                id="tg-session"
                rows={3}
                placeholder="Generated after authentication..."
                disabled
              ></textarea>
              <small className="help-text">⚠️ Keep this secret! Full account access.</small>
            </div>
          </div>

          {/* Channel/Group Settings */}
          <div className="settings-group">
            <h4 className="subsection-title">📢 Channels & Groups</h4>
            
            <div className="form-group">
              <label htmlFor="tg-channel-id">Main Channel ID</label>
              <input
                type="text"
                id="tg-channel-id"
                placeholder="-1001234567890"
                disabled
              />
              <small className="help-text">For posting properties/POIs</small>
            </div>

            <div className="form-group">
              <label htmlFor="tg-admin-chat">Admin Chat ID</label>
              <input
                type="text"
                id="tg-admin-chat"
                placeholder="-1009876543210"
                disabled
              />
              <small className="help-text">For notifications and logs</small>
            </div>

            <div className="form-group">
              <label htmlFor="tg-backup-channel">Backup Channel ID</label>
              <input
                type="text"
                id="tg-backup-channel"
                placeholder="-1001111111111"
                disabled
              />
              <small className="help-text">Optional backup channel</small>
            </div>
          </div>

          {/* Features Settings */}
          <div className="settings-group">
            <h4 className="subsection-title">⚙️ Features</h4>
            
            <div className="checkbox-group">
              <label>
                <input type="checkbox" disabled />
                <span>Enable auto-posting to channel</span>
              </label>
              <label>
                <input type="checkbox" disabled />
                <span>Send parsing notifications</span>
              </label>
              <label>
                <input type="checkbox" disabled />
                <span>Enable inline search via bot</span>
              </label>
              <label>
                <input type="checkbox" disabled />
                <span>Allow user submissions via bot</span>
              </label>
              <label>
                <input type="checkbox" disabled />
                <span>Auto-expand short URLs in messages</span>
              </label>
            </div>
          </div>
        </div>

        <div className="telegram-stats">
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-content">
              <span className="stat-label">Bot Status</span>
              <span className="stat-value">Not Configured</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📨</div>
            <div className="stat-content">
              <span className="stat-label">Messages Today</span>
              <span className="stat-value">0</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <span className="stat-label">Subscribers</span>
              <span className="stat-value">0</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <span className="stat-label">API Calls</span>
              <span className="stat-value">0</span>
            </div>
          </div>
        </div>

        <div className="disabled-actions">
          <button className="btn-primary" disabled>💾 Save Telegram Settings</button>
          <button className="btn-secondary" disabled>🔄 Test Connection</button>
        </div>
      </div>

      <style jsx>{`
        .url-expander {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .tool-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .tool-card h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #1a1a1a;
        }

        .description {
          margin: 0 0 24px 0;
          color: #666;
          font-size: 14px;
        }

        .input-section {
          margin-bottom: 24px;
        }

        .input-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .input-group {
          display: flex;
          gap: 12px;
        }

        .input-group input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .input-group input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .error-message {
          margin: 8px 0 0 0;
          color: #dc2626;
          font-size: 14px;
        }

        .result-section {
          padding: 20px;
          background: #f0fdf4;
          border: 2px solid #86efac;
          border-radius: 8px;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .result-header h4 {
          margin: 0;
          font-size: 16px;
          color: #166534;
        }

        .result-meta {
          display: flex;
          gap: 8px;
        }

        .badge {
          padding: 4px 10px;
          background: white;
          border-radius: 12px;
          font-size: 12px;
          color: #166534;
          font-weight: 500;
        }

        .result-url {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .result-url code {
          flex: 1;
          font-size: 13px;
          color: #1e40af;
          word-break: break-all;
        }

        .result-actions {
          display: flex;
          gap: 8px;
        }

        .examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        .example-btn {
          padding: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .example-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #3b82f6;
        }

        .example-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Telegram Section */
        .disabled-section {
          opacity: 0.8;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .future-notice {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          margin-bottom: 24px;
          border-radius: 4px;
        }

        .future-notice p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .settings-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .subsection-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:disabled,
        .form-group textarea:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .form-group textarea {
          resize: vertical;
          font-family: monospace;
          font-size: 12px;
        }

        .input-with-icon {
          display: flex;
          gap: 8px;
        }

        .input-with-icon input {
          flex: 1;
        }

        .help-text {
          font-size: 12px;
          color: #6b7280;
        }

        .help-text a {
          color: #3b82f6;
          text-decoration: none;
        }

        .help-text a:hover {
          text-decoration: underline;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #4b5563;
        }

        .checkbox-group input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"]:disabled {
          cursor: not-allowed;
        }

        .telegram-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e5e5;
        }

        .stat-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .stat-icon {
          font-size: 24px;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .disabled-actions {
          display: flex;
          gap: 12px;
        }

        /* Buttons */
        .btn-primary,
        .btn-secondary,
        .btn-ghost,
        .btn-icon {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-ghost {
          background: transparent;
          color: #6b7280;
        }

        .btn-ghost:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .btn-icon {
          padding: 8px 12px;
          background: transparent;
          font-size: 16px;
        }

        .btn-icon:hover:not(:disabled) {
          background: #f3f4f6;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
