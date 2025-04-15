// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server:{
//     proxy:{
//       "/api":{
//         target:"http://localhost:5173 ",
//       },
//     },
//   },
// });

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';

// Manually load env from one level up
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

export default defineConfig({
  plugins: [react()],
  server: {
    port: PORT,
    proxy: {
      '/api': {
        target: `http://localhost:${PORT}`, // dynamically reflect port
        changeOrigin: true,
      },
    },
  },
});
