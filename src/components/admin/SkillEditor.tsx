import { useState, useEffect } from 'react';

interface SkillEditorProps {
  skillId: string;
}

interface TestResult {
  success: boolean;
  skillId: string;
  checks: {
    skillMdExists: boolean;
    scriptsFolderExists: boolean;
    hasScripts: boolean;
    scripts: string[];
  };
  execution: {
    success: boolean;
    stdout?: string;
    stderr?: string;
    error?: string;
    script?: string;
  } | null;
  message: string;
}

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

export default function SkillEditor({ skillId }: SkillEditorProps) {
  const isNew = skillId === 'new';
  
  const [id, setId] = useState(isNew ? '' : skillId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(isNew ? SKILL_TEMPLATE : '');
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

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
        setError(data.error || 'Failed to load skill');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Валидация
    if (!id.trim()) {
      setError('ID обязателен');
      return;
    }
    
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
      setError('ID может содержать только буквы, цифры и дефисы');
      return;
    }

    if (!content.trim()) {
      setError('Содержимое SKILL.md обязательно');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const url = isNew ? '/api/admin/skills' : `/api/admin/skills/${skillId}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description, content })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Skill успешно сохранён!');
        if (isNew) {
          // Редирект на страницу редактирования
          setTimeout(() => {
            window.location.href = `/admin/skills/${id}`;
          }, 1500);
        }
      } else {
        setError(data.error || 'Failed to save skill');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (isNew) {
      setError('Сначала сохраните skill перед тестированием');
      return;
    }

    try {
      setTesting(true);
      setError(null);
      setTestResult(null);

      const response = await fetch(`/api/admin/skills/${skillId}/test`, {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult(data);
      } else {
        setError(data.error || 'Failed to test skill');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  // Автоматически парсим name и description из контента
  useEffect(() => {
    const nameMatch = content.match(/##\s*Name:\s*(.+)/);
    const descMatch = content.match(/##\s*Description:\s*\n(.+)/);
    
    if (nameMatch) setName(nameMatch[1].trim());
    if (descMatch) setDescription(descMatch[1].trim());
  }, [content]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Создать новый Skill' : `Редактировать: ${name || id}`}
            </h1>
            <p className="mt-2 text-gray-600">
              {isNew ? 'Заполните информацию о новом skill' : 'Редактируйте содержимое skill'}
            </p>
          </div>
          <a
            href="/admin/skills"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к списку
          </a>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'edit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✏️ Редактирование
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Описание задачи
            </button>
          </nav>
        </div>
      </div>

      {/* Form */}
      {activeTab === 'edit' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* ID Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Skill <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={!isNew}
            placeholder="my-awesome-skill"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-sm text-gray-500">
            Только латиница, цифры и дефисы. {!isNew && 'ID нельзя изменить после создания.'}
          </p>
        </div>

        {/* Name Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название (парсится автоматически из SKILL.md)
          </label>
          <input
            type="text"
            value={name}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
        </div>

        {/* Description Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание (парсится автоматически из SKILL.md)
          </label>
          <input
            type="text"
            value={description}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
        </div>

        {/* Content Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Содержимое SKILL.md <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Введите markdown содержимое..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Markdown формат. Name и Description будут автоматически распознаны из заголовков.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Сохранение...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Сохранить
              </>
            )}
          </button>

          {!isNew && (
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Проверка...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Проверить выполнение
                </>
              )}
            </button>
          )}
        </div>
      </div>
      )}

      {/* Preview Tab - Markdown Preview */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="prose max-w-none">
            <div 
              className="markdown-preview"
              dangerouslySetInnerHTML={{ 
                __html: content
                  .replace(/^### /gm, '<h3>')
                  .replace(/^## /gm, '<h2>')
                  .replace(/^# /gm, '<h1>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/^(.+)$/gm, '<p>$1</p>')
              }}
            />
          </div>
          
          <style jsx>{`
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
          `}</style>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Результаты проверки</h2>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap font-mono">{testResult.message}</pre>
          </div>

          {testResult.execution && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Выполнение скрипта:</h3>
                <div className={`p-4 rounded-lg ${testResult.execution.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm font-medium ${testResult.execution.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.execution.success ? '✅ Успешно' : '❌ Ошибка'}
                  </p>
                  {testResult.execution.script && (
                    <p className="text-sm text-gray-600 mt-1">Скрипт: {testResult.execution.script}</p>
                  )}
                </div>
              </div>

              {testResult.execution.stdout && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">STDOUT:</h3>
                  <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto">
                    {testResult.execution.stdout}
                  </pre>
                </div>
              )}

              {testResult.execution.stderr && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">STDERR:</h3>
                  <pre className="p-4 bg-gray-900 text-red-400 rounded-lg text-sm overflow-x-auto">
                    {testResult.execution.stderr}
                  </pre>
                </div>
              )}

              {testResult.execution.error && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ошибка:</h3>
                  <pre className="p-4 bg-red-50 text-red-800 rounded-lg text-sm overflow-x-auto">
                    {testResult.execution.error}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
