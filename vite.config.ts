import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

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
      // Safely resolves Windows path configurations to prevent optimizer crashes
      '@': path.resolve(__dirname, './src')
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