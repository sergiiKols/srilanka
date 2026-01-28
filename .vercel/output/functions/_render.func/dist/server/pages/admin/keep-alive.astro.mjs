import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { A as AdminLayout } from '../../chunks/AdminLayout_DTgBj3su.mjs';
export { renderers } from '../../renderers.mjs';

const $$KeepAlive = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", AdminLayout, { "title": "Keep-Alive Management v2.0" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "KeepAliveDynamic", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/KeepAliveDynamic.tsx", "client:component-export": "default" })} ` })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/keep-alive.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/keep-alive.astro";
const $$url = "/admin/keep-alive";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$KeepAlive,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
