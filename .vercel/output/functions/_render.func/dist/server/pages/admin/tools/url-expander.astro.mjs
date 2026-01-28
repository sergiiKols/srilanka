import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../../chunks/Layout_lp9ZR76Z.mjs';
import { j as jsxRuntimeExports, A as AdminLayout } from '../../../chunks/AdminLayout_xmS9cJRX.mjs';
import { a as reactExports } from '../../../chunks/_@astro-renderers_1ISMqT13.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_1ISMqT13.mjs';

function URLExpander() {
  const [shortUrl, setShortUrl] = reactExports.useState("");
  const [expandedUrl, setExpandedUrl] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [expandTime, setExpandTime] = reactExports.useState(0);
  const handleExpand = async () => {
    if (!shortUrl.trim()) {
      setError("Please enter a URL");
      return;
    }
    setLoading(true);
    setError("");
    setExpandedUrl("");
    const startTime = Date.now();
    try {
      const response = await fetch("/api/expand-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: shortUrl })
      });
      const data = await response.json();
      const elapsed = ((Date.now() - startTime) / 1e3).toFixed(2);
      setExpandTime(parseFloat(elapsed));
      if (data.error) {
        setError(data.error);
      } else {
        setExpandedUrl(data.expandedUrl || data.url);
      }
    } catch (err) {
      setError("Failed to expand URL. Please check your API settings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleClear = () => {
    setShortUrl("");
    setExpandedUrl("");
    setError("");
    setExpandTime(0);
  };
  const handleCopyExpanded = () => {
    if (expandedUrl) {
      navigator.clipboard.writeText(expandedUrl);
      alert("Expanded URL copied to clipboard!");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "url-expander", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🔗 URL Expander" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "description", children: "Expand short URLs (bit.ly, goo.gl, t.co, etc.) to their full destination" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "short-url", children: "Short URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              id: "short-url",
              value: shortUrl,
              onChange: (e) => setShortUrl(e.target.value),
              placeholder: "https://bit.ly/abc123",
              disabled: loading,
              onKeyDown: (e) => e.key === "Enter" && handleExpand()
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleExpand,
              disabled: loading || !shortUrl.trim(),
              className: "btn-primary",
              children: loading ? "⏳ Expanding..." : "🔗 Expand URL"
            }
          )
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "error-message", children: [
          "❌ ",
          error
        ] })
      ] }),
      expandedUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-section success", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "✅ Expanded URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "badge", children: [
              "Time: ",
              expandTime,
              "s"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge", children: "Perplexity API" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-url", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: expandedUrl }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCopyExpanded, className: "btn-icon", title: "Copy", children: "📋" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "result-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: expandedUrl, target: "_blank", rel: "noopener noreferrer", className: "btn-secondary", children: "🌐 Open in New Tab" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleClear, className: "btn-ghost", children: "🔄 Clear" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📚 Example URLs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "description", children: "Click to test with example short URLs:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "examples", children: [
        "https://bit.ly/3example",
        "https://goo.gl/maps/test",
        "https://t.co/abcd1234",
        "https://tinyurl.com/test123"
      ].map((url) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShortUrl(url),
          className: "example-btn",
          disabled: loading,
          children: url
        },
        url
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tool-card disabled-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📱 Telegram Integration Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-badge inactive", children: "Coming Soon" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "future-notice", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "🚧 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Future Feature" }),
        " - Telegram bot and client API integration will be available soon"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "subsection-title", children: "🤖 Bot Configuration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-bot-token", children: "Bot Token" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-with-icon", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "password",
                  id: "tg-bot-token",
                  placeholder: "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
                  disabled: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-icon", disabled: true, title: "Show/Hide", children: "👁️" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("small", { className: "help-text", children: [
              "Get from ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://t.me/BotFather", target: "_blank", children: "@BotFather" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-bot-username", children: "Bot Username" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "tg-bot-username",
                placeholder: "@YourPropertyBot",
                disabled: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-webhook-url", children: "Webhook URL (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "tg-webhook-url",
                placeholder: "https://yoursite.com/api/telegram/webhook",
                disabled: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "subsection-title", children: "👤 User Client API" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-api-id", children: "API ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "tg-api-id",
                placeholder: "12345678",
                disabled: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("small", { className: "help-text", children: [
              "Get from ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://my.telegram.org/apps", target: "_blank", children: "my.telegram.org" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-api-hash", children: "API Hash" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-with-icon", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "password",
                  id: "tg-api-hash",
                  placeholder: "abcdef1234567890abcdef1234567890",
                  disabled: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-icon", disabled: true, title: "Show/Hide", children: "👁️" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-phone", children: "Phone Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "tel",
                id: "tg-phone",
                placeholder: "+1234567890",
                disabled: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-session", children: "Session String" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                id: "tg-session",
                rows: 3,
                placeholder: "Generated after authentication...",
                disabled: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("small", { className: "help-text", children: "⚠️ Keep this secret! Full account access." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "subsection-title", children: "📢 Channels & Groups" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-channel-id", children: "Main Channel ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "tg-channel-id",
                placeholder: "-1001234567890",
                disabled: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("small", { className: "help-text", children: "For posting properties/POIs" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-admin-chat", children: "Admin Chat ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "tg-admin-chat",
                placeholder: "-1009876543210",
                disabled: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("small", { className: "help-text", children: "For notifications and logs" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "tg-backup-channel", children: "Backup Channel ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "tg-backup-channel",
                placeholder: "-1001111111111",
                disabled: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("small", { className: "help-text", children: "Optional backup channel" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "settings-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "subsection-title", children: "⚙️ Features" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "checkbox-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", disabled: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Enable auto-posting to channel" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", disabled: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Send parsing notifications" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", disabled: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Enable inline search via bot" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", disabled: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Allow user submissions via bot" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", disabled: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Auto-expand short URLs in messages" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "telegram-stats", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "🤖" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Bot Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: "Not Configured" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "📨" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Messages Today" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: "0" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "👥" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Subscribers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: "0" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-icon", children: "⚡" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "API Calls" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: "0" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "disabled-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-primary", disabled: true, children: "💾 Save Telegram Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-secondary", disabled: true, children: "🔄 Test Connection" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { jsx: true, children: `
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
      ` })
  ] });
}

const $$Astro = createAstro();
const $$UrlExpander = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$UrlExpander;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "URL Expander - Admin Tools" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminLayout", AdminLayout, { "client:load": true, "title": "URL Expander Tool", "subtitle": "Expand short URLs and manage Telegram integrations", "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/AdminLayout", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "URLExpander", URLExpander, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/URLExpander", "client:component-export": "default" })} ` })} ` })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/tools/url-expander.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/tools/url-expander.astro";
const $$url = "/admin/tools/url-expander";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$UrlExpander,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
