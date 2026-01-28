import { e as createComponent, l as renderScript, v as renderHead, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
/* empty css                                      */
/* empty css                                      */
export { renderers } from '../renderers.mjs';

const $$TenantApp = createComponent(($$result, $$props, $$slots) => {
  const pageTitle = "Find Accommodation in Sri Lanka";
  return renderTemplate`<html lang="en" data-astro-cid-iv3rghsv> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><meta name="theme-color" content="#7C3AED"><title>${pageTitle}</title><!-- Telegram Web App Script -->${renderScript($$result, "C:/Users/User/Desktop/sri/src/pages/tenant-app.astro?astro&type=script&index=0&lang.ts")}<!-- Prevent zoom on iOS --><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"><!-- Favicon --><link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body data-astro-cid-iv3rghsv> <!-- Loading fallback --> <div id="app-loading" class="app-loading" data-astro-cid-iv3rghsv> <div class="spinner" data-astro-cid-iv3rghsv></div> </div> <!-- Main App --> <div id="app" style="display: none;" data-astro-cid-iv3rghsv> ${renderComponent($$result, "TenantRequestForm", null, { "client:only": "react", "client:component-hydration": "only", "data-astro-cid-iv3rghsv": true, "client:component-path": "C:/Users/User/Desktop/sri/src/components/TenantRequestForm", "client:component-export": "default" })} </div> ${renderScript($$result, "C:/Users/User/Desktop/sri/src/pages/tenant-app.astro?astro&type=script&index=1&lang.ts")} </body> </html>`;
}, "C:/Users/User/Desktop/sri/src/pages/tenant-app.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/tenant-app.astro";
const $$url = "/tenant-app";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TenantApp,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
