import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    // Clean, direct wrapper without any broken context tags
    <div className="min-h-screen bg-slate-900 text-white">
      {/* This Outlet allows your landing page (index.tsx) to render! */}
      <Outlet /> 
    </div>
  );
}