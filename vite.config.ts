import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' で、どのURL配下（GitHub Pages など）に置いても動くようにする
export default defineConfig({
  base: './',
  plugins: [react()],
});
