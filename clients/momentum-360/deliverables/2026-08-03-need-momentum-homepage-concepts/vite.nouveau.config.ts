import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/nouveau',
    rollupOptions: {
      input: {
        homepage: 'nouveau.html',
        localSeo: 'nouveau-service.html',
      },
    },
  },
});
