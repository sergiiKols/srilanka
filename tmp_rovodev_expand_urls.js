/**
 * Разворачивает короткие Google Maps ссылки
 * Запуск: node tmp_rovodev_expand_urls.js
 */

import https from 'https';
import http from 'http';

/**
 * Разворачивает короткую ссылку следуя редиректам
 */
async function expandUrl(shortUrl) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔗 Разворачиваю: ${shortUrl}`);
        
        const urlObj = new URL(shortUrl);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };
        
        let redirectCount = 0;
        const maxRedirects = 10;
        
        const followRedirect = (url) => {
            const currentUrl = new URL(url);
            const currentProtocol = currentUrl.protocol === 'https:' ? https : http;
            
            const req = currentProtocol.request({
                hostname: currentUrl.hostname,
                path: currentUrl.pathname + currentUrl.search,
                method: 'GET',
                headers: options.headers
            }, (res) => {
                console.log(`   Status: ${res.statusCode}`);
                
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    redirectCount++;
                    if (redirectCount > maxRedirects) {
                        reject(new Error('Too many redirects'));
                        return;
                    }
                    
                    let nextUrl = res.headers.location;
                    // Если относительный URL, делаем абсолютным
                    if (!nextUrl.startsWith('http')) {
                        nextUrl = new URL(nextUrl, url).href;
                    }
                    
                    console.log(`   ➡️  Redirect #${redirectCount}: ${nextUrl.substring(0, 100)}...`);
                    followRedirect(nextUrl);
                } else if (res.statusCode === 200) {
                    console.log(`✅ Финальный URL: ${url}`);
                    
                    // Парсим координаты из URL
                    const coordsMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                    if (coordsMatch) {
                        const lat = parseFloat(coordsMatch[1]);
                        const lng = parseFloat(coordsMatch[2]);
                        console.log(`📍 Координаты: lat=${lat}, lng=${lng}`);
                        resolve({ url, lat, lng });
                    } else {
                        console.log(`⚠️  Координаты не найдены в URL`);
                        resolve({ url, lat: null, lng: null });
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
            
            req.on('error', reject);
            req.end();
        };
        
        followRedirect(shortUrl);
    });
}

/**
 * Основная функция
 */
async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     🔍 РАЗВОРАЧИВАНИЕ GOOGLE MAPS ССЫЛОК                    ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    
    const urls = [
        'https://maps.app.goo.gl/KSZKYnL8PmKigKPe7',
        'https://maps.app.goo.gl/3k4khwBzm2tPtZKN6'
    ];
    
    for (const url of urls) {
        try {
            const result = await expandUrl(url);
            console.log('\n📊 РЕЗУЛЬТАТ:');
            console.log(`   URL: ${result.url}`);
            console.log(`   Latitude: ${result.lat}`);
            console.log(`   Longitude: ${result.lng}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } catch (error) {
            console.error(`❌ Ошибка: ${error.message}`);
        }
    }
}

// Запускаем
main().catch(console.error);
