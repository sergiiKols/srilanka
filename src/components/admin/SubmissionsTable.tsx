/**
 * SubmissionsTable - таблица заявок с фильтрацией и экспортом
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { FormSubmission, SubmissionFilters } from '../../types/telegram.types';

interface SubmissionsTableProps {
  formId: string;
}

export default function SubmissionsTable({ formId }: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  
  // Фильтры и пагинация
  const [filters, setFilters] = useState<SubmissionFilters>({
    form_id: formId,
    limit: 50,
    offset: 0,
    sort: 'created_at',
    order: 'desc',
  });
  
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Загрузка заявок
  const loadSubmissions = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/admin/forms/${formId}/submissions?${params}`);
      const result = await response.json();

      if (result.success) {
        setSubmissions(result.data || []);
        setTotal(result.count || 0);
        setStats(result.stats || null);
      } else {
        toast.error('Ошибка загрузки заявок');
      }
    } catch (error) {
      console.error('Load submissions error:', error);
      toast.error('Ошибка загрузки заявок');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [filters]);

  // Авто-обновление каждые 10 секунд
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSubmissions();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, filters]);

  // Экспорт в CSV
  const handleExport = async () => {
    try {
      toast.loading('Экспорт...', { id: 'export' });
      
      const params = new URLSearchParams();
      params.append('export', 'csv');
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'limit' && key !== 'offset') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/admin/forms/${formId}/submissions?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `submissions_${formId}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('Экспорт завершен', { id: 'export' });
      } else {
        toast.error('Ошибка экспорта', { id: 'export' });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка экспорта', { id: 'export' });
    }
  };

  // Удаление заявки
  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту заявку?')) return;

    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Заявка удалена');
        loadSubmissions();
      } else {
        toast.error('Ошибка удаления');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Ошибка удаления');
    }
  };

  // Пагинация
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = Math.ceil(total / filters.limit);

  const goToPage = (page: number) => {
    setFilters({
      ...filters,
      offset: (page - 1) * filters.limit,
    });
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Статус badge
  const getStatusBadge = (status: FormSubmission['status']) => {
    const colors = {
      received: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };

    const labels = {
      received: 'Получено',
      processing: 'Обработка',
      sent: 'Отправлено',
      error: 'Ошибка',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Всего заявок</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-sm text-gray-600">Отправлено</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <div className="text-sm text-gray-600">Ошибок</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.success_rate}%</div>
            <div className="text-sm text-gray-600">Успешность</div>
          </div>
        </div>
      )}

      {/* Панель управления */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Заявки ({total})</h2>
          
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Авто-обновление (10с)
            </label>
            
            <button
              onClick={() => loadSubmissions()}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              🔄 Обновить
            </button>
            
            <button
              onClick={handleExport}
              className="px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 rounded"
            >
              📥 Экспорт CSV
            </button>
          </div>
        </div>

        {/* Фильтры */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined, offset: 0 })}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Все статусы</option>
            <option value="received">Получено</option>
            <option value="processing">Обработка</option>
            <option value="sent">Отправлено</option>
            <option value="error">Ошибка</option>
          </select>

          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined, offset: 0 })}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="Дата от"
          />

          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined, offset: 0 })}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="Дата до"
          />

          <select
            value={filters.limit}
            onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), offset: 0 })}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="10">10 на странице</option>
            <option value="25">25 на странице</option>
            <option value="50">50 на странице</option>
            <option value="100">100 на странице</option>
          </select>
        </div>
      </div>

      {/* Таблица */}
      {submissions.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center text-gray-500">
          Заявок пока нет
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Данные</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {submission.first_name} {submission.last_name}
                      </div>
                      {submission.username && (
                        <div className="text-gray-500">@{submission.username}</div>
                      )}
                      <div className="text-xs text-gray-400">ID: {submission.user_id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="text-blue-600 hover:underline"
                      >
                        Просмотр
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="text-red-600 hover:underline"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Показано {filters.offset + 1} - {Math.min(filters.offset + filters.limit, total)} из {total}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Назад
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Вперёд →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Модальное окно с деталями заявки */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Детали заявки</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">ID заявки</div>
                <div className="font-mono text-sm">{selectedSubmission.id}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Дата создания</div>
                <div>{formatDate(selectedSubmission.created_at)}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Пользователь</div>
                <div>
                  {selectedSubmission.first_name} {selectedSubmission.last_name}
                  {selectedSubmission.username && ` (@${selectedSubmission.username})`}
                  <br />
                  <span className="text-xs text-gray-400">Telegram ID: {selectedSubmission.user_id}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Статус</div>
                <div>{getStatusBadge(selectedSubmission.status)}</div>
              </div>

              {selectedSubmission.error_message && (
                <div>
                  <div className="text-sm text-gray-500">Ошибка</div>
                  <div className="text-red-600 text-sm">{selectedSubmission.error_message}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-500 mb-2">Данные формы</div>
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  {Object.entries(selectedSubmission.data).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-xs text-gray-500 uppercase">{key}</div>
                      <div className="font-medium">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSubmission.telegram_message_id && (
                <div>
                  <div className="text-sm text-gray-500">Telegram Message ID</div>
                  <div className="font-mono text-sm">{selectedSubmission.telegram_message_id}</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
