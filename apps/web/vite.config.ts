import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'desktop' ? './' : '/',
  define: { __DESKTOP__: JSON.stringify(mode === 'desktop') },
  build: {
    outDir: mode === 'desktop' ? '../desktop/app' : 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
}));
