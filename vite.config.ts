import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
const inputBase = process.env.PAGES_BASE_PATH ?? "/";
if (!/^\/?[A-Za-z0-9._~/-]*$/.test(inputBase) || inputBase.includes("..")) {
  throw new Error("PAGES_BASE_PATH must be a URL path such as /portfolio/");
}
const base = `/${inputBase.replace(/^\/+|\/+$/g, "")}${inputBase.replace(/^\/+|\/+$/g, "") ? "/" : ""}`;
export default defineConfig({
  base,
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      router: { basepath: base },
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
        concurrency: 1,
      },
      pages: [{ path: "/" }, { path: "/en" }],
    }),
    nitro({ preset: "node-server" }),
    react(),
  ],
});
