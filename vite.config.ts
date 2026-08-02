import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Ship publicDir only — research A/B plates live outside default public (see public/ab README).
  publicDir: 'public',
  server: {
    port: 5180,
    strictPort: true,
    host: '0.0.0.0', // Zen/LAN + 127.0.0.1
    fs: { allow: ['.'] },
  },
  preview: {
    port: 4180,
    strictPort: true,
    host: '0.0.0.0', // Zen/LAN + 127.0.0.1
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      // Ship surface is the main demo only. Research A/B viewer (ab.html) is
      // intentionally excluded from the production multi-page bundle.
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
});
