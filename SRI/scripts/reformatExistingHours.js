/**
 * Переформатирование существующих часов работы
 * Применяет улучшенную функцию formatOpeningHours к данным
 * БЕЗ API вызовов - работает с существующими данными
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { formatOpeningHours } from './formatOpeningHours.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../parsed_data/negombo_tangalle/pass_1_0-1km.json');
const OUTPUT_FILE = path.join(__dirname, '../parsed_data/negombo_tangalle/pass_1_0-1km.json');
const BACKUP_FILE = path.join(__dirname, `../parsed_data/negombo_tangalle/pass_1_0-1km_backup_before_reformat_${Date.now()}.json`);

console.log('');
console.log('='.repeat(70));
console.log('REFORMATTING OPENING HOURS');
console.log('='.repeat(70));
console.log('');

// Загружаем данные
console.log('📂 Loading data...');
const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
console.log(`   Loaded: ${data.length} POIs`);
console.log('');

// Создаём бэкап
console.log('💾 Creating backup...');
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log(`   Backup: ${path.basename(BACKUP_FILE)}`);
console.log('');

// Статистика
let reformatted = 0;
let withoutHours = 0;
let alreadyShort = 0;

console.log('🔄 Reformatting hours...');
console.log('');

// Обрабатываем каждый POI
data.forEach((poi, index) => {
  if (!poi.hours || poi.hours === '') {
    withoutHours++;
    return;
  }
  
  const originalHours = poi.hours;
  const originalLength = originalHours.length;
  
  // Пытаемся распарсить и переформатировать
  try {
    // Разбиваем на дни
    const daysParts = originalHours.split('|').map(p => p.trim());
    
    // Проверяем, что это формат "Day: Hours"
    if (daysParts.length === 7 && daysParts[0].includes(':')) {
      // Применяем форматирование
      const newHours = formatOpeningHours(daysParts);
      
      if (newHours && newHours !== originalHours) {
        poi.hours = newHours;
        reformatted++;
        
        const newLength = newHours.length;
        const reduction = ((originalLength - newLength) / originalLength * 100).toFixed(0);
        
        if ((index + 1) % 100 === 0) {
          console.log(`   Processed ${index + 1}/${data.length} POIs...`);
        }
        
        // Показываем примеры
        if (reformatted <= 5) {
          console.log(`   Example ${reformatted}:`);
          console.log(`     Before (${originalLength} chars): ${originalHours.substring(0, 80)}...`);
          console.log(`     After  (${newLength} chars): ${newHours}`);
          console.log(`     Reduction: ${reduction}%`);
          console.log('');
        }
      } else {
        alreadyShort++;
      }
    } else {
      alreadyShort++;
    }
  } catch (error) {
    console.log(`   ⚠️  Error processing POI ${poi.name}: ${error.message}`);
  }
});

console.log('');
console.log('='.repeat(70));
console.log('RESULTS');
console.log('='.repeat(70));
console.log('');
console.log(`Total POIs: ${data.length}`);
console.log(`Without hours: ${withoutHours}`);
console.log(`Already short/formatted: ${alreadyShort}`);
console.log(`Reformatted: ${reformatted}`);
console.log('');

if (reformatted > 0) {
  // Сохраняем
  console.log('💾 Saving reformatted data...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`   ✅ Saved to: ${path.basename(OUTPUT_FILE)}`);
  console.log('');
  
  console.log('✅ SUCCESS!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Refresh website: http://localhost:4321 (Ctrl+F5)');
  console.log('  2. Check POI details - hours should be shorter!');
  console.log('');
} else {
  console.log('ℹ️  No hours needed reformatting.');
  console.log('');
}

console.log('='.repeat(70));
console.log('');
