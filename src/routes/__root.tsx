import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { getDictionary, toLocale, useLocale } from "../i18n";
import appCss from "../styles.css?url";
import { assetUrl, localeUrl, languageRedirectScript } from "../lib/site";

function NotFoundComponent() {
  const { locale, t } = useLocale();
  return (
    <main className="error-screen">
      <p className="eyebrow">404</p>
      <h1>{t.ui.notFound}</h1>
      <p>{t.ui.notFoundText}</p>
      <Link className="button" to="/" search={{ lang: locale }}>
        {t.ui.backHome}
      </Link>
    </main>
  );
}
function ErrorComponent({ reset }: { reset: () => void }) {
  const router = useRouter();
  const { locale, t } = useLocale();
  return (
    <main className="error-screen">
      <h1>{t.ui.error}</h1>
      <p>{t.ui.errorText}</p>
      <button
        className="button"
        onClick={() => {
          void router.invalidate();
          reset();
        }}
      >
        {t.ui.retry}
      </button>
      <a className="text-link" href={localeUrl(locale)}>
        {t.ui.backHome}
      </a>
    </main>
  );
}
function RootContent() {
  return <Outlet />;
}
export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>) => ({
    lang: search.lang === "fr" || search.lang === "en" ? search.lang : undefined,
  }),
  head: ({ match, matches }) => {
    const locale = toLocale(match.search.lang, matches.at(-1)?.pathname);
    const { seo } = getDictionary(locale);
    const site = import.meta.env.VITE_SITE_URL;
    const canonical = site
      ? new URL(locale === "en" ? "en/" : "", site.replace(/\/+$/, "") + "/").href
      : undefined;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: seo.title },
        { name: "description", content: seo.description },
        { name: "author", content: "Mouad Charef" },
        { name: "theme-color", content: "#151918" },
        { property: "og:title", content: seo.title },
        { property: "og:description", content: seo.description },
        { property: "og:type", content: "website" },
        ...(canonical ? [{ property: "og:url", content: canonical }] : []),
        { property: "og:locale", content: seo.locale },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: seo.title },
        { name: "twitter:description", content: seo.description },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", type: "image/svg+xml", href: assetUrl("favicon.svg") },
        ...(canonical ? [{ rel: "canonical", href: canonical }] : []),
        {
          rel: "alternate",
          hrefLang: "fr",
          href: site ? new URL("./", site.replace(/\/+$/, "") + "/").href : localeUrl("fr"),
        },
        {
          rel: "alternate",
          hrefLang: "en",
          href: site ? new URL("en/", site.replace(/\/+$/, "") + "/").href : localeUrl("en"),
        },
        {
          rel: "alternate",
          hrefLang: "x-default",
          href: site ? new URL("./", site.replace(/\/+$/, "") + "/").href : localeUrl("fr"),
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootContent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return (
    <html lang={locale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: languageRedirectScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
