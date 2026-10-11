import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Start loading a page as soon as a link is hovered or touched, so navigation feels instant
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
