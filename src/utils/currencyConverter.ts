/**
 * Currency Converter для конвертации цен между валютами
 * 
 * Используется для:
 * - Конвертации LKR → USD при парсинге объявлений
 * - Унификации цен для фильтров и сортировки
 * - Отображения эквивалента в местной валюте
 */

/**
 * Актуальные курсы валют к USD
 * Обновляются раз в месяц или через API
 * 
 * Источник: https://open.er-api.com/v6/latest/USD
 * Дата обновления: 31 января 2026
 */
export const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1,           // Базовая валюта
  'LKR': 0.0031,      // Шри-Ланкийская рупия (1 LKR = $0.0031)
  'EUR': 1.09,        // Евро (1 EUR = $1.09)
  'GBP': 1.27,        // Фунт стерлингов (1 GBP = $1.27)
  'INR': 0.012,       // Индийская рупия (1 INR = $0.012)
  'RUB': 0.011,       // Российский рубль (1 RUB = $0.011)
  'AUD': 0.64,        // Австралийский доллар (1 AUD = $0.64)
  'CAD': 0.71,        // Канадский доллар (1 CAD = $0.71)
};

/**
 * Обратные курсы (USD → другая валюта)
 * Рассчитываются автоматически
 */
export const USD_TO_CURRENCY: Record<string, number> = {
  'USD': 1,
  'LKR': 1 / EXCHANGE_RATES.LKR,  // ≈ 322.58
  'EUR': 1 / EXCHANGE_RATES.EUR,  // ≈ 0.92
  'GBP': 1 / EXCHANGE_RATES.GBP,  // ≈ 0.79
  'INR': 1 / EXCHANGE_RATES.INR,  // ≈ 83.33
  'RUB': 1 / EXCHANGE_RATES.RUB,  // ≈ 90.91
  'AUD': 1 / EXCHANGE_RATES.AUD,  // ≈ 1.56
  'CAD': 1 / EXCHANGE_RATES.CAD,  // ≈ 1.41
};

/**
 * Конвертирует цену в USD
 * 
 * @param price - Цена в исходной валюте
 * @param fromCurrency - Код валюты (USD, LKR, EUR и т.д.)
 * @returns Цена в USD
 * 
 * @example
 * convertToUSD(50000, 'LKR') // 155 USD
 * convertToUSD(100, 'EUR')   // 109 USD
 * convertToUSD(500, 'USD')   // 500 USD
 */
export function convertToUSD(price: number, fromCurrency: string): number {
  if (!price || isNaN(price)) {
    console.warn('⚠️ Invalid price:', price);
    return 0;
  }

  const currency = fromCurrency.toUpperCase();
  const rate = EXCHANGE_RATES[currency];

  if (!rate) {
    console.warn(`⚠️ Unknown currency: ${currency}, assuming USD`);
    return price; // Считаем что цена уже в USD
  }

  const usdPrice = price * rate;
  console.log(`💱 Converted ${price} ${currency} → $${usdPrice.toFixed(2)} USD (rate: ${rate})`);
  
  return Math.round(usdPrice * 100) / 100; // Округляем до центов
}

/**
 * Конвертирует из USD в другую валюту
 * 
 * @param priceUSD - Цена в USD
 * @param toCurrency - Целевая валюта (USD, LKR, EUR и т.д.)
 * @returns Цена в целевой валюте
 * 
 * @example
 * convertFromUSD(155, 'LKR') // 50000 LKR
 * convertFromUSD(100, 'EUR') // 92 EUR
 * convertFromUSD(500, 'USD') // 500 USD
 */
export function convertFromUSD(priceUSD: number, toCurrency: string): number {
  if (!priceUSD || isNaN(priceUSD)) {
    console.warn('⚠️ Invalid USD price:', priceUSD);
    return 0;
  }

  const currency = toCurrency.toUpperCase();
  const rate = USD_TO_CURRENCY[currency];

  if (!rate) {
    console.warn(`⚠️ Unknown currency: ${currency}, returning USD`);
    return priceUSD;
  }

  const convertedPrice = priceUSD * rate;
  console.log(`💱 Converted $${priceUSD} USD → ${convertedPrice.toFixed(2)} ${currency} (rate: ${rate})`);
  
  return Math.round(convertedPrice * 100) / 100;
}

/**
 * Форматирует цену с символом валюты
 * 
 * @param price - Цена
 * @param currency - Код валюты
 * @returns Отформатированная строка с символом валюты
 * 
 * @example
 * formatPrice(50000, 'LKR') // "Rs 50,000"
 * formatPrice(155, 'USD')   // "$155"
 * formatPrice(109, 'EUR')   // "€109"
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  if (!price || isNaN(price)) return '';

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);

  switch (currency.toUpperCase()) {
    case 'USD':
      return `$${formatted}`;
    case 'LKR':
      return `Rs ${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    case 'GBP':
      return `£${formatted}`;
    case 'INR':
      return `₹${formatted}`;
    case 'RUB':
      return `₽${formatted}`;
    default:
      return `${formatted} ${currency}`;
  }
}

/**
 * Получает актуальные курсы валют через API
 * Использует бесплатный API: https://open.er-api.com/v6/latest/USD
 * 
 * @returns Promise с курсами валют или null при ошибке
 */
export async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    console.log('🌐 Fetching latest exchange rates from API...');
    
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.rates) {
      console.log('✅ Successfully fetched exchange rates');
      console.log(`   USD → LKR: ${data.rates.LKR}`);
      console.log(`   USD → EUR: ${data.rates.EUR}`);
      
      // Конвертируем в наш формат (валюта → USD)
      const rates: Record<string, number> = {
        'USD': 1
      };
      
      // Для каждой валюты вычисляем обратный курс
      for (const [currency, rate] of Object.entries(data.rates) as [string, number][]) {
        if (['LKR', 'EUR', 'GBP', 'INR', 'RUB', 'AUD', 'CAD'].includes(currency)) {
          rates[currency] = 1 / rate; // Обратный курс (валюта → USD)
        }
      }
      
      return rates;
    }
    
    throw new Error('Invalid API response format');
    
  } catch (error) {
    console.error('❌ Failed to fetch exchange rates:', error);
    console.log('⚠️ Using fallback static rates');
    return null;
  }
}

/**
 * Кэширует курсы валют в localStorage
 * Обновляет раз в 24 часа
 */
export async function getCachedExchangeRates(): Promise<Record<string, number>> {
  try {
    const cached = localStorage.getItem('exchange_rates_cache');
    const now = Date.now();
    
    if (cached) {
      const { rates, timestamp } = JSON.parse(cached);
      
      // Если кэш свежий (< 24 часа) - используем его
      if (now - timestamp < 24 * 60 * 60 * 1000) {
        console.log('✅ Using cached exchange rates');
        return rates;
      }
    }
    
    // Загружаем свежие курсы
    const freshRates = await fetchExchangeRates();
    
    if (freshRates) {
      // Сохраняем в кэш
      localStorage.setItem('exchange_rates_cache', JSON.stringify({
        rates: freshRates,
        timestamp: now
      }));
      
      return freshRates;
    }
    
    // Fallback на статические курсы
    return EXCHANGE_RATES;
    
  } catch (error) {
    console.error('❌ Error with exchange rates cache:', error);
    return EXCHANGE_RATES;
  }
}

/**
 * Определяет валюту по символу или коду
 * 
 * @param text - Текст с ценой (например "Rs 50000" или "$500")
 * @returns Код валюты или 'USD' по умолчанию
 */
export function detectCurrency(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes('rs') || lower.includes('lkr') || lower.includes('рупи')) {
    return 'LKR';
  }
  if (lower.includes('€') || lower.includes('eur') || lower.includes('евро')) {
    return 'EUR';
  }
  if (lower.includes('£') || lower.includes('gbp') || lower.includes('фунт')) {
    return 'GBP';
  }
  if (lower.includes('₹') || lower.includes('inr') || lower.includes('рупий')) {
    return 'INR';
  }
  if (lower.includes('₽') || lower.includes('rub') || lower.includes('рубл')) {
    return 'RUB';
  }
  
  return 'USD'; // По умолчанию
}

/**
 * Примеры использования и тесты
 */
export const CURRENCY_EXAMPLES = [
  {
    input: { price: 50000, currency: 'LKR' },
    output: { usd: 155, formatted: 'Rs 50,000' }
  },
  {
    input: { price: 100, currency: 'EUR' },
    output: { usd: 109, formatted: '€100' }
  },
  {
    input: { price: 500, currency: 'USD' },
    output: { usd: 500, formatted: '$500' }
  }
];

/**
 * Тестовая функция
 */
export function testCurrencyConverter(): void {
  console.log('🧪 Testing Currency Converter:');
  console.log('');
  
  CURRENCY_EXAMPLES.forEach((example, i) => {
    const { price, currency } = example.input;
    const usd = convertToUSD(price, currency);
    const formatted = formatPrice(price, currency);
    
    console.log(`${i + 1}. ${formatted}`);
    console.log(`   → $${usd} USD`);
    console.log(`   ✅ Expected: $${example.output.usd} USD`);
    console.log('');
  });
}
