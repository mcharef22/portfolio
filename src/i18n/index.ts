import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toLocale, getDictionary, type Locale } from "./catalog";
export { toLocale, getDictionary, type Locale } from "./catalog";
export function useLocale() {
  const locale = useRouterState({
    select: (state) => toLocale(state.location.search.lang, state.location.pathname),
  });
  const navigate = useNavigate();
  function setLocale(next: Locale) {
    try {
      localStorage.setItem("portfolio-language", next);
    } catch {
      /* URL persistence remains available. */
    }
    void navigate({
      to: next === "en" ? "/en/" : "/",
      search: { lang: undefined },
      hash: window.location.hash.slice(1),
      resetScroll: false,
    }).then(() => {
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLButtonElement>(`.language-switch button[lang="${next}"]`)
          ?.focus();
      });
    });
  }
  return { locale, t: getDictionary(locale), setLocale };
}
