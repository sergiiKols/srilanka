import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from '../../../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../../../chunks/Layout_lp9ZR76Z.mjs';
import { A as AdminLayout } from '../../../../chunks/AdminLayout_DTgBj3su.mjs';
import { E as ErrorBoundary } from '../../../../chunks/ErrorBoundary_Kxi8QkMt.mjs';
import { r as requireAdminPage } from '../../../../chunks/auth_DRVvN-zp.mjs';
/* empty css                                                */
export { renderers } from '../../../../renderers.mjs';

const $$Astro = createAstro();
const $$Submissions = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Submissions;
  const authError = await requireAdminPage(Astro2);
  if (authError) return authError;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u0412\u0441\u0435 \u0437\u0430\u044F\u0432\u043A\u0438 - Telegram Forms", "data-astro-cid-sqxthahq": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminLayout", AdminLayout, { "client:load": true, "title": "\u0412\u0441\u0435 \u0437\u0430\u044F\u0432\u043A\u0438", "subtitle": "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u044F\u0432\u043E\u043A \u0441\u043E \u0432\u0441\u0435\u0445 Telegram \u0444\u043E\u0440\u043C", "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/AdminLayout", "client:component-export": "default", "data-astro-cid-sqxthahq": true }, { "default": async ($$result3) => renderTemplate` ${maybeRenderHead()}<div class="submissions-page" data-astro-cid-sqxthahq> <!-- Фильтры --> <div class="filters-panel" data-astro-cid-sqxthahq> <div class="filter-group" data-astro-cid-sqxthahq> <label for="form-filter" data-astro-cid-sqxthahq>Форма:</label> <select id="form-filter" class="filter-select" data-astro-cid-sqxthahq> <option value="" data-astro-cid-sqxthahq>Все формы</option> <!-- Динамически загружается через JS --> </select> </div> <div class="filter-group" data-astro-cid-sqxthahq> <label for="status-filter" data-astro-cid-sqxthahq>Статус:</label> <select id="status-filter" class="filter-select" data-astro-cid-sqxthahq> <option value="" data-astro-cid-sqxthahq>Все статусы</option> <option value="received" data-astro-cid-sqxthahq>Получена</option> <option value="processing" data-astro-cid-sqxthahq>В обработке</option> <option value="sent" data-astro-cid-sqxthahq>Отправлена</option> <option value="error" data-astro-cid-sqxthahq>Ошибка</option> </select> </div> <div class="filter-group" data-astro-cid-sqxthahq> <label for="date-from" data-astro-cid-sqxthahq>Дата от:</label> <input type="date" id="date-from" class="filter-input" data-astro-cid-sqxthahq> </div> <div class="filter-group" data-astro-cid-sqxthahq> <label for="date-to" data-astro-cid-sqxthahq>Дата до:</label> <input type="date" id="date-to" class="filter-input" data-astro-cid-sqxthahq> </div> <button id="apply-filters" class="btn-primary" data-astro-cid-sqxthahq>Применить</button> <button id="reset-filters" class="btn-secondary" data-astro-cid-sqxthahq>Сбросить</button> <button id="export-csv" class="btn-success" data-astro-cid-sqxthahq>📥 Экспорт CSV</button> </div> <!-- Таблица заявок --> <div class="table-container" data-astro-cid-sqxthahq> ${renderComponent($$result3, "ErrorBoundary", ErrorBoundary, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/ErrorBoundary", "client:component-export": "default", "data-astro-cid-sqxthahq": true }, { "default": async ($$result4) => renderTemplate` <div id="submissions-table" data-astro-cid-sqxthahq> <div class="loading" data-astro-cid-sqxthahq>Загрузка заявок...</div> </div> ` })} </div> <!-- Пагинация --> <div class="pagination" data-astro-cid-sqxthahq> <button id="prev-page" class="btn-secondary" disabled data-astro-cid-sqxthahq>← Назад</button> <span id="page-info" data-astro-cid-sqxthahq>Страница 1</span> <button id="next-page" class="btn-secondary" data-astro-cid-sqxthahq>Вперёд →</button> </div> </div> ${renderScript($$result3, "C:/Users/User/Desktop/sri/src/pages/admin/forms/telegram/submissions.astro?astro&type=script&index=0&lang.ts")}  ` })} ` })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/forms/telegram/submissions.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/forms/telegram/submissions.astro";
const $$url = "/admin/forms/telegram/submissions";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Submissions,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
