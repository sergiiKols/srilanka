import { r as renderers } from './chunks/_@astro-renderers_1ISMqT13.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BdSMsjc4.mjs';
import { manifest } from './manifest_DHJqP5wG.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/cron-jobs.astro.mjs');
const _page2 = () => import('./pages/admin/database.astro.mjs');
const _page3 = () => import('./pages/admin/forms/telegram/settings.astro.mjs');
const _page4 = () => import('./pages/admin/forms/telegram/submissions.astro.mjs');
const _page5 = () => import('./pages/admin/forms/telegram/_id_/submissions.astro.mjs');
const _page6 = () => import('./pages/admin/forms/telegram/_id_.astro.mjs');
const _page7 = () => import('./pages/admin/forms/telegram.astro.mjs');
const _page8 = () => import('./pages/admin/keep-alive.astro.mjs');
const _page9 = () => import('./pages/admin/skills/new.astro.mjs');
const _page10 = () => import('./pages/admin/skills/_id_.astro.mjs');
const _page11 = () => import('./pages/admin/skills.astro.mjs');
const _page12 = () => import('./pages/admin/supabase.astro.mjs');
const _page13 = () => import('./pages/admin/tools/url-expander.astro.mjs');
const _page14 = () => import('./pages/admin.astro.mjs');
const _page15 = () => import('./pages/api/admin/forms/submissions.astro.mjs');
const _page16 = () => import('./pages/api/admin/forms/_id_/submissions.astro.mjs');
const _page17 = () => import('./pages/api/admin/forms/_id_.astro.mjs');
const _page18 = () => import('./pages/api/admin/forms.astro.mjs');
const _page19 = () => import('./pages/api/admin/keep-alive/test-table.astro.mjs');
const _page20 = () => import('./pages/api/admin/skills/_id_/test.astro.mjs');
const _page21 = () => import('./pages/api/admin/skills/_id_.astro.mjs');
const _page22 = () => import('./pages/api/admin/skills.astro.mjs');
const _page23 = () => import('./pages/api/admin/stats.astro.mjs');
const _page24 = () => import('./pages/api/admin/submissions/_id_.astro.mjs');
const _page25 = () => import('./pages/api/admin/tables/_name_.astro.mjs');
const _page26 = () => import('./pages/api/admin/tables.astro.mjs');
const _page27 = () => import('./pages/api/expand-url.astro.mjs');
const _page28 = () => import('./pages/api/telegram-form.astro.mjs');
const _page29 = () => import('./pages/api/tenant-request.astro.mjs');
const _page30 = () => import('./pages/api/validate-city.astro.mjs');
const _page31 = () => import('./pages/api/validate-poi.astro.mjs');
const _page32 = () => import('./pages/map.astro.mjs');
const _page33 = () => import('./pages/telegram-app.astro.mjs');
const _page34 = () => import('./pages/tenant-app.astro.mjs');
const _page35 = () => import('./pages/test-tenant-form.astro.mjs');
const _page36 = () => import('./pages/test-validation.astro.mjs');
const _page37 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/cron-jobs.astro", _page1],
    ["src/pages/admin/database.astro", _page2],
    ["src/pages/admin/forms/telegram/settings.astro", _page3],
    ["src/pages/admin/forms/telegram/submissions.astro", _page4],
    ["src/pages/admin/forms/telegram/[id]/submissions.astro", _page5],
    ["src/pages/admin/forms/telegram/[id].astro", _page6],
    ["src/pages/admin/forms/telegram.astro", _page7],
    ["src/pages/admin/keep-alive.astro", _page8],
    ["src/pages/admin/skills/new.astro", _page9],
    ["src/pages/admin/skills/[id].astro", _page10],
    ["src/pages/admin/skills/index.astro", _page11],
    ["src/pages/admin/supabase.astro", _page12],
    ["src/pages/admin/tools/url-expander.astro", _page13],
    ["src/pages/admin/index.astro", _page14],
    ["src/pages/api/admin/forms/submissions.ts", _page15],
    ["src/pages/api/admin/forms/[id]/submissions.ts", _page16],
    ["src/pages/api/admin/forms/[id].ts", _page17],
    ["src/pages/api/admin/forms.ts", _page18],
    ["src/pages/api/admin/keep-alive/test-table.ts", _page19],
    ["src/pages/api/admin/skills/[id]/test.ts", _page20],
    ["src/pages/api/admin/skills/[id].ts", _page21],
    ["src/pages/api/admin/skills.ts", _page22],
    ["src/pages/api/admin/stats.ts", _page23],
    ["src/pages/api/admin/submissions/[id].ts", _page24],
    ["src/pages/api/admin/tables/[name].ts", _page25],
    ["src/pages/api/admin/tables.ts", _page26],
    ["src/pages/api/expand-url.ts", _page27],
    ["src/pages/api/telegram-form.ts", _page28],
    ["src/pages/api/tenant-request.ts", _page29],
    ["src/pages/api/validate-city.ts", _page30],
    ["src/pages/api/validate-poi.ts", _page31],
    ["src/pages/map.astro", _page32],
    ["src/pages/telegram-app.astro", _page33],
    ["src/pages/tenant-app.astro", _page34],
    ["src/pages/test-tenant-form.astro", _page35],
    ["src/pages/test-validation.astro", _page36],
    ["src/pages/index.astro", _page37]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "a5de76f2-fdb7-425d-ab58-29fcb52a2312",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
