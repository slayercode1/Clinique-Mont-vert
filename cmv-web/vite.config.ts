/// <reference types="vitest" />
import { URL, fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['vue', 'vue-sonner'],
  },
  optimizeDeps: {
    include: ['vue-sonner'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': [
            'radix-vue',
            'lucide-vue-next',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
          'form-vendor': ['vee-validate', '@vee-validate/zod', 'zod'],
          'table-vendor': ['@tanstack/vue-table'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/it': 'http://localhost:3000',
      '/fleet': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/store/**', 'src/utils/**'],
    },
  },
});
