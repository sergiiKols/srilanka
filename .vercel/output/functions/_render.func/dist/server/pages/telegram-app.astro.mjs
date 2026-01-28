import { e as createComponent, f as createAstro, l as renderScript, v as renderHead, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
/* empty css                                        */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$TelegramApp = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TelegramApp;
  const formId = Astro2.url.searchParams.get("form_id");
  if (!formId) {
    return Astro2.redirect("/404");
  }
  return renderTemplate`<html lang="ru" data-astro-cid-axmxulfa> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><title>Форма</title><!-- Telegram Web App SDK -->${renderScript($$result, "C:/Users/User/Desktop/sri/src/pages/telegram-app.astro?astro&type=script&index=0&lang.ts")}${renderHead()}</head> <body data-astro-cid-axmxulfa> <div id="app" data-astro-cid-axmxulfa></div> ${renderScript($$result, "C:/Users/User/Desktop/sri/src/pages/telegram-app.astro?astro&type=script&index=1&lang.ts")} <!-- React компонент --> ${renderComponent($$result, "TelegramForm", null, { "formId": formId, "client:only": "react", "client:component-hydration": "only", "data-astro-cid-axmxulfa": true, "client:component-path": "C:/Users/User/Desktop/sri/src/components/TelegramForm.tsx", "client:component-export": "default" })} </body></html>`;
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
