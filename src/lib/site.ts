export function assetUrl(path = ""): string {
  return import.meta.env.BASE_URL + path.replace(/^\/+/, "");
}

export function localeUrl(locale: "fr" | "en"): string {
  return assetUrl(locale === "en" ? "en/" : "");
}

// Resolve legacy query-based language URLs before the static HTML hydrates.
export const languageRedirectScript = `(() => {
  const url = new URL(location.href);
  const lang = url.searchParams.get("lang");
  const home = ${JSON.stringify(import.meta.env.BASE_URL)};
  if ((url.pathname === home || url.pathname === home + "en/" || url.pathname === home + "en") && (lang === "fr" || lang === "en")) {
    url.pathname = home + (lang === "en" ? "en/" : "");
    url.searchParams.delete("lang");
    location.replace(url.href);
  }
})();`;
