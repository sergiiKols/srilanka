/**
 * Компонент управления курсами валют
 * Интегрирован в раздел Cron Jobs админ-панели
 * 
 * Функционал:
 * - Просмотр текущих курсов
 * - Ручное обновление
 * - История обновлений
 * - Настройка расписания
 * - Включение/отключение автообновления
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ExchangeRate {
  currency: string;
  rate: number;
  symbol: string;
  name: string;
}

interface RateLog {
  id: string;
  rates: Record<string, number>;
  api_timestamp: string;
  success: boolean;
  message: string;
  error?: string;
  created_at: string;
}

interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  enabled: boolean;
  last_run_at: string;
  last_run_status: string;
  last_run_message: string;
  next_run_at: string;
  run_count: number;
  error_count: number;
}

const CURRENCY_INFO: Record<string, { symbol: string; name: string }> = {
  'USD': { symbol: '$', name: 'US Dollar' },
  'LKR': { symbol: 'Rs', name: 'Sri Lankan Rupee' },
  'EUR': { symbol: '€', name: 'Euro' },
  'GBP': { symbol: '£', name: 'British Pound' },
  'INR': { symbol: '₹', name: 'Indian Rupee' },
  'RUB': { symbol: '₽', name: 'Russian Ruble' },
  'AUD': { symbol: 'A$', name: 'Australian Dollar' },
  'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
};

export default function ExchangeRatesManager() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [cronJob, setCronJob] = useState<CronJob | null>(null);
  const [logs, setLogs] = useState<RateLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newSchedule, setNewSchedule] = useState('');
  const [showScheduleEdit, setShowScheduleEdit] = useState(false);

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Загружаем cron задачу
      const { data: jobData, error: jobError } = await supabase
        .from('cron_jobs')
        .select('*')
        .eq('name', 'update_exchange_rates')
        .single();

      if (jobError) throw jobError;
      setCronJob(jobData);
      setNewSchedule(jobData.schedule);

      // 2. Загружаем последние курсы
      const { data: ratesData, error: ratesError } = await supabase
        .from('exchange_rates_log')
        .select('*')
        .eq('success', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (ratesData && ratesData.rates) {
        const ratesArray: ExchangeRate[] = Object.entries(ratesData.rates).map(([currency, rate]) => ({
          currency,
          rate: rate as number,
          symbol: CURRENCY_INFO[currency]?.symbol || currency,
          name: CURRENCY_INFO[currency]?.name || currency,
        }));
        setRates(ratesArray);
      }

      // 3. Загружаем историю (последние 10)
      const { data: logsData, error: logsError } = await supabase
        .from('exchange_rates_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsData) {
        setLogs(logsData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Ручное обновление курсов
  async function handleManualUpdate() {
    setUpdating(true);
    try {
      console.log('🔄 Manually triggering exchange rates update...');

      // Получаем URL и ключ из конфигурации Supabase
      const supabaseUrl = (supabase as any).supabaseUrl;
      const supabaseKey = (supabase as any).supabaseKey;

      // Вызываем Edge Function
      const response = await fetch(
        `${supabaseUrl}/functions/v1/update-exchange-rates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('✅ Курсы валют успешно обновлены!');
        await loadData(); // Перезагружаем данные
      } else {
        alert(`❌ Ошибка: ${result.message}`);
      }

    } catch (error) {
      console.error('Error updating rates:', error);
      alert('❌ Ошибка при обновлении курсов');
    } finally {
      setUpdating(false);
    }
  }

  // Включение/отключение автообновления
  async function toggleAutoUpdate() {
    if (!cronJob) return;

    try {
      const { error } = await supabase
        .from('cron_jobs')
        .update({ enabled: !cronJob.enabled })
        .eq('id', cronJob.id);

      if (error) throw error;

      setCronJob({ ...cronJob, enabled: !cronJob.enabled });
      alert(`Автообновление ${!cronJob.enabled ? 'включено' : 'отключено'}`);

    } catch (error) {
      console.error('Error toggling auto-update:', error);
      alert('Ошибка при изменении настроек');
    }
  }

  // Сохранение нового расписания
  async function handleSaveSchedule() {
    if (!cronJob) return;

    try {
      const { error } = await supabase
        .from('cron_jobs')
        .update({ schedule: newSchedule })
        .eq('id', cronJob.id);

      if (error) throw error;

      await loadData();
      setShowScheduleEdit(false);
      alert('✅ Расписание обновлено');

    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Ошибка при обновлении расписания');
    }
  }

  // Форматирование даты
  function formatDate(dateString: string) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  }

  // Расшифровка cron выражения
  function explainCron(schedule: string) {
    const parts = schedule.split(' ');
    if (parts.length !== 5) return schedule;

    const [min, hour, day, month, weekday] = parts;

    if (min === '0' && hour === '3' && day === '*' && month === '*' && weekday === '*') {
      return 'Каждый день в 3:00 утра';
    }
    if (min === '0' && hour === '*') {
      return 'Каждый час';
    }
    if (min === '*/30') {
      return 'Каждые 30 минут';
    }
    return schedule;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Курсы валют</h2>
          <p className="text-sm text-gray-600 mt-1">
            Автоматическое обновление через API: <a href="https://open.er-api.com" target="_blank" className="text-blue-600 hover:underline">open.er-api.com</a>
          </p>
        </div>
        <button
          onClick={handleManualUpdate}
          disabled={updating}
          className={`px-4 py-2 rounded-lg font-medium ${
            updating
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {updating ? '⏳ Обновление...' : '🔄 Обновить сейчас'}
        </button>
      </div>

      {/* Статус автообновления */}
      {cronJob && (
        <div className={`p-4 rounded-lg border-2 ${
          cronJob.enabled ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">
                  {cronJob.enabled ? '✅ Автообновление включено' : '⏸️ Автообновление отключено'}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p><strong>Расписание:</strong> {explainCron(cronJob.schedule)} <code className="bg-gray-200 px-2 py-0.5 rounded">{cronJob.schedule}</code></p>
                {cronJob.enabled && cronJob.next_run_at && (
                  <p><strong>Следующее обновление:</strong> {formatDate(cronJob.next_run_at)}</p>
                )}
                {cronJob.last_run_at && (
                  <p>
                    <strong>Последний запуск:</strong> {formatDate(cronJob.last_run_at)}
                    {cronJob.last_run_status === 'success' ? ' ✅' : ' ❌'}
                  </p>
                )}
                <p><strong>Статистика:</strong> {cronJob.run_count} запусков, {cronJob.error_count} ошибок</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={toggleAutoUpdate}
                className={`px-4 py-2 rounded-lg font-medium ${
                  cronJob.enabled
                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {cronJob.enabled ? 'Отключить' : 'Включить'}
              </button>
              <button
                onClick={() => setShowScheduleEdit(!showScheduleEdit)}
                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                ⚙️ Настроить
              </button>
            </div>
          </div>

          {/* Редактирование расписания */}
          {showScheduleEdit && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <h3 className="font-semibold mb-2">Изменить расписание</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  placeholder="0 3 * * *"
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
                <p className="text-xs text-gray-600">
                  Формат cron: <code>минута час день месяц день_недели</code><br/>
                  Примеры:<br/>
                  • <code>0 3 * * *</code> - каждый день в 3:00<br/>
                  • <code>0 */6 * * *</code> - каждые 6 часов<br/>
                  • <code>0 0 * * 0</code> - каждое воскресенье в полночь
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveSchedule}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setShowScheduleEdit(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Текущие курсы */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Текущие курсы</h3>
        {rates.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rates.map((rate) => (
              <div key={rate.currency} className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{rate.symbol}</div>
                <div className="text-sm text-gray-600">{rate.name}</div>
                <div className="mt-2 text-lg font-semibold">
                  1 {rate.currency} = ${rate.rate.toFixed(6)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  $1 = {(1 / rate.rate).toFixed(2)} {rate.currency}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Курсы еще не загружены. Нажмите "Обновить сейчас".</p>
        )}
      </div>

      {/* История обновлений */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">История обновлений</h3>
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border ${
                  log.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span>{log.success ? '✅' : '❌'}</span>
                      <span className="font-medium">{log.message}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatDate(log.created_at)}
                      {log.api_timestamp && ` • API: ${formatDate(log.api_timestamp)}`}
                    </div>
                    {log.error && (
                      <div className="text-xs text-red-600 mt-1">
                        Ошибка: {log.error}
                      </div>
                    )}
                  </div>
                  {log.rates && (
                    <div className="text-xs text-gray-500">
                      {Object.keys(log.rates).length} валют
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">История пуста</p>
        )}
      </div>
    </div>
  );
}
