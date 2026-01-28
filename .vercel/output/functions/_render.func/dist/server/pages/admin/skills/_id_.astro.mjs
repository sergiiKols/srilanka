import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { $ as $$Layout } from '../../../chunks/Layout_lp9ZR76Z.mjs';
import { A as AdminLayout } from '../../../chunks/AdminLayout_xmS9cJRX.mjs';
import { S as SkillEditor } from '../../../chunks/SkillEditor_Bk98pIJW.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_1ISMqT13.mjs';

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 Skill - ${id}` }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminLayout", AdminLayout, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/AdminLayout", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "SkillEditor", SkillEditor, { "client:load": true, "skillId": id, "client:component-hydration": "load", "client:component-path": "C:/Users/User/Desktop/sri/src/components/admin/SkillEditor", "client:component-export": "default" })} ` })} ` })}`;
}, "C:/Users/User/Desktop/sri/src/pages/admin/skills/[id].astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/admin/skills/[id].astro";
const $$url = "/admin/skills/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
