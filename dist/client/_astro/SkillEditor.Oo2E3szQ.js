import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as o}from"./index.JXKNaeUN.js";const z=`## Name: New Skill

## Description: 
Brief description of what this skill does

## Purpose:
Detailed explanation of the skill's purpose and use cases

## Instructions for AI Agent:

### Step 1: [First Step]
Detailed instruction...

### Step 2: [Second Step]
Detailed instruction...

## Expected Output:
Description of what the skill should return

## Example Usage:
\`\`\`
Example of how to use this skill
\`\`\`

## Notes:
- Important note 1
- Important note 2
`;function F({skillId:i}){const t=i==="new",[d,x]=o.useState(t?"":i),[m,h]=o.useState(""),[u,p]=o.useState(""),[l,g]=o.useState(t?z:""),[T,b]=o.useState(!t),[f,j]=o.useState(!1),[w,v]=o.useState(!1),[y,a]=o.useState(null),[N,k]=o.useState(null),[r,S]=o.useState(null),[c,L]=o.useState("edit");o.useEffect(()=>{t||$()},[i]);const $=async()=>{try{b(!0);const s=await fetch(`/api/admin/skills/${i}`),n=await s.json();s.ok?(x(n.id),h(n.name),p(n.description),g(n.content),a(null)):a(n.error||"Failed to load skill")}catch(s){a(s instanceof Error?s.message:"Unknown error")}finally{b(!1)}},E=async()=>{if(!d.trim()){a("ID обязателен");return}if(!/^[a-zA-Z0-9-]+$/.test(d)){a("ID может содержать только буквы, цифры и дефисы");return}if(!l.trim()){a("Содержимое SKILL.md обязательно");return}try{j(!0),a(null),k(null);const s=t?"/api/admin/skills":`/api/admin/skills/${i}`,C=await fetch(s,{method:t?"POST":"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:d,name:m,description:u,content:l})}),M=await C.json();C.ok?(k("Skill успешно сохранён!"),t&&setTimeout(()=>{window.location.href=`/admin/skills/${d}`},1500)):a(M.error||"Failed to save skill")}catch(s){a(s instanceof Error?s.message:"Unknown error")}finally{j(!1)}},D=async()=>{if(t){a("Сначала сохраните skill перед тестированием");return}try{v(!0),a(null),S(null);const s=await fetch(`/api/admin/skills/${i}/test`,{method:"POST"}),n=await s.json();s.ok?S(n):a(n.error||"Failed to test skill")}catch(s){a(s instanceof Error?s.message:"Unknown error")}finally{v(!1)}};return o.useEffect(()=>{const s=l.match(/##\s*Name:\s*(.+)/),n=l.match(/##\s*Description:\s*\n(.+)/);s&&h(s[1].trim()),n&&p(n[1].trim())},[l]),T?e.jsx("div",{className:"p-8",children:e.jsx("div",{className:"flex items-center justify-center",children:e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"})})}):e.jsxs("div",{className:"p-8 max-w-6xl mx-auto",children:[e.jsxs("div",{className:"mb-6",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-900",children:t?"Создать новый Skill":`Редактировать: ${m||d}`}),e.jsx("p",{className:"mt-2 text-gray-600",children:t?"Заполните информацию о новом skill":"Редактируйте содержимое skill"})]}),e.jsxs("a",{href:"/admin/skills",className:"inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50",children:[e.jsx("svg",{className:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 19l-7-7m0 0l7-7m-7 7h18"})}),"Назад к списку"]})]}),y&&e.jsx("div",{className:"mb-4 p-4 bg-red-50 border border-red-200 rounded-lg",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{className:"w-5 h-5 text-red-600 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),e.jsx("span",{className:"text-red-800",children:y})]})}),N&&e.jsx("div",{className:"mb-4 p-4 bg-green-50 border border-green-200 rounded-lg",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("svg",{className:"w-5 h-5 text-green-600 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),e.jsx("span",{className:"text-green-800",children:N})]})})]}),e.jsx("div",{className:"bg-white rounded-lg shadow-md mb-6",children:e.jsx("div",{className:"border-b border-gray-200",children:e.jsxs("nav",{className:"flex -mb-px",children:[e.jsx("button",{onClick:()=>L("edit"),className:`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${c==="edit"?"border-blue-600 text-blue-600":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,children:"✏️ Редактирование"}),e.jsx("button",{onClick:()=>L("preview"),className:`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${c==="preview"?"border-blue-600 text-blue-600":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,children:"📋 Описание задачи"})]})})}),c==="edit"&&e.jsxs("div",{className:"bg-white rounded-lg shadow-md p-6 mb-6",children:[e.jsxs("div",{className:"mb-6",children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["ID Skill ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsx("input",{type:"text",value:d,onChange:s=>x(s.target.value),disabled:!t,placeholder:"my-awesome-skill",className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"}),e.jsxs("p",{className:"mt-1 text-sm text-gray-500",children:["Только латиница, цифры и дефисы. ",!t&&"ID нельзя изменить после создания."]})]}),e.jsxs("div",{className:"mb-6",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Название (парсится автоматически из SKILL.md)"}),e.jsx("input",{type:"text",value:m,readOnly:!0,className:"w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"})]}),e.jsxs("div",{className:"mb-6",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Описание (парсится автоматически из SKILL.md)"}),e.jsx("input",{type:"text",value:u,readOnly:!0,className:"w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"})]}),e.jsxs("div",{className:"mb-6",children:[e.jsxs("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Содержимое SKILL.md ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsx("textarea",{value:l,onChange:s=>g(s.target.value),rows:20,className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm",placeholder:"Введите markdown содержимое..."}),e.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Markdown формат. Name и Description будут автоматически распознаны из заголовков."})]}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx("button",{onClick:E,disabled:f,className:"flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",children:f?e.jsxs(e.Fragment,{children:[e.jsxs("svg",{className:"animate-spin -ml-1 mr-3 h-5 w-5 text-white",fill:"none",viewBox:"0 0 24 24",children:[e.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),e.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),"Сохранение..."]}):e.jsxs(e.Fragment,{children:[e.jsx("svg",{className:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"})}),"Сохранить"]})}),!t&&e.jsx("button",{onClick:D,disabled:w,className:"flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",children:w?e.jsxs(e.Fragment,{children:[e.jsxs("svg",{className:"animate-spin -ml-1 mr-3 h-5 w-5 text-white",fill:"none",viewBox:"0 0 24 24",children:[e.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),e.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),"Проверка..."]}):e.jsxs(e.Fragment,{children:[e.jsx("svg",{className:"w-5 h-5 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}),"Проверить выполнение"]})})]})]}),c==="preview"&&e.jsxs("div",{className:"bg-white rounded-lg shadow-md p-6 mb-6",children:[e.jsx("div",{className:"prose max-w-none",children:e.jsx("div",{className:"markdown-preview",dangerouslySetInnerHTML:{__html:l.replace(/^### /gm,"<h3>").replace(/^## /gm,"<h2>").replace(/^# /gm,"<h1>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/```(.*?)```/gs,"<pre><code>$1</code></pre>").replace(/`(.*?)`/g,"<code>$1</code>").replace(/\n\n/g,"</p><p>").replace(/^(.+)$/gm,"<p>$1</p>")}})}),e.jsx("style",{jsx:!0,children:`
            .markdown-preview {
              line-height: 1.8;
            }
            .markdown-preview h1 {
              font-size: 2em;
              font-weight: bold;
              margin-top: 1em;
              margin-bottom: 0.5em;
              color: #1a202c;
            }
            .markdown-preview h2 {
              font-size: 1.5em;
              font-weight: bold;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              color: #2d3748;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 0.3em;
            }
            .markdown-preview h3 {
              font-size: 1.25em;
              font-weight: bold;
              margin-top: 1em;
              margin-bottom: 0.5em;
              color: #4a5568;
            }
            .markdown-preview code {
              background-color: #f7fafc;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: monospace;
              font-size: 0.9em;
              color: #e53e3e;
            }
            .markdown-preview pre {
              background-color: #2d3748;
              color: #f7fafc;
              padding: 1em;
              border-radius: 6px;
              overflow-x: auto;
              margin: 1em 0;
            }
            .markdown-preview pre code {
              background: none;
              color: inherit;
              padding: 0;
            }
            .markdown-preview strong {
              font-weight: 600;
              color: #2d3748;
            }
            .markdown-preview p {
              margin: 0.75em 0;
            }
          `})]}),r&&e.jsxs("div",{className:"bg-white rounded-lg shadow-md p-6",children:[e.jsx("h2",{className:"text-xl font-bold text-gray-900 mb-4",children:"Результаты проверки"}),e.jsx("div",{className:"mb-4 p-4 bg-gray-50 rounded-lg",children:e.jsx("pre",{className:"text-sm whitespace-pre-wrap font-mono",children:r.message})}),r.execution&&e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900 mb-2",children:"Выполнение скрипта:"}),e.jsxs("div",{className:`p-4 rounded-lg ${r.execution.success?"bg-green-50":"bg-red-50"}`,children:[e.jsx("p",{className:`text-sm font-medium ${r.execution.success?"text-green-800":"text-red-800"}`,children:r.execution.success?"✅ Успешно":"❌ Ошибка"}),r.execution.script&&e.jsxs("p",{className:"text-sm text-gray-600 mt-1",children:["Скрипт: ",r.execution.script]})]})]}),r.execution.stdout&&e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900 mb-2",children:"STDOUT:"}),e.jsx("pre",{className:"p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto",children:r.execution.stdout})]}),r.execution.stderr&&e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900 mb-2",children:"STDERR:"}),e.jsx("pre",{className:"p-4 bg-gray-900 text-red-400 rounded-lg text-sm overflow-x-auto",children:r.execution.stderr})]}),r.execution.error&&e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900 mb-2",children:"Ошибка:"}),e.jsx("pre",{className:"p-4 bg-red-50 text-red-800 rounded-lg text-sm overflow-x-auto",children:r.execution.error})]})]})]})]})}export{F as default};
