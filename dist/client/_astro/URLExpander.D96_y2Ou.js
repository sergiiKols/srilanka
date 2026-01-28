import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r}from"./index.JXKNaeUN.js";function y(){const[l,o]=r.useState(""),[t,d]=r.useState(""),[i,c]=r.useState(!1),[p,a]=r.useState(""),[b,x]=r.useState(0),h=async()=>{if(!l.trim()){a("Please enter a URL");return}c(!0),a(""),d("");const s=Date.now();try{const n=await(await fetch("/api/expand-url",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:l})})).json(),f=((Date.now()-s)/1e3).toFixed(2);x(parseFloat(f)),n.error?a(n.error):d(n.expandedUrl||n.url)}catch(u){a("Failed to expand URL. Please check your API settings."),console.error(u)}finally{c(!1)}},m=()=>{o(""),d(""),a(""),x(0)},g=()=>{t&&(navigator.clipboard.writeText(t),alert("Expanded URL copied to clipboard!"))};return e.jsxs("div",{className:"url-expander",children:[e.jsxs("div",{className:"tool-card",children:[e.jsx("h3",{children:"🔗 URL Expander"}),e.jsx("p",{className:"description",children:"Expand short URLs (bit.ly, goo.gl, t.co, etc.) to their full destination"}),e.jsxs("div",{className:"input-section",children:[e.jsx("label",{htmlFor:"short-url",children:"Short URL"}),e.jsxs("div",{className:"input-group",children:[e.jsx("input",{type:"text",id:"short-url",value:l,onChange:s=>o(s.target.value),placeholder:"https://bit.ly/abc123",disabled:i,onKeyDown:s=>s.key==="Enter"&&h()}),e.jsx("button",{onClick:h,disabled:i||!l.trim(),className:"btn-primary",children:i?"⏳ Expanding...":"🔗 Expand URL"})]}),p&&e.jsxs("p",{className:"error-message",children:["❌ ",p]})]}),t&&e.jsxs("div",{className:"result-section success",children:[e.jsxs("div",{className:"result-header",children:[e.jsx("h4",{children:"✅ Expanded URL"}),e.jsxs("div",{className:"result-meta",children:[e.jsxs("span",{className:"badge",children:["Time: ",b,"s"]}),e.jsx("span",{className:"badge",children:"Perplexity API"})]})]}),e.jsxs("div",{className:"result-url",children:[e.jsx("code",{children:t}),e.jsx("button",{onClick:g,className:"btn-icon",title:"Copy",children:"📋"})]}),e.jsxs("div",{className:"result-actions",children:[e.jsx("a",{href:t,target:"_blank",rel:"noopener noreferrer",className:"btn-secondary",children:"🌐 Open in New Tab"}),e.jsx("button",{onClick:m,className:"btn-ghost",children:"🔄 Clear"})]})]})]}),e.jsxs("div",{className:"tool-card",children:[e.jsx("h3",{children:"📚 Example URLs"}),e.jsx("p",{className:"description",children:"Click to test with example short URLs:"}),e.jsx("div",{className:"examples",children:["https://bit.ly/3example","https://goo.gl/maps/test","https://t.co/abcd1234","https://tinyurl.com/test123"].map(s=>e.jsx("button",{onClick:()=>o(s),className:"example-btn",disabled:i,children:s},s))})]}),e.jsxs("div",{className:"tool-card disabled-section",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h3",{children:"📱 Telegram Integration Settings"}),e.jsx("span",{className:"status-badge inactive",children:"Coming Soon"})]}),e.jsx("div",{className:"future-notice",children:e.jsxs("p",{children:["🚧 ",e.jsx("strong",{children:"Future Feature"})," - Telegram bot and client API integration will be available soon"]})}),e.jsxs("div",{className:"settings-grid",children:[e.jsxs("div",{className:"settings-group",children:[e.jsx("h4",{className:"subsection-title",children:"🤖 Bot Configuration"}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-bot-token",children:"Bot Token"}),e.jsxs("div",{className:"input-with-icon",children:[e.jsx("input",{type:"password",id:"tg-bot-token",placeholder:"1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",disabled:!0}),e.jsx("button",{className:"btn-icon",disabled:!0,title:"Show/Hide",children:"👁️"})]}),e.jsxs("small",{className:"help-text",children:["Get from ",e.jsx("a",{href:"https://t.me/BotFather",target:"_blank",children:"@BotFather"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-bot-username",children:"Bot Username"}),e.jsx("input",{type:"text",id:"tg-bot-username",placeholder:"@YourPropertyBot",disabled:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-webhook-url",children:"Webhook URL (Optional)"}),e.jsx("input",{type:"text",id:"tg-webhook-url",placeholder:"https://yoursite.com/api/telegram/webhook",disabled:!0})]})]}),e.jsxs("div",{className:"settings-group",children:[e.jsx("h4",{className:"subsection-title",children:"👤 User Client API"}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-api-id",children:"API ID"}),e.jsx("input",{type:"text",id:"tg-api-id",placeholder:"12345678",disabled:!0}),e.jsxs("small",{className:"help-text",children:["Get from ",e.jsx("a",{href:"https://my.telegram.org/apps",target:"_blank",children:"my.telegram.org"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-api-hash",children:"API Hash"}),e.jsxs("div",{className:"input-with-icon",children:[e.jsx("input",{type:"password",id:"tg-api-hash",placeholder:"abcdef1234567890abcdef1234567890",disabled:!0}),e.jsx("button",{className:"btn-icon",disabled:!0,title:"Show/Hide",children:"👁️"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-phone",children:"Phone Number"}),e.jsx("input",{type:"tel",id:"tg-phone",placeholder:"+1234567890",disabled:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-session",children:"Session String"}),e.jsx("textarea",{id:"tg-session",rows:3,placeholder:"Generated after authentication...",disabled:!0}),e.jsx("small",{className:"help-text",children:"⚠️ Keep this secret! Full account access."})]})]}),e.jsxs("div",{className:"settings-group",children:[e.jsx("h4",{className:"subsection-title",children:"📢 Channels & Groups"}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-channel-id",children:"Main Channel ID"}),e.jsx("input",{type:"text",id:"tg-channel-id",placeholder:"-1001234567890",disabled:!0}),e.jsx("small",{className:"help-text",children:"For posting properties/POIs"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-admin-chat",children:"Admin Chat ID"}),e.jsx("input",{type:"text",id:"tg-admin-chat",placeholder:"-1009876543210",disabled:!0}),e.jsx("small",{className:"help-text",children:"For notifications and logs"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"tg-backup-channel",children:"Backup Channel ID"}),e.jsx("input",{type:"text",id:"tg-backup-channel",placeholder:"-1001111111111",disabled:!0}),e.jsx("small",{className:"help-text",children:"Optional backup channel"})]})]}),e.jsxs("div",{className:"settings-group",children:[e.jsx("h4",{className:"subsection-title",children:"⚙️ Features"}),e.jsxs("div",{className:"checkbox-group",children:[e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",disabled:!0}),e.jsx("span",{children:"Enable auto-posting to channel"})]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",disabled:!0}),e.jsx("span",{children:"Send parsing notifications"})]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",disabled:!0}),e.jsx("span",{children:"Enable inline search via bot"})]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",disabled:!0}),e.jsx("span",{children:"Allow user submissions via bot"})]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",disabled:!0}),e.jsx("span",{children:"Auto-expand short URLs in messages"})]})]})]})]}),e.jsxs("div",{className:"telegram-stats",children:[e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",children:"🤖"}),e.jsxs("div",{className:"stat-content",children:[e.jsx("span",{className:"stat-label",children:"Bot Status"}),e.jsx("span",{className:"stat-value",children:"Not Configured"})]})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",children:"📨"}),e.jsxs("div",{className:"stat-content",children:[e.jsx("span",{className:"stat-label",children:"Messages Today"}),e.jsx("span",{className:"stat-value",children:"0"})]})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",children:"👥"}),e.jsxs("div",{className:"stat-content",children:[e.jsx("span",{className:"stat-label",children:"Subscribers"}),e.jsx("span",{className:"stat-value",children:"0"})]})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",children:"⚡"}),e.jsxs("div",{className:"stat-content",children:[e.jsx("span",{className:"stat-label",children:"API Calls"}),e.jsx("span",{className:"stat-value",children:"0"})]})]})]}),e.jsxs("div",{className:"disabled-actions",children:[e.jsx("button",{className:"btn-primary",disabled:!0,children:"💾 Save Telegram Settings"}),e.jsx("button",{className:"btn-secondary",disabled:!0,children:"🔄 Test Connection"})]})]}),e.jsx("style",{jsx:!0,children:`
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
      `})]})}export{y as default};
