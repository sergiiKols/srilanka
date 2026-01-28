export { r as renderers } from '../../chunks/_@astro-renderers_1ISMqT13.mjs';

const POST = async ({ request }) => {
  try {
    const { url } = await request.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL не предоставлен" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("🔗 Сервер: Разворачиваем URL:", url);
    try {
      console.log("Попытка 1: Прямой fetch...");
      const response = await fetch(url, {
        method: "GET",
        // Изменили с HEAD на GET для надежности
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      const finalUrl = response.url;
      console.log("Ответ от fetch:", { status: response.status, url: finalUrl });
      if (finalUrl && finalUrl !== url && !finalUrl.includes("consent.google.com")) {
        console.log("✅ Сервер: Ссылка развернута через fetch");
        return new Response(JSON.stringify({
          success: true,
          expandedUrl: finalUrl,
          method: "server-fetch"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (error) {
      console.warn("⚠️ Метод 1 (server fetch) не сработал:", error.message);
    }
    try {
      console.log("Попытка 2: Используем getlinkinfo.com...");
      const getlinkResponse = await fetch(`https://getlinkinfo.com/api/v1/link-info?url=${encodeURIComponent(url)}`);
      if (getlinkResponse.ok) {
        const data = await getlinkResponse.json();
        if (data.url && data.url !== url) {
          console.log("✅ Сервер: Ссылка развернута через getlinkinfo.com");
          return new Response(JSON.stringify({
            success: true,
            expandedUrl: data.url,
            method: "getlinkinfo.com"
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    } catch (error) {
      console.warn("⚠️ Метод 2 (getlinkinfo.com) не сработал:", error.message);
    }
    try {
      console.log("Попытка 3: Получаем HTML и ищем мета-теги...");
      const htmlResponse = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (htmlResponse.ok) {
        const html = await htmlResponse.text();
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
        if (canonicalMatch && canonicalMatch[1]) {
          console.log("✅ Сервер: Найден canonical URL в HTML");
          return new Response(JSON.stringify({
            success: true,
            expandedUrl: canonicalMatch[1],
            method: "html-canonical"
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        if (ogUrlMatch && ogUrlMatch[1]) {
          console.log("✅ Сервер: Найден og:url в HTML");
          return new Response(JSON.stringify({
            success: true,
            expandedUrl: ogUrlMatch[1],
            method: "html-og-url"
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        const jsRedirectMatch = html.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i);
        if (jsRedirectMatch && jsRedirectMatch[1]) {
          console.log("✅ Сервер: Найден JS редирект в HTML");
          return new Response(JSON.stringify({
            success: true,
            expandedUrl: jsRedirectMatch[1],
            method: "html-js-redirect"
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    } catch (error) {
      console.warn("⚠️ Метод 3 (HTML parsing) не сработал:", error.message);
    }
    console.error("❌ Сервер: Все методы разворачивания не сработали");
    return new Response(JSON.stringify({
      success: false,
      error: "Не удалось развернуть ссылку",
      originalUrl: url
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("❌ Ошибка сервера:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
