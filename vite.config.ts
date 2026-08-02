import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Serve content pack (dex-index, shards) at /content/*
  publicDir: 'public',
  server: {
    port: 5180,
    strictPort: true,
    host: '127.0.0.1',
    fs: { allow: ['.'] },
  },
  preview: {
    port: 4180,
    strictPort: true,
    host: '127.0.0.1',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
