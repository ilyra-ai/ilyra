import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', '@libsql/client'], // Exclude libsql client from optimizeDeps
  },
  build: {
    target: 'es2022' // Target that supports top-level await
  },
  esbuild: {
    target: 'es2022' // Ensure esbuild target also supports top-level await
  }
});
