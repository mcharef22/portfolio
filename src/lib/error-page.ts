import { getDictionary, type Locale } from "../i18n/catalog";
import { localeUrl } from "./site";
export function renderErrorPage(locale: Locale = "fr"): string {
  const { ui } = getDictionary(locale);
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${ui.error} — Mouad Charef</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#151918;color:#f1f0e9;font:16px/1.6 system-ui}main{max-width:36rem;padding:2rem}a{color:#efb48f}</style></head><body><main><h1>${ui.error}</h1><p>${ui.errorText}</p><a href="${localeUrl(locale)}">${ui.backHome}</a></main></body></html>`;
}
