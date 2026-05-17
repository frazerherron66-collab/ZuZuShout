import React from 'react';
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url"; // This brings the "nice" look back

// ... (Keep your NotFoundComponent and ErrorComponent as they were)
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found.</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error; reset: () => void }) {
  return (
    <div className="p-4">
      <h1>Something went wrong</h1>
      <pre className="text-red-500">{error.message}</pre>
    </div>
  );
}
function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Add this line below to bring the styles back */}
        <link rel="stylesheet" href={appCss} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const RootComponent = () => {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
      <Toaster />
    </div>
  );
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
