import { createServer } from 'vite';
const server = await createServer({
  server: {
    port: 5193,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/device-assets': {
        target: 'http://127.0.0.1:5185',
        rewrite: path => `/assets/devices/pokedex-v001/runtime${path.slice('/device-assets'.length)}`,
      },
    },
  },
});
await server.listen();
server.printUrls();
