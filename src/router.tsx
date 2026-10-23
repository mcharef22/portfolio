import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
export const getRouter = () =>
  createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    trailingSlash: "always",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
