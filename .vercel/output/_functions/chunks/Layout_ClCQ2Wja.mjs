import { e as createComponent, f as createAstro, h as addAttribute, v as renderHead, w as renderSlot, r as renderTemplate } from './astro/server_CZKHqJbe.mjs';
import 'piccolore';
import 'clsx';
/* empty css                             */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "H-Ome Finder | Sri Lanka" } = Astro2.props;
  return renderTemplate`<html lang="ru"> <head><meta charset="UTF-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Users/User/Desktop/sri/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
