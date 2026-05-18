import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }), 
    react(), 
    tailwindcss()
  ],
  resolve: { 
    alias: { 
      '@': new URL('./src', import.meta.url).pathname
    } 
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-zuzu-[hash].js',
        chunkFileNames: 'assets/[name]-zuzu-[hash].js',
        assetFileNames: 'assets/[name]-zuzu-[hash][extname]'
      }
    }
  }
});