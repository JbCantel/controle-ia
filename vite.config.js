import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Porta travada: os dados do IndexedDB ficam presos a http://localhost:5174.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
  test: { setupFiles: ['./src/test/setup.js'] },
});
