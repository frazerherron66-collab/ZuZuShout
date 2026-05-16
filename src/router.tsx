import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {  // ← must be named createRouter
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
  })
}
