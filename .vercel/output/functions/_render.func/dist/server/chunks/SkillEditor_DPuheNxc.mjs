import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

const SKILL_TEMPLATE = `## Name: New Skill

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
`;
function SkillEditor({ skillId }) {
  const isNew = skillId === "new";
  const [id, setId] = useState(isNew ? "" : skillId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(isNew ? SKILL_TEMPLATE : "");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState("edit");
  useEffect(() => {
    if (!isNew) {
      loadSkill();
    }
  }, [skillId]);
  const loadSkill = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/skills/${skillId}`);
      const data = await response.json();
      if (response.ok) {
        setId(data.id);
        setName(data.name);
        setDescription(data.description);
        setContent(data.content);
        setError(null);
      } else {
        setError(data.error || "Failed to load skill");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!id.trim()) {
      setError("ID обязателен");
      return;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
      setError("ID может содержать только буквы, цифры и дефисы");
      return;
    }
    if (!content.trim()) {
      setError("Содержимое SKILL.md обязательно");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const url = isNew ? "/api/admin/skills" : `/api/admin/skills/${skillId}`;
      const method = isNew ? "POST" : "PUT";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, description, content })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Skill успешно сохранён!");
        if (isNew) {
          setTimeout(() => {
            window.location.href = `/admin/skills/${id}`;
          }, 1500);
        }
      } else {
        setError(data.error || "Failed to save skill");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };
  const handleTest = async () => {
    if (isNew) {
      setError("Сначала сохраните skill перед тестированием");
      return;
    }
    try {
      setTesting(true);
      setError(null);
      setTestResult(null);
      const response = await fetch(`/api/admin/skills/${skillId}/test`, {
        method: "POST"
      });
      const data = await response.json();
      if (response.ok) {
        setTestResult(data);
      } else {
        setError(data.error || "Failed to test skill");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setTesting(false);
    }
  };
  useEffect(() => {
    const nameMatch = content.match(/##\s*Name:\s*(.+)/);
    const descMatch = content.match(/##\s*Description:\s*\n(.+)/);
    if (nameMatch) setName(nameMatch[1].trim());
    if (descMatch) setDescription(descMatch[1].trim());
  }, [content]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-8 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900", children: isNew ? "Создать новый Skill" : `Редактировать: ${name || id}` }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-600", children: isNew ? "Заполните информацию о новом skill" : "Редактируйте содержимое skill" })
        ] }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/admin/skills",
            className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
              "Назад к списку"
            ]
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-red-600 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-red-800", children: error })
      ] }) }),
      success && /* @__PURE__ */ jsx("div", { className: "mb-4 p-4 bg-green-50 border border-green-200 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-600 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-green-800", children: success })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow-md mb-6", children: /* @__PURE__ */ jsx("div", { className: "border-b border-gray-200", children: /* @__PURE__ */ jsxs("nav", { className: "flex -mb-px", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("edit"),
          className: `py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === "edit" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
          children: "✏️ Редактирование"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("preview"),
          className: `py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === "preview" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
          children: "📋 Описание задачи"
        }
      )
    ] }) }) }),
    activeTab === "edit" && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [
          "ID Skill ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: id,
            onChange: (e) => setId(e.target.value),
            disabled: !isNew,
            placeholder: "my-awesome-skill",
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-gray-500", children: [
          "Только латиница, цифры и дефисы. ",
          !isNew && "ID нельзя изменить после создания."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Название (парсится автоматически из SKILL.md)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: name,
            readOnly: true,
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Описание (парсится автоматически из SKILL.md)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: description,
            readOnly: true,
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [
          "Содержимое SKILL.md ",
          /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: content,
            onChange: (e) => setContent(e.target.value),
            rows: 20,
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm",
            placeholder: "Введите markdown содержимое..."
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Markdown формат. Name и Description будут автоматически распознаны из заголовков." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSave,
            disabled: saving,
            className: "flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
              ] }),
              "Сохранение..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" }) }),
              "Сохранить"
            ] })
          }
        ),
        !isNew && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleTest,
            disabled: testing,
            className: "flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            children: testing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
              ] }),
              "Проверка..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
              "Проверить выполнение"
            ] })
          }
        )
      ] })
    ] }),
    activeTab === "preview" && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [
      /* @__PURE__ */ jsx("div", { className: "prose max-w-none", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "markdown-preview",
          dangerouslySetInnerHTML: {
            __html: content.replace(/^### /gm, "<h3>").replace(/^## /gm, "<h2>").replace(/^# /gm, "<h1>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>").replace(/`(.*?)`/g, "<code>$1</code>").replace(/\n\n/g, "</p><p>").replace(/^(.+)$/gm, "<p>$1</p>")
          }
        }
      ) }),
      /* @__PURE__ */ jsx("style", { jsx: true, children: `
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
          ` })
    ] }),
    testResult && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Результаты проверки" }),
      /* @__PURE__ */ jsx("div", { className: "mb-4 p-4 bg-gray-50 rounded-lg", children: /* @__PURE__ */ jsx("pre", { className: "text-sm whitespace-pre-wrap font-mono", children: testResult.message }) }),
      testResult.execution && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Выполнение скрипта:" }),
          /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-lg ${testResult.execution.success ? "bg-green-50" : "bg-red-50"}`, children: [
            /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${testResult.execution.success ? "text-green-800" : "text-red-800"}`, children: testResult.execution.success ? "✅ Успешно" : "❌ Ошибка" }),
            testResult.execution.script && /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
              "Скрипт: ",
              testResult.execution.script
            ] })
          ] })
        ] }),
        testResult.execution.stdout && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "STDOUT:" }),
          /* @__PURE__ */ jsx("pre", { className: "p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto", children: testResult.execution.stdout })
        ] }),
        testResult.execution.stderr && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "STDERR:" }),
          /* @__PURE__ */ jsx("pre", { className: "p-4 bg-gray-900 text-red-400 rounded-lg text-sm overflow-x-auto", children: testResult.execution.stderr })
        ] }),
        testResult.execution.error && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Ошибка:" }),
          /* @__PURE__ */ jsx("pre", { className: "p-4 bg-red-50 text-red-800 rounded-lg text-sm overflow-x-auto", children: testResult.execution.error })
        ] })
      ] })
    ] })
  ] });
}

export { SkillEditor as S };
