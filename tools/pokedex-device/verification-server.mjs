import { createServer } from 'vite';
const server = await createServer({
  server: {
    port: 5193,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: ['0.taila30dc.ts.net'],
  },
});
await server.listen();
server.printUrls();
