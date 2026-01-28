import React, { useState, useEffect } from 'react';

export default function TelegramFormsList() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadForms();
    loadStats();
  }, []);

  const loadForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      const result = await response.json();
      if (result.success) {
        setForms(result.data || []);
      }
    } catch (error) {
      console.error('Load forms error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту форму? Все связанные заявки также будут удалены.')) return;

    try {
      const response = await fetch(`/api/admin/forms/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Форма удалена');
        loadForms();
        loadStats();
      } else {
        alert('Ошибка удаления');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Ошибка удаления');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        loadForms();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{stats.total_forms}</div>
            <div className="text-sm text-gray-600 mt-1">Всего форм</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-green-600">{stats.active_forms}</div>
            <div className="text-sm text-gray-600 mt-1">Активных</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">{stats.total_submissions}</div>
            <div className="text-sm text-gray-600 mt-1">Всего заявок</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-3xl font-bold text-purple-600">{stats.submissions_today}</div>
            <div className="text-sm text-gray-600 mt-1">Заявок сегодня</div>
          </div>
        </div>
      )}

      {/* Список форм */}
      {forms.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <p className="text-gray-500 mb-4">У вас пока нет форм</p>
          <a href="/admin/forms/telegram/new" className="text-blue-600 hover:underline">
            Создать первую форму
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{form.title}</h3>
                    {form.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Активна
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        Неактивна
                      </span>
                    )}
                  </div>
                  {form.description && (
                    <p className="text-gray-600 mb-3">{form.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div>📝 {form.fields?.length || 0} полей</div>
                    <div>📨 {form.total_submissions || 0} заявок</div>
                    {form.last_submission_at && (
                      <div>
                        Последняя: {new Date(form.last_submission_at).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/forms/telegram/${form.id}`}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Редактировать
                  </a>
                  <a
                    href={`/admin/forms/telegram/${form.id}/submissions`}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Заявки
                  </a>
                  <button
                    onClick={() => toggleActive(form.id, form.is_active)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {form.is_active ? 'Деактивировать' : 'Активировать'}
                  </button>
                  <button
                    onClick={() => handleDelete(form.id)}
                    className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <strong>Web App URL: </strong>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {typeof window !== 'undefined' && `${window.location.origin}/telegram-app?form_id=${form.id}`}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
