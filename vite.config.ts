import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  base: './',
  build: {
    outDir: 'dist-react',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['@radix-ui/react-checkbox', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-popover'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/ui/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/ui/hooks'),
      '@/types': path.resolve(__dirname, './src/ui/types'),
      '@/interfaces': path.resolve(__dirname, './src/interfaces'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/redux': path.resolve(__dirname, './src/redux'),
      '@/utils': path.resolve(__dirname, './src/ui/utils'),
    },
  },
});
