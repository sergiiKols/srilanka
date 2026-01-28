import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, s as spreadAttributes, w as renderSlot, r as renderTemplate, k as renderComponent } from '../chunks/astro/server_CZKHqJbe.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_ClCQ2Wja.mjs';
import 'clsx';
/* empty css                               */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Button = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Button;
  const { variant = "primary", href, class: className, ...rest } = Astro2.props;
  const baseStyles = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] border border-transparent",
    secondary: "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-background)]",
    ghost: "hover:bg-[var(--color-background)] text-[var(--color-text)]"
  };
  const styles = `${baseStyles} ${variants[variant]} ${className || ""}`;
  return renderTemplate`${href ? renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")}${addAttribute(styles, "class")}${spreadAttributes(rest)}>${renderSlot($$result, $$slots["default"])}</a>` : renderTemplate`<button${addAttribute(styles, "class")}${spreadAttributes(rest)}>${renderSlot($$result, $$slots["default"])}</button>`}`;
}, "C:/Users/User/Desktop/sri/src/components/ui/Button.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="header" data-astro-cid-3ef6ksr2> <div class="container" data-astro-cid-3ef6ksr2> <a href="/" class="logo" data-astro-cid-3ef6ksr2> <div class="logo-circle" data-astro-cid-3ef6ksr2>HF</div> <div class="logo-content" data-astro-cid-3ef6ksr2> <span class="logo-text" data-astro-cid-3ef6ksr2>H-Ome Finder</span> <span class="logo-subtitle" data-astro-cid-3ef6ksr2>Simplified apartment rental service</span> </div> </a> <nav class="nav" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "Button", $$Button, { "variant": "ghost", "href": "/procedures", "data-astro-cid-3ef6ksr2": true }, { "default": ($$result2) => renderTemplate`How it works` })} ${renderComponent($$result, "Button", $$Button, { "variant": "primary", "data-astro-cid-3ef6ksr2": true }, { "default": ($$result2) => renderTemplate`List your property` })} </nav> </div> </header> `;
}, "C:/Users/User/Desktop/sri/src/components/Header.astro", void 0);

const $$Map = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "H-Ome Finder | Sri Lanka - \u041A\u0430\u0440\u0442\u0430", "data-astro-cid-y6dp7ad7": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, { "data-astro-cid-y6dp7ad7": true })} ${maybeRenderHead()}<main class="main" data-astro-cid-y6dp7ad7> <div class="map-container" data-astro-cid-y6dp7ad7> ${renderComponent($$result2, "Explorer", null, { "client:only": "react", "client:component-hydration": "only", "data-astro-cid-y6dp7ad7": true, "client:component-path": "C:/Users/User/Desktop/sri/src/components/Explorer", "client:component-export": "default" })} <div class="floating-buttons" id="floating-buttons-container" data-astro-cid-y6dp7ad7> <!-- GEO button will be added here by React --> </div> </div> </main> ` })} `;
}, "C:/Users/User/Desktop/sri/src/pages/map.astro", void 0);

const $$file = "C:/Users/User/Desktop/sri/src/pages/map.astro";
const $$url = "/map";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Map,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
