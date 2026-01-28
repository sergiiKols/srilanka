import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { A as AdminLayout } from '../../../chunks/AdminLayout_xmS9cJRX.mjs';
import { r as requireAdminPage } from '../../../chunks/auth_DRVvN-zp.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_1ISMqT13.mjs';

const $$Astro = createAstro();
const $$Telegram = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Telegram;
  const authResult = await requireAdminPage(Astro2);
  if (authResult.redirect) return authResult.redirect;
  const user = authResult.user;
  return renderTemplate`${renderComponent($$result, "AdminLayout", AdminLayout, { "title": "Telegram \u0424\u043E\u0440\u043C\u044B", "user": user }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <!-- Заголовок и кнопка создания --> <div class="flex justify-between items-center"> <div> <h1 class="text-3xl font-bold text-gray-900">Telegram Формы</h1> <p class="text-gray-600 mt-1">Управление формами для Telegram Web App</p> </div> <a href="/admin/forms/telegram/new" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
Создать форму
</a> </div> <!-- Список форм --> ${renderComponent($$result2, "TelegramFormsList", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/TelegramFormsList.tsx", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/forms/telegram.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/forms/telegram.astro";
const $$url = "/admin/forms/telegram";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Telegram,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
