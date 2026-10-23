import { toLocale } from "./i18n/catalog";
import handler from "@tanstack/react-start/server-entry";
import { renderErrorPage } from "./lib/error-page";
export default {
  async fetch(request: Request) {
    try {
      return await handler.fetch(request);
    } catch (error) {
      console.error("Erreur de rendu du portfolio", error);
      return new Response(
        renderErrorPage(toLocale(new URL(request.url).searchParams.get("lang"))),
        {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        },
      );
    }
  },
};
