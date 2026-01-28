import { e as createComponent, f as createAstro, r as renderTemplate, l as renderScript, v as renderHead } from '../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                        */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$TelegramApp = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TelegramApp;
  const formId = Astro2.url.searchParams.get("form_id");
  if (!formId) {
    return Astro2.redirect("/404");
  }
  return renderTemplate(_a || (_a = __template(['<html lang="ru" data-astro-cid-axmxulfa> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><title>\u0424\u043E\u0440\u043C\u0430</title><!-- Telegram Web App SDK -->', "", '</head> <body data-astro-cid-axmxulfa> <div id="app" data-astro-cid-axmxulfa></div> ', ` <!-- React \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 --> <div id="telegram-form-root" data-astro-cid-axmxulfa></div> <script type="module">
    import TelegramForm from '../components/TelegramForm';
    import { createRoot } from 'react-dom/client';
    
    const root = document.getElementById('telegram-form-root');
    if (root) {
      createRoot(root).render(
        <TelegramForm formId="{formId}" />
      );
    }
  <\/script> </body> </html>`])), renderScript($$result, "C:/Users/User/Desktop/sri/src/pages/telegram-app.astro?astro&type=script&index=0&lang.ts"), renderHead(), renderScript($$result, "C:/Users/User/Desktop/sri/src/pages/telegram-app.astro?astro&type=script&index=1&lang.ts"));
}, "C:/Users/User/Desktop/sri/src/pages/telegram-app.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/telegram-app.astro";
const $$url = "/telegram-app";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TelegramApp,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
