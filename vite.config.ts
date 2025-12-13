import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: base: './' permet de charger les assets (js, css) via des chemins relatifs
  // Cela permet à l'app de marcher dans http://localhost/mon-site/ sans configuration serveur
  base: './', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false
  },
});