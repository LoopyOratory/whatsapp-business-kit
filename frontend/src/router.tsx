import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-4 inline-block text-primary hover:underline">
          Go home
        </a>
      </div>
    </div>
  ),
  defaultErrorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">{error?.message}</p>
        <a href="/" className="mt-4 inline-block text-primary hover:underline">
          Go home
        </a>
      </div>
    </div>
  ),
})

export function getRouter() {
  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
