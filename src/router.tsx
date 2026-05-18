import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Export the direct static instance the compiler is looking for
export const router = createTanStackRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Provide a type registration helper so the app knows your paths
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}