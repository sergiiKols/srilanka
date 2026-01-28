import{j as e}from"./jsx-runtime.D_zvdyIk.js";import"./index.JXKNaeUN.js";import{u as p,L as h}from"./LanguageSwitcher.DNO4dlch.js";import{t as n}from"./translations.BI5rNvUj.js";function u({children:l,title:o,subtitle:r,headerAction:t}){const d=typeof window<"u"?window.location.pathname:"",a=p(),m=[{href:"/admin",icon:"📊",label:n("dashboard",a)},{href:"/admin/api-settings",icon:"🔑",label:n("apiSettings",a)},{href:"/admin/tools/url-expander",icon:"🔗",label:n("urlExpander",a)},{href:"/admin/pois",icon:"📍",label:n("poiManagement",a)},{href:"/admin/supabase",icon:"🗄️",label:"Supabase DB"},{href:"/admin/parsing",icon:"🔄",label:n("parsingSystem",a)},{href:"/admin/cron-jobs",icon:"⏰",label:"Cron Jobs"},{href:"/admin/users",icon:"👥",label:n("users",a)},{icon:"📋",label:n("telegramForms",a),submenu:[{href:"/admin/forms/telegram",label:n("formsList",a)},{href:"/admin/forms/telegram/submissions",label:n("allSubmissions",a)},{href:"/admin/forms/telegram/settings",label:n("botSettings",a)}]},{href:"/admin/skills",icon:"🤖",label:"MCP Skills"},{href:"/admin/settings",icon:"⚙️",label:n("settings",a)}];return e.jsxs("div",{className:"admin-container",children:[e.jsxs("aside",{className:"admin-sidebar",children:[e.jsxs("div",{className:"sidebar-header",children:[e.jsxs("h2",{children:["⚙️ ",n("adminPanel",a)]}),e.jsx("p",{className:"version",children:"v0.1.0"})]}),e.jsx("nav",{className:"sidebar-nav",children:m.map((i,c)=>i.submenu?e.jsxs("div",{className:"nav-group",children:[e.jsxs("div",{className:"nav-item nav-group-header",children:[e.jsx("span",{className:"icon",children:i.icon}),e.jsx("span",{children:i.label})]}),e.jsx("div",{className:"submenu",children:i.submenu.map(s=>e.jsx("a",{href:s.href,className:`nav-item submenu-item ${d===s.href?"active":""}`,children:e.jsx("span",{children:s.label})},s.href))})]},`submenu-${c}`):e.jsxs("a",{href:i.href,className:`nav-item ${d===i.href?"active":""}`,children:[e.jsx("span",{className:"icon",children:i.icon}),e.jsx("span",{children:i.label})]},i.href))}),e.jsx("div",{className:"sidebar-footer",children:e.jsxs("a",{href:"/map",className:"nav-item",children:[e.jsx("span",{className:"icon",children:"🗺️"}),e.jsx("span",{children:n("toMap",a)})]})})]}),e.jsxs("main",{className:"admin-main",children:[e.jsxs("header",{className:"admin-header",children:[e.jsxs("div",{children:[e.jsx("h1",{children:o||n("adminPanel",a)}),r&&e.jsx("p",{className:"subtitle",children:r})]}),e.jsxs("div",{className:"header-actions",children:[e.jsx(h,{}),t]})]}),e.jsx("div",{className:"admin-content",children:l})]}),e.jsx("style",{jsx:!0,children:`
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

        .nav-group {
          margin-bottom: 8px;
        }

        .nav-group-header {
          cursor: default;
          font-weight: 500;
        }

        .submenu {
          background: rgba(0, 0, 0, 0.2);
          border-left: 2px solid rgba(255, 255, 255, 0.1);
          margin-left: 20px;
        }

        .submenu-item {
          padding-left: 44px;
          font-size: 14px;
        }

        .submenu-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .submenu-item.active {
          background: rgba(59, 130, 246, 0.2);
          border-left: 3px solid #3b82f6;
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
      `})]})}export{u as default};
