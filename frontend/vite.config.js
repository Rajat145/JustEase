// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//       },
//       '/uploads': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//       },
//     },
//   },
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // No proxy needed — production calls go directly to Render.
  // Proxy is only used if you run `npm run dev` locally AND
  // change VITE_API_URL to http://localhost:5000/api in .env.
  server: {
    port: 5173,
  },
});

