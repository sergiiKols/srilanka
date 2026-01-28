import{j as r}from"./jsx-runtime.D_zvdyIk.js";import{r as o}from"./index.JXKNaeUN.js";function l(){const[t,n]=o.useState("ru");o.useEffect(()=>{const e=localStorage.getItem("admin_lang");e&&n(e)},[]);const a=()=>{const e=t==="en"?"ru":"en";n(e),localStorage.setItem("admin_lang",e),window.dispatchEvent(new CustomEvent("languageChange",{detail:e})),window.location.reload()};return r.jsxs("button",{onClick:a,className:"lang-switcher",children:[t==="en"?"🇬🇧 EN":"🇷🇺 RU",r.jsx("style",{jsx:!0,children:`
        .lang-switcher {
          padding: 8px 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lang-switcher:hover {
          border-color: #3b82f6;
          background: #f9fafb;
        }
      `})]})}function c(){const[t,n]=o.useState("ru");return o.useEffect(()=>{const a=localStorage.getItem("admin_lang");a&&n(a);const e=s=>{n(s.detail)};return window.addEventListener("languageChange",e),()=>window.removeEventListener("languageChange",e)},[]),t}export{l as L,c as u};
